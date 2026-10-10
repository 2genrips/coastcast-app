(function(){
'use strict';

const AO={
  version:'11.0.0',
  pendingArm:false,

  app(){return window.CastVector;},
  native(){return window.CastVectorNative||null;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchAlerts(app);
    this.bind(app);
    this.render(app);
    window.addEventListener('castvector:native-ready',()=>this.render(app));
    window.addEventListener('castvector:notification-permission',e=>{
      if(this.pendingArm&&e.detail?.granted){this.pendingArm=false;this.arm(app);}
      else this.render(app);
    });
  },

  installUI(app){
    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('alwaysOnAnglerPanel')){
      const p=document.createElement('section');p.id='alwaysOnAnglerPanel';p.className='panel always-on-panel';
      p.innerHTML=
        '<div class="ao-head"><div><div class="eyebrow">ALWAYS-ON ANGLER • 11.0</div><h2>CastVector can watch while the app is closed</h2></div><span id="aoBadge" class="ao-badge">ANDROID</span></div>'+
        '<p class="ao-intro">Android checks official NWS warnings and the next 48 hours of fishing conditions in the background. High-impact weather suppresses fishing-window notifications.</p>'+
        '<div class="ao-grid">'+
          '<article><span>WATCHED WATER</span><strong id="aoWater">—</strong><small id="aoWaterMeta">Choose a fishing location</small></article>'+
          '<article><span>TARGET</span><strong id="aoSpecies">—</strong><small id="aoRuleMeta">82+ • max 15 mph</small></article>'+
          '<article><span>NEXT WINDOW</span><strong id="aoWindow">—</strong><small id="aoWindowMeta">Background check pending</small></article>'+
          '<article><span>NATIVE SCORE</span><strong id="aoScore">—</strong><small id="aoScoreMeta">Rechecked fully when app opens</small></article>'+
          '<article><span>NWS STATUS</span><strong id="aoNws">—</strong><small id="aoNwsMeta">Official point alerts</small></article>'+
          '<article><span>LAST CHECK</span><strong id="aoChecked">—</strong><small id="aoCheckMeta">Android WorkManager</small></article>'+
        '</div>'+
        '<div id="aoCall" class="ao-call"><strong>Arm a fishing watch to use native background intelligence.</strong><span>CastVector will use your current species and the closest saved forecast-watch rule.</span></div>'+
        '<div class="ao-actions"><button id="aoArmBtn" class="primary-button" type="button">Arm fishing watch</button><button id="aoCheckBtn" class="secondary-button" type="button">Check now</button><button id="aoWidgetBtn" class="secondary-button" type="button">Add home widget</button><button id="aoDisableBtn" class="ghost-button" type="button">Disable</button></div>'+
        '<p class="ao-foot">Background fishing score uses the same core wind, rain, wave, water-temperature, time and pressure rules as CastVector. Full in-app scoring can still change with live tide, history and exact local data. Android may delay periodic work to protect battery.</p>';
      const center=document.getElementById('dailyAlertCenter'),offline=document.getElementById('offlineProLauncher');
      if(center)center.after(p);else if(offline)offline.before(p);else trips.prepend(p);
    }
  },

  parse(raw){
    if(!raw)return{available:false,enabled:false};
    if(typeof raw==='object')return raw;
    try{return JSON.parse(raw);}catch(_){return{available:false,enabled:false};}
  },

  status(){
    const n=this.native();if(!n?.getSafetyWatchStatus)return{available:false,enabled:false};
    try{return this.parse(n.getSafetyWatchStatus());}catch(_){return{available:false,enabled:false};}
  },

  rule(app){
    const l=app.state.location||{},species=app.state.targetSpecies;
    const rules=(app.state.alertRules||[]).filter(r=>r.enabled!==false&&String(r.species)===String(species))
      .map(r=>({...r,_d:app.haversine(Number(l.lat),Number(l.lon),Number(r.lat),Number(r.lon))}))
      .sort((a,b)=>a._d-b._d);
    const exact=rules.find(r=>r._d<2)||null;
    return{threshold:Math.max(50,Math.min(98,Number(exact?.threshold)||82)),maxWind:Math.max(1,Number(exact?.maxWind)||15),source:exact?'Saved forecast watch':'CastVector default'};
  },

  config(app){
    const l=app.state.location||{},species=app.state.targetSpecies||'Target species',cfg=app.species?.[species]||{water:[55,80],waveIdeal:[.5,4],tideBias:5},rule=this.rule(app);
    const fresh=window.CastVectorFreshwater?.mode?.(app)==='freshwater'||app.state.waterMode?.mode==='freshwater';
    return{
      lat:Number(l.lat),lon:Number(l.lon),name:l.name||'Selected fishing location',species,
      threshold:rule.threshold,maxWind:rule.maxWind,
      waterMin:Number(cfg.water?.[0]??55),waterMax:Number(cfg.water?.[1]??80),
      waveMin:Number(cfg.waveIdeal?.[0]??(fresh?0:.5)),waveMax:Number(cfg.waveIdeal?.[1]??(fresh?2:4)),
      tideBias:Number(cfg.tideBias)||0,mode:fresh?'freshwater':'coast',ruleSource:rule.source
    };
  },

  arm(app,{silent=false}={}){
    const n=this.native(),c=this.config(app);
    if(!n?.enableFishingWatch)return app.showToast?.('Always-On Angler requires the Android Play build.');
    const st=this.status();
    if(!st.notificationGranted){
      this.pendingArm=true;
      try{n.requestNotificationPermission?.();if(!silent)app.showToast?.('Allow notifications so CastVector can watch in the background.');}catch(_){this.pendingArm=false;}
      return;
    }
    try{
      const r=n.enableFishingWatch(c.lat,c.lon,c.name,c.species,c.threshold,c.maxWind,c.waterMin,c.waterMax,c.waveMin,c.waveMax,c.tideBias,c.mode);
      if(r==='enabled'&&!silent)app.showToast?.('Always-On Angler armed for '+c.species+' at '+c.name+'.');
      else if(r==='permission_required'){this.pendingArm=true;n.requestNotificationPermission?.();}
      else if(r!=='enabled'&&!silent)app.showToast?.('Could not arm the background fishing watch.');
    }catch(_){if(!silent)app.showToast?.('Could not arm the background fishing watch.');}
    setTimeout(()=>this.render(app),450);
  },

  disable(app){
    const n=this.native();if(!n?.disableSafetyWatch)return;
    try{n.disableSafetyWatch();app.showToast?.('Always-On Angler disabled.');}catch(_){}
    setTimeout(()=>this.render(app),300);
  },

  check(app){
    const n=this.native();if(!n?.checkSafetyWatchNow)return;
    try{const r=n.checkSafetyWatchNow();app.showToast?.(r==='queued'?'Native fishing + safety check queued.':'Arm the background watch first.');}catch(_){app.showToast?.('Could not queue the native check.');}
    setTimeout(()=>this.render(app),1400);
  },

  pinWidget(app){
    const n=this.native();if(!n?.pinFishingWidget)return app.showToast?.('The CastVector widget requires the Android Play build.');
    try{
      const r=n.pinFishingWidget();
      if(r==='requested')app.showToast?.('Confirm Add widget on your Android screen.');
      else if(r==='unsupported')app.showToast?.('Long-press your Android Home screen → Widgets → CastVector.');
      else app.showToast?.('Use Home screen → Widgets → CastVector to add the fishing widget.');
    }catch(_){app.showToast?.('Use Home screen → Widgets → CastVector to add the fishing widget.');}
  },

  sameWater(app,st){
    const l=app.state.location||{};
    return !!(st?.enabled&&st?.name&&String(st.name)===String(l.name));
  },

  render(app){
    const st=this.status(),cfg=this.config(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const badge=document.getElementById('aoBadge'),arm=document.getElementById('aoArmBtn'),check=document.getElementById('aoCheckBtn'),disable=document.getElementById('aoDisableBtn'),widget=document.getElementById('aoWidgetBtn');

    if(!st.available){
      if(badge){badge.textContent='ANDROID BUILD REQUIRED';badge.className='ao-badge';}
      set('aoWater','WEB / PWA');set('aoWaterMeta','Native background work unavailable');
      set('aoSpecies',cfg.species);set('aoRuleMeta',cfg.threshold+'+ • max '+cfg.maxWind+' mph');
      set('aoWindow','—');set('aoWindowMeta','Install the Android Play build');
      set('aoScore','—');set('aoNws','—');set('aoChecked','—');
      const call=document.getElementById('aoCall');if(call)call.innerHTML='<strong>Always-On Angler is a native Android feature.</strong><span>The live web app still has normal in-app forecast watches and NWS checks.</span>';
      if(arm)arm.disabled=true;if(check)check.disabled=true;if(disable)disable.disabled=true;if(widget)widget.disabled=true;return;
    }

    const same=this.sameWater(app,st),fishing=!!st.fishingEnabled;
    if(badge){badge.textContent=st.enabled?(fishing?'WATCHING':'SAFETY ONLY'):'OFF';badge.className='ao-badge '+(st.enabled?'live':'');}
    set('aoWater',st.enabled?(st.name||cfg.name):cfg.name);set('aoWaterMeta',st.enabled?(same?'Matches selected fishing location':'Watching a different location'):'Not armed');
    set('aoSpecies',fishing?(st.species||cfg.species):cfg.species);set('aoRuleMeta',(fishing?(st.threshold||cfg.threshold):cfg.threshold)+'+ • max '+(fishing?(st.maxWind||cfg.maxWind):cfg.maxWind)+' mph');
    set('aoWindow',fishing?(st.lastWindowTime||'CHECKING'):'—');
    set('aoWindowMeta',fishing?(st.lastWindowQualified?'Qualifying background window':'Best background window; below current trigger'):'Fishing-window watch is off');
    set('aoScore',fishing&&Number(st.lastWindowScore)>0?st.lastWindowScore+'/100':'—');
    set('aoScoreMeta','Full tide + personal score is rechecked in-app');
    set('aoNws',Number(st.lastAlertCount)>0?st.lastAlertCount+' ACTIVE':'CLEAR');
    set('aoNwsMeta',st.lastEvent||'No high-impact event recorded');
    set('aoChecked',st.lastChecked?new Date(Number(st.lastChecked)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'NOT YET');
    set('aoCheckMeta',st.lastStatus==='retry'?'Provider retry scheduled':st.lastStatus==='error'?(st.lastError||'Last check failed'):'Android background check');

    const call=document.getElementById('aoCall');
    if(call){
      if(!st.enabled)call.innerHTML='<strong>Arm '+app.escape(cfg.species)+' at '+app.escape(cfg.name)+'.</strong><span>'+cfg.threshold+'+ background score • '+cfg.maxWind+' mph max wind • '+app.escape(cfg.ruleSource)+'.</span>';
      else if(!same)call.innerHTML='<strong>Android is watching '+app.escape(st.name||'another water')+'.</strong><span>Tap Update watch to switch Always-On Angler to the location currently open in CastVector.</span>';
      else if(Number(st.lastAlertCount)>0)call.innerHTML='<strong>Official NWS alerts are active.</strong><span>Fishing-window notifications are suppressed when a high-impact warning is active.</span>';
      else if(st.lastWindowQualified)call.innerHTML='<strong>'+app.escape(st.species||cfg.species)+' has a qualifying background window.</strong><span>'+app.escape(st.lastWindowTime||'Upcoming')+' • '+Number(st.lastWindowScore||0)+'/100. Open CastVector for the full trip decision.</span>';
      else call.innerHTML='<strong>Always-On Angler is watching.</strong><span>No background window currently clears the saved score/wind rule.</span>';
    }

    if(arm){arm.disabled=false;arm.textContent=st.enabled?(same?'Update fishing watch':'Switch watch to this water'):'Arm fishing watch';}
    if(check)check.disabled=!st.enabled;if(disable)disable.disabled=!st.enabled;if(widget)widget.disabled=false;
  },

  patchAlerts(app){
    if(app._alwaysOnAlertPatch)return;app._alwaysOnAlertPatch=true;
    const old=app.saveAlertRule?.bind(app);
    if(old)app.saveAlertRule=function(){
      const out=old();
      setTimeout(()=>{
        const st=AO.status();
        if(st.fishingEnabled&&AO.sameWater(this,st))AO.arm(this,{silent:true});
        AO.render(this);
      },120);
      return out;
    };
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#aoArmBtn')){this.arm(app);return;}
      if(e.target.closest('#aoCheckBtn')){this.check(app);return;}
      if(e.target.closest('#aoWidgetBtn')){this.pinWidget(app);return;}
      if(e.target.closest('#aoDisableBtn')){this.disable(app);return;}
    });
    const old=app.renderAll?.bind(app);
    if(old)app.renderAll=function(){const out=old();AO.render(this);return out;};
  }
};

window.CastVectorAlwaysOn=AO;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>AO.install());else AO.install();
})();