(function(){
'use strict';

const AOC={
  version:'12.5.0',
  app(){return window.CastVector;},
  native(){return window.CastVectorNative||null;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.bind(app);
    this.render(app);
    window.addEventListener('castvector:native-ready',()=>this.render(app));
    window.addEventListener('castvector:notification-permission',()=>this.render(app));
  },

  installUI(app){
    const status=document.querySelector('#view-home .status-row');
    if(status&&!document.getElementById('alwaysOnPill')){
      const b=document.createElement('button');
      b.id='alwaysOnPill';b.type='button';b.className='always-on-pill';
      b.innerHTML='<i></i><span>ALWAYS-ON</span><strong id="alwaysOnPillText">CHECK</strong>';
      status.appendChild(b);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('alwaysOnCenter')){
      const p=document.createElement('section');p.id='alwaysOnCenter';p.className='panel always-on-center';
      p.innerHTML=
        '<div class="aoc-head"><div><div class="eyebrow">ALWAYS-ON CENTER • 12.5</div><h2>CastVector keeps watching when you close the app</h2></div><span id="aocBadge" class="aoc-badge">CHECKING</span></div>'+
        '<p class="aoc-intro">Your two native Android watches stay separate on purpose: high-priority official NWS safety alerts and battery-conscious fishing-opportunity alerts. This screen brings both together.</p>'+
        '<div class="aoc-grid">'+
          '<article><span>SAFETY WATCH</span><strong id="aocSafety">—</strong><small id="aocSafetyMeta">Official NWS point alerts</small></article>'+
          '<article><span>BITE WATCH</span><strong id="aocBite">—</strong><small id="aocBiteMeta">Fishing opportunity threshold</small></article>'+
          '<article><span>WATCHED WATER</span><strong id="aocWater">—</strong><small id="aocWaterMeta">Current background destination</small></article>'+
          '<article><span>TARGET</span><strong id="aocSpecies">—</strong><small id="aocSpeciesMeta">Background fishing target</small></article>'+
          '<article><span>LAST SCORE</span><strong id="aocScore">—</strong><small id="aocWindow">No bite-watch result yet</small></article>'+
          '<article><span>LAST CHECK</span><strong id="aocChecked">—</strong><small id="aocCheckMeta">Native workers</small></article>'+
        '</div>'+
        '<div id="aocCall" class="aoc-call"><strong>Native status is loading.</strong><span>CastVector will summarize your background watches here.</span></div>'+
        '<div class="aoc-actions"><button id="aocBiteBtn" class="primary-button" type="button">Bite Watch controls</button><button id="aocSafetyBtn" class="secondary-button" type="button">Safety controls</button><button id="aocRefreshBtn" class="secondary-button" type="button">Refresh both</button><button id="aocWidgetBtn" class="ghost-button" type="button">Add home widget</button></div>'+
        '<p class="aoc-foot">Background work is intentionally inexact to protect battery. Fishing-opportunity alerts are planning aids; official NWS/local warnings always take priority.</p>';
      const bite=document.getElementById('biteWatchPanel'),daily=document.getElementById('dailyAlertCenter');
      if(bite)bite.after(p);else if(daily)daily.after(p);else trips.prepend(p);
    }
  },

  parse(raw){
    if(!raw)return{available:false,enabled:false};
    if(typeof raw==='object')return raw;
    try{return JSON.parse(raw);}catch(_){return{available:false,enabled:false};}
  },

  safety(){
    const n=this.native();if(!n?.getSafetyWatchStatus)return{available:false,enabled:false};
    try{return this.parse(n.getSafetyWatchStatus());}catch(_){return{available:false,enabled:false};}
  },

  bite(){
    const n=this.native();if(!n?.getOpportunityWatchStatus)return{available:false,enabled:false};
    try{return this.parse(n.getOpportunityWatchStatus());}catch(_){return{available:false,enabled:false};}
  },

  latestCheck(s,b){
    const a=Number(s?.lastChecked)||0,c=Number(b?.lastChecked)||0;
    return Math.max(a,c);
  },

  render(app){
    const safety=this.safety(),bite=this.bite(),available=safety.available||bite.available;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const pill=document.getElementById('alwaysOnPill'),badge=document.getElementById('aocBadge');
    const active=!!(safety.enabled||bite.enabled),alerts=Number(safety.lastAlertCount)||0;
    const score=Number(bite.lastScore);

    if(!available){
      if(pill){pill.className='always-on-pill native-needed';pill.querySelector('strong').textContent='NATIVE UPDATE';}
      if(badge){badge.textContent='NEXT ANDROID BUILD';badge.className='aoc-badge';}
      set('aocSafety','ANDROID REQUIRED');set('aocBite','ANDROID REQUIRED');
      set('aocWater',app.state.location?.name||'Selected water');set('aocWaterMeta','Web app is ready');
      set('aocSpecies',app.state.targetSpecies||'Target species');set('aocSpeciesMeta','Native background worker not installed');
      set('aocScore','—');set('aocWindow','Install the next native Play update');
      set('aocChecked','—');set('aocCheckMeta','No 12.5 native status available');
      const call=document.getElementById('aocCall');if(call)call.innerHTML='<strong>The web side is ready now.</strong><span>The home widget and native Always-On Center activate after our next batched Google Play update.</span>';
      return;
    }

    if(pill){
      pill.className='always-on-pill '+(alerts?'alert':active?'active':'');
      pill.querySelector('strong').textContent=alerts?alerts+' NWS':bite.enabled&&score>=0?score+'/100':active?'ON':'OFF';
    }
    if(badge){
      badge.textContent=alerts?'NWS ACTIVE':active?'WATCHING':'OFF';
      badge.className='aoc-badge '+(alerts?'danger':active?'live':'');
    }

    set('aocSafety',safety.enabled?(alerts?alerts+' ACTIVE':'ON'):'OFF');
    set('aocSafetyMeta',alerts?(safety.lastEvent||'Official NWS alert active'):(safety.enabled?'Official NWS point watch armed':'Enable from Weather Center'));
    set('aocBite',bite.enabled?'ON':'OFF');
    set('aocBiteMeta',bite.enabled?(String(bite.threshold||80)+'+ opportunity threshold'):'Enable from Background Bite Watch');

    const water=bite.enabled?(bite.name||'Watched water'):safety.enabled?(safety.name||'Watched water'):app.state.location?.name||'Selected water';
    set('aocWater',water);
    set('aocWaterMeta',bite.enabled&&safety.enabled&&bite.name&&safety.name&&bite.name!==safety.name?'Bite and safety watches are on different waters':'Background destination');

    set('aocSpecies',bite.enabled?(bite.species||app.state.targetSpecies||'Target species'):(app.state.targetSpecies||'Target species'));
    set('aocSpeciesMeta',bite.enabled?'Native Bite Watch target':'Current CastVector target');
    set('aocScore',bite.enabled&&score>=0?score+'/100':'—');
    set('aocWindow',bite.enabled?(bite.lastBestTime?'Best around '+bite.lastBestTime:(bite.lastStatus==='error'?(bite.lastError||'Last check failed'):'Waiting for first background result')):'Bite Watch is off');

    const checked=this.latestCheck(safety,bite);
    set('aocChecked',checked?new Date(checked).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'NOT YET');
    set('aocCheckMeta',checked?new Date(checked).toLocaleDateString():'Native workers have not completed a check');

    const call=document.getElementById('aocCall');
    if(call){
      if(alerts)call.innerHTML='<strong>Official weather alert active.</strong><span>Open Safety controls and review NWS guidance before relying on fishing-opportunity scores.</span>';
      else if(bite.enabled&&score>=Number(bite.threshold||80))call.innerHTML='<strong>Your Bite Watch is above its trigger.</strong><span>'+app.escape(bite.species||'Target species')+' • '+score+'/100'+(bite.lastBestTime?' • best around '+app.escape(bite.lastBestTime):'')+'.</span>';
      else if(active)call.innerHTML='<strong>Always-On monitoring is armed.</strong><span>'+(bite.enabled?'Bite Watch is checking fishing opportunity. ':'')+(safety.enabled?'Safety Watch is checking official NWS alerts.':'')+'</span>';
      else call.innerHTML='<strong>No native background watch is armed.</strong><span>Use the detailed Bite Watch and Safety Watch controls to choose exactly what CastVector should monitor.</span>';
    }
  },

  showBite(app){
    app.navigate?.('trips');
    setTimeout(()=>document.getElementById('biteWatchPanel')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
  },

  showSafety(app){
    const aa=window.CastVectorAnglerAdvantage;
    if(aa?.openWeather){aa.openWeather(app);setTimeout(()=>document.getElementById('nativeSafetyPanel')?.scrollIntoView({behavior:'smooth',block:'center'}),160);return;}
    app.navigate?.('trips');
  },

  refreshBoth(app){
    const n=this.native();if(!n)return app.showToast?.('Native background checks require the Android Play build.');
    let queued=0;
    try{if(this.safety().enabled&&n.checkSafetyWatchNow?.()==='queued')queued++;}catch(_){}
    try{if(this.bite().enabled&&n.checkOpportunityWatchNow?.()==='queued')queued++;}catch(_){}
    app.showToast?.(queued?queued+' background check'+(queued===1?'':'s')+' queued.':'Arm a Safety Watch or Bite Watch first.');
    setTimeout(()=>this.render(app),1400);
  },

  pinWidget(app){
    const n=this.native();if(!n?.pinFishingWidget)return app.showToast?.('The CastVector home widget requires the next Android Play build.');
    try{
      const r=n.pinFishingWidget();
      if(r==='requested')app.showToast?.('Confirm “Add widget” on Android.');
      else if(r==='unsupported')app.showToast?.('Long-press your Home screen → Widgets → CastVector.');
      else app.showToast?.('Open Android Widgets and choose CastVector.');
    }catch(_){app.showToast?.('Long-press your Home screen → Widgets → CastVector.');}
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#alwaysOnPill')){app.navigate?.('trips');setTimeout(()=>document.getElementById('alwaysOnCenter')?.scrollIntoView({behavior:'smooth',block:'center'}),120);return;}
      if(e.target.closest('#aocBiteBtn')){this.showBite(app);return;}
      if(e.target.closest('#aocSafetyBtn')){this.showSafety(app);return;}
      if(e.target.closest('#aocRefreshBtn')){this.refreshBoth(app);return;}
      if(e.target.closest('#aocWidgetBtn')){this.pinWidget(app);return;}
    });
    const old=app.renderAll?.bind(app);
    if(old)app.renderAll=function(){const out=old();AOC.render(this);return out;};
  }
};

window.CastVectorAlwaysOnCenter=AOC;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>AOC.install());else AOC.install();
})();