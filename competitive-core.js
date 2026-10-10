(function(){
'use strict';

const C={
  version:'9.0.0',
  accessTiles:'https://services.arcgis.com/v01gqwM5QqNysAAi/ArcGIS/rest/services/PADUS3_0PublicAccess/MapServer/tile/{z}/{y}/{x}',
  accessQuery:'https://services.arcgis.com/v01gqwM5QqNysAAi/ArcGIS/rest/services/PADUS_Public_Access/FeatureServer/0/query',
  fwsLicense:'https://www.fws.gov/services/purchase-fishing-license',
  accessLayer:null,
  communityLayer:null,
  measureLayer:null,
  measureStart:null,
  catchPoint:null,
  point:null,
  stateCode:null,
  stateName:null,
  stateResolvedAt:null,
  offlineMetaKey:'castvector-offline-map-packs-v90',
  mapCache:'castvector-offline-map-v90',
  stateNames:{
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
    HI:'Hawaiʻi',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
    MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
    NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
    SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia'
  },

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    Object.assign(app.stateNames||{},this.stateNames);
    this.installUI(app);
    this.patchMap(app);
    this.patchCatch(app);
    this.patchRegulations(app);
    this.patchCommunity(app);
    this.bind(app);
    this.ensureMap(app);
    this.resolveState(app);
    this.renderProfile(app);
    this.renderOffline(app);
  },

  installUI(app){
    const dock=document.querySelector('#mapProDock .map-pro-layers');
    if(dock&&!dock.querySelector('[data-core-layer="public"]')){
      const publicBtn=document.createElement('button');publicBtn.type='button';publicBtn.dataset.coreLayer='public';publicBtn.textContent='Public Land';
      const community=document.createElement('button');community.type='button';community.dataset.coreLayer='community';community.textContent='Community';
      const offline=document.createElement('button');offline.type='button';offline.dataset.coreLayer='offline';offline.textContent='Offline';
      dock.append(publicBtn,community,offline);
    }

    if(!document.getElementById('corePointDialog')){
      const d=document.createElement('dialog');d.id='corePointDialog';d.className='sheet-dialog core-point-dialog';
      d.innerHTML='<div class="sheet-card core-point-sheet">'+
        '<div class="core-head"><div><div class="eyebrow">QUICK MAP • 9.0</div><h2 id="corePointTitle">Fishing point</h2><p id="corePointCoords">—</p></div><button id="corePointClose" class="icon-button" type="button">×</button></div>'+
        '<div class="core-point-grid"><article><span>DISTANCE</span><strong id="corePointDistance">—</strong><small>From selected fishing location</small></article><article><span>AREA SCORE</span><strong id="corePointScore">—</strong><small>Current CastVector conditions</small></article><article><span>PUBLIC ACCESS</span><strong id="corePointAccess">CHECKING</strong><small id="corePointAccessMeta">USGS PAD-US context</small></article><article><span>COMMUNITY</span><strong id="corePointCommunity">—</strong><small>Shared catches nearby</small></article></div>'+
        '<div class="core-point-actions"><button id="coreAnalyzePoint" class="primary-button" type="button">Analyze here</button><button id="coreSavePoint" class="secondary-button" type="button">Save</button><button id="coreLogPoint" class="secondary-button" type="button">Log catch</button><button id="coreMeasurePoint" class="ghost-button" type="button">Measure</button><button id="coreSharePoint" class="ghost-button" type="button">Share</button><button id="coreRoutePoint" class="ghost-button" type="button">Route</button></div>'+
        '<p class="core-point-note">Public-land/access data is recreation context, not proof that fishing is permitted at a particular shoreline. Verify posted signs, ownership and current rules.</p>'+
      '</div>';
      document.body.appendChild(d);
    }

    if(!document.getElementById('coreRegsDialog')){
      const d=document.createElement('dialog');d.id='coreRegsDialog';d.className='sheet-dialog core-regs-dialog';
      d.innerHTML='<div class="sheet-card core-regs-sheet">'+
        '<div class="core-head"><div><div class="eyebrow">REGULATIONS CENTER • 9.0</div><h2>Rules for this fishing location</h2><p>CastVector keeps the location, species, official source and your review status together.</p></div><button id="coreRegsClose" class="icon-button" type="button">×</button></div>'+
        '<div class="core-reg-hero"><div><span>LOCATION</span><strong id="coreRegState">Detecting state…</strong><small id="coreRegLocation">—</small></div><div><span>TARGET</span><strong id="coreRegSpecies">—</strong><small>Current CastVector target</small></div></div>'+
        '<div class="core-reg-status"><div><span>OFFICIAL SOURCE</span><strong id="coreRegSource">—</strong><small id="coreRegSourceMeta">—</small></div><div><span>REVIEW STATUS</span><strong id="coreRegChecked">NEEDS REVIEW</strong><small id="coreRegCheckedMeta">Open official rules before keeping fish</small></div></div>'+
        '<div class="core-reg-actions"><button id="coreOpenRegs" class="primary-button" type="button">Open official rules</button><button id="coreMarkRegs" class="secondary-button" type="button">Mark reviewed today</button><button id="coreLicenseBtn" class="secondary-button" type="button">License directory</button></div>'+
        '<label class="core-license-reminder"><span>License / permit reminder date</span><input id="coreLicenseDate" type="date"/><small id="coreLicenseMeta">Stored only on this device.</small></label>'+
        '<div class="core-reg-warning"><strong>Important</strong><span>CastVector does not invent bag, size, season or boundary limits. When an exact verified limit is not available in-app, the official agency source remains the authority.</span></div>'+
      '</div>';
      document.body.appendChild(d);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('competitiveCorePanel')){
      const panel=document.createElement('section');panel.id='competitiveCorePanel';panel.className='panel competitive-core-panel';
      panel.innerHTML='<div class="core-panel-head"><div><div class="eyebrow">COMPETITIVE CORE • 9.0</div><h2>Map, rules & offline readiness</h2></div><span id="coreReadyBadge" class="core-ready-badge">READY</span></div>'+
        '<div class="core-ready-grid"><article><span>REGULATIONS</span><strong id="coreTripRegs">—</strong><small id="coreTripRegsMeta">—</small></article><article><span>PUBLIC ACCESS</span><strong id="coreTripAccess">—</strong><small id="coreTripAccessMeta">—</small></article><article><span>OFFLINE MAP</span><strong id="coreTripOffline">—</strong><small id="coreTripOfflineMeta">—</small></article><article><span>COMMUNITY INTEL</span><strong id="coreTripCommunity">—</strong><small id="coreTripCommunityMeta">—</small></article></div>'+
        '<div class="core-panel-actions"><button id="coreTripRegsBtn" class="primary-button small" type="button">Regulations</button><button id="coreTripOfflineBtn" class="secondary-button small" type="button">Download map area</button><button id="coreTripMapBtn" class="secondary-button small" type="button">Open Map Pro</button></div>';
      const aa=document.getElementById('anglerAdvantagePanel');if(aa)aa.after(panel);else trips.prepend(panel);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('coreProfilePanel')){
      const panel=document.createElement('section');panel.id='coreProfilePanel';panel.className='panel core-profile-panel';
      panel.innerHTML='<div class="core-panel-head"><div><div class="eyebrow">YOUR FISHING PROFILE • 9.0</div><h2>What CastVector has learned</h2></div><span id="coreProfileStage" class="core-ready-badge">LEARNING</span></div>'+
        '<div class="core-profile-grid"><article><strong id="coreProfileCatches">0</strong><span>Catches</span></article><article><strong id="coreProfileSpecies">0</strong><span>Species</span></article><article><strong id="coreProfilePBs">0</strong><span>PBs tracked</span></article><article><strong id="coreProfileZones">0</strong><span>Pattern zones</span></article><article><strong id="coreProfileShares">0</strong><span>Community shares</span></article><article><strong id="coreProfileSessions">0</strong><span>Tracked trips</span></article></div>'+
        '<div class="core-profile-depth"><div><span>PERSONAL INTELLIGENCE DEPTH</span><strong id="coreProfileDepthLabel">Learning</strong></div><div class="core-depth-bar"><i id="coreProfileDepthBar"></i></div><small id="coreProfileDepthMeta">Log catches with bait, conditions and location to improve recommendations.</small></div>';
      const first=profile.querySelector('.profile-hero,.panel');if(first)first.after(panel);else profile.prepend(panel);
    }
  },

  patchMap(app){
    if(app._competitiveCoreMap)return;app._competitiveCoreMap=true;
    const old=app.ensureMap?.bind(app);
    if(old)app.ensureMap=function(){const out=old();setTimeout(()=>C.ensureMap(this),0);return out;};
  },

  ensureMap(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(!map._competitiveCoreBound){
      map._competitiveCoreBound=true;
      map.on('click',e=>C.onMapClick(app,e));
    }
    this.renderLayerButtons();
  },

  async onMapClick(app,e){
    if(!e?.latlng)return;
    const lat=e.latlng.lat,lon=e.latlng.lng;
    if(this.measureStart){
      const start=this.measureStart;this.measureStart=null;
      if(this.measureLayer){try{app.state.map.removeLayer(this.measureLayer);}catch(_){}}
      const miles=app.haversine(start.lat,start.lon,lat,lon);
      this.measureLayer=L.polyline([[start.lat,start.lon],[lat,lon]],{weight:4,dashArray:'8 7'}).addTo(app.state.map);
      L.popup().setLatLng([lat,lon]).setContent('<strong>'+miles.toFixed(2)+' miles</strong><br><small>Tap Measure again to start another line.</small>').openOn(app.state.map);
      app.showToast?.('Measured '+miles.toFixed(2)+' miles.');
      return;
    }
    this.point={lat,lon,access:null};
    this.renderPoint(app);this.openPoint();
    this.point.access=await this.queryAccess(app,lat,lon);
    this.renderPoint(app);
  },

  openPoint(){const d=document.getElementById('corePointDialog');if(d&&!d.open)d.showModal();},

  communityPosts(app){
    const cloud=(app._cloudCommunityPosts||[]).filter(p=>p.locationPrecision!=='hidden'&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)>1);
    return cloud;
  },

  nearbyCommunity(app,lat,lon,radius=10){
    return this.communityPosts(app).filter(p=>app.haversine(lat,lon,p.lat,p.lon)<=radius);
  },

  renderPoint(app){
    if(!this.point)return;
    const p=this.point,l=app.state.location||{},dist=app.haversine(Number(l.lat),Number(l.lon),p.lat,p.lon),near=this.nearbyCommunity(app,p.lat,p.lon,10);
    const access=p.access;
    const map={OA:['OPEN','PAD-US open recreation access'],RA:['RESTRICTED','Permit/seasonal/restricted recreation access'],XA:['CLOSED','PAD-US closed recreation access']};
    const am=access?map[access.code]||['UNKNOWN','PAD-US category unavailable']:['CHECKING','Querying USGS PAD-US'];
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('corePointTitle','Fishing point');
    set('corePointCoords',p.lat.toFixed(5)+', '+p.lon.toFixed(5));
    set('corePointDistance',dist<10?dist.toFixed(1)+' mi':Math.round(dist)+' mi');
    set('corePointScore',(app.currentScore?.()??'—')+'/100');
    set('corePointAccess',am[0]);
    set('corePointAccessMeta',access?(access.name||access.manager||am[1])+' • '+am[1]:am[1]);
    set('corePointCommunity',String(near.length));
  },

  async queryAccess(app,lat,lon){
    try{
      const q=new URLSearchParams({
        where:'1=1',geometry:lon+','+lat,geometryType:'esriGeometryPoint',inSR:'4326',
        spatialRel:'esriSpatialRelIntersects',outFields:'Unit_Nm,Pub_Access,MngNm_Desc,DesTp_Desc,BndryName,ST_Name',
        returnGeometry:'false',f:'json'
      });
      const data=await app.fetchJSON(this.accessQuery+'?'+q.toString(),10000),a=data?.features?.[0]?.attributes;
      if(!a)return null;
      return{code:a.Pub_Access||'',name:a.BndryName||a.Unit_Nm||'',unit:a.Unit_Nm||'',manager:a.MngNm_Desc||'',designation:a.DesTp_Desc||'',state:a.ST_Name||''};
    }catch(_){return null;}
  },

  togglePublic(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(this.accessLayer){try{map.removeLayer(this.accessLayer);}catch(_){}this.accessLayer=null;app.showToast?.('USGS public-access layer hidden.');}
    else{
      this.accessLayer=L.tileLayer(this.accessTiles,{maxZoom:20,maxNativeZoom:9,opacity:.42,attribution:'USGS PAD-US public access'}).addTo(map);
      app.showToast?.('USGS PAD-US recreation access layer on.');
    }
    this.renderLayerButtons();this.renderTrips(app);
  },

  async toggleCommunity(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(this.communityLayer){try{map.removeLayer(this.communityLayer);}catch(_){}this.communityLayer=null;app.showToast?.('Community catches hidden.');this.renderLayerButtons();return;}
    if(app.cloudSignedIn?.()&&!(app._cloudCommunityPosts||[]).length)try{await app.loadCloudCommunity?.({quiet:true});}catch(_){}
    const posts=this.communityPosts(app),g=L.layerGroup();
    posts.slice(0,100).forEach(p=>{
      if(p.locationPrecision==='exact'){
        const m=L.circleMarker([p.lat,p.lon],{radius:7,weight:2,fillOpacity:.85})
          .bindPopup('<div class="cc-popup"><strong>'+app.escape(p.species||'Catch')+'</strong><br><span>'+app.escape(p.user||'CastVector angler')+' • exact public share</span><br><small>'+app.escape(p.bait||'Bait not listed')+(p.score?' • Score '+app.escape(p.score):'')+'</small></div>');
        g.addLayer(m);
      }else{
        const c=L.circle([p.lat,p.lon],{radius:5000,weight:1,fillOpacity:.05,opacity:.45})
          .bindPopup('<div class="cc-popup"><strong>'+app.escape(p.species||'Catch')+'</strong><br><span>'+app.escape(p.user||'CastVector angler')+' • general area only</span><br><small>Exact spot intentionally hidden by the angler.</small></div>');
        g.addLayer(c);
      }
    });
    g.addTo(map);this.communityLayer=g;this.renderLayerButtons();this.renderTrips(app);
    app.showToast?.(posts.length?posts.length+' shared community catch'+(posts.length===1?'':'es')+' mapped.':'No cloud community locations are available yet.');
  },

  renderLayerButtons(){
    document.querySelectorAll('[data-core-layer="public"]').forEach(b=>b.classList.toggle('active',!!this.accessLayer));
    document.querySelectorAll('[data-core-layer="community"]').forEach(b=>b.classList.toggle('active',!!this.communityLayer));
  },

  savePoint(app){
    const p=this.point;if(!p)return;
    const exists=(app.state.waypoints||[]).some(w=>app.haversine(w.lat,w.lon,p.lat,p.lon)<.03);
    if(exists)return app.showToast?.('That point is already saved.');
    const a=p.access,access=a?(a.code==='OA'?'PAD-US open access':a.code==='RA'?'PAD-US restricted access':a.code==='XA'?'PAD-US closed access':'PAD-US access unknown'):'Access unverified';
    app.state.waypoints.unshift({id:Date.now(),name:'Map point '+p.lat.toFixed(3)+', '+p.lon.toFixed(3),notes:access+' • verify local fishing access',lat:p.lat,lon:p.lon,privacy:'private'});
    app.save?.();app.renderWaypoints?.();app.renderMapLayers?.();app.showToast?.('Map point saved privately.');
  },

  patchCatch(app){
    if(app._competitiveCoreCatch)return;app._competitiveCoreCatch=true;
    const old=app.saveCatch?.bind(app);
    if(old)app.saveCatch=function(){
      if(!C.catchPoint)return old();
      const prev={...this.state.location},p=C.catchPoint;C.catchPoint=null;
      this.state.location={key:'map-catch',name:'Map point '+p.lat.toFixed(4)+', '+p.lon.toFixed(4),lat:p.lat,lon:p.lon,source:'Quick Map'};
      try{return old();}finally{this.state.location=prev;this.renderLocation?.();}
    };
  },

  logPoint(app){
    if(!this.point)return;this.catchPoint={...this.point};document.getElementById('corePointDialog')?.close();app.openCatchDialog?.();
  },

  analyzePoint(app){
    if(!this.point)return;const p=this.point;
    app.state.location={key:'quick-map',name:'Map point '+p.lat.toFixed(4)+', '+p.lon.toFixed(4),lat:p.lat,lon:p.lon,source:'Quick Map'};
    app.onLocationChanged?.();document.getElementById('corePointDialog')?.close();
    window.CastVectorSpotDNA?.analyze?.(app,p.lat,p.lon,'Quick Map point');
    app.showToast?.('Point loaded into CastVector intelligence.');
  },

  measurePoint(app){
    if(!this.point)return;this.measureStart={lat:this.point.lat,lon:this.point.lon};document.getElementById('corePointDialog')?.close();
    app.showToast?.('Measure started. Tap the second point on the map.');
  },

  async sharePoint(app){
    if(!this.point)return;const p=this.point,text='CastVector fishing point\n'+p.lat.toFixed(5)+', '+p.lon.toFixed(5)+'\n'+app.mapsUrl(p.lat,p.lon,'Fishing point');
    try{if(navigator.share){await navigator.share({title:'CastVector fishing point',text});return;}}catch(e){if(e?.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(text);app.showToast?.('Fishing point copied.');}catch(_){app.showToast?.('Could not share that point.');}
  },

  routePoint(app){if(this.point)window.open(app.mapsUrl(this.point.lat,this.point.lon,'Fishing point'),'_blank','noopener');},

  patchCommunity(app){
    if(app._competitiveCoreCommunity)return;app._competitiveCoreCommunity=true;
    const old=app.loadCloudCommunity?.bind(app);
    if(old)app.loadCloudCommunity=async function(opts={}){const out=await old(opts);if(C.communityLayer){try{this.state.map?.removeLayer(C.communityLayer);}catch(_){}C.communityLayer=null;await C.toggleCommunity(this);}C.renderTrips(this);C.renderProfile(this);return out;};
  },

  async resolveState(app){
    const l=app.state.location||{},key=Number(l.lat).toFixed(2)+','+Number(l.lon).toFixed(2);
    try{
      const cached=JSON.parse(localStorage.getItem('castvector-state-v90:'+key)||'null');
      if(cached?.code){this.stateCode=cached.code;this.stateName=cached.name;this.stateResolvedAt=cached.at;this.applyState(app);return cached;}
    }catch(_){}
    try{
      const q=new URLSearchParams({format:'jsonv2',lat:String(l.lat),lon:String(l.lon),zoom:'5',addressdetails:'1'});
      const data=await app.fetchJSON('https://nominatim.openstreetmap.org/reverse?'+q.toString(),9000);
      const iso=data?.address?.['ISO3166-2-lvl4']||data?.address?.['ISO3166-2-lvl3']||'';
      let code=String(iso).split('-').pop().toUpperCase();
      if(!this.stateNames[code]){
        const state=String(data?.address?.state||'').toLowerCase();
        code=Object.keys(this.stateNames).find(k=>this.stateNames[k].toLowerCase()===state)||'';
      }
      if(code){
        this.stateCode=code;this.stateName=this.stateNames[code]||data?.address?.state||code;this.stateResolvedAt=new Date().toISOString();
        try{localStorage.setItem('castvector-state-v90:'+key,JSON.stringify({code,name:this.stateName,at:this.stateResolvedAt}));}catch(_){}
        this.applyState(app);return{code,name:this.stateName};
      }
    }catch(_){}
    this.stateCode=app.detectStateCode?.()||null;this.stateName=this.stateCode?this.stateNames[this.stateCode]||this.stateCode:null;this.applyState(app);return null;
  },

  applyState(app){
    const code=this.stateCode;if(!code)return;
    if(!app.regulationSources[code])app.regulationSources[code]={name:'USFWS state license & agency directory',url:this.fwsLicense,fallback:true};
    const original=app.detectStateCode;
    if(!app._competitiveCoreStatePatch){
      app._competitiveCoreStatePatch=true;
      app.detectStateCode=function(){return original.call(this)||C.stateCode||null;};
    }
    app.renderRegulations?.();this.renderRegs(app);this.renderTrips(app);
  },

  patchRegulations(app){
    if(app._competitiveCoreRegs)return;app._competitiveCoreRegs=true;
    const loc=app.onLocationChanged?.bind(app);
    if(loc)app.onLocationChanged=function(){const out=loc();setTimeout(()=>C.resolveState(this),120);return out;};
    const old=app.renderRegulations?.bind(app);
    if(old)app.renderRegulations=function(){const out=old();C.renderRegs(this);C.renderTrips(this);return out;};
  },

  openRegs(app){this.resolveState(app).finally(()=>{this.renderRegs(app);const d=document.getElementById('coreRegsDialog');if(d&&!d.open)d.showModal();});},

  regModel(app){
    const code=this.stateCode||app.detectStateCode?.(),name=this.stateNames[code]||code||'State not resolved',src=code?app.regulationSources?.[code]:null;
    const key=code?code+'|'+app.state.targetSpecies:null,check=key?app.state.regChecks?.[key]:null,today=app.localDateKey?.(new Date()),fresh=!!(check&&check.date===today);
    return{code,name,src,key,check,fresh,fallback:!!src?.fallback};
  },

  renderRegs(app){
    const r=this.regModel(app),set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('coreRegState',r.code?r.name+' ('+r.code+')':'State not resolved');
    set('coreRegLocation',app.state.location?.name||'Selected fishing location');
    set('coreRegSpecies',app.state.targetSpecies||'Target species');
    set('coreRegSource',r.src?.name||'Official source not configured');
    set('coreRegSourceMeta',r.src?(r.fallback?'Federal directory to your state agency':'Direct official agency link'):'Use the license directory to reach your state agency');
    set('coreRegChecked',r.fresh?'REVIEWED TODAY':'NEEDS REVIEW');
    set('coreRegCheckedMeta',r.fresh?'Recorded '+new Date(r.check.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Review the official source before keeping fish');
    const mark=document.getElementById('coreMarkRegs');if(mark)mark.disabled=!r.code;
    const date=document.getElementById('coreLicenseDate');if(date){try{date.value=localStorage.getItem('castvector-license-date-v90:'+r.code)||'';}catch(_){}}
  },

  markRegs(app){
    const r=this.regModel(app);if(!r.code)return app.showToast?.('CastVector could not resolve the state yet.');
    const src=r.src||{name:'Official state source'};
    app.state.regChecks[r.key]={date:app.localDateKey(new Date()),at:new Date().toISOString(),state:r.code,species:app.state.targetSpecies,source:src.name,location:app.state.location.name};
    app.save?.();app.renderRegulations?.();this.renderRegs(app);app.showToast?.('Regulation review recorded for today.');
  },

  openOfficial(app){
    const r=this.regModel(app);window.open(r.src?.url||this.fwsLicense,'_blank','noopener');
    app.showToast?.(r.fallback?'Use the federal directory to open your state agency rules.':'Official regulation source opened.');
  },

  tileXY(lat,lon,z){
    const n=Math.pow(2,z),x=Math.floor((lon+180)/360*n),rad=lat*Math.PI/180,y=Math.floor((1-Math.log(Math.tan(rad)+1/Math.cos(rad))/Math.PI)/2*n);
    return{x:Math.max(0,Math.min(n-1,x)),y:Math.max(0,Math.min(n-1,y))};
  },

  tileUrl(base,z,x,y){
    if(base==='street')return'https://a.tile.openstreetmap.org/'+z+'/'+x+'/'+y+'.png';
    const service=base==='aerial'?'USGSImageryOnly':base==='topo'?'USGSTopo':'USGSImageryTopo';
    return'https://basemap.nationalmap.gov/arcgis/rest/services/'+service+'/MapServer/tile/'+z+'/'+y+'/'+x;
  },

  offlineList(){try{return JSON.parse(localStorage.getItem(this.offlineMetaKey)||'[]')||[];}catch(_){return[];}},
  saveOfflineList(list){try{localStorage.setItem(this.offlineMetaKey,JSON.stringify(list.slice(0,12)));}catch(_){}},

  async downloadOfflineMap(app){
    if(!('caches'in window))return app.showToast?.('Offline map storage is not available on this device.');
    const l=app.state.location||{},base=window.CastVectorMapPro?.activeBase||'hybrid',map=app.state.map,z0=Math.max(8,Math.min(16,map?.getZoom?.()||13));
    const coords=[],seen=new Set(),add=(z,x,y)=>{const k=z+'/'+x+'/'+y;if(!seen.has(k)){seen.add(k);coords.push({z,x,y});}};
    for(const z of [Math.max(8,z0-1),z0,Math.min(16,z0+1)]){
      const c=this.tileXY(Number(l.lat),Number(l.lon),z);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)add(z,c.x+dx,c.y+dy);
    }
    const c=this.tileXY(Number(l.lat),Number(l.lon),z0);for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)add(z0,c.x+dx,c.y+dy);
    const cache=await caches.open(this.mapCache),btn=document.getElementById('coreTripOfflineBtn');
    if(btn){btn.disabled=true;btn.textContent='Downloading '+coords.length+' tiles…';}
    let ok=0;
    for(const t of coords){
      const url=this.tileUrl(base,t.z,t.x,t.y);
      try{
        const r=await fetch(url,{mode:'no-cors',cache:'reload'});
        if(r){await cache.put(url,r.clone());ok++;}
      }catch(_){}
    }
    const item={id:Date.now(),savedAt:new Date().toISOString(),name:l.name,lat:l.lat,lon:l.lon,base,zoom:z0,tiles:ok};
    const list=this.offlineList().filter(x=>app.haversine(x.lat,x.lon,l.lat,l.lon)>.5);list.unshift(item);this.saveOfflineList(list);
    if(btn){btn.disabled=false;btn.textContent='Download map area';}
    this.renderOffline(app);this.renderTrips(app);app.showToast?.('Offline map area saved • '+ok+' tile'+(ok===1?'':'s')+'.');
  },

  offlineFor(app){
    const l=app.state.location||{};return this.offlineList().find(x=>app.haversine(Number(x.lat),Number(x.lon),Number(l.lat),Number(l.lon))<1)||null;
  },

  renderOffline(app){
    const p=this.offlineFor(app),set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('coreTripOffline',p?'READY':'NOT SAVED');
    set('coreTripOfflineMeta',p?p.tiles+' map tiles • '+p.base+' • '+new Date(p.savedAt).toLocaleDateString():'Download around this fishing location');
  },

  async publicAccessForLocation(app){
    const l=app.state.location||{};if(this._lastAccess&&app.haversine(this._lastAccess.lat,this._lastAccess.lon,l.lat,l.lon)<.1)return this._lastAccess.data;
    const data=await this.queryAccess(app,Number(l.lat),Number(l.lon));this._lastAccess={lat:Number(l.lat),lon:Number(l.lon),data};return data;
  },

  async renderTrips(app){
    const r=this.regModel(app),offline=this.offlineFor(app),posts=this.nearbyCommunity(app,Number(app.state.location?.lat),Number(app.state.location?.lon),25);
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('coreTripRegs',r.fresh?'REVIEWED':r.src?'REVIEW':'VERIFY');set('coreTripRegsMeta',r.src?.name||'Official source not configured');
    set('coreTripCommunity',String(posts.length));set('coreTripCommunityMeta',posts.length?'Shared catches within 25 mi':'Community network still growing');
    set('coreTripOffline',offline?'READY':'NOT SAVED');set('coreTripOfflineMeta',offline?offline.tiles+' cached map tiles':'Download a map area before weak service');
    try{
      const a=await this.publicAccessForLocation(app),m=a?(a.code==='OA'?'OPEN':a.code==='RA'?'RESTRICTED':a.code==='XA'?'CLOSED':'UNKNOWN'):'VERIFY';
      set('coreTripAccess',m);set('coreTripAccessMeta',a?(a.name||a.manager||'USGS PAD-US'):'No PAD-US polygon at exact point');
    }catch(_){set('coreTripAccess','VERIFY');set('coreTripAccessMeta','Access lookup unavailable');}
    const badge=document.getElementById('coreReadyBadge');if(badge)badge.textContent=(r.fresh&&offline)?'TRIP READY':'REVIEW';
  },

  renderProfile(app){
    const catches=app.state.catches||[],species=new Set(catches.map(c=>c.species)).size,pbs=new Map();
    catches.forEach(c=>{const n=Number(c.length)||0;if(n>(pbs.get(c.species)||0))pbs.set(c.species,n);});
    let zones=0;try{zones=window.CastVectorPatternAtlas?.cluster?.(app)?.length||0;}catch(_){}
    const shares=(app.state.community?.publishedLocalIds||[]).length,sessions=(app.state.goMode?.history||[]).length;
    let depth=0;try{depth=app.personalAnalytics?.().depth||0;}catch(_){depth=Math.min(100,catches.length*8);}
    const stage=depth>=80?'STRONG':depth>=50?'GROWING':depth>0?'LEARNING':'START';
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('coreProfileCatches',catches.length);set('coreProfileSpecies',species);set('coreProfilePBs',[...pbs.values()].filter(x=>x>0).length);set('coreProfileZones',zones);set('coreProfileShares',shares);set('coreProfileSessions',sessions);set('coreProfileStage',stage);set('coreProfileDepthLabel',depth+'%');
    const bar=document.getElementById('coreProfileDepthBar');if(bar)bar.style.width=Math.max(2,Math.min(100,depth))+'%';
    set('coreProfileDepthMeta',depth>=80?'CastVector has a strong personal history signal for recommendations.':depth>=50?'Your catches are materially improving recommendations.':'Log catches with bait, conditions and location to improve recommendations.');
  },

  bind(app){
    document.addEventListener('click',e=>{
      const layer=e.target.closest('[data-core-layer]');
      if(layer){
        if(layer.dataset.coreLayer==='public')this.togglePublic(app);
        if(layer.dataset.coreLayer==='community')this.toggleCommunity(app);
        if(layer.dataset.coreLayer==='offline')this.downloadOfflineMap(app);
        return;
      }
      if(e.target.closest('#corePointClose')){document.getElementById('corePointDialog')?.close();return;}
      if(e.target.closest('#coreAnalyzePoint')){this.analyzePoint(app);return;}
      if(e.target.closest('#coreSavePoint')){this.savePoint(app);return;}
      if(e.target.closest('#coreLogPoint')){this.logPoint(app);return;}
      if(e.target.closest('#coreMeasurePoint')){this.measurePoint(app);return;}
      if(e.target.closest('#coreSharePoint')){this.sharePoint(app);return;}
      if(e.target.closest('#coreRoutePoint')){this.routePoint(app);return;}
      if(e.target.closest('#coreRegsClose')){document.getElementById('coreRegsDialog')?.close();return;}
      if(e.target.closest('#coreTripRegsBtn')){this.openRegs(app);return;}
      if(e.target.closest('#coreOpenRegs')){this.openOfficial(app);return;}
      if(e.target.closest('#coreMarkRegs')){this.markRegs(app);return;}
      if(e.target.closest('#coreLicenseBtn')){window.open(this.fwsLicense,'_blank','noopener');return;}
      if(e.target.closest('#coreTripOfflineBtn')){this.downloadOfflineMap(app);return;}
      if(e.target.closest('#coreTripMapBtn')){app.navigate?.('map');setTimeout(()=>app.ensureMap?.(),100);return;}
    });
    document.addEventListener('change',e=>{
      if(e.target.id==='coreLicenseDate'){
        const r=this.regModel(app);if(r.code)try{localStorage.setItem('castvector-license-date-v90:'+r.code,e.target.value||'');}catch(_){}
        const m=document.getElementById('coreLicenseMeta');if(m)m.textContent=e.target.value?'Reminder saved for '+new Date(e.target.value+'T12:00:00').toLocaleDateString()+'.':'Stored only on this device.';
      }
    });
    const oldRender=app.renderAll?.bind(app);
    if(oldRender)app.renderAll=function(){const out=oldRender();C.renderProfile(this);C.renderOffline(this);C.renderTrips(this);return out;};
  }
};

window.CastVectorCompetitiveCore=C;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>C.install());else C.install();
})();