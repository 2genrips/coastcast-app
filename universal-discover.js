(function(){
'use strict';

const D={
  version:'8.0.0',
  prefsKey:'castvector-discover-v80',
  results:[],
  busy:false,

  app(){return window.CastVector;},

  prefs(app){
    let saved={};try{saved=JSON.parse(localStorage.getItem(this.prefsKey)||'{}')||{};}catch(_){}
    return {
      environment:saved.environment||'auto',
      radius:Number(saved.radius)||25,
      when:saved.when||'today',
      party:saved.party||'solo',
      target:saved.target||'best'
    };
  },

  savePrefs(p){try{localStorage.setItem(this.prefsKey,JSON.stringify(p));}catch(_){}},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.bind(app);
    this.renderEnvironment(app);
  },

  installUI(app){
    const action=document.querySelector('#home7QuickActions .home7-action[data-home7-view="map"]');
    if(action&&!document.getElementById('discoverHomeBtn')){
      action.id='discoverHomeBtn';
      action.removeAttribute('data-home7-view');
      action.innerHTML='<span class="home7-icon">◎</span><strong>Where should I fish?</strong><small>Let CastVector choose the best water</small>';
      action.classList.add('discover-home-action');
    }

    if(!document.getElementById('discoverDialog')){
      const dlg=document.createElement('dialog');dlg.id='discoverDialog';dlg.className='sheet-dialog discover-dialog';
      dlg.innerHTML=
        '<div class="sheet-card discover-sheet">'+
          '<div class="discover-head"><div><div class="eyebrow">CASTVECTOR DISCOVER • 8.0</div><h2>Where should I fish?</h2><p>One answer from live conditions, access, distance and your own fishing history.</p></div><button class="icon-button" type="button" id="discoverCloseBtn" aria-label="Close">×</button></div>'+
          '<div class="discover-origin"><div><span>STARTING FROM</span><strong id="discoverOriginName">Current fishing location</strong><small id="discoverOriginMeta">Using your selected CastVector location</small></div><button id="discoverGpsBtn" class="secondary-button small" type="button">Use phone location</button></div>'+
          '<div class="discover-fields">'+
            '<label><span>Water</span><select id="discoverEnvironment" class="select-control"><option value="auto">Current mode</option><option value="coast">Coast</option><option value="freshwater">Freshwater</option></select></label>'+
            '<label><span>Radius</span><select id="discoverRadius" class="select-control"><option value="10">10 miles</option><option value="25">25 miles</option><option value="50">50 miles</option></select></label>'+
            '<label><span>When</span><select id="discoverWhen" class="select-control"><option value="today">Today</option><option value="tomorrow">Tomorrow</option><option value="weekend">This weekend</option></select></label>'+
            '<label><span>Who</span><select id="discoverParty" class="select-control"><option value="solo">Just me</option><option value="family">Family</option><option value="friends">Friends</option></select></label>'+
            '<label class="discover-target-field"><span>Target</span><select id="discoverTarget" class="select-control"></select></label>'+
          '</div>'+
          '<button id="discoverRunBtn" class="primary-button full discover-run" type="button">Find my best fishing option</button>'+
          '<div id="discoverProgress" class="discover-progress" hidden><span class="scan-spinner"></span><div><strong>CastVector is ranking real options…</strong><small id="discoverProgressText">Checking water, access and live conditions.</small></div></div>'+
          '<div id="discoverResults" class="discover-results"><div class="discover-empty"><strong>Tell CastVector what kind of trip you want.</strong><span>Discover will return a best choice, a backup, and the reason behind both.</span></div></div>'+
        '</div>';
      document.body.appendChild(dlg);
    }
    this.renderForm(app);
  },

  renderForm(app){
    const p=this.prefs(app);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=String(v);};
    set('discoverEnvironment',p.environment);set('discoverRadius',p.radius);set('discoverWhen',p.when);set('discoverParty',p.party);
    const target=document.getElementById('discoverTarget');
    if(target){
      const names=(app.coastRegionSpecies?.()||Object.keys(app.species||{})).filter(n=>app.species?.[n]);
      target.innerHTML='<option value="best">Best available species</option>'+names.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
      target.value=names.includes(p.target)||p.target==='best'?p.target:'best';
    }
    this.renderOrigin(app);
  },

  renderOrigin(app){
    const l=app.state.location||{};
    const name=document.getElementById('discoverOriginName'),meta=document.getElementById('discoverOriginMeta');
    if(name)name.textContent=l.name||'Selected location';
    if(meta)meta.textContent=(l.source||'CastVector')+' • '+Number(l.lat||0).toFixed(3)+', '+Number(l.lon||0).toFixed(3);
  },

  read(){
    return{
      environment:document.getElementById('discoverEnvironment')?.value||'auto',
      radius:Number(document.getElementById('discoverRadius')?.value)||25,
      when:document.getElementById('discoverWhen')?.value||'today',
      party:document.getElementById('discoverParty')?.value||'solo',
      target:document.getElementById('discoverTarget')?.value||'best'
    };
  },

  environment(app,p){
    if(p.environment==='coast'||p.environment==='freshwater')return p.environment;
    return window.CastVectorFreshwater?.mode?.(app)||app.state.waterMode?.mode||'coast';
  },

  async prepare(app,p){
    const env=this.environment(app,p);
    const fw=window.CastVectorFreshwater;
    if(fw&&fw.mode?.(app)!==env)fw.setMode(app,env);
    app.state.scout.radius=p.radius;app.state.scout.period=p.when;
    const species=p.target!=='best'&&app.species[p.target]?p.target:this.bestSpecies(app);
    app.state.scout.species=species;app.state.targetSpecies=species;
    app.recalculateScores?.();

    if(env==='freshwater'){
      if(fw){
        try{if(!(app.state.freshwaterIQ?.waters||[]).length)await fw.scanWaters(app);}catch(_){}
        try{await fw.loadUSGS(app);}catch(_){}
      }
    }else{
      try{if(!(app.state.mapPOIs||[]).length)await app.loadMapPlaces?.(false);}catch(_){}
    }
    return{env,species};
  },

  bestSpecies(app){
    const ranked=app.rankSpecies?.()||[];
    if(ranked[0]?.name&&app.species[ranked[0].name])return ranked[0].name;
    const names=app.coastRegionSpecies?.()||Object.keys(app.species||{});
    return [...names].sort((a,b)=>(app.speciesTodayScore?.(b)||0)-(app.speciesTodayScore?.(a)||0))[0]||app.state.targetSpecies;
  },

  pool(app,p,env){
    const center=app.state.location||{},all=[];
    const add=(x,sourceKind,base=70)=>{
      if(!x||!Number.isFinite(Number(x.lat))||!Number.isFinite(Number(x.lon)))return;
      const lat=Number(x.lat),lon=Number(x.lon),distance=app.haversine(Number(center.lat),Number(center.lon),lat,lon);
      if(distance>p.radius*1.15&&sourceKind!=='Current')return;
      const name=String(x.name||x.label||'Fishing option');
      if(all.some(a=>app.haversine(a.lat,a.lon,lat,lon)<.12||a.name.toLowerCase()===name.toLowerCase()))return;
      all.push({
        id:String(x.id||sourceKind+'-'+all.length+'-'+Math.round(lat*10000)),name,lat,lon,distance,
        type:x.type||sourceKind,sourceKind,source:x.source||sourceKind,match:Number(x.match??x.patternScore??base)||base,
        patternScore:Number(x.patternScore)||null,verified:x.verified===true||/official|verified|public access/i.test(String(x.source||''))
      });
    };

    add({id:'discover-current',name:center.name,lat:center.lat,lon:center.lon,type:'Current destination',source:center.source,match:app.currentScore?.()||72},'Current',72);
    (app.state.scout?.results||[]).forEach(x=>add(x,'Scout',Number(x.score)||74));
    (app.state.waypoints||[]).forEach(x=>add({...x,type:'Private favorite',match:79},'Favorite',79));

    if(env==='freshwater'){
      (app.state.freshwaterIQ?.waters||[]).forEach(x=>add({...x,type:x.type||'Freshwater'},'Freshwater',74));
    }else{
      (app.state.mapPOIs||[]).forEach(x=>add(x,'Public access',Number(x.match)||72));
    }

    const atlas=window.CastVectorPatternAtlas;
    if(atlas?.cluster){
      try{atlas.cluster(app).forEach(z=>add({...z,name:z.label,type:'Private Pattern Zone',match:z.patternScore},'Pattern Atlas',z.patternScore));}catch(_){}
    }
    return all.sort((a,b)=>b.match-a.match||a.distance-b.distance).slice(0,9);
  },

  familyFit(c,p){
    if(p.party!=='family')return 0;
    const t=(c.type+' '+c.source+' '+c.sourceKind).toLowerCase();
    let x=0;if(/public|access|pier|beach|park|ramp|lake|reservoir|pond/.test(t))x+=6;if(/private|pattern/.test(t))x-=2;if(c.distance<=10)x+=3;return x;
  },

  personalFit(c){
    if(c.sourceKind==='Pattern Atlas')return Math.min(14,Math.max(5,(Number(c.patternScore||70)-60)*.25));
    if(c.sourceKind==='Favorite')return 5;
    return 0;
  },

  accessFit(c){
    if(c.verified)return 7;
    if(c.sourceKind==='Public access')return 4;
    if(c.sourceKind==='Current'||c.sourceKind==='Pattern Atlas'||c.sourceKind==='Favorite')return 2;
    return 0;
  },

  composite(c,p){
    const live=Number(c.score??c.match??65);
    const distancePenalty=Math.min(14,(Number(c.distance)||0)*.35);
    const personal=this.personalFit(c),family=this.familyFit(c,p),access=this.accessFit(c);
    return Math.round(Math.max(30,Math.min(99,live-distancePenalty+personal+family+access)));
  },

  why(app,r,p,env){
    const parts=[];
    parts.push((r.liveScore||r.score)+' live fishing score');
    if(Number(r.distance)<=2)parts.push('very close to your start');
    else if(Number(r.distance)<=10)parts.push(r.distance.toFixed(1)+' mi away');
    if(r.sourceKind==='Pattern Atlas')parts.push('proven by your own catch history');
    else if(r.sourceKind==='Favorite')parts.push('one of your saved waters');
    else if(r.verified)parts.push('verified/public access signal');
    if(p.party==='family'&&this.familyFit(r,p)>0)parts.push('family-friendly access profile');
    if(env==='freshwater'&&app.state.freshwaterIQ?.status==='live')parts.push('USGS water context loaded');
    if(r.bestTime)parts.push('best around '+r.bestTime);
    return parts.slice(0,4).join(' • ');
  },

  async evaluate(app,c,p,env,species){
    const originalPeriod=app.state.scout.period,originalSpecies=app.state.scout.species;
    app.state.scout.period=p.when;app.state.scout.species=species;
    let r=null;
    try{r=await app.scoutEvaluateSpot(c);}catch(_){r=app.scoutPreviewResult?.(c)||{...c,score:c.match||65,confidence:'preview'};}
    app.state.scout.period=originalPeriod;app.state.scout.species=originalSpecies;
    const liveScore=Number(r.score)||Number(c.match)||65;
    const merged={...c,...r,liveScore};
    merged.discoverScore=this.composite(merged,p);
    merged.why=this.why(app,merged,p,env);
    return merged;
  },

  async run(app){
    if(this.busy)return;this.busy=true;
    const p=this.read();this.savePrefs(p);
    const button=document.getElementById('discoverRunBtn'),progress=document.getElementById('discoverProgress'),text=document.getElementById('discoverProgressText');
    if(button){button.disabled=true;button.textContent='Finding your best water…';}
    if(progress)progress.hidden=false;
    const box=document.getElementById('discoverResults');
    if(box)box.innerHTML='';
    try{
      const prep=await this.prepare(app,p);
      if(text)text.textContent=prep.env==='freshwater'?'Checking nearby waters, USGS context and your history.':'Checking nearby access, live coast conditions and your history.';
      const candidates=this.pool(app,p,prep.env);
      if(!candidates.length)throw new Error('No candidates');
      const settled=await Promise.allSettled(candidates.slice(0,8).map(c=>this.evaluate(app,c,p,prep.env,prep.species)));
      this.results=settled.filter(x=>x.status==='fulfilled'&&x.value).map(x=>x.value).sort((a,b)=>b.discoverScore-a.discoverScore||a.distance-b.distance);
      this.renderResults(app,p,prep);
      app.state.discover={lastRun:new Date().toISOString(),environment:prep.env,species:prep.species,results:this.results.slice(0,5)};
      app.save?.();
    }catch(e){
      if(box)box.innerHTML='<div class="discover-empty"><strong>CastVector could not build a reliable nearby ranking.</strong><span>Try a larger radius or choose a fishing location first.</span></div>';
    }finally{
      this.busy=false;if(button){button.disabled=false;button.textContent='Find my best fishing option';}if(progress)progress.hidden=true;
    }
  },

  renderResults(app,p,prep){
    const box=document.getElementById('discoverResults');if(!box)return;
    if(!this.results.length){box.innerHTML='<div class="discover-empty"><strong>No ranked options yet.</strong><span>Try increasing the search radius.</span></div>';return;}
    const best=this.results[0],backup=this.results[1],safety=app.safetyAssessment?.()||{level:0,status:'Review conditions before leaving'};
    box.innerHTML=
      '<section class="discover-winner '+(safety.level>=2?'hold':'')+'">'+
        '<div class="discover-winner-top"><div><span class="discover-label">'+(safety.level>=2?'BEST OPTION • REVIEW SAFETY':'BEST CHOICE')+'</span><h3>'+app.escape(best.name)+'</h3><p>'+app.escape(best.type||prep.env)+'</p></div><div class="discover-score"><strong>'+best.discoverScore+'</strong><span>/100</span></div></div>'+
        '<div class="discover-facts"><div><span>TARGET</span><strong>'+app.escape(prep.species)+'</strong></div><div><span>WHEN</span><strong>'+app.escape(best.bestTime||'Best loaded window')+'</strong></div><div><span>DISTANCE</span><strong>'+Number(best.distance||0).toFixed(1)+' mi</strong></div><div><span>LIVE SCORE</span><strong>'+best.liveScore+'/100</strong></div></div>'+
        '<div class="discover-why"><span>WHY THIS ONE</span><strong>'+app.escape(best.why)+'</strong></div>'+
        '<div class="discover-actions"><button class="primary-button" type="button" data-discover-use="0">Use this spot</button><button class="secondary-button" type="button" data-discover-plan="0">Build trip</button><button class="ghost-button" type="button" data-discover-route="0">Route</button></div>'+
      '</section>'+
      (backup?'<section class="discover-backup"><div><span>BACKUP</span><strong>'+app.escape(backup.name)+'</strong><small>'+app.escape(backup.why)+'</small></div><b>'+backup.discoverScore+'</b><button class="secondary-button small" type="button" data-discover-use="1">Use backup</button></section>':'')+
      '<div class="discover-more">'+this.results.slice(2,5).map((r,i)=>'<button type="button" data-discover-use="'+(i+2)+'"><span>#'+(i+3)+'</span><div><strong>'+app.escape(r.name)+'</strong><small>'+Number(r.distance||0).toFixed(1)+' mi • '+app.escape(r.bestTime||'best window')+'</small></div><b>'+r.discoverScore+'</b></button>').join('')+'</div>'+
      '<div class="discover-safety"><strong>Safety check:</strong> '+app.escape(safety.status||'Review local conditions and access before fishing.')+'</div>';
  },

  select(app,index,plan=false){
    const r=this.results[Number(index)];if(!r)return;
    app.state.location={key:'discover',name:r.name,lat:Number(r.lat),lon:Number(r.lon),source:'CastVector Discover • '+r.sourceKind};
    app.state.targetSpecies=app.state.discover?.species||app.state.targetSpecies;
    app.onLocationChanged?.();this.close();
    if(plan){
      app.navigate?.('trips');
      setTimeout(()=>{
        const tmf=window.CastVectorTakeMeFishing;
        if(tmf){
          const target=document.getElementById('tmfTarget');if(target)target.value=app.state.targetSpecies;
          tmf.build?.(app);
        }else app.openPlanner?.();
      },250);
    }else{
      app.navigate?.('map');
      setTimeout(()=>window.CastVectorSpotDNA?.analyze?.(app,r.lat,r.lon,r.name),220);
    }
    app.showToast?.(r.name+' selected from Discover.');
  },

  route(app,index){
    const r=this.results[Number(index)];if(r)window.open(app.mapsUrl(r.lat,r.lon,r.name),'_blank','noopener');
  },

  open(app){
    this.renderForm(app);const d=document.getElementById('discoverDialog');if(d&&!d.open)d.showModal();
  },

  close(){const d=document.getElementById('discoverDialog');if(d?.open)d.close();},

  renderEnvironment(app){
    const b=document.getElementById('discoverHomeBtn');if(!b)return;
    const env=window.CastVectorFreshwater?.mode?.(app)||app.state.waterMode?.mode||'coast';
    const small=b.querySelector('small');if(small)small.textContent=env==='freshwater'?'Rank nearby lakes, rivers & reservoirs':'Rank nearby coast, access & private spots';
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#discoverHomeBtn')){this.open(app);return;}
      if(e.target.closest('#discoverCloseBtn')){this.close();return;}
      if(e.target.closest('#discoverGpsBtn')){app.useMyLocation?.();setTimeout(()=>this.renderOrigin(app),1200);return;}
      if(e.target.closest('#discoverRunBtn')){this.run(app);return;}
      const use=e.target.closest('[data-discover-use]');if(use){this.select(app,use.dataset.discoverUse,false);return;}
      const plan=e.target.closest('[data-discover-plan]');if(plan){this.select(app,plan.dataset.discoverPlan,true);return;}
      const route=e.target.closest('[data-discover-route]');if(route){this.route(app,route.dataset.discoverRoute);return;}
    });
    window.addEventListener('castvector:native-ready',()=>this.renderEnvironment(app));
    const old=app.renderAll?.bind(app);
    if(old)app.renderAll=function(){const out=old();D.renderEnvironment(this);return out;};
  }
};

window.CastVectorDiscover=D;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>D.install());else D.install();
})();