(function(){
'use strict';
const module={
  version:'5.8.0',
  prefs:{duration:180,party:'solo',style:null,target:'best'},
  getPrefs(app){
    const saved=app.state.takeMeFishing||{};
    return {
      duration:Number(saved.duration)||180,
      party:saved.party||'solo',
      style:saved.style||app.state.fishingStyle||'Surf fishing',
      target:saved.target||'best'
    };
  },
  savePrefs(app,p){app.state.takeMeFishing={...p,lastBuilt:app.state.takeMeFishing?.lastBuilt||null,lastPlan:app.state.takeMeFishing?.lastPlan||null};app.save();},
  styleLabel(v){return v==='Nearshore boat'?'Boat':v==='Inlet / jetty'?'Inlet / jetty':v==='Pier fishing'?'Pier':'Surf / shore';},
  partyLabel(v){return v==='family'?'Family':v==='friends'?'Friends':'Just me';},
  durationLabel(v){const n=Number(v)||180;return n<120?n+' min':n===180?'3 hours':n===360?'Half day':n===480?'Full day':Math.round(n/60)+' hours';},
  chooseSpecies(app,p){
    if(p.target!=='best'&&app.species[p.target])return p.target;
    const ranked=app.rankSpecies?.()||[];
    return ranked[0]?.name||app.state.targetSpecies;
  },
  chooseDay(app,species){
    const rows=app.commandDayRows?.(species,'bite')||[];
    if(!rows.length)return {index:0,score:app.speciesTodayScore?.(species)||60,day:app.state.data?.days?.[0]||{}};
    return [...rows].sort((a,b)=>b.score-a.score)[0];
  },
  chooseWindow(app,species,dayIndex,duration){
    const dayRows=(app.state.data?.hours||[]).filter(h=>h.dateIndex===dayIndex).slice(0,24);
    if(!dayRows.length)return null;
    const scored=dayRows.map(h=>({...h,score:app.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??app.state.data.current?.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??app.state.data.current?.pressure},species)}));
    const hours=Math.max(1,Math.min(8,Math.round(Number(duration||180)/60)));
    let best=null;
    for(let i=0;i<scored.length;i++){
      const rows=scored.slice(i,i+hours);if(!rows.length)continue;
      const avg=Math.round(app.average(rows.map(x=>x.score)));
      if(!best||avg>best.score)best={rows,score:avg,start:rows[0],end:rows[rows.length-1]};
    }
    return best?{...best,label:best.rows.length>1?best.start.time+' – '+best.end.time:best.start.time}:null;
  },
  spotScore(p,prefs){
    let s=Number(p.score??p.match??70);
    const type=String(p.type||'').toLowerCase();
    if(prefs.party==='family'){
      if(/pier|beach|public|access/.test(type))s+=8;
      if(/jetty|rocks|private/.test(type))s-=10;
    }
    if(prefs.style==='Pier fishing'&&/pier/.test(type))s+=12;
    if(prefs.style==='Surf fishing'&&/beach|surf|access/.test(type))s+=10;
    if(prefs.style==='Nearshore boat'&&/ramp|marina/.test(type))s+=12;
    if(prefs.style==='Inlet / jetty'&&/inlet|jetty|pier/.test(type))s+=8;
    return s;
  },
  chooseSpot(app,prefs){
    const scout=(app.state.scout?.results||[]).map(x=>({...x,sourceKind:'Scout'}));
    const pois=(app.state.mapPOIs||[]).map(x=>({...x,sourceKind:'Map'}));
    const pool=[...scout,...pois].filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon)));
    if(!pool.length)return {name:app.state.location.name,lat:app.state.location.lat,lon:app.state.location.lon,type:'Current destination',sourceKind:'Current',score:app.currentScore?.()||70,distance:0};
    return pool.sort((a,b)=>this.spotScore(b,prefs)-this.spotScore(a,prefs)||Number(a.distance||0)-Number(b.distance||0))[0];
  },
  familyNotes(prefs){
    if(prefs.party==='family')return ['Favor easy public access and a short walk when possible.','Bring extra water, snacks, sunscreen and a simple backup rig.','Re-check surf, lightning, heat/cold and restroom/access details before leaving.'];
    if(prefs.party==='friends')return ['Share the trip plan and meeting point before departure.','Split bait, ice and safety gear so the group is not duplicating everything.'];
    return ['Share your destination with someone if fishing remote water.','Keep a charged phone and first-aid kit accessible.'];
  },
  async build(app){
    const p=this.readForm(app);
    this.savePrefs(app,p);
    const button=app.$('tmfBuildBtn');if(button){button.disabled=true;button.textContent='Building your trip…';}
    try{
      app.state.fishingStyle=p.style;
      let species=this.chooseSpecies(app,p);
      app.state.targetSpecies=species;
      app.state.scout.species=species;
      app.recalculateScores?.();

      if((!app.state.mapPOIs||!app.state.mapPOIs.length)&&app.loadMapPlaces){
        try{await app.loadMapPlaces(false);}catch(_){}
      }
      if(app.state.live&&(!app.state.scout?.results||!app.state.scout.results.length)&&app.runScout){
        app.state.scout.period='today';
        try{await app.runScout();}catch(_){}
      }

      const day=this.chooseDay(app,species);
      const dayIndex=Number(day.index)||0;
      const window=this.chooseWindow(app,species,dayIndex,p.duration);
      const spot=this.chooseSpot(app,p);
      const bait=app.baitIntelligence?.(species)||{};
      const safety=app.safetyAssessment?.()||{level:0,status:'Review local conditions'};
      const confidence=app.dataConfidence?.().score??50;
      const dayData=app.state.data?.days?.[dayIndex]||{};
      const dayLabel=dayData.date||dayData.day||(dayIndex===0?'Today':'Day '+(dayIndex+1));
      const shop=(app.state.data?.shops||[])[0]||null;
      const regCode=app.detectStateCode?.();
      const regSource=regCode?app.regulationSources?.[regCode]:null;

      const plan={
        id:Date.now(),
        type:'take-me-fishing',
        location:spot.name||app.state.location.name,
        lat:Number(spot.lat),
        lon:Number(spot.lon),
        species,
        day:dayLabel,
        dayIndex,
        score:window?.score||day.score||app.speciesTodayScore?.(species)||70,
        window:window?.label||day.window?.label||'Best loaded window',
        priority:'take-me-fishing',
        fishingStyle:p.style,
        party:p.party,
        duration:Number(p.duration),
        spotType:spot.type||'Coastal spot',
        spotSource:spot.sourceKind||spot.source||'CastVector',
        confidence,
        baitPlan:{species,primary:bait.primary,backup:bait.backup,rig:bait.rig,presentation:bait.presentation,terminal:bait.terminal,created:new Date().toISOString()},
        safety:{level:safety.level,status:safety.status},
        regulations:regSource?{state:regCode,source:regSource.name,url:regSource.url}:null,
        shop:shop?{name:shop.name,lat:shop.lat,lon:shop.lon}:null,
        notes:this.familyNotes(p),
        created:new Date().toISOString()
      };

      app.state.goMode.baitPlan={...plan.baitPlan};
      app.state.forecastDay=dayIndex;
      app.state.savedTripPlans.unshift(plan);
      app.state.savedTripPlans=app.state.savedTripPlans.slice(0,30);
      app.state.takeMeFishing={...p,lastBuilt:new Date().toISOString(),lastPlan:plan};
      app.save();
      app.populateSpeciesControls?.();
      app.renderAll?.();
      this.renderResult(app,plan);
      app.showToast?.('Take Me Fishing plan built and saved.');
      return plan;
    } finally{
      if(button){button.disabled=false;button.textContent='Build my fishing trip';}
    }
  },
  readForm(app){
    return {
      duration:Number(app.$('tmfDuration')?.value)||180,
      party:app.$('tmfParty')?.value||'solo',
      style:app.$('tmfStyle')?.value||app.state.fishingStyle||'Surf fishing',
      target:app.$('tmfTarget')?.value||'best'
    };
  },
  renderForm(app){
    const p=this.getPrefs(app);
    if(app.$('tmfDuration'))app.$('tmfDuration').value=String(p.duration);
    if(app.$('tmfParty'))app.$('tmfParty').value=p.party;
    if(app.$('tmfStyle'))app.$('tmfStyle').value=p.style;
    const target=app.$('tmfTarget');
    if(target){
      target.innerHTML='<option value="best">Best available species</option>'+Object.keys(app.species||{}).map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
      target.value=p.target;
    }
    const last=app.state.takeMeFishing?.lastPlan;
    if(last)this.renderResult(app,last);
  },
  renderResult(app,plan){
    const box=app.$('tmfResult');if(!box||!plan)return;
    box.hidden=false;
    app.$('tmfResultBadge').textContent=plan.safety?.level>=2?'HOLD & REVIEW':plan.score>=86?'STRONG PLAN':plan.score>=72?'GOOD PLAN':'FISHABLE';
    app.$('tmfResultBadge').className='tmf-result-badge '+(plan.safety?.level>=2?'hold':plan.score>=86?'go':'watch');
    app.$('tmfResultTitle').textContent=plan.species+' at '+plan.location;
    app.$('tmfResultMeta').textContent=this.styleLabel(plan.fishingStyle)+' • '+this.partyLabel(plan.party)+' • '+this.durationLabel(plan.duration);
    app.$('tmfResultWindow').textContent=plan.window||'—';
    app.$('tmfResultScore').textContent=(plan.score||'—')+'/100';
    app.$('tmfResultBait').textContent=app.titleCase?.(plan.baitPlan?.primary||'Match local forage')||'Match local forage';
    app.$('tmfResultRig').textContent=plan.baitPlan?.rig||'Open tackle intelligence';
    app.$('tmfResultConfidence').textContent=(plan.confidence??'—')+'%';
    app.$('tmfResultSafety').textContent=plan.safety?.status||'Review local conditions';
    app.$('tmfResultReg').textContent=plan.regulations?plan.regulations.source:'Official rules not resolved';
    app.$('tmfResultNotes').innerHTML=(plan.notes||[]).map(n=>'<li>'+app.escape(n)+'</li>').join('');
    const shop=app.$('tmfShopBtn');if(shop)shop.hidden=!plan.shop;
    const launch=app.$('tmfLaunchBtn');if(launch){launch.disabled=plan.safety?.level>=2;launch.textContent=plan.safety?.level>=2?'Review safety before launch':'Start fishing mode';}
  },
  route(app,kind){
    const plan=app.state.takeMeFishing?.lastPlan;if(!plan)return;
    if(kind==='spot')window.open(app.mapsUrl(plan.lat,plan.lon,plan.location),'_blank','noopener');
    if(kind==='shop'&&plan.shop)window.open(app.mapsUrl(plan.shop.lat,plan.shop.lon,plan.shop.name),'_blank','noopener');
    if(kind==='regs'&&plan.regulations?.url)window.open(plan.regulations.url,'_blank','noopener');
  },
  launch(app){
    const plan=app.state.takeMeFishing?.lastPlan;if(!plan)return app.showToast?.('Build a trip first.');
    if(plan.safety?.level>=2)return app.showToast?.('Review the active safety warning before starting this trip.');
    app.state.location={key:'take-me-fishing',name:plan.location,lat:plan.lat,lon:plan.lon,source:'Take Me Fishing'};
    app.state.targetSpecies=plan.species;
    app.state.fishingStyle=plan.fishingStyle;
    app.state.goMode.baitPlan={...plan.baitPlan};
    app.save();
    app.startGoMode?.();
    app.navigate?.('trips');
  }
};
window.CastVectorTakeMeFishing=module;
const app=window.CastVector;if(!app)return;
const prev=app.renderAll.bind(app);
app.renderAll=function(){const out=prev();module.renderForm(this);return out;};
document.addEventListener('click',async e=>{
  if(e.target.closest('#tmfBuildBtn'))await module.build(app);
  if(e.target.closest('#tmfSpotBtn'))module.route(app,'spot');
  if(e.target.closest('#tmfShopBtn'))module.route(app,'shop');
  if(e.target.closest('#tmfRegsBtn'))module.route(app,'regs');
  if(e.target.closest('#tmfLaunchBtn'))module.launch(app);
  if(e.target.closest('#tmfOpenScoutBtn')){app.navigate?.('map');setTimeout(()=>app.runScout?.(),120);}
});
module.renderForm(app);
})();