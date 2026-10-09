(function(){
'use strict';

const AA={
  version:'8.5.0',
  radarService:'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer',
  prefsKey:'castvector-angler-advantage-v85',
  seenKey:'castvector-weather-alerts-seen-v85',
  radarLayer:null,
  warningLayer:null,
  alerts:[],
  lastAlertCheck:null,
  lastRadarAt:null,
  alertTimer:null,
  moveTimer:null,
  radarFailures:0,

  app(){return window.CastVector;},

  prefs(){
    let p={};try{p=JSON.parse(localStorage.getItem(this.prefsKey)||'{}')||{};}catch(_){}
    return{
      radar:!!p.radar,
      warnings:p.warnings!==false,
      activeWatch:p.activeWatch!==false,
      opacity:Number.isFinite(Number(p.opacity))?Math.max(.25,Math.min(.9,Number(p.opacity))):.65
    };
  },

  savePrefs(p){try{localStorage.setItem(this.prefsKey,JSON.stringify(p));}catch(_){}},

  seen(){
    let x=[];try{x=JSON.parse(localStorage.getItem(this.seenKey)||'[]')||[];}catch(_){}
    return new Set(Array.isArray(x)?x:[]);
  },

  saveSeen(s){try{localStorage.setItem(this.seenKey,JSON.stringify([...s].slice(-120)));}catch(_){}},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchMap(app);
    this.patchLive(app);
    this.patchOffline(app);
    this.patchDiscover(app);
    this.bind(app);
    this.ensureMap(app);
    this.refreshAlerts(app,{notify:false,quiet:true});
    this.startWatch(app);
    this.wireVisibility(app);
    this.render(app);
  },

  installUI(app){
    const status=document.querySelector('#view-home .status-row');
    if(status&&!document.getElementById('aaWeatherPill')){
      const b=document.createElement('button');b.id='aaWeatherPill';b.type='button';b.className='aa-weather-pill';
      b.innerHTML='<i></i><span>TRIP TRUST</span><strong>CHECK</strong>';
      status.appendChild(b);
    }

    const dock=document.querySelector('#mapProDock .map-pro-layers');
    if(dock&&!dock.querySelector('[data-aa-layer="radar"]')){
      const radar=document.createElement('button');radar.type='button';radar.dataset.aaLayer='radar';radar.textContent='Radar';
      const warn=document.createElement('button');warn.type='button';warn.dataset.aaLayer='warnings';warn.textContent='Warnings';
      dock.append(radar,warn);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('anglerAdvantagePanel')){
      const panel=document.createElement('section');panel.id='anglerAdvantagePanel';panel.className='panel angler-advantage-panel';
      panel.innerHTML=
        '<div class="aa-head"><div><div class="eyebrow">ANGLER ADVANTAGE • 8.5</div><h2>Is this trip actually ready?</h2></div><span id="aaTrustBadge" class="aa-trust-badge">CHECKING</span></div>'+
        '<div class="aa-trust-hero"><div class="aa-trust-score"><strong id="aaTrustScore">—</strong><span>/100 TRUST</span></div><div><h3 id="aaTrustTitle">Building a complete trip check…</h3><p id="aaTrustDetail">CastVector is combining data quality, official warnings, access, regulations, offline readiness and your own history.</p></div></div>'+
        '<div class="aa-trust-grid">'+
          '<article><span>LIVE DATA</span><strong id="aaDataScore">—</strong><small id="aaDataMeta">Forecast confidence</small></article>'+
          '<article><span>WEATHER</span><strong id="aaWeatherStatus">—</strong><small id="aaWeatherMeta">NWS point check</small></article>'+
          '<article><span>ACCESS</span><strong id="aaAccessStatus">—</strong><small id="aaAccessMeta">Public-access confidence</small></article>'+
          '<article><span>REGULATIONS</span><strong id="aaRegStatus">—</strong><small id="aaRegMeta">Official rules review</small></article>'+
          '<article><span>PERSONAL EDGE</span><strong id="aaPersonal">—</strong><small id="aaPersonalMeta">Your history</small></article>'+
          '<article><span>OFFLINE READY</span><strong id="aaOffline">—</strong><small id="aaOfflineMeta">Trip snapshot</small></article>'+
        '</div>'+
        '<div class="aa-actions"><button id="aaWeatherCenterBtn" class="primary-button" type="button">Weather & warnings</button><button id="aaRegsBtn" class="secondary-button" type="button">Review regulations</button><button id="aaMapBtn" class="secondary-button" type="button">Verify access on map</button><button id="aaOfflineBtn" class="ghost-button" type="button">Save offline pack</button></div>';
      const safety=document.querySelector('#view-trips .departure-safety-panel');
      if(safety)safety.before(panel);else trips.appendChild(panel);
    }

    if(!document.getElementById('aaWeatherDialog')){
      const d=document.createElement('dialog');d.id='aaWeatherDialog';d.className='sheet-dialog aa-weather-dialog';
      d.innerHTML=
        '<div class="sheet-card aa-weather-sheet">'+
          '<div class="aa-weather-head"><div><div class="eyebrow">OFFICIAL WEATHER CENTER • 8.5</div><h2>Radar & real alerts</h2><p>NWS warning feed plus the national base-reflectivity radar mosaic for your selected fishing destination.</p></div><button id="aaWeatherClose" class="icon-button" type="button">×</button></div>'+
          '<div id="aaWeatherHero" class="aa-weather-hero"></div>'+
          '<div class="aa-weather-actions"><button id="aaRadarBtn" class="primary-button small" type="button">Show radar on map</button><button id="aaWarningsBtn" class="secondary-button small" type="button">Show warning areas</button><button id="aaNotifyBtn" class="secondary-button small" type="button">Enable severe-warning notifications</button><button id="aaRefreshAlerts" class="ghost-button small" type="button">Refresh NWS</button></div>'+
          '<label class="aa-opacity"><span>Radar opacity</span><input id="aaRadarOpacity" type="range" min="25" max="90" step="5" value="65"/></label>'+
          '<div class="aa-weather-metrics"><article><span>NWS ALERTS</span><strong id="aaAlertCount">0</strong><small id="aaAlertAge">Not checked</small></article><article><span>WIND / GUST</span><strong id="aaWind">—</strong><small>Loaded conditions</small></article><article><span>RAIN</span><strong id="aaRain">—</strong><small>Loaded probability</small></article><article><span>RADAR</span><strong id="aaRadarAge">OFF</strong><small>NWS mosaic</small></article></div>'+
          '<div class="aa-weather-subhead">ACTIVE OFFICIAL WARNINGS & ADVISORIES</div><div id="aaAlertList" class="aa-alert-list"></div>'+
          '<div class="aa-lightning-note"><strong>Thunderstorm / lightning awareness</strong><span id="aaLightningText">CastVector flags thunderstorm signals from NWS warnings and loaded forecast conditions. It does not claim strike-level lightning tracking.</span></div>'+
          '<p class="aa-source-note">Radar and warning information are planning aids. Follow National Weather Service warnings, local authorities, lifeguards, marina operators and posted conditions.</p>'+
        '</div>';
      document.body.appendChild(d);
    }
  },

  patchMap(app){
    if(app._aaMapPatched)return;app._aaMapPatched=true;
    const old=app.ensureMap?.bind(app);
    if(old)app.ensureMap=function(){const out=old();setTimeout(()=>AA.ensureMap(this),0);return out;};
  },

  patchLive(app){
    if(app._aaLivePatched)return;app._aaLivePatched=true;
    const old=app.loadLiveData?.bind(app);
    if(old)app.loadLiveData=async function(opts={}){
      const out=await old(opts);
      setTimeout(()=>AA.refreshAlerts(this,{notify:true,quiet:true}),100);
      AA.render(this);return out;
    };
    const loc=app.onLocationChanged?.bind(app);
    if(loc)app.onLocationChanged=function(){
      const out=loc();
      setTimeout(()=>AA.refreshAlerts(this,{notify:false,quiet:true}),150);
      return out;
    };
  },

  patchOffline(app){
    if(app._aaOfflinePatched)return;app._aaOfflinePatched=true;
    const old=app.saveOfflinePack?.bind(app);
    if(old)app.saveOfflinePack=function(){
      const before=(this.state.offlinePacks||[]).map(x=>x.id);
      const out=old();
      const p=(this.state.offlinePacks||[]).find(x=>!before.includes(x.id));
      if(p){
        const trust=AA.trust(this);
        const reg=AA.regStatus(this),access=AA.accessStatus(this),personal=AA.personalEdge(this);
        p.anglerAdvantage={
          trustScore:trust.score,trustLabel:trust.label,
          alerts:AA.alerts.slice(0,8).map(a=>({id:a.id,event:a.event,severity:a.severity,headline:a.headline,expires:a.expires})),
          alertCheckedAt:AA.lastAlertCheck,
          access:{level:access.level,label:access.label,detail:access.detail},
          regulations:{checked:reg.checked,state:reg.state,source:reg.sourceName||null},
          personal:{match:personal.match,confidence:personal.confidence},
          dataConfidence:this.dataConfidence?.().score??null
        };
        this.save?.();
      }
      AA.render(this);return out;
    };

    const oldOpen=app.handleOfflinePackClick?.bind(app);
    if(oldOpen)app.handleOfflinePackClick=function(event){
      const id=event.target.closest('[data-pack-view]')?.dataset.packView;
      const out=oldOpen(event);
      if(id){
        const p=(this.state.offlinePacks||[]).find(x=>String(x.id)===String(id));
        const extra=p?.anglerAdvantage,box=this.$?.('offlinePackDetail');
        if(extra&&box){
          const alertText=(extra.alerts||[]).length?(extra.alerts||[]).map(a=>a.event).slice(0,3).join(' • '):'No active NWS alerts were saved in this snapshot';
          box.insertAdjacentHTML('beforeend','<div class="aa-offline-extra"><strong>Trip Trust '+this.escape(String(extra.trustScore??'—'))+'/100 • '+this.escape(extra.trustLabel||'VERIFY')+'</strong><span>'+this.escape(extra.access?.label||'VERIFY')+' access • '+(extra.regulations?.checked?'regulations checked':'regulations not marked checked')+' • personal '+this.escape(extra.personal?.match==null?'learning':extra.personal.match+'%')+'</span><small>'+this.escape(alertText)+'</small></div>');
        }
      }
      return out;
    };
  },

  patchDiscover(app){
    const d=window.CastVectorDiscover;if(!d||d._aaPatched)return;d._aaPatched=true;
    const oldComposite=d.composite?.bind(d),oldWhy=d.why?.bind(d);
    if(oldComposite)d.composite=function(c,p){
      let score=oldComposite(c,p);
      const personal=AA.personalEdge(app);
      if(Number.isFinite(personal.match)&&personal.confidence>=45)score+=Math.round(Math.max(0,personal.match-60)*.08);
      const access=AA.candidateAccess(c);
      score+=access==='official'?4:access==='verified'?3:access==='mapped'?1:-2;
      const reg=AA.regStatus(app);if(reg.checked)score+=2;
      const safety=app.safetyAssessment?.();if(safety?.level>=2)score-=10;else if(safety?.level===1)score-=4;
      return Math.max(25,Math.min(99,Math.round(score)));
    };
    if(oldWhy)d.why=function(a,r,p,env){
      const parts=String(oldWhy(a,r,p,env)||'').split(' • ').filter(Boolean);
      const personal=AA.personalEdge(a);
      if(Number.isFinite(personal.match)&&personal.confidence>=45)parts.push('Personal Edge '+personal.match+'%');
      const ac=AA.candidateAccess(r);if(ac==='official')parts.push('official access source');else if(ac==='verified')parts.push('verified access signal');
      return [...new Set(parts)].slice(0,5).join(' • ');
    };
  },

  candidateAccess(c){
    const s=String(c?.source||'')+' '+String(c?.sourceKind||'')+' '+String(c?.reason||'');
    if(/Official\\s*•|official state|NC DEQ|state access/i.test(s))return'official';
    if(c?.verified||/Verified\\s*•|verified local|verified catalog/i.test(s))return'verified';
    if(/public access|public map|Fishing access|Beach|Pier|Boat ramp/i.test(String(c?.type||'')+' '+s))return'mapped';
    return'unverified';
  },

  accessStatus(app){
    const l=app.state.location||{},near=(app.state.mapPOIs||[])
      .map(p=>({...p,_d:app.haversine(Number(l.lat),Number(l.lon),Number(p.lat),Number(p.lon))}))
      .filter(p=>Number.isFinite(p._d)&&p._d<=1.2)
      .sort((a,b)=>a._d-b._d);
    const best=near[0]||null;
    const direct=this.candidateAccess({source:l.source,type:l.type,verified:l.verified});
    const level=best?this.candidateAccess(best):direct;
    const model={
      official:{score:96,label:'OFFICIAL',detail:best?best.name:'Official public-access source'},
      verified:{score:87,label:'VERIFIED',detail:best?best.name:'Verified public-access signal'},
      mapped:{score:68,label:'MAPPED',detail:best?best.name:'Public map signal — verify restrictions'},
      unverified:{score:38,label:'VERIFY',detail:'Legal/public access not confirmed at this exact point'}
    };
    return{level,...model[level],place:best};
  },

  regStatus(app){
    const code=app.detectStateCode?.(),src=code?app.regulationSources?.[code]:null,key=app.regulationCheckKey?.(),check=key?app.state.regChecks?.[key]:null;
    const today=app.localDateKey?.(new Date()),checked=!!(check&&check.date===today);
    return{
      state:code||null,source:src||null,sourceName:src?.name||null,checked,
      score:checked?100:src?62:28,
      label:checked?'CHECKED':src?'REVIEW':'VERIFY',
      detail:checked?'Official regulations marked reviewed today':src?'Official source available — review before keeping fish':'Official state source not confirmed for this destination'
    };
  },

  personalEdge(app){
    const b=window.CastVectorPersonalBrain;
    try{
      const s=b?.summary?.(app),best=s?.best;
      return{match:Number.isFinite(best?.personalMatch)?best.personalMatch:null,confidence:Number(best?.personalConfidence)||0,catches:s?.catches?.length||0};
    }catch(_){return{match:null,confidence:0,catches:0};}
  },

  offlineStatus(app){
    const l=app.state.location||{},packs=(app.state.offlinePacks||[]);
    const p=packs.find(x=>x.location&&app.haversine(Number(l.lat),Number(l.lon),Number(x.location.lat),Number(x.location.lon))<1&&String(x.species)===String(app.state.targetSpecies));
    if(!p)return{score:35,label:'NOT SAVED',detail:'Save an offline pack before weak-service travel',pack:null};
    const age=(Date.now()-new Date(p.savedAt).getTime())/3600000;
    if(age<=12)return{score:96,label:'READY',detail:'Offline trip pack saved '+Math.round(age)+'h ago',pack:p};
    if(age<=48)return{score:75,label:'AGING',detail:'Offline pack is '+Math.round(age)+'h old',pack:p};
    return{score:48,label:'STALE',detail:'Offline pack is '+Math.round(age/24)+' days old',pack:p};
  },

  trust(app){
    const conf=app.dataConfidence?.().score??0,safety=app.safetyAssessment?.()||{level:1},access=this.accessStatus(app),reg=this.regStatus(app),offline=this.offlineStatus(app),personal=this.personalEdge(app);
    const weather=safety.level>=2?20:safety.level===1?62:95;
    const personalScore=Number.isFinite(personal.match)?Math.max(45,Math.min(100,Math.round(personal.match*.8+personal.confidence*.2))):48;
    const score=Math.round(conf*.28+weather*.24+access.score*.18+reg.score*.13+offline.score*.08+personalScore*.09);
    const label=score>=86?'READY':score>=72?'STRONG':score>=58?'REVIEW':'HOLD';
    const title=score>=86?'Trip checks are lined up':score>=72?'Strong plan with a few checks':score>=58?'Review the weak points before leaving':'Do not treat this as a ready-to-go trip';
    const weak=[];
    if(conf<70)weak.push('live-data confidence');
    if(safety.level>0)weak.push('weather/safety');
    if(access.score<70)weak.push('access');
    if(!reg.checked)weak.push('regulations');
    if(offline.score<70)weak.push('offline pack');
    return{score,label,title,detail:weak.length?'Needs attention: '+weak.join(' • '):'Core data, safety, access, regulations and trip prep are aligned.',conf,weather,access,reg,offline,personal,personalScore};
  },

  async fetchOfficialAlerts(app){
    const l=app.state.location||{};
    const url='https://api.weather.gov/alerts/active?point='+encodeURIComponent(Number(l.lat).toFixed(4)+','+Number(l.lon).toFixed(4));
    const data=await app.fetchJSON(url,12000);
    return(data?.features||[]).map(f=>{
      const p=f?.properties||{};
      return{id:f.id||p.id||'',event:p.event||'Weather alert',severity:p.severity||'Unknown',certainty:p.certainty||'',urgency:p.urgency||'',headline:p.headline||p.event||'Active NWS alert',description:p.description||'',instruction:p.instruction||'',areaDesc:p.areaDesc||'',expires:p.expires||'',senderName:p.senderName||'National Weather Service',geometry:f.geometry||null};
    });
  },

  async refreshAlerts(app,{notify=true,quiet=false}={}){
    if(this.checking)return;this.checking=true;
    try{
      const alerts=await this.fetchOfficialAlerts(app);
      this.alerts=alerts;this.lastAlertCheck=new Date().toISOString();
      app.state.safetyAlerts=alerts.map(a=>({...a}));
      app.state.sourceHealth.alerts='live';
      if(notify)await this.notifyNewSevere(app,alerts);
      this.renderWarningLayer(app);app.renderSafetyGuard?.();app.renderTripSafety?.();app.renderSourceHealth?.();
      if(!quiet)app.showToast?.(alerts.length?alerts.length+' active NWS alert'+(alerts.length===1?'':'s')+' found.':'No active NWS point alerts returned.');
    }catch(_){
      app.state.sourceHealth.alerts='fallback';
      if(!quiet)app.showToast?.('NWS warning feed could not refresh.');
    }finally{this.checking=false;this.render(app);}
  },

  severe(a){
    return /Extreme|Severe/i.test(String(a.severity))||/Tornado|Severe Thunderstorm|Flash Flood|Hurricane|Tropical Storm|Storm Surge|Tsunami|Special Marine Warning/i.test(String(a.event));
  },

  async notifyNewSevere(app,alerts){
    if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
    const seen=this.seen(),fresh=alerts.filter(a=>this.severe(a)&&a.id&&!seen.has(a.id));
    for(const a of fresh.slice(0,3)){
      try{
        const reg='serviceWorker'in navigator?await navigator.serviceWorker.ready:null;
        const title='CastVector warning: '+a.event;
        const body=(a.headline||a.areaDesc||'Official NWS warning for your selected fishing area').slice(0,180);
        if(reg)await reg.showNotification(title,{body,icon:'icon-192.png',badge:'favicon-32.png',tag:'castvector-nws-'+a.id});
        else new Notification(title,{body,icon:'icon-192.png'});
      }catch(_){}
      seen.add(a.id);
    }
    alerts.filter(a=>a.id).forEach(a=>seen.add(a.id));this.saveSeen(seen);
  },

  radarUrl(map){
    const b=map.getBounds();
    const q=new URLSearchParams({bbox:[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].join(','),bboxSR:'4326',imageSR:'4326',size:'1200,900',format:'png32',transparent:'true',layers:'show:3',f:'image',_:String(Date.now())});
    return this.radarService+'/export?'+q.toString();
  },

  ensureMap(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(!map._aaBound){
      map._aaBound=true;
      map.on('moveend zoomend',()=>{
        clearTimeout(this.moveTimer);
        this.moveTimer=setTimeout(()=>{if(this.prefs().radar)this.refreshRadar(app);},500);
      });
    }
    const p=this.prefs();if(p.radar)this.showRadar(app,true);if(p.warnings)this.renderWarningLayer(app);
  },

  showRadar(app,silent=false){
    const p=this.prefs();p.radar=true;this.savePrefs(p);
    document.querySelectorAll('[data-aa-layer="radar"]').forEach(b=>b.classList.add('active'));
    this.refreshRadar(app);if(!silent)app.showToast?.('NWS radar overlay on.');this.render(app);
  },

  hideRadar(app,silent=false){
    if(this.radarLayer&&app.state.map){try{app.state.map.removeLayer(this.radarLayer);}catch(_){}}
    this.radarLayer=null;const p=this.prefs();p.radar=false;this.savePrefs(p);
    document.querySelectorAll('[data-aa-layer="radar"]').forEach(b=>b.classList.remove('active'));
    if(!silent)app.showToast?.('Radar overlay hidden.');this.render(app);
  },

  refreshRadar(app){
    const map=app.state.map;if(!map||!window.L||!this.prefs().radar)return;
    const b=map.getBounds(),bounds=[[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]];
    const next=L.imageOverlay(this.radarUrl(map),bounds,{opacity:this.prefs().opacity,interactive:false});
    next.on('load',()=>{
      if(this.radarLayer&&this.radarLayer!==next){try{map.removeLayer(this.radarLayer);}catch(_){}}
      this.radarLayer=next;this.lastRadarAt=new Date().toISOString();this.radarFailures=0;this.render(app);
    });
    next.on('error',()=>{
      this.radarFailures++;try{map.removeLayer(next);}catch(_){}
      if(this.radarFailures>=2){this.hideRadar(app,true);app.showToast?.('NWS radar unavailable right now. Warning alerts still work.');}
    });
    next.addTo(map);
  },

  toggleWarnings(app){
    const p=this.prefs();p.warnings=!p.warnings;this.savePrefs(p);
    if(p.warnings)this.renderWarningLayer(app);else this.clearWarnings(app);this.render(app);
  },

  clearWarnings(app){
    if(this.warningLayer&&app.state.map){try{app.state.map.removeLayer(this.warningLayer);}catch(_){}}
    this.warningLayer=null;
  },

  warningStyle(a){
    if(/Extreme/i.test(a.severity)||/Tornado|Hurricane|Storm Surge|Tsunami/i.test(a.event))return{color:'#ff4f68',weight:3,fillColor:'#ff4f68',fillOpacity:.13};
    if(/Severe/i.test(a.severity)||/Severe Thunderstorm|Flash Flood|Special Marine Warning/i.test(a.event))return{color:'#ff8b52',weight:3,fillColor:'#ff8b52',fillOpacity:.11};
    return{color:'#f0c861',weight:2,fillColor:'#f0c861',fillOpacity:.08};
  },

  renderWarningLayer(app){
    const map=app.state.map;if(!map||!window.L)return;this.clearWarnings(app);
    if(!this.prefs().warnings)return;
    const fs=this.alerts.filter(a=>a.geometry).map(a=>({type:'Feature',geometry:a.geometry,properties:a}));
    if(!fs.length)return;
    this.warningLayer=L.geoJSON({type:'FeatureCollection',features:fs},{
      style:f=>this.warningStyle(f.properties||{}),
      onEachFeature:(f,l)=>{const p=f.properties||{};l.bindPopup('<div class="cc-popup"><strong>'+app.escape(p.event||'NWS alert')+'</strong><br><span>'+app.escape(p.severity||'')+' • '+app.escape(p.areaDesc||'')+'</span><br><small>'+app.escape(p.headline||'Official NWS warning')+'</small></div>');}
    }).addTo(map);
  },

  wireVisibility(app){
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        const age=this.lastAlertCheck?(Date.now()-new Date(this.lastAlertCheck).getTime()):Infinity;
        if(age>10*60*1000)this.refreshAlerts(app,{notify:true,quiet:true});
      }
    });
  },

  startWatch(app){
    clearInterval(this.alertTimer);
    this.alertTimer=setInterval(()=>{
      if(document.visibilityState==='visible'&&this.prefs().activeWatch)this.refreshAlerts(app,{notify:true,quiet:true});
    },10*60*1000);
  },

  render(app){
    const trust=this.trust(app),pill=document.getElementById('aaWeatherPill');
    if(pill){pill.className='aa-weather-pill '+trust.label.toLowerCase();pill.querySelector('strong').textContent=trust.score+'/100';}

    const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val;};
    set('aaTrustScore',trust.score);set('aaTrustBadge',trust.label);set('aaTrustTitle',trust.title);set('aaTrustDetail',trust.detail);
    const badge=document.getElementById('aaTrustBadge');if(badge)badge.className='aa-trust-badge '+trust.label.toLowerCase();
    set('aaDataScore',trust.conf+'%');set('aaDataMeta','Forecast/source confidence');
    const severe=this.alerts.filter(a=>this.severe(a)).length;
    set('aaWeatherStatus',severe?'WARNING':trust.weather>=90?'CLEAR':'REVIEW');set('aaWeatherMeta',this.alerts.length?this.alerts.length+' active NWS alert'+(this.alerts.length===1?'':'s'):'No active point alert loaded');
    set('aaAccessStatus',trust.access.label);set('aaAccessMeta',trust.access.detail);
    set('aaRegStatus',trust.reg.label);set('aaRegMeta',trust.reg.detail);
    set('aaPersonal',Number.isFinite(trust.personal.match)?trust.personal.match+'%':'LEARNING');set('aaPersonalMeta',trust.personal.catches+' target-species catches • '+trust.personal.confidence+'% confidence');
    set('aaOffline',trust.offline.label);set('aaOfflineMeta',trust.offline.detail);

    const hero=document.getElementById('aaWeatherHero');
    if(hero){
      const safety=app.safetyAssessment?.()||{},storm=severe?'OFFICIAL WARNING':safety.level>=2?'HIGH RISK':safety.level===1?'CAUTION':'NO MAJOR SIGNAL';
      hero.className='aa-weather-hero '+(severe||safety.level>=2?'danger':safety.level===1?'caution':'good');
      hero.innerHTML='<div><span>TRIP WEATHER</span><strong>'+app.escape(storm)+'</strong><small>'+(this.lastAlertCheck?'NWS checked '+new Date(this.lastAlertCheck).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Official alert check pending')+'</small></div><div><span>SELECTED WATER</span><strong>'+app.escape(app.state.location?.name||'Fishing destination')+'</strong><small>'+app.escape(safety.detail||'Review conditions before travel')+'</small></div>';
    }

    const c=app.state.data?.current||{};
    set('aaAlertCount',String(this.alerts.length));
    set('aaAlertAge',this.lastAlertCheck?'Checked '+new Date(this.lastAlertCheck).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Not checked');
    set('aaWind',(Number.isFinite(Number(c.windSpeed))?Math.round(Number(c.windSpeed))+' mph':'—')+(Number.isFinite(Number(c.windGust))?' • '+Math.round(Number(c.windGust))+' gust':''));
    set('aaRain',Number.isFinite(Number(c.rain))?Math.round(Number(c.rain))+'%':'—');
    set('aaRadarAge',this.prefs().radar?(this.lastRadarAt?'LIVE':'LOADING'):'OFF');
    const opacity=document.getElementById('aaRadarOpacity');if(opacity)opacity.value=String(Math.round(this.prefs().opacity*100));

    const list=document.getElementById('aaAlertList');
    if(list)list.innerHTML=this.alerts.length?this.alerts.slice(0,8).map(a=>'<article class="aa-alert '+(this.severe(a)?'severe':'')+'"><div><span>'+app.escape(a.severity||'NWS')+'</span><strong>'+app.escape(a.event)+'</strong><small>'+app.escape(a.areaDesc||'')+'</small></div><p>'+app.escape(a.headline||a.description||'Official NWS alert')+'</p></article>').join(''):'<div class="aa-clear"><strong>No active NWS point alerts returned.</strong><span>Local hazards can still exist. Check posted warnings and conditions at the water.</span></div>';

    const radarBtn=document.getElementById('aaRadarBtn');if(radarBtn)radarBtn.textContent=this.prefs().radar?'Hide radar':'Show radar on map';
    const warnBtn=document.getElementById('aaWarningsBtn');if(warnBtn)warnBtn.textContent=this.prefs().warnings?'Hide warning areas':'Show warning areas';
    const notify=document.getElementById('aaNotifyBtn');if(notify)notify.textContent=typeof Notification!=='undefined'&&Notification.permission==='granted'?'Severe-warning notifications enabled':'Enable severe-warning notifications';
    document.querySelectorAll('[data-aa-layer="radar"]').forEach(b=>b.classList.toggle('active',this.prefs().radar));
    document.querySelectorAll('[data-aa-layer="warnings"]').forEach(b=>b.classList.toggle('active',this.prefs().warnings));
  },

  openWeather(app){this.render(app);const d=document.getElementById('aaWeatherDialog');if(d&&!d.open)d.showModal();},

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#aaWeatherPill')||e.target.closest('#aaWeatherCenterBtn')){this.openWeather(app);return;}
      if(e.target.closest('#aaWeatherClose')){document.getElementById('aaWeatherDialog')?.close();return;}
      if(e.target.closest('#aaRadarBtn')||e.target.closest('[data-aa-layer="radar"]')){this.prefs().radar?this.hideRadar(app):this.showRadar(app);return;}
      if(e.target.closest('#aaWarningsBtn')||e.target.closest('[data-aa-layer="warnings"]')){this.toggleWarnings(app);return;}
      if(e.target.closest('#aaRefreshAlerts')){this.refreshAlerts(app,{notify:true,quiet:false});return;}
      if(e.target.closest('#aaNotifyBtn')){app.requestNotificationPermission?.();setTimeout(()=>this.render(app),500);return;}
      if(e.target.closest('#aaRegsBtn')){app.openOfficialRegulations?.();return;}
      if(e.target.closest('#aaMapBtn')){app.navigate?.('map');setTimeout(()=>app.ensureMap?.(),100);return;}
      if(e.target.closest('#aaOfflineBtn')){app.saveOfflinePack?.();return;}
    });
    document.addEventListener('input',e=>{
      if(e.target.id==='aaRadarOpacity'){
        const p=this.prefs();p.opacity=Math.max(.25,Math.min(.9,Number(e.target.value)/100));this.savePrefs(p);
        if(this.radarLayer)this.radarLayer.setOpacity(p.opacity);
      }
    });
    const oldRender=app.renderAll?.bind(app);
    if(oldRender)app.renderAll=function(){const out=oldRender();AA.render(this);return out;};
  }
};

window.CastVectorAnglerAdvantage=AA;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>AA.install());else AA.install();
})();