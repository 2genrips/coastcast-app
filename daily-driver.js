(function(){
'use strict';

const DD={
  version:'10.5.0',
  historyKey:'castvector-check-history-v105',
  radarService:'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
  replayLayer:null,
  replayIndex:12,
  replayTimer:null,
  replayPlaying:false,
  frames:[],

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchLive(app);
    this.patchAlertRenders(app);
    this.bind(app);
    this.buildFrames();
    this.render(app);
  },

  installUI(app){
    const home=document.getElementById('view-home');
    if(home&&!document.getElementById('sinceLastCheckPanel')){
      const p=document.createElement('section');p.id='sinceLastCheckPanel';p.className='panel since-check-panel';
      p.innerHTML='<div class="dd-head"><div><div class="eyebrow">SINCE LAST CHECK • 10.5</div><h2>What changed at this water?</h2></div><span id="ddChangeBadge" class="dd-badge">LEARNING</span></div>'+
        '<div id="ddChangeHero" class="dd-change-hero"><strong>Refresh live data once more to build a comparison.</strong><span>CastVector will remember the last live snapshot for this location.</span></div>'+
        '<div class="dd-change-grid"><article><span>FISHING SCORE</span><strong id="ddScoreDelta">—</strong><small id="ddScoreNow">Current —</small></article><article><span>WIND</span><strong id="ddWindDelta">—</strong><small id="ddWindNow">Current —</small></article><article><span>WAVE / SURF</span><strong id="ddWaveDelta">—</strong><small id="ddWaveNow">Current —</small></article><article><span>WATER TEMP</span><strong id="ddWaterDelta">—</strong><small id="ddWaterNow">Current —</small></article><article><span>PRESSURE</span><strong id="ddPressureDelta">—</strong><small id="ddPressureNow">Current —</small></article><article><span>NWS ALERTS</span><strong id="ddAlertDelta">—</strong><small id="ddAlertNow">Current —</small></article></div>'+
        '<div id="ddChangeMove" class="dd-change-move">No comparison yet.</div>';
      const brain=document.getElementById('brain3Panel'),quick=document.getElementById('quickAnswerPanel');
      if(brain)brain.after(p);else if(quick)quick.after(p);else home.prepend(p);
    }

    const weather=document.querySelector('#aaWeatherDialog .aa-weather-sheet');
    if(weather&&!document.getElementById('radarReplayPanel')){
      const p=document.createElement('section');p.id='radarReplayPanel';p.className='radar-replay-panel';
      p.innerHTML='<div class="dd-head"><div><div class="eyebrow">NWS RADAR REPLAY • 10.5</div><h3>See which way the weather is moving</h3></div><span id="radarReplayBadge" class="dd-badge">OFF</span></div>'+
        '<p class="radar-replay-note">Uses the official time-enabled NWS/MRMS base-reflectivity service. The service carries a moving history window; CastVector shows recent frames around the selected map view.</p>'+
        '<div class="radar-replay-controls"><button id="radarReplayPlay" class="primary-button small" type="button">Play last 2 hours</button><button id="radarReplayMap" class="secondary-button small" type="button">Open map</button><button id="radarReplayStop" class="ghost-button small" type="button">Stop / live</button></div>'+
        '<div class="radar-replay-slider"><input id="radarReplayRange" type="range" min="0" max="12" step="1" value="12"/><div><span id="radarReplayStart">−120m</span><strong id="radarReplayTime">LIVE</strong><span>Now</span></div></div>'+
        '<div id="radarReplayStatus" class="radar-replay-status">Open Map Pro before replaying radar.</div>';
      const native=document.getElementById('nativeSafetyPanel');
      if(native)native.before(p);else{
        const note=weather.querySelector('.aa-source-note');if(note)note.before(p);else weather.appendChild(p);
      }
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('dailyAlertCenter')){
      const p=document.createElement('section');p.id='dailyAlertCenter';p.className='panel daily-alert-center';
      p.innerHTML='<div class="dd-head"><div><div class="eyebrow">ALERT CENTER • 10.5</div><h2>Everything worth watching</h2></div><span id="ddAlertCenterBadge" class="dd-badge">READY</span></div>'+
        '<div class="dd-alert-grid"><article><span>FORECAST WATCHES</span><strong id="ddForecastWatchCount">0</strong><small id="ddForecastWatchMeta">No saved thresholds matched</small></article><article><span>NWS</span><strong id="ddNwsCount">0</strong><small id="ddNwsMeta">No active alerts loaded</small></article><article><span>ANDROID BACKGROUND</span><strong id="ddNativeWatch">—</strong><small id="ddNativeWatchMeta">Native package status</small></article><article><span>NEXT OPPORTUNITY</span><strong id="ddOpportunity">—</strong><small id="ddOpportunityMeta">Run Opportunity Radar</small></article></div>'+
        '<div id="ddAlertSummary" class="dd-alert-summary">CastVector combines your saved score/wind watches, official NWS alerts and optional Android background safety watch here.</div>'+
        '<div class="dd-alert-actions"><button id="ddOpenWeather" class="primary-button small" type="button">Weather Center</button><button id="ddRunWatches" class="secondary-button small" type="button">Check forecast watches</button><button id="ddOpenRadar" class="secondary-button small" type="button">Radar Replay</button></div>';
      const watch=document.querySelector('#view-trips .coast-watch-panel'),aa=document.getElementById('anglerAdvantagePanel');
      if(watch)watch.before(p);else if(aa)aa.after(p);else trips.prepend(p);
    }
  },

  locationKey(app){
    const l=app.state.location||{};
    return Number(l.lat).toFixed(2)+','+Number(l.lon).toFixed(2);
  },

  readHistory(){
    try{return JSON.parse(localStorage.getItem(this.historyKey)||'{}')||{};}catch(_){return{};}
  },

  writeHistory(h){try{localStorage.setItem(this.historyKey,JSON.stringify(h));}catch(_){}},

  snapshot(app){
    const c=app.state.data?.current||{},cmd=app.commandRecommendation?.()||{},conf=app.dataConfidence?.();
    return{
      at:new Date().toISOString(),key:this.locationKey(app),location:app.state.location?.name||'Fishing location',
      score:Number(app.currentScore?.()),species:cmd.species||app.state.targetSpecies,speciesScore:Number(cmd.speciesScore),
      wind:Number(c.windSpeed),gust:Number(c.windGust),wave:Number(c.waveHeight),water:Number(c.waterTemp),
      pressure:Number(c.pressure),rain:Number(c.rain),alerts:(app.state.safetyAlerts||[]).length,
      tide:app.currentTideLabel?.()||'',confidence:Number(conf?.score)
    };
  },

  previous(app){
    const h=this.readHistory(),list=h[this.locationKey(app)]||[];
    return list.length?list[list.length-1]:null;
  },

  record(app,prior=null){
    if(!app.state.live||!app.state.data)return;
    const snap=this.snapshot(app),h=this.readHistory(),key=snap.key,list=Array.isArray(h[key])?h[key]:[];
    const last=list[list.length-1];
    if(last&&Date.now()-new Date(last.at).getTime()<60000){
      list[list.length-1]=snap;
    }else list.push(snap);
    h[key]=list.slice(-12);this.writeHistory(h);
    this._comparison={prior:prior||last,current:snap};this.renderChanges(app);
  },

  delta(a,b,digits=0,unit=''){
    if(!Number.isFinite(a)||!Number.isFinite(b))return'—';
    const n=a-b,abs=Math.abs(n).toFixed(digits);if(Math.abs(n)<Math.pow(10,-digits)/2)return'NO CHANGE';
    return(n>0?'+':'−')+abs+unit;
  },

  compare(app){
    if(this._comparison?.current?.key===this.locationKey(app))return this._comparison;
    const h=this.readHistory(),list=h[this.locationKey(app)]||[];
    if(list.length>=2)return{prior:list[list.length-2],current:list[list.length-1]};
    return{prior:null,current:list[list.length-1]||this.snapshot(app)};
  },

  renderChanges(app){
    const {prior,current}=this.compare(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('ddScoreNow','Current '+(Number.isFinite(current?.score)?Math.round(current.score)+'/100':'—'));
    set('ddWindNow','Current '+(Number.isFinite(current?.wind)?Math.round(current.wind)+' mph':'—'));
    set('ddWaveNow','Current '+(Number.isFinite(current?.wave)?current.wave.toFixed(1)+' ft':'—'));
    set('ddWaterNow','Current '+(Number.isFinite(current?.water)?Math.round(current.water)+'°F':'—'));
    set('ddPressureNow','Current '+(Number.isFinite(current?.pressure)?Math.round(current.pressure)+' hPa':'—'));
    set('ddAlertNow','Current '+(current?.alerts??0));
    if(!prior){
      ['ddScoreDelta','ddWindDelta','ddWaveDelta','ddWaterDelta','ddPressureDelta','ddAlertDelta'].forEach(id=>set(id,'—'));
      const hero=document.getElementById('ddChangeHero');if(hero)hero.innerHTML='<strong>Baseline saved for this water.</strong><span>Refresh live data later and CastVector will show exactly what changed.</span>';
      set('ddChangeBadge','BASELINE');set('ddChangeMove','No earlier live snapshot exists for this location yet.');return;
    }
    set('ddScoreDelta',this.delta(current.score,prior.score,0,''));
    set('ddWindDelta',this.delta(current.wind,prior.wind,0,' mph'));
    set('ddWaveDelta',this.delta(current.wave,prior.wave,1,' ft'));
    set('ddWaterDelta',this.delta(current.water,prior.water,0,'°'));
    set('ddPressureDelta',this.delta(current.pressure,prior.pressure,0,' hPa'));
    set('ddAlertDelta',this.delta(current.alerts,prior.alerts,0,''));

    let momentum=0;const reasons=[];
    const scoreDelta=current.score-prior.score;if(Number.isFinite(scoreDelta)){momentum+=scoreDelta*.8;if(Math.abs(scoreDelta)>=3)reasons.push('CastVector score '+(scoreDelta>0?'rose ':'fell ')+Math.abs(Math.round(scoreDelta))+' points');}
    const windDelta=current.wind-prior.wind;if(Number.isFinite(windDelta)&&Math.abs(windDelta)>=3){if(windDelta>0)momentum-=2;else momentum+=1;reasons.push('wind '+(windDelta>0?'increased ':'eased ')+Math.abs(Math.round(windDelta))+' mph');}
    const waveDelta=current.wave-prior.wave;if(Number.isFinite(waveDelta)&&Math.abs(waveDelta)>=.5){if(waveDelta>0)momentum-=2;else momentum+=1;reasons.push('wave height '+(waveDelta>0?'rose ':'dropped ')+Math.abs(waveDelta).toFixed(1)+' ft');}
    const alertDelta=(current.alerts||0)-(prior.alerts||0);if(alertDelta>0){momentum-=5;reasons.push(alertDelta+' new loaded NWS alert'+(alertDelta===1?'':'s'));}else if(alertDelta<0){momentum+=2;reasons.push(Math.abs(alertDelta)+' loaded NWS alert'+(alertDelta===-1?'':'s')+' cleared');}
    const label=momentum>=4?'IMPROVING':momentum<=-4?'WORSENING':'STABLE';
    const hero=document.getElementById('ddChangeHero');
    if(hero)hero.innerHTML='<strong>'+(label==='IMPROVING'?'Conditions moved in a better direction.':label==='WORSENING'?'Conditions need another look before you commit.':'The loaded fishing picture is broadly stable.')+'</strong><span>Compared with '+new Date(prior.at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'.</span>';
    const badge=document.getElementById('ddChangeBadge');if(badge){badge.textContent=label;badge.className='dd-badge '+label.toLowerCase();}
    set('ddChangeMove',reasons.length?reasons.join(' • '):'No large changes crossed CastVector’s comparison thresholds.');
  },

  patchLive(app){
    if(app._dailyDriverLive)return;app._dailyDriverLive=true;
    const old=app.loadLiveData?.bind(app);if(!old)return;
    app.loadLiveData=async function(opts={}){
      const prior=DD.previous(this);
      const out=await old(opts);
      if(this.state.live&&!this.state.loading)DD.record(this,prior);
      DD.renderAlerts(this);return out;
    };
    if(app.state.live&&app.state.data)this.record(app,this.previous(app));
  },

  buildFrames(){
    const now=Date.now(),rounded=now-(now%(10*60000));
    this.frames=Array.from({length:13},(_,i)=>rounded-(12-i)*10*60000);
    this.replayIndex=12;
  },

  frameUrl(map,time){
    const b=map.getBounds(),q=new URLSearchParams({
      bbox:[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].join(','),bboxSR:'4326',imageSR:'4326',
      size:'1200,900',format:'png32',transparent:'true',time:String(time),f:'image',_:String(Date.now())
    });
    return this.radarService+'/exportImage?'+q.toString();
  },

  async showFrame(app,index,quiet=false){
    const map=app.state.map;if(!map||!window.L)return false;
    if(!this.frames.length)this.buildFrames();
    index=Math.max(0,Math.min(this.frames.length-1,Number(index)||0));this.replayIndex=index;
    const time=this.frames[index],b=map.getBounds(),bounds=[[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]];
    const overlay=L.imageOverlay(this.frameUrl(map,time),bounds,{opacity:window.CastVectorAnglerAdvantage?.prefs?.().opacity||.65,interactive:false});
    return new Promise(resolve=>{
      let done=false;const finish=ok=>{if(done)return;done=true;resolve(ok);};
      overlay.once('load',()=>{
        const aa=window.CastVectorAnglerAdvantage;if(aa?.radarLayer){try{map.removeLayer(aa.radarLayer);}catch(_){}aa.radarLayer=null;}
        if(this.replayLayer){try{map.removeLayer(this.replayLayer);}catch(_){}}
        this.replayLayer=overlay;this.renderRadar();finish(true);
      });
      overlay.once('error',()=>{try{map.removeLayer(overlay);}catch(_){}finish(false);});
      overlay.addTo(map);setTimeout(()=>finish(false),8500);
      if(!quiet)this.renderRadar();
    });
  },

  async playRadar(app){
    if(!app.state.map){app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.playRadar(app);},220);return;}
    this.stopRadar(app,false);this.buildFrames();this.replayPlaying=true;this.replayIndex=0;this.renderRadar();
    const step=async()=>{
      if(!this.replayPlaying)return;
      await this.showFrame(app,this.replayIndex,true);
      if(!this.replayPlaying)return;
      if(this.replayIndex>=this.frames.length-1){this.replayPlaying=false;this.renderRadar();return;}
      this.replayIndex++;this.renderRadar();this.replayTimer=setTimeout(step,850);
    };
    step();
  },

  stopRadar(app,restore=true){
    this.replayPlaying=false;clearTimeout(this.replayTimer);this.replayTimer=null;
    if(this.replayLayer&&app.state.map){try{app.state.map.removeLayer(this.replayLayer);}catch(_){}this.replayLayer=null;}
    if(restore&&window.CastVectorAnglerAdvantage?.prefs?.().radar)window.CastVectorAnglerAdvantage?.refreshRadar?.(app);
    this.renderRadar();
  },

  renderRadar(){
    const range=document.getElementById('radarReplayRange'),time=document.getElementById('radarReplayTime'),badge=document.getElementById('radarReplayBadge'),status=document.getElementById('radarReplayStatus'),play=document.getElementById('radarReplayPlay');
    if(range)range.value=String(this.replayIndex);
    const t=this.frames[this.replayIndex];
    if(time)time.textContent=t?new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'LIVE';
    if(badge){badge.textContent=this.replayPlaying?'PLAYING':this.replayLayer?'FRAME':'OFF';badge.className='dd-badge '+(this.replayPlaying?'live':'');}
    if(status)status.textContent=this.replayLayer||this.replayPlaying?'Official NWS/MRMS frame • '+(t?new Date(t).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):''):'Open Map Pro before replaying radar.';
    if(play)play.textContent=this.replayPlaying?'Playing…':'Play last 2 hours';
  },

  nativeWatch(){
    try{return window.CastVectorLaunchCandidate?.nativeStatus?.()||{available:false,enabled:false};}catch(_){return{available:false,enabled:false};}
  },

  opportunity(app){
    const r=app.state.opportunityRadar?.results?.[0];if(!r)return null;
    return{score:Number(r.score||r.adjusted||0),label:r.name||r.location||r.day||'Top opportunity',species:r.species||app.state.targetSpecies};
  },

  renderAlerts(app){
    const matches=(app.state.alertMatches||[]).filter(x=>x.match),nws=app.state.safetyAlerts||[],native=this.nativeWatch(),opp=this.opportunity(app);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('ddForecastWatchCount',String(matches.length));set('ddForecastWatchMeta',matches.length?(matches[0].name||'Saved fishing watch')+' matched':'No saved thresholds matched');
    set('ddNwsCount',String(nws.length));set('ddNwsMeta',nws.length?(nws[0].event||'Official NWS alert'):'No active point alerts loaded');
    set('ddNativeWatch',native.available?(native.enabled?'ON':'OFF'):'WEB ONLY');set('ddNativeWatchMeta',native.enabled?(native.name||'Selected fishing location'):'Optional Android severe-weather watch');
    set('ddOpportunity',opp&&opp.score?opp.score+'/100':'—');set('ddOpportunityMeta',opp?opp.species+' • '+opp.label:'Run Opportunity Radar to rank saved waters');
    const total=matches.length+nws.length+(native.enabled?1:0),badge=document.getElementById('ddAlertCenterBadge'),summary=document.getElementById('ddAlertSummary');
    if(badge){badge.textContent=nws.length?'NWS ACTIVE':matches.length?'WATCH MATCH':'READY';badge.className='dd-badge '+(nws.length?'worsening':matches.length?'improving':'');}
    if(summary)summary.textContent=nws.length?'Official NWS alerts are active for the selected water. Open Weather Center before departure.':matches.length?matches.length+' saved fishing watch'+(matches.length===1?'':'es')+' currently meet your score/wind rules.':total?'Background safety watch is armed; no loaded NWS or forecast-watch trigger is active.':'No active watch trigger is loaded.';
  },

  patchAlertRenders(app){
    const trips=app.renderTrips?.bind(app);if(trips)app.renderTrips=function(){const out=trips();DD.renderAlerts(this);return out;};
    const alerts=app.evaluateAlerts?.bind(app);if(alerts)app.evaluateAlerts=function(opts={}){const out=alerts(opts);Promise.resolve(out).finally(()=>DD.renderAlerts(this));return out;};
  },

  render(app){
    this.renderChanges(app);this.renderAlerts(app);this.renderRadar();
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#radarReplayPlay')){this.playRadar(app);return;}
      if(e.target.closest('#radarReplayStop')){this.stopRadar(app,true);return;}
      if(e.target.closest('#radarReplayMap')){document.getElementById('aaWeatherDialog')?.close();app.navigate?.('map');setTimeout(()=>app.ensureMap?.(),120);return;}
      if(e.target.closest('#ddOpenWeather')){window.CastVectorAnglerAdvantage?.openWeather?.(app);return;}
      if(e.target.closest('#ddRunWatches')){app.evaluateAlerts?.({notify:false});app.showToast?.('Forecast watches checked against loaded data.');return;}
      if(e.target.closest('#ddOpenRadar')){window.CastVectorAnglerAdvantage?.openWeather?.(app);setTimeout(()=>document.getElementById('radarReplayPanel')?.scrollIntoView({behavior:'smooth',block:'center'}),120);return;}
    });
    document.addEventListener('input',e=>{
      if(e.target.id==='radarReplayRange'){
        this.replayPlaying=false;clearTimeout(this.replayTimer);this.replayTimer=null;
        this.showFrame(app,Number(e.target.value));this.renderRadar();
      }
    });
    const mapOld=app.ensureMap?.bind(app);
    if(mapOld)app.ensureMap=function(){const out=mapOld();setTimeout(()=>{if(DD.replayLayer){DD.stopRadar(this,false);}},0);return out;};
  }
};

window.CastVectorDailyDriver=DD;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>DD.install());else DD.install();
})();