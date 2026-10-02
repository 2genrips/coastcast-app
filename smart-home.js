(function(){
'use strict';
const H={
  hiddenSelectors:[
    '#speciesCommandPanel','#spotCompareProPanel','#biteGridPanel','#opportunityRadarPanel',
    '#tripCopilotPanel','#personalBrainPanel','#dataTrustPanel','#decisionEnginePanel',
    '#takeMeFishingPanel','#liveGuidePanel','#destinationHubPanel','#dailyBriefPanel',
    '#seasonPulsePanel','#oceanNetworkPanel','#commandCenterPanel','#readinessPanel',
    '.species-mode','.species-intelligence-panel','.bait-intelligence-panel','.pattern-match-panel',
    '.intel-panel','.ocean-iq-panel','.regulations-panel','.home-alert-panel'
  ],
  setup(){
    const app=window.CastVector;if(!app)return;
    this.hiddenSelectors.forEach(sel=>document.querySelectorAll('#view-home '+sel).forEach(el=>el.classList.add('advanced-home')));
    this.bind(app);this.render(app);
  },
  bind(app){
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-home7-view]');
      if(b){app.navigate?.(b.dataset.home7View);return;}
      if(e.target.closest('#home7AllTools')){app.setExperienceMode?.('full',true);return;}
      if(e.target.closest('#home7Simple')){app.setExperienceMode?.('simple',true);return;}
    });
    const prev=app.renderAll?.bind(app);
    if(prev)app.renderAll=function(){const out=prev();H.render(this);return out;};
  },
  pulse(app){
    const safety=app.safetyAssessment?.()||{level:0,status:'No major alert loaded'};
    const go=app.state.goMode||{};
    const radar=app.state.opportunityRadar?.results||[];
    const personal=window.CastVectorPersonalBrain?.summary?.(app);
    const rec=app.commandRecommendation?.()||{};
    if(safety.level>=2)return{kind:'SAFETY',title:'Review conditions before you go',detail:safety.status,action:'Open forecast',view:'forecast',tone:'hold'};
    if(go.active)return{kind:'LIVE TRIP',title:'Your fishing session is active',detail:'Trip Copilot and Live Guide are watching catches, timing and changing conditions.',action:'Open Trips',view:'trips',tone:'go'};
    if(radar[0])return{kind:'BEST OPPORTUNITY',title:(radar[0].name||'Saved spot')+' • '+(radar[0].opportunity||radar[0].score||'—')+'/100',detail:(radar[0].day||'Upcoming')+' • '+(radar[0].window||'best loaded window'),action:'Open Trips',view:'trips',tone:'go'};
    if(personal?.best?.personalMatch!=null)return{kind:'PERSONAL MATCH',title:personal.best.personalMatch+'% similar to your successful trips',detail:personal.headline||'Your catch history is influencing today’s recommendation.',action:'See forecast',view:'forecast',tone:'personal'};
    return{kind:'CASTVECTOR INTEL',title:rec.call||'Your fishing plan is ready',detail:rec.species?('Best target: '+rec.species+' • '+(rec.best?.window?.label||'check the best window')):'Load live data to build your strongest move.',action:'View forecast',view:'forecast',tone:'default'};
  },
  render(app){
    const root=document.getElementById('home7Pulse');if(!root)return;
    const p=this.pulse(app);
    root.className='home7-pulse '+p.tone;
    document.getElementById('home7PulseKind').textContent=p.kind;
    document.getElementById('home7PulseTitle').textContent=p.title;
    document.getElementById('home7PulseDetail').textContent=p.detail;
    const a=document.getElementById('home7PulseAction');a.textContent=p.action;a.dataset.home7View=p.view;
    const mode=app.state.experience?.mode||'simple';
    document.getElementById('home7ModeLabel').textContent=mode==='simple'?'SMART HOME':'ALL TOOLS';
    document.getElementById('home7AllTools').hidden=mode!=='simple';
    document.getElementById('home7Simple').hidden=mode==='simple';
  }
};
window.CastVectorSmartHome=H;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>H.setup());else H.setup();
})();