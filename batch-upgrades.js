(function(){
'use strict';

const B={
  version:'9.5.0',
  heatLayer:null,
  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.installGrowthUI(app);
    this.patchCore(app);
    this.patchCommunity(app);
    this.patchCatch(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
    setTimeout(()=>this.maybeOnboard(app),450);
  },

  installUI(app){
    const home=document.getElementById('view-home');
    if(home&&!document.getElementById('brain3Panel')){
      const p=document.createElement('section');p.id='brain3Panel';p.className='panel brain3-panel';
      p.innerHTML='<div class="b95-head"><div><div class="eyebrow">PERSONAL BRAIN 3.0 • 9.5</div><h2>Your edge today</h2></div><span id="brain3Badge" class="b95-badge">LEARNING</span></div>'+
        '<div class="brain3-hero"><div class="brain3-score"><strong id="brain3Score">—</strong><span>MATCH</span></div><div><h3 id="brain3Title">Log catches to unlock your edge.</h3><p id="brain3Detail">CastVector will compare today with the conditions, bait, tide and time that have actually worked for you.</p></div></div>'+
        '<div class="brain3-grid"><article><span>BAIT</span><strong id="brain3Bait">—</strong><small>Best personal signal</small></article><article><span>TIME</span><strong id="brain3Time">—</strong><small>Most productive period</small></article><article><span>TIDE</span><strong id="brain3Tide">—</strong><small>Personal history</small></article><article><span>WIND</span><strong id="brain3Wind">—</strong><small>Successful range</small></article><article><span>WATER</span><strong id="brain3Water">—</strong><small>Successful range</small></article><article><span>ZONE</span><strong id="brain3Zone">—</strong><small>Private Pattern Atlas</small></article></div>'+
        '<div class="brain3-action"><strong id="brain3Move">Your next move will appear here.</strong><small id="brain3Confidence">Personal confidence is still building.</small></div>';
      const quick=document.getElementById('quickAnswerPanel');if(quick)quick.after(p);else home.prepend(p);
    }

    const community=document.getElementById('view-community');
    if(community&&!document.getElementById('communityPulsePanel')){
      const p=document.createElement('section');p.id='communityPulsePanel';p.className='panel community-pulse-panel';
      p.innerHTML='<div class="b95-head"><div><div class="eyebrow">COMMUNITY PULSE • 9.5</div><h2>What anglers are actually reporting</h2></div><span id="communityPulseBadge" class="b95-badge">PRIVATE-SAFE</span></div>'+
        '<div class="community-pulse-grid"><article><strong id="cpNearby">0</strong><span>Shared nearby</span></article><article><strong id="cpSpecies">—</strong><span>Top species</span></article><article><strong id="cpBait">—</strong><span>Trending bait</span></article><article><strong id="cpFresh">—</strong><span>Latest share</span></article></div>'+
        '<div id="communityPulseInsight" class="community-pulse-insight">Community intelligence will grow as anglers share catches.</div>'+
        '<div class="community-pulse-actions"><button id="cpHeatBtn" class="primary-button small" type="button">Show catch heat on map</button><button id="cpRefreshBtn" class="secondary-button small" type="button">Refresh Community</button></div>';
      const hero=community.querySelector('.community-hero,.community-mode-panel,.panel');if(hero)hero.after(p);else community.prepend(p);
    }

    const dock=document.querySelector('#mapProDock .map-pro-layers');
    if(dock&&!dock.querySelector('[data-b95-layer="heat"]')){
      const b=document.createElement('button');b.type='button';b.dataset.b95Layer='heat';b.textContent='Catch Heat';dock.appendChild(b);
    }

    if(!document.getElementById('offlineProDialog')){
      const d=document.createElement('dialog');d.id='offlineProDialog';d.className='sheet-dialog offline-pro-dialog';
      d.innerHTML='<div class="sheet-card offline-pro-sheet">'+
        '<div class="b95-head"><div><div class="eyebrow">OFFLINE TRIPS PRO • 9.5</div><h2>Prepare before signal disappears</h2><p>Save the trip plan and real map tiles together, then manage what stays on your device.</p></div><button id="offlineProClose" class="icon-button" type="button">×</button></div>'+
        '<div class="offline-pro-status"><div><span>CURRENT LOCATION</span><strong id="offlineProLocation">—</strong></div><div><span>MAP AREA</span><strong id="offlineProCurrent">NOT SAVED</strong></div><div><span>TRIP SNAPSHOT</span><strong id="offlineProPack">NOT SAVED</strong></div></div>'+
        '<div class="offline-pro-actions"><button id="offlinePrepareBtn" class="primary-button" type="button">Prepare offline trip</button><button id="offlineRefreshBtn" class="secondary-button" type="button">Refresh current area</button><button id="offlineClearAllBtn" class="ghost-button" type="button">Clear downloaded maps</button></div>'+
        '<div class="offline-pro-sub">DOWNLOADED MAP AREAS</div><div id="offlineProList" class="offline-pro-list"></div>'+
        '<p class="offline-pro-note">Forecasts and rules can change. Offline data is a snapshot; reconnect and refresh before travel whenever possible.</p>'+
      '</div>';
      document.body.appendChild(d);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('offlineProLauncher')){
      const p=document.createElement('section');p.id='offlineProLauncher';p.className='panel offline-pro-launcher';
      p.innerHTML='<div><div class="eyebrow">OFFLINE READY • 9.5</div><h2>One tap before you lose service</h2><p id="offlineLauncherMeta">Save this trip’s forecast, trust snapshot and map area together.</p></div><button id="offlineProOpen" class="primary-button" type="button">Offline Trip Manager</button>';
      const core=document.getElementById('competitiveCorePanel');if(core)core.after(p);else trips.prepend(p);
    }
  },

  installGrowthUI(app){
    if(!document.getElementById('firstTripCoachDialog')){
      const d=document.createElement('dialog');d.id='firstTripCoachDialog';d.className='sheet-dialog first-trip-dialog';
      d.innerHTML='<div class="sheet-card first-trip-sheet">'+
        '<div class="b95-head"><div><div class="eyebrow">FIRST TRIP COACH • 9.5</div><h2>Make CastVector fit how you fish</h2><p>Three quick choices. No account required.</p></div><button id="firstTripClose" class="icon-button" type="button">×</button></div>'+
        '<div class="coach-step"><span>1 • EXPERIENCE</span><div class="coach-choices"><button type="button" data-coach-exp="new">New angler</button><button type="button" data-coach-exp="regular">Regular angler</button><button type="button" data-coach-exp="advanced">Advanced</button></div></div>'+
        '<div class="coach-step"><span>2 • WATER</span><div class="coach-choices"><button type="button" data-coach-water="coast">Coast</button><button type="button" data-coach-water="freshwater">Freshwater</button></div></div>'+
        '<div class="coach-step"><span>3 • MAIN GOAL</span><div class="coach-choices coach-goals"><button type="button" data-coach-goal="spots">Find better spots</button><button type="button" data-coach-goal="plan">Plan trips</button><button type="button" data-coach-goal="learn">Learn conditions</button><button type="button" data-coach-goal="log">Track catches</button></div></div>'+
        '<div id="coachSummary" class="coach-summary">Choose one option in each section.</div>'+
        '<button id="coachFinishBtn" class="primary-button full" type="button" disabled>Build my CastVector</button>'+
      '</div>';
      document.body.appendChild(d);
    }

    const quick=document.querySelector('#quickAnswerPanel .quick-answer-actions');
    if(quick&&!document.getElementById('b95SharePlanBtn')){
      const b=document.createElement('button');b.id='b95SharePlanBtn';b.className='ghost-button';b.type='button';b.textContent='Share trip card';quick.appendChild(b);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('rerunCoachBtn')){
      const b=document.createElement('button');b.id='rerunCoachBtn';b.className='secondary-button';b.type='button';b.textContent='Run First Trip Coach';
      const panel=document.getElementById('coreProfilePanel');if(panel)panel.appendChild(b);else profile.appendChild(b);
    }
  },

  coachState(){return this._coach||(this._coach={experience:null,water:null,goal:null});},

  maybeOnboard(app){
    let done=false;try{done=!!localStorage.getItem('castvector-first-trip-coach-v95');}catch(_){}
    const hasHistory=(app.state.catches||[]).length||(app.state.waypoints||[]).length||Number(app.state.trips||0)>0;
    if(!done&&!hasHistory)this.openCoach();
  },

  openCoach(){
    this._coach={experience:null,water:null,goal:null};
    document.querySelectorAll('[data-coach-exp],[data-coach-water],[data-coach-goal]').forEach(b=>b.classList.remove('active'));
    const d=document.getElementById('firstTripCoachDialog');if(d&&!d.open)d.showModal();
    this.renderCoach();
  },

  renderCoach(){
    const c=this.coachState(),summary=document.getElementById('coachSummary'),finish=document.getElementById('coachFinishBtn');
    const labels={new:'New angler',regular:'Regular angler',advanced:'Advanced',coast:'Coast',freshwater:'Freshwater',spots:'Find better spots',plan:'Plan trips',learn:'Learn conditions',log:'Track catches'};
    if(summary)summary.textContent=c.experience&&c.water&&c.goal?labels[c.experience]+' • '+labels[c.water]+' • '+labels[c.goal]:'Choose one option in each section.';
    if(finish)finish.disabled=!(c.experience&&c.water&&c.goal);
  },

  finishCoach(app){
    const c=this.coachState();if(!(c.experience&&c.water&&c.goal))return;
    try{localStorage.setItem('castvector-first-trip-coach-v95',JSON.stringify({...c,at:new Date().toISOString()}));}catch(_){}
    app.state.experience={...app.state.experience,mode:c.experience==='advanced'?'full':'simple'};
    const fw=window.CastVectorFreshwater;if(fw?.setMode)fw.setMode(app,c.water);
    else app.save?.();
    document.getElementById('firstTripCoachDialog')?.close();
    const dest={spots:'map',plan:'trips',learn:'forecast',log:'logbook'}[c.goal]||'home';
    app.navigate?.(dest);app.showToast?.('CastVector is set up around how you want to fish.');
  },

  tripCardData(app){
    const cmd=app.commandRecommendation?.()||{},best=cmd.best||{},bait=app.baitIntelligence?.(cmd.species||app.state.targetSpecies)||{},c=app.state.data?.current||{};
    const trust=window.CastVectorAnglerAdvantage?.trust?.(app),personal=this.personalData(app);
    const loc=app.generalizeWater?.(app.state.location?.name||'Fishing location')||app.state.location?.name||'Fishing location';
    return{
      location:loc,target:cmd.species||app.state.targetSpecies,score:Number(cmd.speciesScore||best.score||app.currentScore?.()||0),
      window:best.window?.label||app.bestWindowToday?.()?.label||'Check forecast',
      bait:bait.primary||'Check bait plan',backup:bait.backup||'',rig:bait.rig||'',wind:Number(c.windSpeed),wave:Number(c.waveHeight),
      trust:trust?.score??null,personal:personal.match,call:cmd.call||'CastVector fishing plan'
    };
  },

  async buildTripCard(app){
    const d=this.tripCardData(app),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
    const g=ctx.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#07131b');g.addColorStop(.6,'#0b2936');g.addColorStop(1,'#07131b');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);
    ctx.fillStyle='#19d7ba';ctx.font='900 44px system-ui';ctx.fillText('CASTVECTOR',70,110);
    ctx.fillStyle='#84b9cc';ctx.font='700 22px system-ui';ctx.fillText('PLAN SMARTER. FISH BETTER.',70,146);
    ctx.fillStyle='#f5fbff';ctx.font='900 66px system-ui';ctx.fillText('MY FISHING PLAN',70,245);
    ctx.fillStyle='#8bc2d3';ctx.font='700 25px system-ui';ctx.fillText(String(d.location).slice(0,48),70,292);
    ctx.fillStyle='#0f3441';ctx.fillRect(70,350,940,220);
    ctx.fillStyle='#7fdccb';ctx.font='800 22px system-ui';ctx.fillText('TARGET',105,405);ctx.fillText('CASTVECTOR SCORE',610,405);
    ctx.fillStyle='#f4fbff';ctx.font='900 48px system-ui';ctx.fillText(String(d.target).slice(0,24),105,470);ctx.font='900 72px system-ui';ctx.fillText(String(d.score),610,485);
    const rows=[['BEST WINDOW',d.window],['START WITH',d.bait],['BACKUP',d.backup||'—'],['RIG',d.rig||'—'],['WIND',Number.isFinite(d.wind)?Math.round(d.wind)+' mph':'—'],['SURF / WAVE',Number.isFinite(d.wave)?d.wave.toFixed(1)+' ft':'—']];
    rows.forEach((r,i)=>{const y=645+i*82;ctx.fillStyle='#7fa6b5';ctx.font='800 20px system-ui';ctx.fillText(r[0],80,y);ctx.fillStyle='#eef9fd';ctx.font='800 31px system-ui';ctx.fillText(String(r[1]).slice(0,42),320,y);});
    ctx.fillStyle='#0f2b37';ctx.fillRect(70,1138,940,105);ctx.fillStyle='#7fdccb';ctx.font='800 19px system-ui';ctx.fillText('TRIP TRUST',100,1180);ctx.fillText('PERSONAL MATCH',450,1180);ctx.fillStyle='#f4fbff';ctx.font='900 32px system-ui';ctx.fillText(d.trust==null?'—':d.trust+'/100',100,1220);ctx.fillText(d.personal==null?'LEARNING':d.personal+'%',450,1220);
    ctx.fillStyle='#688b99';ctx.font='600 18px system-ui';ctx.fillText('Location is generalized on shared cards • Verify weather, access and regulations before fishing.',70,1310);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)return null;
    let file=null;try{file=new File([blob],'castvector-trip-plan.jpg',{type:'image/jpeg'});}catch(_){}
    return{blob,file};
  },

  async shareTripCard(app){
    const built=await this.buildTripCard(app);if(!built)return app.showToast?.('Could not build the trip card.');
    const d=this.tripCardData(app),text='CastVector fishing plan • '+d.target+' • '+d.score+'/100 • '+d.window;
    try{
      if(built.file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[built.file]}))){await navigator.share({title:'CastVector fishing plan',text,files:[built.file]});return;}
    }catch(e){if(e?.name==='AbortError')return;}
    const u=URL.createObjectURL(built.blob),a=document.createElement('a');a.href=u;a.download='castvector-trip-plan.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(u),1200);app.showToast?.('Trip card downloaded.');
  },

  personalData(app){
    const catches=(app.state.catches||[]).filter(c=>c.species===app.state.targetSpecies);
    const p=app.personalPattern?.()||{};
    const nums=(key)=>catches.map(c=>Number(c.conditionData?.[key])).filter(Number.isFinite);
    const band=arr=>{
      if(!arr.length)return null;
      arr.sort((a,b)=>a-b);const lo=arr[Math.floor((arr.length-1)*.2)],hi=arr[Math.floor((arr.length-1)*.8)];
      return{lo,hi,avg:arr.reduce((a,b)=>a+b,0)/arr.length};
    };
    const wind=band(nums('wind')),water=band(nums('water'));
    let zone=null;try{zone=window.CastVectorPatternAtlas?.cluster?.(app)?.find(z=>z.topSpecies===app.state.targetSpecies)||window.CastVectorPatternAtlas?.cluster?.(app)?.[0]||null;}catch(_){}
    const match=Number.isFinite(Number(p.score))?Number(p.score):null,confidence=Number(p.confidence)||0;
    const c=app.state.data?.current||{};
    const moves=[];
    if(p.topBait&&p.topBait!=='Not enough data')moves.push('Start with '+p.topBait);
    if(p.bestTime&&p.bestTime!=='Not enough data')moves.push('favor '+String(p.bestTime).toLowerCase());
    if(p.bestTide&&p.bestTide!=='Not enough data')moves.push('watch '+String(p.bestTide).toLowerCase());
    if(wind&&Number.isFinite(Number(c.windSpeed))&&(c.windSpeed<wind.lo-3||c.windSpeed>wind.hi+3))moves.push('today’s wind is outside your strongest range');
    const title=match==null?'CastVector is still learning you':match>=85?'Very close to your successful pattern':match>=70?'Good personal setup today':match>=55?'Some of your successful signals are present':'Today differs from your usual wins';
    return{catches,p,wind,water,zone,match,confidence,title,move:moves.join(' • ')||'Log bait, tide and conditions on catches to strengthen this recommendation.'};
  },

  renderBrain(app){
    const d=this.personalData(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('brain3Score',d.match==null?'—':d.match);
    set('brain3Badge',d.catches.length>=6?'STRONG':d.catches.length>=3?'GROWING':d.catches.length?'LEARNING':'START');
    set('brain3Title',d.title);
    set('brain3Detail',d.catches.length?'Built from '+d.catches.length+' logged '+app.state.targetSpecies+' catch'+(d.catches.length===1?'':'es')+'.':'Your own catches will become a private fishing model.');
    set('brain3Bait',d.p.topBait||'—');set('brain3Time',d.p.bestTime||'—');set('brain3Tide',d.p.bestTide||'—');
    set('brain3Wind',d.wind?Math.round(d.wind.lo)+'–'+Math.round(d.wind.hi)+' mph':'—');
    set('brain3Water',d.water?Math.round(d.water.lo)+'–'+Math.round(d.water.hi)+'°F':'—');
    set('brain3Zone',d.zone?String(d.zone.patternScore)+'/100':'—');
    set('brain3Move',d.move);set('brain3Confidence',d.catches.length?d.confidence+'% personal confidence • private to your CastVector data':'Personal confidence is still building.');
  },

  realCommunityPosts(app){
    const cloud=(app._cloudCommunityPosts||[]).filter(p=>!p.demo);
    const local=(app.normalizeLocalCommunityPosts?.()||[]).filter(p=>!p.demo);
    const seen=new Set(),out=[];
    [...cloud,...local].forEach(p=>{const k=String(p.id);if(!seen.has(k)){seen.add(k);out.push(p);}});
    return out;
  },

  mode(values){
    const m=new Map();values.filter(Boolean).forEach(v=>m.set(String(v),1+(m.get(String(v))||0)));
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
  },

  renderCommunityPulse(app){
    const posts=this.realCommunityPosts(app),l=app.state.location||{},near=posts.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&app.haversine(l.lat,l.lon,p.lat,p.lon)<=25);
    const topSpecies=this.mode(near.map(p=>p.species)),bait=this.mode(near.map(p=>p.bait).filter(x=>x&&x!=='Not listed'));
    const dates=near.map(p=>new Date(p.date||0)).filter(d=>Number.isFinite(d.getTime())).sort((a,b)=>b-a),fresh=dates[0];
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('cpNearby',near.length);set('cpSpecies',topSpecies);set('cpBait',bait);set('cpFresh',fresh?app.prettyDate(fresh.toISOString()):'—');
    const insight=document.getElementById('communityPulseInsight');
    if(insight)insight.textContent=near.length?near.length+' real shared catch'+(near.length===1?'':'es')+' within 25 miles. '+(topSpecies!=='—'?topSpecies+' is the most-shared species nearby. ':'')+(bait!=='—'?bait+' is the most-reported bait in this sample.':''):'No real shared catches are available within 25 miles yet. CastVector does not use demo posts for Community Pulse.';
    const badge=document.getElementById('communityPulseBadge');if(badge)badge.textContent=near.length?'REAL SHARES':'NETWORK GROWING';
  },

  heatGroups(app){
    const posts=this.realCommunityPosts(app).filter(p=>p.locationPrecision!=='hidden'&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)>1),groups=new Map();
    posts.forEach(p=>{
      const lat=Math.round(p.lat*10)/10,lon=Math.round(p.lon*10)/10,k=lat.toFixed(1)+','+lon.toFixed(1);
      const g=groups.get(k)||{lat:0,lon:0,n:0,posts:[]};g.lat+=p.lat;g.lon+=p.lon;g.n++;g.posts.push(p);groups.set(k,g);
    });
    return [...groups.values()].map(g=>({...g,lat:g.lat/g.n,lon:g.lon/g.n,species:this.mode(g.posts.map(p=>p.species)),bait:this.mode(g.posts.map(p=>p.bait).filter(x=>x&&x!=='Not listed'))})).sort((a,b)=>b.n-a.n);
  },

  toggleHeat(app){
    const map=app.state.map;if(!map||!window.L){app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.toggleHeat(app);},180);return;}
    if(this.heatLayer){try{map.removeLayer(this.heatLayer);}catch(_){}this.heatLayer=null;this.renderHeatButton();app.showToast?.('Community catch heat hidden.');return;}
    const groups=this.heatGroups(app),layer=L.layerGroup();
    groups.slice(0,80).forEach(g=>{
      const radius=Math.max(1800,Math.min(9000,1800+g.n*900));
      const c=L.circle([g.lat,g.lon],{radius,weight:2,fillOpacity:Math.min(.22,.05+g.n*.025),opacity:.6});
      c.bindPopup('<div class="cc-popup"><strong>'+g.n+' shared catch'+(g.n===1?'':'es')+'</strong><br><span>Community activity zone</span><br><small>'+app.escape(g.species)+' • '+app.escape(g.bait)+'</small><br><small>Broad visualization only; exact private/hidden spots are not exposed.</small></div>');
      c.addTo(layer);
    });
    layer.addTo(map);this.heatLayer=layer;this.renderHeatButton();
    app.showToast?.(groups.length?groups.length+' Community activity zone'+(groups.length===1?'':'s')+' shown.':'No real shared Community locations are available yet.');
  },

  renderHeatButton(){document.querySelectorAll('[data-b95-layer="heat"]').forEach(b=>b.classList.toggle('active',!!this.heatLayer));},

  patchCommunity(app){
    if(app._b95Community)return;app._b95Community=true;
    const old=app.loadCloudCommunity?.bind(app);
    if(old)app.loadCloudCommunity=async function(opts={}){const out=await old(opts);B.renderCommunityPulse(this);if(B.heatLayer){try{this.state.map?.removeLayer(B.heatLayer);}catch(_){}B.heatLayer=null;B.toggleHeat(this);}return out;};
  },

  patchCatch(app){
    if(app._b95Catch)return;app._b95Catch=true;
    const old=app.saveCatch?.bind(app);
    if(old)app.saveCatch=function(){const out=old();B.renderBrain(this);B.renderCommunityPulse(this);return out;};
  },

  patchCore(app){
    const c=window.CastVectorCompetitiveCore;if(!c||c._b95Patched)return;c._b95Patched=true;
    const old=c.downloadOfflineMap?.bind(c);
    if(old)c.downloadOfflineMap=async function(a){
      const before=this.offlineList().map(x=>x.id),out=await old(a),list=this.offlineList();
      const item=list.find(x=>!before.includes(x.id))||this.offlineFor(a);
      if(item&&!Array.isArray(item.urls)){
        const l=item,base=item.base||window.CastVectorMapPro?.activeBase||'hybrid',z0=item.zoom||13,coords=[],seen=new Set(),add=(z,x,y)=>{const n=Math.pow(2,z);x=Math.max(0,Math.min(n-1,x));y=Math.max(0,Math.min(n-1,y));const k=z+'/'+x+'/'+y;if(!seen.has(k)){seen.add(k);coords.push({z,x,y});}};
        for(const z of [Math.max(8,z0-1),z0,Math.min(16,z0+1)]){const cc=this.tileXY(Number(l.lat),Number(l.lon),z);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)add(z,cc.x+dx,cc.y+dy);}
        const cc=this.tileXY(Number(l.lat),Number(l.lon),z0);for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)add(z0,cc.x+dx,cc.y+dy);
        item.urls=coords.map(t=>this.tileUrl(base,t.z,t.x,t.y));this.saveOfflineList(list);
      }
      B.renderOffline(a);return out;
    };
  },

  offlineCore(){return window.CastVectorCompetitiveCore;},

  tripPackFor(app){
    const l=app.state.location||{};
    return (app.state.offlinePacks||[]).find(p=>p.location&&app.haversine(Number(p.location.lat),Number(p.location.lon),Number(l.lat),Number(l.lon))<1&&String(p.species)===String(app.state.targetSpecies))||null;
  },

  renderOffline(app){
    const c=this.offlineCore(),list=c?.offlineList?.()||[],current=c?.offlineFor?.(app)||null,pack=this.tripPackFor(app);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('offlineProLocation',app.state.location?.name||'Fishing location');set('offlineProCurrent',current?'READY':'NOT SAVED');set('offlineProPack',pack?'READY':'NOT SAVED');
    const box=document.getElementById('offlineProList');
    if(box)box.innerHTML=list.length?list.map(x=>{
      const age=Math.max(0,(Date.now()-new Date(x.savedAt).getTime())/3600000),ageText=age<24?Math.round(age)+'h old':Math.round(age/24)+'d old';
      return '<article class="offline-pro-row"><div><strong>'+app.escape(x.name||'Fishing map area')+'</strong><span>'+app.escape(String(x.base||'map').toUpperCase())+' • '+Number(x.tiles||0)+' tiles • '+ageText+'</span></div><div><button class="mini-button" type="button" data-offline-center="'+x.id+'">Use</button><button class="mini-button" type="button" data-offline-delete="'+x.id+'">Delete</button></div></article>';
    }).join(''):'<div class="empty-state">No downloaded map areas yet.</div>';
    const meta=document.getElementById('offlineLauncherMeta');if(meta)meta.textContent=current&&pack?'This location is ready with both a trip snapshot and map area.':current?'Map area saved; add a trip snapshot for full offline readiness.':pack?'Trip snapshot saved; download the map area too.':'Save this trip’s forecast, trust snapshot and map area together.';
  },

  async prepareOffline(app){
    app.saveOfflinePack?.();
    const c=this.offlineCore();if(c)await c.downloadOfflineMap(app);
    this.renderOffline(app);app.showToast?.('Offline trip prepared on this device.');
  },

  async deleteOffline(app,id){
    const c=this.offlineCore();if(!c)return;
    const list=c.offlineList(),item=list.find(x=>String(x.id)===String(id));
    if(item&&'caches'in window&&Array.isArray(item.urls)){try{const cache=await caches.open(c.mapCache);await Promise.all(item.urls.map(u=>cache.delete(u)));}catch(_){}}
    c.saveOfflineList(list.filter(x=>String(x.id)!==String(id)));this.renderOffline(app);c.renderTrips?.(app);app.showToast?.('Offline map area removed.');
  },

  async clearOffline(app){
    if('caches'in window){try{await caches.delete(this.offlineCore()?.mapCache||'castvector-offline-map-v90');}catch(_){}}
    this.offlineCore()?.saveOfflineList?.([]);this.renderOffline(app);this.offlineCore()?.renderTrips?.(app);app.showToast?.('Downloaded map areas cleared.');
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();B.render(this);return out;};
    const prof=app.renderProfile?.bind(app);if(prof)app.renderProfile=function(){const out=prof();B.renderBrain(this);return out;};
  },

  render(app){
    this.renderBrain(app);this.renderCommunityPulse(app);this.renderOffline(app);this.renderHeatButton();
  },

  bind(app){
    document.addEventListener('click',e=>{
      const exp=e.target.closest('[data-coach-exp]');if(exp){this.coachState().experience=exp.dataset.coachExp;document.querySelectorAll('[data-coach-exp]').forEach(b=>b.classList.toggle('active',b===exp));this.renderCoach();return;}
      const water=e.target.closest('[data-coach-water]');if(water){this.coachState().water=water.dataset.coachWater;document.querySelectorAll('[data-coach-water]').forEach(b=>b.classList.toggle('active',b===water));this.renderCoach();return;}
      const goal=e.target.closest('[data-coach-goal]');if(goal){this.coachState().goal=goal.dataset.coachGoal;document.querySelectorAll('[data-coach-goal]').forEach(b=>b.classList.toggle('active',b===goal));this.renderCoach();return;}
      if(e.target.closest('#coachFinishBtn')){this.finishCoach(app);return;}
      if(e.target.closest('#firstTripClose')){document.getElementById('firstTripCoachDialog')?.close();return;}
      if(e.target.closest('#rerunCoachBtn')){this.openCoach();return;}
      if(e.target.closest('#b95SharePlanBtn')){this.shareTripCard(app);return;}
      if(e.target.closest('#cpHeatBtn')||e.target.closest('[data-b95-layer="heat"]')){app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.toggleHeat(app);},160);return;}
      if(e.target.closest('#cpRefreshBtn')){app.loadCloudCommunity?.({quiet:false});return;}
      if(e.target.closest('#offlineProOpen')){this.renderOffline(app);const d=document.getElementById('offlineProDialog');if(d&&!d.open)d.showModal();return;}
      if(e.target.closest('#offlineProClose')){document.getElementById('offlineProDialog')?.close();return;}
      if(e.target.closest('#offlinePrepareBtn')){this.prepareOffline(app);return;}
      if(e.target.closest('#offlineRefreshBtn')){this.offlineCore()?.downloadOfflineMap?.(app).then(()=>this.renderOffline(app));return;}
      if(e.target.closest('#offlineClearAllBtn')){this.clearOffline(app);return;}
      const del=e.target.closest('[data-offline-delete]');if(del){this.deleteOffline(app,del.dataset.offlineDelete);return;}
      const use=e.target.closest('[data-offline-center]');if(use){
        const c=this.offlineCore(),x=c?.offlineList?.().find(v=>String(v.id)===String(use.dataset.offlineCenter));if(!x)return;
        app.state.location={key:'offline-map',name:x.name,lat:Number(x.lat),lon:Number(x.lon),source:'Offline map area'};app.onLocationChanged?.();document.getElementById('offlineProDialog')?.close();app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();app.state.map?.setView([x.lat,x.lon],x.zoom||13);},160);return;
      }
    });
  }
};

window.CastVectorBatchUpgrades=B;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>B.install());else B.install();
})();