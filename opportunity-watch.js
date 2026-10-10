(function(){
'use strict';

const O={
  version:'12.0.0',
  pending:false,
  app(){return window.CastVector;},
  native(){return window.CastVectorNative||null;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('biteWatchPanel')){
      const p=document.createElement('section');p.id='biteWatchPanel';p.className='panel bite-watch-panel';
      p.innerHTML='<div class="bw-head"><div><div class="eyebrow">BACKGROUND BITE WATCH • 12.0</div><h2>Let CastVector watch while the app is closed</h2></div><span id="biteWatchBadge" class="bw-badge">CHECKING</span></div>'+
        '<p class="bw-note">Android-only. Watches one selected fishing destination with a battery-conscious background forecast check and notifies you when the best 24-hour opportunity reaches your threshold.</p>'+
        '<div class="bw-grid"><article><span>WATCHING</span><strong id="bwWater">—</strong><small id="bwSpecies">Current target</small></article><article><span>THRESHOLD</span><strong id="bwThreshold">—</strong><small>Fishing opportunity score</small></article><article><span>LAST SCORE</span><strong id="bwLastScore">—</strong><small id="bwBestTime">No background check yet</small></article><article><span>LAST CHECK</span><strong id="bwLastCheck">—</strong><small id="bwStatus">Android worker status</small></article></div>'+
        '<div class="bw-controls"><label><span>Notify me at</span><select id="bwThresholdSelect" class="select-control"><option value="70">70+ Good</option><option value="75">75+ Strong</option><option value="80" selected>80+ Prime</option><option value="85">85+ Excellent</option></select></label><button id="bwEnableBtn" class="primary-button" type="button">Watch current water</button><button id="bwCheckBtn" class="secondary-button" type="button">Check now</button><button id="bwDisableBtn" class="ghost-button" type="button">Turn off</button></div>'+
        '<div id="bwDetail" class="bw-detail">Background opportunity alerts require a CastVector Android build that includes version 12.0 or newer.</div>'+
        '<p class="bw-foot">WorkManager runs inexactly to protect battery. This is a fishing-planning alert, not a safety notification. Severe weather continues to use CastVector’s separate high-priority NWS safety watch.</p>';
      const water=document.getElementById('competitiveCorePanel'),alerts=document.getElementById('dailyAlertCenter');
      if(water)water.after(p);else if(alerts)alerts.after(p);else trips.prepend(p);
    }
  },

  status(){
    const n=this.native();if(!n?.getOpportunityWatchStatus)return{available:false,enabled:false};
    try{const x=n.getOpportunityWatchStatus();return typeof x==='string'?JSON.parse(x):x;}catch(_){return{available:false,enabled:false};}
  },

  config(app){
    const l=app.state.location||{},species=app.state.targetSpecies||'Target species',cfg=app.species?.[species]||{},range=Array.isArray(cfg.water)?cfg.water:[null,null];
    const mode=window.CastVectorFreshwater?.mode?.(app)||app.state.waterMode?.mode||'coast';
    return{lat:Number(l.lat),lon:Number(l.lon),name:l.name||'Selected fishing location',species,min:Number(range[0]),max:Number(range[1]),coast:mode!=='freshwater',threshold:Number(document.getElementById('bwThresholdSelect')?.value)||80};
  },

  enable(app){
    const n=this.native();if(!n?.enableOpportunityWatch)return app.showToast?.('Background Bite Watch requires the newer Android Play build.');
    const st=this.status();
    if(!st.notificationGranted){
      this.pending=true;
      try{n.requestNotificationPermission?.();app.showToast?.('Allow CastVector notifications to enable Background Bite Watch.');}catch(_){this.pending=false;}
      return;
    }
    const c=this.config(app);
    try{
      const r=n.enableOpportunityWatch(c.lat,c.lon,c.name,c.species,c.min,c.max,c.threshold,c.coast);
      if(r==='enabled')app.showToast?.('Background Bite Watch enabled for '+c.name+'.');
      else if(r==='permission_required'){this.pending=true;n.requestNotificationPermission?.();}
      else app.showToast?.('Could not enable Background Bite Watch.');
    }catch(_){app.showToast?.('Could not enable Background Bite Watch.');}
    setTimeout(()=>this.render(app),250);
  },

  disable(app){
    const n=this.native();if(!n?.disableOpportunityWatch)return;
    try{n.disableOpportunityWatch();app.showToast?.('Background Bite Watch turned off.');}catch(_){}
    setTimeout(()=>this.render(app),150);
  },

  check(app){
    const n=this.native();if(!n?.checkOpportunityWatchNow)return app.showToast?.('Background Bite Watch requires the newer Android Play build.');
    try{const r=n.checkOpportunityWatchNow();app.showToast?.(r==='queued'?'Fishing opportunity check queued.':'Enable Background Bite Watch first.');}catch(_){app.showToast?.('Could not queue opportunity check.');}
    setTimeout(()=>this.render(app),350);
  },

  render(app){
    const st=this.status(),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const badge=document.getElementById('biteWatchBadge'),enable=document.getElementById('bwEnableBtn'),check=document.getElementById('bwCheckBtn'),disable=document.getElementById('bwDisableBtn'),detail=document.getElementById('bwDetail');
    if(!st.available){
      set('bwWater','ANDROID 12.0 REQUIRED');set('bwSpecies',app.state.targetSpecies||'Target species');set('bwThreshold','—');set('bwLastScore','—');set('bwLastCheck','—');set('bwBestTime','Install the next native Play update');set('bwStatus','Web interface ready');
      if(badge){badge.textContent='WEB READY';badge.className='bw-badge';}
      if(enable)enable.disabled=false;if(check)check.disabled=true;if(disable)disable.disabled=true;
      if(detail)detail.textContent='The web feature is ready. The background worker becomes active after the next Google Play native update.';
      return;
    }

    set('bwWater',st.enabled?(st.name||'Watched water'):'OFF');
    set('bwSpecies',st.enabled?(st.species||app.state.targetSpecies||'Target species'):'Choose a destination and target species');
    set('bwThreshold',st.enabled?(st.threshold||80)+'/100':'—');
    set('bwLastScore',Number.isFinite(Number(st.lastScore))&&Number(st.lastScore)>=0?st.lastScore+'/100':'—');
    set('bwBestTime',st.lastBestTime?('Best '+st.lastBestTime):'No background check yet');
    set('bwLastCheck',st.lastChecked?new Date(Number(st.lastChecked)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'NOT YET');
    set('bwStatus',st.lastStatus==='error'?(st.lastError||'Last check failed'):st.enabled?'Native worker armed':'Background watch is off');
    if(detail)detail.textContent=st.lastDetail||'Checks the next 24 hours using forecast wind, rain, pressure, time-of-day and coastal wave/water context when available.';
    if(badge){badge.textContent=st.enabled?'WATCHING':'OFF';badge.className='bw-badge '+(st.enabled?'live':'');}
    if(enable){enable.disabled=false;enable.textContent=st.enabled?'Update watch to current water':'Watch current water';}
    if(check)check.disabled=!st.enabled;if(disable)disable.disabled=!st.enabled;
    const select=document.getElementById('bwThresholdSelect');if(select&&st.enabled)select.value=String(st.threshold||80);
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#bwEnableBtn')){this.enable(app);return;}
      if(e.target.closest('#bwDisableBtn')){this.disable(app);return;}
      if(e.target.closest('#bwCheckBtn')){this.check(app);return;}
    });
    window.addEventListener('castvector:native-ready',()=>this.render(app));
    window.addEventListener('castvector:notification-permission',e=>{
      if(e.detail?.granted&&this.pending){this.pending=false;this.enable(app);}
      else if(this.pending){this.pending=false;app.showToast?.('Notification permission is needed for Background Bite Watch.');}
    });
    const trips=app.renderTrips?.bind(app);if(trips)app.renderTrips=function(){const out=trips();O.render(this);return out;};
  }
};

window.CastVectorOpportunityWatch=O;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>O.install());else O.install();
})();