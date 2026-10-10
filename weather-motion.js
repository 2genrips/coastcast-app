(function(){
'use strict';

const WM={
  version:'13.5.0',
  service:'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
  prefsKey:'castvector-weather-motion-v135',
  frames:[],
  index:0,
  layer:null,
  timer:null,
  playing:false,
  loading:false,
  lastBoundsKey:'',
  frameCache:new Map(),

  app(){return window.CastVector;},

  prefs(){
    let p={};try{p=JSON.parse(localStorage.getItem(this.prefsKey)||'{}')||{};}catch(_){}
    return{enabled:!!p.enabled,opacity:Number.isFinite(Number(p.opacity))?Math.max(.25,Math.min(.9,Number(p.opacity))):.62,speed:Number(p.speed)||700};
  },

  savePrefs(p){try{localStorage.setItem(this.prefsKey,JSON.stringify(p));}catch(_){}},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchMap(app);
    this.patchLive(app);
    this.bind(app);
    this.ensure(app);
    this.render(app);
  },

  installUI(app){
    const layers=document.querySelector('#mapProDock .map-pro-layers');
    if(layers&&!layers.querySelector('[data-wm-layer="motion"]')){
      const b=document.createElement('button');b.type='button';b.dataset.wmLayer='motion';b.textContent='Radar Motion';layers.appendChild(b);
    }

    const sheet=document.querySelector('#aaWeatherDialog .aa-weather-sheet');
    if(sheet&&!document.getElementById('weatherMotionPanel')){
      const p=document.createElement('section');p.id='weatherMotionPanel';p.className='weather-motion-panel';
      p.innerHTML=
        '<div class="wm-head"><div><div class="eyebrow">WEATHER MOTION • 13.5</div><h3>See what is moving toward your water</h3><p>Official NWS MRMS radar history with a rolling four-hour timeline.</p></div><span id="wmBadge" class="wm-badge">OFF</span></div>'+
        '<div class="wm-player">'+
          '<button id="wmPlayBtn" class="wm-play" type="button">▶</button>'+
          '<div class="wm-time"><strong id="wmTimeLabel">LIVE</strong><small id="wmTimeMeta">Radar motion is off</small></div>'+
          '<input id="wmSlider" type="range" min="0" max="12" step="1" value="12" />'+
          '<select id="wmSpeed" class="select-control"><option value="1000">Slow</option><option value="700" selected>Normal</option><option value="420">Fast</option></select>'+
        '</div>'+
        '<div class="wm-actions"><button id="wmToggleBtn" class="primary-button small" type="button">Show 4-hour motion</button><button id="wmLatestBtn" class="secondary-button small" type="button">Jump to latest</button></div>'+
        '<div id="wmTimeline" class="wm-timeline"></div>'+
        '<p class="wm-foot">Historical radar is a planning aid, not a forecast. Use NWS warnings and current conditions for safety decisions.</p>';
      const note=sheet.querySelector('.aa-source-note');if(note)note.before(p);else sheet.appendChild(p);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('frontWatchPanel')){
      const p=document.createElement('section');p.id='frontWatchPanel';p.className='panel front-watch-panel';
      p.innerHTML=
        '<div class="wm-head"><div><div class="eyebrow">FRONT WATCH • 13.5</div><h2>Are conditions moving in your favor?</h2></div><span id="frontWatchBadge" class="wm-badge">CHECKING</span></div>'+
        '<div class="front-watch-hero"><div class="front-watch-call"><strong id="frontWatchCall">—</strong><span id="frontWatchWindow">Next 6 hours</span></div><div><h3 id="frontWatchTitle">Load live forecast data.</h3><p id="frontWatchDetail">CastVector will compare wind, gusts and rain through the next several hours.</p></div></div>'+
        '<div class="front-watch-grid"><article><span>NOW</span><strong id="fwNow">—</strong><small id="fwNowMeta">Current</small></article><article><span>+3 HOURS</span><strong id="fw3">—</strong><small id="fw3Meta">Trend</small></article><article><span>+6 HOURS</span><strong id="fw6">—</strong><small id="fw6Meta">Trend</small></article><article><span>BEST MOVE</span><strong id="fwMove">—</strong><small>Trip timing</small></article></div>'+
        '<div class="front-watch-actions"><button id="fwOpenMotion" class="primary-button small" type="button">Open radar motion</button><button id="fwRefresh" class="secondary-button small" type="button">Refresh conditions</button></div>';
      const aa=document.getElementById('anglerAdvantagePanel'),bite=document.getElementById('biteWatchPanel');
      if(bite)bite.before(p);else if(aa)aa.after(p);else trips.prepend(p);
    }
  },

  patchMap(app){
    if(app._weatherMotionMapPatched)return;app._weatherMotionMapPatched=true;
    const old=app.ensureMap?.bind(app);
    if(old)app.ensureMap=function(){const out=old();setTimeout(()=>WM.ensure(this),0);return out;};
  },

  patchLive(app){
    if(app._weatherMotionLivePatched)return;app._weatherMotionLivePatched=true;
    const old=app.loadLiveData?.bind(app);
    if(old)app.loadLiveData=async function(opts={}){
      const out=await old(opts);WM.renderFront(this);return out;
    };
    const render=app.renderAll?.bind(app);
    if(render)app.renderAll=function(){const out=render();WM.render(this);return out;};
  },

  ensure(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(!map._weatherMotionBound){
      map._weatherMotionBound=true;
      map.on('moveend zoomend',()=>{
        if(!WM.prefs().enabled)return;
        clearTimeout(WM.moveDebounce);
        WM.moveDebounce=setTimeout(()=>WM.rebuildOverlay(app),350);
      });
    }
    if(this.prefs().enabled)this.enable(app,true);
  },

  async loadFrames(app){
    if(this.loading)return;this.loading=true;
    try{
      let start=Date.now()-4*3600000,end=Date.now();
      try{
        const meta=await app.fetchJSON(this.service+'?f=json',12000),ext=meta?.timeInfo?.timeExtent;
        if(Array.isArray(ext)&&ext.length===2&&Number.isFinite(Number(ext[0]))&&Number.isFinite(Number(ext[1]))){
          start=Math.max(Number(ext[0]),Date.now()-4*3600000);
          end=Math.min(Date.now(),Number(ext[1]));
        }
      }catch(_){}
      const count=13,span=Math.max(30*60000,end-start),step=span/(count-1);
      this.frames=Array.from({length:count},(_,i)=>Math.round(start+i*step));
      this.index=this.frames.length-1;
      this.renderTimeline(app);
    }finally{this.loading=false;}
  },

  boundsKey(map){
    const b=map.getBounds();return [b.getWest(),b.getSouth(),b.getEast(),b.getNorth(),map.getZoom()].map(x=>Number(x).toFixed(3)).join('|');
  },

  imageUrl(map,time){
    const b=map.getBounds(),q=new URLSearchParams({
      bbox:[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].join(','),
      bboxSR:'4326',imageSR:'4326',size:'1200,900',format:'png32',transparent:'true',
      time:String(time),f:'image',_:String(time)
    });
    return this.service+'/exportImage?'+q.toString();
  },

  async preload(map){
    const key=this.boundsKey(map);
    if(key===this.lastBoundsKey&&this.frameCache.size>=this.frames.length)return;
    this.lastBoundsKey=key;this.frameCache.clear();
    const urls=this.frames.map(t=>({t,url:this.imageUrl(map,t)}));
    for(const x of urls){
      await new Promise(resolve=>{
        const img=new Image();img.onload=()=>{this.frameCache.set(x.t,x.url);resolve();};img.onerror=()=>resolve();img.src=x.url;
      });
    }
  },

  async enable(app,silent=false){
    const map=app.state.map;if(!map||!window.L){app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.enable(app,silent);},180);return;}
    const p=this.prefs();p.enabled=true;this.savePrefs(p);
    window.CastVectorAnglerAdvantage?.hideRadar?.(app,true);
    if(!this.frames.length)await this.loadFrames(app);
    await this.preload(map);
    this.rebuildOverlay(app);
    if(!silent)app.showToast?.('NWS 4-hour radar motion ready.');
    this.render(app);
  },

  disable(app,silent=false){
    this.stop();
    if(this.layer&&app.state.map){try{app.state.map.removeLayer(this.layer);}catch(_){}}
    this.layer=null;const p=this.prefs();p.enabled=false;this.savePrefs(p);
    if(!silent)app.showToast?.('Radar Motion hidden.');
    this.render(app);
  },

  rebuildOverlay(app){
    const map=app.state.map;if(!map||!this.prefs().enabled||!this.frames.length)return;
    const t=this.frames[Math.max(0,Math.min(this.index,this.frames.length-1))],url=this.frameCache.get(t)||this.imageUrl(map,t);
    const b=map.getBounds(),bounds=[[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]];
    if(this.layer){
      try{map.removeLayer(this.layer);}catch(_){}
    }
    this.layer=L.imageOverlay(url,bounds,{opacity:this.prefs().opacity,interactive:false}).addTo(map);
    this.renderFrame(app);
  },

  showFrame(app,i){
    if(!this.frames.length)return;
    this.index=Math.max(0,Math.min(Number(i)||0,this.frames.length-1));
    const map=app.state.map;if(!map)return;
    const t=this.frames[this.index],url=this.frameCache.get(t)||this.imageUrl(map,t);
    if(this.layer?.setUrl)this.layer.setUrl(url);else this.rebuildOverlay(app);
    this.renderFrame(app);
  },

  play(app){
    if(!this.prefs().enabled){this.enable(app).then(()=>this.play(app));return;}
    if(this.playing){this.stop();this.render(app);return;}
    this.playing=true;
    if(this.index>=this.frames.length-1)this.index=0;
    const tick=()=>{
      if(!this.playing)return;
      this.showFrame(app,this.index);
      this.index++;
      if(this.index>=this.frames.length)this.index=0;
      this.timer=setTimeout(tick,this.prefs().speed);
    };
    tick();this.render(app);
  },

  stop(){this.playing=false;clearTimeout(this.timer);this.timer=null;},

  latest(app){
    this.stop();this.index=Math.max(0,this.frames.length-1);this.showFrame(app,this.index);this.render(app);
  },

  renderFrame(app){
    const t=this.frames[this.index],slider=document.getElementById('wmSlider'),label=document.getElementById('wmTimeLabel'),meta=document.getElementById('wmTimeMeta');
    if(slider){slider.max=String(Math.max(0,this.frames.length-1));slider.value=String(this.index);}
    if(label)label.textContent=t?new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'LIVE';
    if(meta)meta.textContent=t?(this.index===this.frames.length-1?'Latest NWS frame':'Historical NWS radar frame'):'Radar history unavailable';
  },

  renderTimeline(app){
    const box=document.getElementById('wmTimeline');if(!box)return;
    if(!this.frames.length){box.innerHTML='<span>No radar history loaded.</span>';return;}
    const idxs=[0,Math.floor((this.frames.length-1)/2),this.frames.length-1];
    box.innerHTML=idxs.map(i=>'<span>'+new Date(this.frames[i]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'</span>').join('');
    this.renderFrame(app);
  },

  frameModel(app){
    const hours=(app.state.data?.hours||[]).filter(h=>Number.isFinite(Number(h.windSpeed))).slice(0,8);
    const c=app.state.data?.current||{};
    const norm=h=>({wind:Number(h?.windSpeed),gust:Number(h?.windGust),rain:Number(h?.rain),time:h?.time||''});
    const now={wind:Number(c.windSpeed),gust:Number(c.windGust),rain:Number(c.rain),time:'Now'};
    const h3=norm(hours[3]||hours[Math.min(2,hours.length-1)]||c),h6=norm(hours[6]||hours[Math.min(5,hours.length-1)]||c);
    const risk=x=>(Number.isFinite(x.gust)?Math.max(x.wind||0,x.gust*.8):x.wind||0)+(Number.isFinite(x.rain)?x.rain*.08:0);
    const rn=risk(now),r3=risk(h3),r6=risk(h6),delta=r6-rn;
    let call='STEADY',title='Conditions are holding fairly steady.',move='Stay with your best bite window.';
    if(delta<=-5){call='IMPROVING';title='Conditions improve later in the window.';move='Consider delaying toward the calmer period.';}
    else if(delta>=7){call='DETERIORATING';title='Conditions get tougher over the next several hours.';move='Fish earlier or shorten the trip.';}
    else if((h3.rain||0)>Math.max(40,(now.rain||0)+25)){call='RAIN BUILDING';title='Rain chances build into the middle of the window.';move='Favor the earlier/drier window.';}
    const format=x=>(Number.isFinite(x.wind)?Math.round(x.wind)+' mph':'—')+(Number.isFinite(x.gust)&&x.gust>x.wind+3?' / '+Math.round(x.gust)+' gust':'');
    return{now,h3,h6,call,title,move,detail:'Wind/rain trend from the loaded CastVector forecast. Radar history shows what has already moved through.',format};
  },

  renderFront(app){
    const m=this.frameModel(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('frontWatchBadge',m.call);set('frontWatchCall',m.call);set('frontWatchTitle',m.title);set('frontWatchDetail',m.detail);set('fwMove',m.move);
    set('fwNow',m.format(m.now));set('fw3',m.format(m.h3));set('fw6',m.format(m.h6));
    set('fwNowMeta',Number.isFinite(m.now.rain)?Math.round(m.now.rain)+'% rain':'Current');
    set('fw3Meta',Number.isFinite(m.h3.rain)?Math.round(m.h3.rain)+'% rain':'Forecast');
    set('fw6Meta',Number.isFinite(m.h6.rain)?Math.round(m.h6.rain)+'% rain':'Forecast');
    const badge=document.getElementById('frontWatchBadge');if(badge)badge.className='wm-badge '+m.call.toLowerCase().replace(/\s+/g,'-');
  },

  render(app){
    const p=this.prefs(),btn=document.getElementById('wmToggleBtn'),play=document.getElementById('wmPlayBtn'),badge=document.getElementById('wmBadge'),speed=document.getElementById('wmSpeed');
    if(btn)btn.textContent=p.enabled?'Hide radar motion':'Show 4-hour motion';
    if(play)play.textContent=this.playing?'Ⅱ':'▶';
    if(badge){badge.textContent=p.enabled?'MOTION ON':'OFF';badge.className='wm-badge '+(p.enabled?'on':'');}
    if(speed)speed.value=String(p.speed);
    document.querySelectorAll('[data-wm-layer="motion"]').forEach(b=>b.classList.toggle('active',p.enabled));
    this.renderTimeline(app);this.renderFront(app);
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-wm-layer="motion"]')||e.target.closest('#wmToggleBtn')){this.prefs().enabled?this.disable(app):this.enable(app);return;}
      if(e.target.closest('#wmPlayBtn')){this.play(app);return;}
      if(e.target.closest('#wmLatestBtn')){this.latest(app);return;}
      if(e.target.closest('#fwOpenMotion')){
        app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.enable(app);},180);return;
      }
      if(e.target.closest('#fwRefresh')){app.state.live?app.loadLiveData?.():app.setLiveMode?.(true);return;}
    });
    document.addEventListener('input',e=>{
      if(e.target.id==='wmSlider'){this.stop();this.showFrame(app,Number(e.target.value));this.render(app);}
    });
    document.addEventListener('change',e=>{
      if(e.target.id==='wmSpeed'){const p=this.prefs();p.speed=Number(e.target.value)||700;this.savePrefs(p);if(this.playing){this.stop();this.play(app);}}
    });
  }
};

window.CastVectorWeatherMotion=WM;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>WM.install());else WM.install();
})();