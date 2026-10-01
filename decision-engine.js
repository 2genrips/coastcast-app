(function(){
'use strict';
const engine={
  version:'5.7.0',
  clamp:(n,min,max)=>Math.max(min,Math.min(max,n)),
  daylightScore(hour){return (hour>=5&&hour<=9)?100:(hour>=17&&hour<=20)?92:(hour>=10&&hour<=16)?58:72;},
  factorSnapshot(app,conditions,speciesName){
    const cfg=app.species[speciesName]||app.species['Red Drum'];
    const wind=app.num(conditions.wind,12),rain=app.num(conditions.rain,20),wave=app.num(conditions.wave,2.5),water=app.num(conditions.water,72),pressure=app.num(conditions.pressure,1015);
    const tide=String(conditions.tide||'').toLowerCase(),hour=app.extractHour(conditions.time);
    const waterMid=(cfg.water[0]+cfg.water[1])/2,waterHalf=Math.max(2,(cfg.water[1]-cfg.water[0])/2);
    const waveMid=(cfg.waveIdeal[0]+cfg.waveIdeal[1])/2,waveHalf=Math.max(.25,(cfg.waveIdeal[1]-cfg.waveIdeal[0])/2);
    const waterFit=this.clamp(100-Math.abs(water-waterMid)/waterHalf*55,15,100);
    const waveFit=this.clamp(100-Math.abs(wave-waveMid)/waveHalf*45,12,100);
    const windFit=wind<=6?100:wind<=10?88:wind<=14?68:wind<=18?42:18;
    const rainFit=rain<=15?100:rain<=35?82:rain<=55?58:rain<=70?36:18;
    const tideFit=/rising|falling|moving/.test(tide)?100:/high|low/.test(tide)?68:45;
    const pressureFit=pressure>=1008&&pressure<=1024?92:pressure>=1002&&pressure<=1029?72:48;
    const daylight=this.daylightScore(hour);
    const rows=[
      {key:'water',label:'Water temp',value:Math.round(waterFit),weight:22,detail:water>=cfg.water[0]&&water<=cfg.water[1]?water+'°F is in the preferred range.':water+'°F is outside the preferred '+cfg.water[0]+'–'+cfg.water[1]+'°F range.'},
      {key:'tide',label:'Tide movement',value:tideFit,weight:18,detail:/rising|falling|moving/.test(tide)?'Moving water is helping this target.':'The strongest tide-movement window is not active.'},
      {key:'wind',label:'Wind',value:windFit,weight:17,detail:Math.round(wind)+' mph '+(wind<=10?'is favorable for presentation and casting.':wind<=16?'is workable with tradeoffs.':'is a major penalty.')},
      {key:'marine',label:'Surf / swell',value:Math.round(waveFit),weight:16,detail:wave.toFixed(1)+' ft compared with the preferred '+cfg.waveIdeal[0]+'–'+cfg.waveIdeal[1]+' ft range.'},
      {key:'daylight',label:'Light window',value:daylight,weight:11,detail:(hour>=5&&hour<=9)?'Morning low-light timing is favorable.':(hour>=17&&hour<=20)?'Evening low-light timing is favorable.':'Outside the strongest low-light window.'},
      {key:'weather',label:'Weather',value:Math.round((rainFit+pressureFit)/2),weight:10,detail:Math.round(rain)+'% rain • '+Math.round(pressure)+' hPa.'},
      {key:'personal',label:'Your catch history',value:Math.round(this.clamp(55+(app.historyAdjustment(speciesName,{wind,wave,water})||0)*9,55,100)),weight:6,detail:(app.state.catches||[]).some(c=>c.species===speciesName)?'Your saved catches are influencing this recommendation.':'Log catches to personalize this factor.'}
    ];
    return rows;
  },
  bestToday(app,speciesName){
    const d=app.state.data||{},hours=(d.hours||[]).filter(h=>h.dateIndex===0).slice(0,24);
    if(!hours.length)return null;
    const scored=hours.map(h=>{
      const conditions={wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??d.current?.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current?.pressure};
      return {...h,cvScore:app.calculateScore(conditions,speciesName),cvConditions:conditions};
    });
    const best=[...scored].sort((a,b)=>b.cvScore-a.cvScore)[0];
    const idx=scored.indexOf(best),start=Math.max(0,idx-1),end=Math.min(scored.length-1,idx+1);
    const windowRows=scored.slice(start,end+1);
    const avg=Math.round(app.average(windowRows.map(x=>x.cvScore)));
    return {best,rows:windowRows,score:avg,label:windowRows.length>1?windowRows[0].time+' – '+windowRows[windowRows.length-1].time:best.time};
  },
  snapshot(app){
    if(!app.state.data)return null;
    const ranked=app.rankSpecies();
    const target=ranked[0]||{name:app.state.targetSpecies,score:app.speciesTodayScore(app.state.targetSpecies)};
    const window=this.bestToday(app,target.name);
    const c=window?.best?.cvConditions||{wind:app.state.data.current?.windSpeed,rain:app.state.data.current?.rain,wave:app.state.data.current?.waveHeight,water:app.state.data.current?.waterTemp,tide:app.currentTideLabel?.(),time:new Date(),pressure:app.state.data.current?.pressure};
    const factors=this.factorSnapshot(app,c,target.name);
    const weighted=Math.round(factors.reduce((s,f)=>s+f.value*f.weight,0)/factors.reduce((s,f)=>s+f.weight,0));
    const score=Math.round((target.score*.62)+(weighted*.38));
    const conf=app.dataConfidence?.().score??50,safety=app.safetyAssessment?.()||{level:0,status:'No blocking alert'};
    let call='WAIT / RECHECK',cls='watch',headline='Conditions are mixed. The engine found a better-timed window to watch.';
    if(safety.level>=2){call='HOLD & REVIEW';cls='hold';headline='A safety alert needs review before CastVector recommends this trip.';}
    else if(score>=86&&conf>=60){call='GO WINDOW';cls='go';headline=target.name+' is the strongest play in the loaded conditions.';}
    else if(score>=72){call='PROMISING';cls='watch';headline=target.name+' is fishable with a few tradeoffs.';}
    const tackle=app.baitIntelligence?.(target.name)||{};
    const positives=[...factors].sort((a,b)=>b.value-a.value).slice(0,2);
    const drag=[...factors].sort((a,b)=>a.value-b.value)[0];
    return {target,window,factors,score,confidence:conf,safety,call,cls,headline,tackle,why:positives.map(x=>x.label+' is helping').concat(drag?['Main drag: '+drag.label]:[])};
  }
};
window.CastVectorDecisionEngine=engine;
const app=window.CastVector;
if(!app)return;
app.decisionSnapshot=function(){return engine.snapshot(this);};
app.renderDecisionEngine=function(){
  const root=this.$('decisionEnginePanel');if(!root)return;
  const r=this.decisionSnapshot();if(!r){this.$('decisionEngineHeadline').textContent='Load forecast data to run the Decision Engine.';return;}
  this.$('decisionEngineBadge').textContent=r.call;this.$('decisionEngineBadge').className='decision-engine-badge '+r.cls;
  this.$('decisionEngineScore').textContent=r.score;this.$('decisionEngineScoreRing').style.setProperty('--decision-score',String(r.score));
  this.$('decisionEngineHeadline').textContent=r.headline;
  this.$('decisionEngineTarget').textContent=r.target.name;this.$('decisionEngineTargetScore').textContent=r.target.score+'/100 species fit';
  this.$('decisionEngineWindow').textContent=r.window?.label||'Best window loading';this.$('decisionEngineWindowScore').textContent=r.window?r.window.score+'/100 window':'—';
  this.$('decisionEngineThrow').textContent=this.titleCase?.(r.tackle.primary||r.tackle.bait||'Match local forage')||'Match local forage';
  this.$('decisionEngineRig').textContent=[r.tackle.rig,r.tackle.presentation].filter(Boolean).join(' • ')||'Open tackle intelligence';
  this.$('decisionEngineConfidence').textContent=r.confidence+'%';
  this.$('decisionEngineWhy').textContent=r.why.join(' • ')+'.';
  this.$('decisionEngineFactors').innerHTML=r.factors.map(f=>'<div class="decision-factor"><div><strong>'+this.escape(f.label)+'</strong><span>'+this.escape(f.detail)+'</span></div><b>'+f.value+'</b><i><em style="width:'+f.value+'%"></em></i></div>').join('');
  const targetBtn=this.$('decisionTargetBtn');if(targetBtn)targetBtn.textContent='Target '+r.target.name;
};
const previousRenderAll=app.renderAll.bind(app);
app.renderAll=function(){const out=previousRenderAll();this.renderDecisionEngine();return out;};
document.addEventListener('click',e=>{
  const explain=e.target.closest('#decisionExplainBtn');if(explain){const box=app.$('decisionEngineFactors');box.hidden=!box.hidden;explain.textContent=box.hidden?'Explain this score':'Hide score details';}
  if(e.target.closest('#decisionBuildPlanBtn'))app.buildCommandPlan?.();
  if(e.target.closest('#decisionTargetBtn')){const r=app.decisionSnapshot();if(r?.target?.name)app.setSpecies(r.target.name);}
});
app.renderDecisionEngine();
})();