(function(){
'use strict';

const R={
  version:'8.1.0',
  memory:new Map(),
  providers:new Map(),
  errors:[],
  maxCache:28,
  retryable:new Set([408,425,429,500,502,503,504]),

  app(){return window.CastVector;},

  provider(url){
    let u;try{u=new URL(url,location.href);}catch(_){return'unknown';}
    const h=u.hostname,p=u.pathname;
    if(h.includes('open-meteo.com'))return h.startsWith('marine-')?'marine':'weather';
    if(h.includes('tidesandcurrents.noaa.gov'))return'NOAA tides';
    if(h.includes('weather.gov'))return'NWS alerts';
    if(h.includes('waterdata.usgs.gov'))return'USGS water';
    if(h.includes('ngdc.noaa.gov'))return'NOAA depth';
    if(h.includes('overpass'))return'OpenStreetMap';
    if(h.includes('nominatim'))return'Nominatim';
    if(h.includes('photon.komoot.io'))return'Photon';
    if(h.includes('geoapify'))return'Geoapify';
    return h||'network';
  },

  state(name){
    if(!this.providers.has(name))this.providers.set(name,{name,status:'idle',success:0,fail:0,streak:0,lastOk:null,lastFail:null,lastLatency:null,openUntil:0,recovered:0});
    return this.providers.get(name);
  },

  cacheKey(url){return String(url);},

  putCache(url,data){
    const key=this.cacheKey(url);
    this.memory.set(key,{data,at:Date.now()});
    while(this.memory.size>this.maxCache)this.memory.delete(this.memory.keys().next().value);
  },

  getCache(url,maxAge=15*60000){
    const x=this.memory.get(this.cacheKey(url));
    return x&&Date.now()-x.at<=maxAge?x:null;
  },

  noteError(kind,message,extra=''){
    this.errors.unshift({at:new Date().toISOString(),kind:String(kind||'Runtime'),message:String(message||'Unknown error').slice(0,220),extra:String(extra||'').slice(0,180)});
    this.errors=this.errors.slice(0,20);
    this.render();
  },

  sleep(ms){return new Promise(r=>setTimeout(r,ms));},

  async robustFetch(url,timeout=12000){
    const name=this.provider(url),st=this.state(name),cached=this.getCache(url);
    if(st.openUntil>Date.now()){
      if(cached){st.status='cached';st.recovered++;this.render();return cached.data;}
      throw new Error(name+' temporarily paused after repeated failures');
    }

    let last=null;
    for(let attempt=0;attempt<3;attempt++){
      const ctrl=new AbortController(),started=performance.now(),timer=setTimeout(()=>ctrl.abort(),timeout);
      try{
        const r=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/json'},cache:'no-store'});
        clearTimeout(timer);
        if(!r.ok){
          const e=new Error('HTTP '+r.status);e.status=r.status;throw e;
        }
        const data=await r.json();
        st.status='live';st.success++;st.streak=0;st.lastOk=Date.now();st.lastLatency=Math.round(performance.now()-started);st.openUntil=0;
        this.putCache(url,data);this.render();return data;
      }catch(e){
        clearTimeout(timer);last=e;
        const status=Number(e?.status)||0;
        const canRetry=attempt<2&&(status===0||this.retryable.has(status)||e?.name==='AbortError');
        if(!canRetry)break;
        await this.sleep(attempt===0?350:900);
      }
    }

    st.fail++;st.streak++;st.lastFail=Date.now();st.status='degraded';
    if(st.streak>=3)st.openUntil=Date.now()+45000;
    if(cached){st.status='cached';st.recovered++;this.render();return cached.data;}
    this.render();throw last||new Error('Network request failed');
  },

  installNetwork(app){
    if(app._cvReliabilityFetch)return;app._cvReliabilityFetch=true;
    app.fetchJSON=(url,timeout=12000)=>this.robustFetch(url,timeout);
  },

  installRenderGuard(app){
    if(app._cvReliabilityRender)return;app._cvReliabilityRender=true;
    const prev=app.renderAll?.bind(app);
    if(prev)app.renderAll=function(){
      try{return prev();}
      catch(e){
        R.noteError('Render',e?.message||e,String(e?.stack||'').split('\n').slice(0,2).join(' '));
        try{this.renderMode?.();this.renderLocation?.();this.renderSourceHealth?.();}catch(_){}
        return false;
      }
    };
  },

  installGlobalErrors(){
    window.addEventListener('error',e=>this.noteError('JavaScript',e.message||'Runtime error',e.filename?e.filename.split('/').pop()+':'+e.lineno:''));
    window.addEventListener('unhandledrejection',e=>this.noteError('Promise',e.reason?.message||String(e.reason||'Unhandled rejection')));
    window.addEventListener('online',()=>this.render());
    window.addEventListener('offline',()=>this.render());
  },

  startup(){
    const nav=performance.getEntriesByType?.('navigation')?.[0];
    if(!nav)return null;
    return{
      dom:Math.round(nav.domContentLoadedEventEnd||0),
      load:Math.round(nav.loadEventEnd||0),
      transfer:Math.round(nav.transferSize||0)
    };
  },

  installUI(app){
    const row=document.querySelector('#view-home .status-row');
    if(row&&!document.getElementById('cvHealthPill')){
      const b=document.createElement('button');b.id='cvHealthPill';b.className='cv-health-pill';b.type='button';b.innerHTML='<i></i><span>DATA HEALTH</span><strong>CHECK</strong>';
      row.appendChild(b);
    }
    if(!document.getElementById('cvHealthDialog')){
      const d=document.createElement('dialog');d.id='cvHealthDialog';d.className='sheet-dialog';
      d.innerHTML='<div class="sheet-card cv-health-sheet"><div class="cv-health-head"><div><div class="eyebrow">CASTVECTOR RELIABILITY • 8.1</div><h2>Data Health</h2><p>Know what is live, recovered, cached or unavailable before trusting a recommendation.</p></div><button id="cvHealthClose" class="icon-button" type="button">×</button></div><div id="cvHealthHero" class="cv-health-hero"></div><div id="cvHealthSources" class="cv-health-sources"></div><div class="cv-health-subhead">APP HEALTH</div><div id="cvHealthRuntime" class="cv-health-runtime"></div><div id="cvHealthErrors" class="cv-health-errors"></div><button id="cvHealthRefresh" class="primary-button full" type="button">Refresh live data</button></div>';
      document.body.appendChild(d);
    }
  },

  sourceRows(app){
    const h=app.state.sourceHealth||{},labels={weather:'Weather',marine:'Marine',tides:'Tides',alerts:'Safety alerts',buoy:'Ocean station',shops:'Bait & tackle'};
    return Object.entries(labels).map(([k,label])=>({label,status:h[k]||(!app.state.live?'demo':'idle')}));
  },

  statusModel(app){
    if(!navigator.onLine)return{label:'OFFLINE',tone:'offline',detail:'Using what is already loaded on this device.'};
    if(!app.state.live)return{label:'DEMO',tone:'demo',detail:'Turn on Live Data before making a fishing decision.'};
    const rows=this.sourceRows(app),good=rows.filter(x=>['live','verified','cached'].includes(x.status)).length;
    const runtimeBad=[...this.providers.values()].some(x=>x.status==='degraded');
    if(good>=4&&!runtimeBad)return{label:'LIVE '+good+'/'+rows.length,tone:'good',detail:'Core fishing sources are responding.'};
    if(good>=2)return{label:'PARTIAL '+good+'/'+rows.length,tone:'warn',detail:'Some sources are unavailable; CastVector is filling gaps.'};
    return{label:'LIMITED',tone:'bad',detail:'Live coverage is limited. Recheck official sources before travel.'};
  },

  render(){
    const app=this.app();if(!app)return;
    const model=this.statusModel(app),pill=document.getElementById('cvHealthPill');
    if(pill){pill.className='cv-health-pill '+model.tone;pill.querySelector('strong').textContent=model.label;}

    const hero=document.getElementById('cvHealthHero');
    if(hero){
      const conf=app.dataConfidence?.(),age=Number.isFinite(conf?.ageMin)?Math.round(conf.ageMin):null;
      hero.className='cv-health-hero '+model.tone;
      hero.innerHTML='<div><span>STATUS</span><strong>'+app.escape(model.label)+'</strong><small>'+app.escape(model.detail)+'</small></div><div><span>CONFIDENCE</span><strong>'+(conf?.score??'—')+'%</strong><small>'+(age==null?'No live age yet':age+' min since live refresh')+'</small></div>';
    }

    const src=document.getElementById('cvHealthSources');
    if(src)src.innerHTML=this.sourceRows(app).map(x=>'<div class="cv-health-row"><span>'+app.escape(x.label)+'</span><strong class="'+app.escape(x.status)+'">'+app.escape(String(x.status).toUpperCase())+'</strong></div>').join('');

    const run=document.getElementById('cvHealthRuntime');
    if(run){
      const s=this.startup(),p=[...this.providers.values()].filter(x=>x.success||x.fail).sort((a,b)=>(b.lastFail||b.lastOk||0)-(a.lastFail||a.lastOk||0));
      run.innerHTML='<div><span>NETWORK</span><strong>'+(navigator.onLine?'ONLINE':'OFFLINE')+'</strong></div><div><span>STARTUP</span><strong>'+(s?.dom?s.dom+' ms':'—')+'</strong></div><div><span>RECOVERED REQUESTS</span><strong>'+p.reduce((n,x)=>n+x.recovered,0)+'</strong></div><div><span>RUNTIME ERRORS</span><strong>'+this.errors.length+'</strong></div>'+
        (p.length?'<div class="cv-provider-list">'+p.slice(0,8).map(x=>'<span>'+app.escape(x.name)+'</span><b class="'+app.escape(x.status)+'">'+app.escape(x.status.toUpperCase())+(x.lastLatency?' • '+x.lastLatency+'ms':'')+'</b>').join('')+'</div>':'');
    }

    const errs=document.getElementById('cvHealthErrors');
    if(errs)errs.innerHTML=this.errors.length?'<details><summary>Recent app diagnostics ('+this.errors.length+')</summary>'+this.errors.slice(0,5).map(e=>'<div><strong>'+app.escape(e.kind)+'</strong><span>'+app.escape(e.message)+'</span></div>').join('')+'</details>':'<div class="cv-health-clear">No runtime errors recorded this session.</div>';
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#cvHealthPill')){this.render();const d=document.getElementById('cvHealthDialog');if(d&&!d.open)d.showModal();return;}
      if(e.target.closest('#cvHealthClose')){document.getElementById('cvHealthDialog')?.close();return;}
      if(e.target.closest('#cvHealthRefresh')){document.getElementById('cvHealthDialog')?.close();app.state.live?app.loadLiveData?.():app.setLiveMode?.(true);return;}
    });
    const prev=app.renderSourceHealth?.bind(app);
    if(prev)app.renderSourceHealth=function(){const out=prev();R.render();return out;};
  },

  install(){
    const app=this.app();if(!app)return;
    this.installNetwork(app);
    this.installRenderGuard(app);
    this.installGlobalErrors();
    this.installUI(app);
    this.bind(app);
    this.render();
  }
};

window.CastVectorReliability=R;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>R.install());else R.install();
})();