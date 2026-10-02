(function(){
'use strict';

const smartPan={
  version:'6.1.0',
  minZoom:9,
  debounceMs:650,
  cacheMs:20*60*1000,

  ensureState(app){
    if(!app.state.smartPanMap) app.state.smartPanMap={enabled:true,status:'idle',places:[],shops:[],lastKey:null,lastScan:null,scans:0};
    if(!Array.isArray(app.state.smartPanMap.places)) app.state.smartPanMap.places=[];
    if(!Array.isArray(app.state.smartPanMap.shops)) app.state.smartPanMap.shops=[];
    return app.state.smartPanMap;
  },

  viewportKey(map){
    const c=map.getCenter(),z=map.getZoom();
    return [Number(c.lat).toFixed(2),Number(c.lng).toFixed(2),z].join(':');
  },

  cacheKey(key){return 'castvector-smart-pan-v61:'+key;},

  readCache(key){
    try{
      const raw=localStorage.getItem(this.cacheKey(key));if(!raw)return null;
      const v=JSON.parse(raw);if(!v||Date.now()-Number(v.savedAt||0)>this.cacheMs)return null;
      return v.data||null;
    }catch(_){return null;}
  },

  writeCache(key,data){
    try{localStorage.setItem(this.cacheKey(key),JSON.stringify({savedAt:Date.now(),data}));}catch(_){}
  },

  clearOldCache(){
    try{
      for(let i=localStorage.length-1;i>=0;i--){
        const k=localStorage.key(i);
        if(k&&k.startsWith('castvector-smart-pan-v61:')){
          try{
            const v=JSON.parse(localStorage.getItem(k)||'{}');
            if(Date.now()-Number(v.savedAt||0)>this.cacheMs) localStorage.removeItem(k);
          }catch(_){localStorage.removeItem(k);}
        }
      }
    }catch(_){}
  },

  boundsQuery(map){
    const b=map.getBounds();
    const s=b.getSouth(),w=b.getWest(),n=b.getNorth(),e=b.getEast();
    const box=[s,w,n,e].map(x=>Number(x).toFixed(6)).join(',');
    return '[out:json][timeout:18];('+
      'nwr('+box+')[leisure="fishing"];'+
      'nwr('+box+')[sport="fishing"];'+
      'nwr('+box+')[man_made="pier"][name];'+
      'nwr('+box+')[leisure="slipway"][name];'+
      'nwr('+box+')[leisure="marina"][name];'+
      'nwr('+box+')[natural="beach"][name];'+
      'nwr('+box+')[waterway="dock"][name];'+
      'nwr('+box+')[shop="fishing"];'+
      'nwr('+box+')[shop~"sports|outdoor|hardware|convenience|general"][name~"bait|tackle|fishing|angler|fly|rod.{0,5}reel",i];'+
      'nwr('+box+')[name~"bait & tackle|bait and tackle|bait shop|tackle shop|fishing center|fishing store|fly shop",i];'+
    ');out center tags;';
  },

  accessType(app,t){
    if(t.shop)return null;
    return app.classifyMapPlace?.(t)||'Public access';
  },

  isShop(app,t,name){
    if(String(t.shop||'').toLowerCase()==='fishing')return true;
    return app.isLikelyTackleShop?.(name,{tags:t,display_name:name,categories:[],verifiedFishing:false})||false;
  },

  normalize(app,e,mapCenter){
    const t=e.tags||{},lat=Number(e.lat??e.center?.lat),lon=Number(e.lon??e.center?.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
    const name=String(t.name||'').trim();
    const id='pan-'+String(e.type||'x')+'-'+String(e.id);
    const d=app.haversine(mapCenter.lat,mapCenter.lng,lat,lon);
    if(this.isShop(app,t,name)){
      if(!name)return null;
      const shop={
        id,name,lat,lon,distance:d,source:'OpenStreetMap • map viewport',
        verified:false,osmTags:t,displayName:name,
        address:[t['addr:housenumber'],t['addr:street'],t['addr:city'],t['addr:state']].filter(Boolean).join(' '),
        phone:t.phone||t['contact:phone']||'',website:t.website||t['contact:website']||'',
        openingHours:t.opening_hours||'',tags:['Fishing / tackle',t.opening_hours||'Hours not listed']
      };
      const intel=window.CastVectorDataMapIntelligence;
      if(intel){
        const ev=intel.shopEvidence(app,shop);
        shop.trustScore=ev.score;shop.trustLabel=ev.label;shop.trustReasons=ev.reasons;
        if(ev.score<55)return null;
      }
      return {kind:'shop',item:shop};
    }
    const type=this.accessType(app,t);if(!type)return null;
    if(!name&&type!=='Fishing access')return null;
    const place={
      id,name:name||'Fishing access',type,lat,lon,distance:d,
      tags:{access:t.access||'',surface:t.surface||'',operator:t.operator||'',fee:t.fee||'',parking:t.parking||'',lit:t.lit||''},
      source:'OpenStreetMap • live viewport',sourceConfidence:'MAPPED',
      accessConfidence:/yes|public|permissive/i.test(String(t.access||''))?'mapped public/permissive':'access not explicitly confirmed'
    };
    place.match=app.mapPlaceMatchScore?.(place)??70;
    place.reason=app.mapPlaceReason?.(place)||type+' • live map viewport';
    return {kind:'place',item:place};
  },

  dedupe(app,items,kind){
    const out=[];
    for(const item of items){
      const same=out.find(x=>{
        const xn=String(x.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
        const iname=String(item.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
        return (xn&&iname&&xn===iname)||app.haversine(Number(x.lat),Number(x.lon),Number(item.lat),Number(item.lon))<0.04;
      });
      if(!same)out.push(item);
      else if(kind==='shop'&&Number(item.trustScore||0)>Number(same.trustScore||0))Object.assign(same,item);
    }
    if(kind==='shop')out.sort((a,b)=>Number(b.trustScore||0)-Number(a.trustScore||0)||Number(a.distance||999)-Number(b.distance||999));
    else out.sort((a,b)=>Number(b.match||0)-Number(a.match||0)||Number(a.distance||999)-Number(b.distance||999));
    return out.slice(0,80);
  },

  mergeWithExisting(app,state,newPlaces,newShops){
    const combinedPlaces=[...(state.places||[]),...newPlaces];
    const combinedShops=[...(state.shops||[]),...newShops];
    state.places=this.dedupe(app,combinedPlaces,'place');
    state.shops=this.dedupe(app,combinedShops,'shop');
  },

  async scan(app,{force=false}={}){
    const map=app.state.map;if(!map)return;
    const state=this.ensureState(app);
    if(state.enabled===false)return;
    const zoom=map.getZoom();
    if(zoom<this.minZoom){
      state.status='zoom';this.renderStatus(app);return;
    }
    const key=this.viewportKey(map);
    if(!force&&key===state.lastKey&&state.status!=='error')return;
    state.lastKey=key;
    const cached=!force?this.readCache(key):null;
    if(cached){
      this.mergeWithExisting(app,state,cached.places||[],cached.shops||[]);
      state.status='cached';state.lastScan=new Date().toISOString();
      this.renderStatus(app);this.renderViewportLayers(app);return;
    }

    state.status='loading';this.renderStatus(app);
    const center=map.getCenter(),query=this.boundsQuery(map);
    let data=null;
    const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
    for(const endpoint of endpoints){
      try{data=await app.fetchOverpass(endpoint,query,10000);if(data)break;}catch(_){}
    }
    if(!data){
      state.status='error';this.renderStatus(app);return;
    }

    const places=[],shops=[];
    for(const e of (data.elements||[])){
      const n=this.normalize(app,e,center);if(!n)continue;
      if(n.kind==='shop')shops.push(n.item);else places.push(n.item);
    }
    const cleanPlaces=this.dedupe(app,places,'place');
    const cleanShops=this.dedupe(app,shops,'shop');
    this.mergeWithExisting(app,state,cleanPlaces,cleanShops);
    state.status='live';state.lastScan=new Date().toISOString();state.scans=Number(state.scans||0)+1;
    this.writeCache(key,{places:cleanPlaces,shops:cleanShops});
    this.clearOldCache();
    this.renderStatus(app);this.renderViewportLayers(app);
  },

  bind(app){
    const map=app.state.map;if(!map||map._castVectorSmartPanBound)return;
    map._castVectorSmartPanBound=true;
    const state=this.ensureState(app);
    let timer=null;
    const schedule=()=>{
      clearTimeout(timer);
      state.status='waiting';this.renderStatus(app);
      timer=setTimeout(()=>this.scan(app),this.debounceMs);
    };
    map.on('movestart',()=>{if(state.enabled!==false){state.status='moving';this.renderStatus(app);}});
    map.on('moveend',schedule);
    map.on('zoomend',schedule);
    setTimeout(()=>this.scan(app),250);
  },

  renderStatus(app){
    const state=this.ensureState(app),map=app.state.map;
    const el=app.$('smartPanStatus');if(!el)return;
    const zoom=map?.getZoom?.()??0;
    const copy={
      idle:'Ready to auto-scan the map',
      waiting:'Map moved • preparing scan…',
      moving:'Move anywhere • release to scan',
      loading:'Scanning visible map…',
      live:'Visible area updated',
      cached:'Loaded recent viewport data',
      error:'Map data source did not respond',
      zoom:'Zoom in to auto-populate fishing places'
    }[state.status]||'Smart map ready';
    el.textContent=copy;
    el.className='smart-pan-status '+state.status;
    const count=app.$('smartPanCount');if(count)count.textContent=(state.places.length+state.shops.length)+' pins';
    const access=app.$('smartPanAccessCount');if(access)access.textContent=state.places.length+' access';
    const shops=app.$('smartPanShopCount');if(shops)shops.textContent=state.shops.length+' tackle';
    const toggle=app.$('smartPanToggle');if(toggle)toggle.textContent=state.enabled===false?'Auto-populate OFF':'Auto-populate ON';
    if(app.$('mapCenterLabel'))app.$('mapCenterLabel').textContent=zoom<this.minZoom?'Zoom in for smart scan':'Drag map • CastVector scans automatically';
  },

  markerPopup(app,p){
    const accessNote=p.accessConfidence?'<br><small>'+app.escape(p.accessConfidence)+'</small>':'';
    return '<div class="cc-popup"><strong>'+app.escape(p.name)+'</strong><br><span>'+app.escape(p.type)+' • visible map</span>'+accessNote+'<br><b>'+Math.round(p.match||70)+'/100 area match</b><div class="popup-actions"><button type="button" data-pan-analyze="'+app.escape(p.id)+'">Analyze</button><button type="button" data-pan-save="'+app.escape(p.id)+'">Save</button></div></div>';
  },

  shopPopup(app,s){
    const trust=Number(s.trustScore||0);
    return '<div class="cc-popup"><strong>'+app.escape(s.name)+'</strong><br><span>'+app.escape(s.trustLabel||'Fishing-store match')+' • '+trust+'/100</span><br><small>'+app.escape(s.address||s.source||'Map viewport result')+'</small><div class="popup-actions"><a href="'+app.mapsUrl(s.lat,s.lon,s.name)+'" target="_blank" rel="noopener">Route</a></div></div>';
  },

  renderViewportLayers(app){
    const map=app.state.map;if(!map||!window.L)return;
    const state=this.ensureState(app);

    for(const layer of (app.state.mapLayers.smartpan||[])){try{map.removeLayer(layer);}catch(_){}}
    app.state.mapLayers.smartpan=[];

    const filter=app.state.mapFilter||'all';
    const showAccess=filter==='all'||filter==='access'||filter==='recommended';
    const showShops=filter==='all'||filter==='shops';

    if(showAccess){
      const ranked=[...state.places].sort((a,b)=>Number(b.match||0)-Number(a.match||0));
      const topIds=new Set(ranked.slice(0,5).map(x=>x.id));
      for(const p of ranked){
        const top=topIds.has(p.id);
        const icon=app.markerIcon(top?'recommended':'access',top?Math.round(p.match||70):app.typeAbbr(p.type));
        const marker=L.marker([p.lat,p.lon],{icon}).bindPopup(this.markerPopup(app,p));
        marker.addTo(map);app.state.mapLayers.smartpan.push(marker);
      }
    }
    if(showShops){
      state.shops.slice(0,40).forEach((s,i)=>{
        const marker=L.marker([s.lat,s.lon],{icon:app.markerIcon('bait',String(i+1))}).bindPopup(this.shopPopup(app,s));
        marker.addTo(map);app.state.mapLayers.smartpan.push(marker);
      });
    }

    const total=state.places.length+state.shops.length;
    if(app.$('mapSelection')){
      app.$('mapSelection').innerHTML='<strong>Smart Pan Map:</strong> '+total+' auto-populated pin'+(total===1?'':'s')+' cached from areas you have explored • '+state.places.length+' fishing/access • '+state.shops.length+' bait/tackle.';
    }
    this.renderStatus(app);
  },

  findPlace(app,id){return this.ensureState(app).places.find(x=>String(x.id)===String(id));},

  analyze(app,id){
    const p=this.findPlace(app,id);if(!p)return;
    app.state.location={key:'smart-pan',name:p.name,lat:p.lat,lon:p.lon,source:'Smart Pan Map • '+p.type};
    app.onLocationChanged?.();app.navigate?.('home');app.showToast?.('Analyzing '+p.name+' with exact coordinates…');
  },

  save(app,id){
    const p=this.findPlace(app,id);if(!p)return;
    const exists=(app.state.waypoints||[]).some(w=>app.haversine(p.lat,p.lon,w.lat,w.lon)<.03);
    if(exists)return app.showToast?.('That place is already saved.');
    app.state.waypoints.unshift({id:Date.now(),name:p.name,notes:p.type+' • Smart Pan Map',lat:p.lat,lon:p.lon,privacy:'private'});
    app.save?.();app.renderWaypoints?.();app.renderMapLayers?.();this.renderViewportLayers(app);app.showToast?.(p.name+' saved privately.');
  },

  toggle(app){
    const state=this.ensureState(app);state.enabled=state.enabled===false?true:false;
    if(state.enabled){this.scan(app,{force:true});}
    else{state.status='idle';this.renderStatus(app);}
  },

  refresh(app){this.scan(app,{force:true});}
};

window.CastVectorSmartPanMap=smartPan;
const app=window.CastVector;if(!app)return;

const originalEnsure=app.ensureMap.bind(app);
app.ensureMap=function(){
  const out=originalEnsure();
  setTimeout(()=>smartPan.bind(this),0);
  return out;
};

const originalRenderMapLayers=app.renderMapLayers.bind(app);
app.renderMapLayers=function(){
  const out=originalRenderMapLayers();
  setTimeout(()=>smartPan.renderViewportLayers(this),0);
  return out;
};

const originalFilter=app.applyMapFilter.bind(app);
app.applyMapFilter=function(){
  const out=originalFilter();
  setTimeout(()=>smartPan.renderViewportLayers(this),0);
  return out;
};

document.addEventListener('click',e=>{
  const analyze=e.target.closest('[data-pan-analyze]');
  if(analyze){smartPan.analyze(app,analyze.dataset.panAnalyze);return;}
  const save=e.target.closest('[data-pan-save]');
  if(save){smartPan.save(app,save.dataset.panSave);return;}
  if(e.target.closest('#smartPanToggle')){smartPan.toggle(app);return;}
  if(e.target.closest('#smartPanRefresh')){smartPan.refresh(app);return;}
});

smartPan.ensureState(app);
if(app.state.map)smartPan.bind(app);
smartPan.renderStatus(app);
})();