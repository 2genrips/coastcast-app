(function(){
'use strict';
const mod={
  version:'6.0.0',
  officialHosts:['api.open-meteo.com','marine-api.open-meteo.com','api.weather.gov','api.tidesandcurrents.noaa.gov','www.ndbc.noaa.gov','tidesandcurrents.noaa.gov'],
  sourceTier(source='',verified=false){
    const s=String(source||'').toLowerCase();
    if(verified||/verified|official/.test(s))return 4;
    if(/geoapify/.test(s))return 3;
    if(/openstreetmap/.test(s))return 2;
    if(/photon|location search|search/.test(s))return 1;
    return 0;
  },
  shopEvidence(app,shop){
    const name=String(shop?.name||'');
    const tags=shop?.osmTags||shop?.tagsMeta||{};
    const source=String(shop?.source||'');
    const text=(name+' '+String(shop?.displayName||'')+' '+String(shop?.address||'')+' '+String(tags.description||'')+' '+String(tags.products||'')).toLowerCase();
    const reasons=[];
    let score=35;
    if(shop?.verified){score+=38;reasons.push('verified fishing business');}
    const sourceTier=this.sourceTier(source,shop?.verified);
    score+=sourceTier*6;
    if(String(tags.shop||'').toLowerCase()==='fishing'){score+=22;reasons.push('mapped as fishing shop');}
    if(/\b(bait|tackle)\b/.test(name.toLowerCase())){score+=18;reasons.push('bait/tackle in business name');}
    else if(/\b(fishing|angler|fly shop|rod.{0,5}reel|sportfishing)\b/.test(name.toLowerCase())){score+=13;reasons.push('fishing-specific business name');}
    if(/live bait|frozen bait|bait|tackle|rod|reel|fishing supplies/.test(text)){score+=9;reasons.push('fishing products indicated');}
    if(shop?.address){score+=4;reasons.push('address available');}
    if(shop?.phone||tags.phone||tags['contact:phone'])score+=3;
    if(shop?.website||tags.website||tags['contact:website'])score+=2;
    const d=Number(shop?.distance);
    if(Number.isFinite(d)){score+=Math.max(0,12-Math.min(12,d*.55));}
    const reject=/\b(sheriff|police|library|school|church|courthouse|city hall|hospital|bank|pharmacy|restaurant|hotel|motel|college|university|post office|real estate|museum)\b/i;
    if(reject.test(text))score-=60;
    if(/seafood/.test(text)&&!/bait|tackle|fishing supplies/.test(text))score-=25;
    score=Math.max(0,Math.min(100,Math.round(score)));
    let label=score>=86?'HIGH CONFIDENCE':score>=72?'STRONG MATCH':score>=58?'POSSIBLE MATCH':'LOW CONFIDENCE';
    return {score,label,reasons:[...new Set(reasons)].slice(0,4),tier:sourceTier};
  },
  mergeShop(app,list,shop){
    if(!shop||!shop.name||!Number.isFinite(Number(shop.lat))||!Number.isFinite(Number(shop.lon)))return;
    if(!app.isLikelyTackleShop(shop.name,{tags:shop.osmTags||shop.tagsMeta||{},display_name:shop.displayName||'',categories:shop.categories||[],verifiedFishing:shop.verified===true}))return;
    const normalized=String(shop.name).toLowerCase().replace(/[^a-z0-9]/g,'');
    const near=list.find(x=>{
      const xn=String(x.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
      return (normalized&&xn===normalized)||app.haversine(Number(x.lat),Number(x.lon),Number(shop.lat),Number(shop.lon))<0.06;
    });
    if(near){
      const a=this.shopEvidence(app,near),b=this.shopEvidence(app,shop);
      if(b.score>a.score)Object.assign(near,shop);
      else{
        near.address=near.address||shop.address||'';
        near.phone=near.phone||shop.phone||'';
        near.website=near.website||shop.website||'';
        near.openingHours=near.openingHours||shop.openingHours||'';
      }
      return;
    }
    list.push(shop);
  },
  async structuredTackleDiscovery(app){
    const l=app.state.location||{},lat=Number(l.lat),lon=Number(l.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return[];
    const radiusMiles=Math.max(5,Math.min(50,Number(app.state.tackleRadius)||20));
    const radiusMeters=Math.min(80000,Math.round(radiusMiles*1609.344));
    const query='[out:json][timeout:16];('+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[shop="fishing"];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[shop~"sports|outdoor|hardware|convenience|general"][name~"bait|tackle|fishing|angler|fly|rod.{0,5}reel",i];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[name~"bait & tackle|bait and tackle|tackle shop|fishing center|fishing store|fly shop",i];'+
      ');out center tags;';
    const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
    const out=[];
    for(const endpoint of endpoints){
      try{
        const data=await app.fetchOverpass(endpoint,query,9000);
        for(const el of (data?.elements||[])){
          const t=el.tags||{},slat=Number(el.lat??el.center?.lat),slon=Number(el.lon??el.center?.lon);
          if(!Number.isFinite(slat)||!Number.isFinite(slon)||!t.name)continue;
          const d=app.haversine(lat,lon,slat,slon);if(d>radiusMiles*1.35)continue;
          out.push({
            name:t.name,lat:slat,lon:slon,distance:d,
            source:'OpenStreetMap • structured fishing POI',
            verified:false,categories:[],osmTags:t,
            displayName:t.name,
            address:[t['addr:housenumber'],t['addr:street'],t['addr:city'],t['addr:state']].filter(Boolean).join(' '),
            phone:t.phone||t['contact:phone']||'',
            website:t.website||t['contact:website']||'',
            openingHours:t.opening_hours||'',
            tags:[t.shop==='fishing'?'Fishing tackle shop':'Fishing-related store',t.opening_hours||'Hours not listed']
          });
        }
        if(out.length)break;
      }catch(_){}
    }
    return out;
  },
  rankShops(app,shops){
    const rows=(shops||[]).map(s=>{
      const evidence=this.shopEvidence(app,s);
      return {...s,trustScore:evidence.score,trustLabel:evidence.label,trustReasons:evidence.reasons,sourceTier:evidence.tier};
    }).filter(s=>s.trustScore>=55);
    rows.sort((a,b)=>b.trustScore-a.trustScore || Number(a.distance||999)-Number(b.distance||999));
    return rows.slice(0,20);
  },
  async improveShops(app,forceToast=false){
    let base=[];
    try{base=await this.baseLoadNearbyShops.call(app,false)||[];}catch(_){base=[];}
    const merged=[];
    for(const s of base)this.mergeShop(app,merged,s);
    try{
      const extra=await this.structuredTackleDiscovery(app);
      for(const s of extra)this.mergeShop(app,merged,s);
    }catch(_){}
    const shops=this.rankShops(app,merged);
    if(app.state.data)app.state.data.shops=shops;
    app.state.sourceHealth.shops=shops.some(x=>x.verified)?'verified':shops.length?'live':'fallback';
    app.renderSourceHealth?.();app.renderShops?.();app.renderMapLayers?.();app.renderDestinationHub?.();this.renderDataTrust(app);
    if(forceToast){
      if(shops.length){
        const high=shops.filter(x=>x.trustScore>=86).length,strong=shops.filter(x=>x.trustScore>=72).length;
        app.showToast?.('Tackle scan: '+shops.length+' fishing-store matches • '+high+' high-confidence • '+strong+' strong-or-better.');
      }else app.showToast?.('No high-confidence bait/tackle shop was found. Unrelated businesses were excluded.');
    }
    return shops;
  },
  async mergeMapProviders(app,forceToast=false){
    let base=[];
    try{base=await this.baseLoadMapPlaces.call(app,false)||[];}catch(_){base=[];}
    const l=app.state.location||{},lat=Number(l.lat),lon=Number(l.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return base;
    const radiusMiles=Math.min(20,Math.max(3,Number(app.state.radius)||10));
    const radiusMeters=Math.min(32000,Math.max(5000,Math.round(radiusMiles*1609.344)));
    const merged=[...base],seen=new Set(merged.map(p=>String(p.name||'').toLowerCase().replace(/[^a-z0-9]/g,'')+':'+Number(p.lat).toFixed(4)+':'+Number(p.lon).toFixed(4)));
    const add=(item)=>{
      if(!item||!Number.isFinite(Number(item.lat))||!Number.isFinite(Number(item.lon)))return;
      const d=app.haversine(lat,lon,Number(item.lat),Number(item.lon));if(d>Math.max(radiusMiles*1.6,12))return;
      const key=String(item.name||'').toLowerCase().replace(/[^a-z0-9]/g,'')+':'+Number(item.lat).toFixed(4)+':'+Number(item.lon).toFixed(4);
      if(seen.has(key))return;seen.add(key);
      const p={...item,distance:d};p.match=app.mapPlaceMatchScore(p);p.reason=item.reason||app.mapPlaceReason(p);merged.push(p);
    };
    const query='[out:json][timeout:14];('+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[leisure="fishing"];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[sport="fishing"];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[man_made="pier"][name];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[leisure="slipway"][name];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[leisure="marina"][name];'+
      'nwr(around:'+radiusMeters+','+lat+','+lon+')[natural="beach"][name];'+
      ');out center tags;';
    for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter']){
      try{
        const data=await app.fetchOverpass(endpoint,query,8500);
        for(const el of (data?.elements||[])){
          const t=el.tags||{},plat=Number(el.lat??el.center?.lat),plon=Number(el.lon??el.center?.lon);
          if(!Number.isFinite(plat)||!Number.isFinite(plon))continue;
          const type=app.classifyMapPlace(t),name=String(t.name||'').trim();
          if(!name&&type!=='Fishing access')continue;
          add({
            id:'osm6-'+(el.type||'x')+'-'+el.id,
            name:name||'Fishing access',type,lat:plat,lon:plon,
            tags:{access:t.access||'',surface:t.surface||'',operator:t.operator||'',fee:t.fee||'',parking:t.parking||'',lit:t.lit||''},
            source:'OpenStreetMap • merged map layer',
            accessConfidence:/yes|public|permissive/.test(String(t.access||''))?'mapped public/permissive':'access not explicitly confirmed'
          });
        }
        break;
      }catch(_){}
    }
    merged.forEach(p=>{
      const s=String(p.source||'').toLowerCase();
      p.sourceConfidence=/official state|official/.test(s)?'OFFICIAL':/verified/.test(s)?'VERIFIED':/openstreetmap/.test(s)?'MAPPED':'DISCOVERY';
    });
    merged.sort((a,b)=>{
      const tier=x=>x.sourceConfidence==='OFFICIAL'?4:x.sourceConfidence==='VERIFIED'?3:x.sourceConfidence==='MAPPED'?2:1;
      return tier(b)-tier(a)||Number(b.match||0)-Number(a.match||0)||Number(a.distance||999)-Number(b.distance||999);
    });
    app.state.mapPOIs=merged.slice(0,50);
    if(app.state.mapPOIs.length)app.state.mapPlacesStatus=app.state.mapPOIs.some(x=>x.sourceConfidence==='OFFICIAL')?'official':app.state.mapPOIs.some(x=>x.sourceConfidence==='MAPPED')?'live':'search';
    app.renderSpotIntelligence?.();app.renderMapLayers?.();this.renderDataTrust(app);
    if(forceToast)app.showToast?.('Map Intelligence merged '+app.state.mapPOIs.length+' fishing/access places from the available providers.');
    return app.state.mapPOIs;
  },
  trustSnapshot(app){
    const h=app.state.sourceHealth||{},ageMin=app.state.liveUpdatedAt?Math.max(0,(Date.now()-new Date(app.state.liveUpdatedAt).getTime())/60000):null;
    const weights={weather:22,marine:22,tides:20,buoy:14,alerts:10,shops:12};
    const val={live:1,verified:1,cached:.78,loading:.45,fallback:.28,demo:.12};
    let score=0,total=0;
    for(const [k,w] of Object.entries(weights)){score+=w*(val[h[k]]??.22);total+=w;}
    score=total?score/total*100:0;
    if(ageMin!=null){if(ageMin>180)score*=.62;else if(ageMin>90)score*=.78;else if(ageMin>45)score*=.9;}
    const shopCount=(app.state.data?.shops||[]).length,high=(app.state.data?.shops||[]).filter(x=>Number(x.trustScore)>=86).length;
    return {score:Math.round(Math.max(0,Math.min(100,score))),ageMin,shopCount,high,status:h};
  },
  renderDataTrust(app){
    const snap=this.trustSnapshot(app),root=app.$('dataTrustPanel');if(!root)return;
    app.$('dataTrustScore').textContent=String(snap.score);
    app.$('dataTrustBadge').textContent=snap.score>=85?'HIGH TRUST':snap.score>=68?'GOOD TRUST':snap.score>=48?'PARTIAL':'LIMITED';
    app.$('dataTrustFreshness').textContent=snap.ageMin==null?'Not refreshed':snap.ageMin<1?'Updated now':Math.round(snap.ageMin)+' min old';
    app.$('dataTrustShops').textContent=snap.shopCount+' loaded';
    app.$('dataTrustHighShops').textContent=snap.high+' high-confidence';
    const labels={weather:'Weather',marine:'Marine',tides:'Tides',buoy:'Ocean obs',alerts:'Alerts',shops:'Tackle'};
    app.$('dataTrustSources').innerHTML=Object.entries(labels).map(([k,label])=>'<div class="data-trust-source '+app.escape(String(snap.status[k]||'unknown'))+'"><span>'+app.escape(label)+'</span><strong>'+app.escape(String(snap.status[k]||'unknown').toUpperCase())+'</strong></div>').join('');
  }
};
window.CastVectorDataMapIntelligence=mod;
const app=window.CastVector;if(!app)return;
mod.baseLoadNearbyShops=app.loadNearbyShops.bind(app);
mod.baseLoadMapPlaces=app.loadMapPlaces.bind(app);
app.loadNearbyShops=function(forceToast=false){return mod.improveShops(this,forceToast);};
app.loadMapPlaces=function(forceToast=false){return mod.mergeMapProviders(this,forceToast);};

const originalFetchJSON=app.fetchJSON.bind(app);
app.fetchJSON=async function(url,timeout=12000){
  try{return await originalFetchJSON(url,timeout);}
  catch(err){
    let host='';try{host=new URL(url).hostname;}catch(_){}
    if(!mod.officialHosts.includes(host))throw err;
    await new Promise(r=>setTimeout(r,350));
    return originalFetchJSON(url,Math.min(20000,Math.round(timeout*1.25)));
  }
};

const originalShopHTML=app.shopHTML?.bind(app);
if(originalShopHTML)app.shopHTML=function(s,i){
  const evidence=mod.shopEvidence(this,s),trust=s.trustScore??evidence.score,label=s.trustLabel||evidence.label;
  const tags=(s.tags||[]).slice(0,2).join(' • '),dist=this.fmt(s.distance,1),source=s.verified?'VERIFIED':/Geoapify/i.test(s.source||'')?'PLACES':/OpenStreetMap/i.test(s.source||'')?'OSM':'SEARCH';
  const contact=[s.openingHours||'',s.phone||''].filter(Boolean).join(' • ');
  return '<div class="list-item shop-list-item shop-intel-row"><div class="shop-rank">'+(i+1)+'</div><div class="shop-intel-copy"><div class="list-title">'+this.escape(s.name)+' <span class="shop-source-badge">'+source+'</span> <span class="shop-trust-badge trust-'+(trust>=86?'high':trust>=72?'strong':'possible')+'">'+this.escape(label)+'</span></div><div class="list-sub">'+dist+' mi from fishing spot'+(tags?' • '+this.escape(tags):'')+'</div><div class="shop-intel-reason">'+this.escape((s.trustReasons||evidence.reasons).slice(0,3).join(' • '))+'</div>'+(contact?'<div class="shop-intel-contact">'+this.escape(contact)+'</div>':'')+'</div><a class="mini-button" href="'+this.mapsUrl(s.lat,s.lon,s.name)+'" target="_blank" rel="noopener">Route</a></div>';
};

const prevRenderAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevRenderAll();mod.renderDataTrust(this);return out;};
document.addEventListener('click',e=>{
  if(e.target.closest('#dataTrustRefreshBtn'))app.loadLiveData?.();
  if(e.target.closest('#dataTrustShopsBtn'))app.loadNearbyShops?.(true);
  if(e.target.closest('#dataTrustMapBtn')){app.navigate?.('map');setTimeout(()=>app.loadMapPlaces?.(true),100);}
});
mod.renderDataTrust(app);
})();