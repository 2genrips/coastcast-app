(function(){
'use strict';

const copilot={
  version:'6.5.0',

  ensureState(app){
    if(!app.state.tripCopilot) app.state.tripCopilot={active:false,plan:null,lastUpdate:null,history:[]};
    return app.state.tripCopilot;
  },

  sessionMinutes(app){
    const g=app.state.goMode||{};
    if(!g.active||!g.startedAt)return 0;
    const start=new Date(g.startedAt).getTime();
    return Number.isFinite(start)?Math.max(0,Math.floor((Date.now()-start)/60000)):0;
  },

  conditions(app){
    const c=app.state.data?.current||{};
    return {
      wind:Number(c.windSpeed),gust:Number(c.windGust),wave:Number(c.waveHeight),
      rain:Number(c.rain),water:Number(c.waterTemp),pressure:Number(c.pressure),
      tide:app.currentTideLabel?.()||'',time:new Date()
    };
  },

  chooseScoutBackup(app){
    const rows=(app.state.scout?.results||[]).slice().sort((a,b)=>Number(b.score||0)-Number(a.score||0));
    const cur=app.state.location||{};
    return rows.find(r=>app.haversine(Number(cur.lat),Number(cur.lon),Number(r.lat),Number(r.lon))>0.15)||rows[1]||rows[0]||null;
  },

  buildPlan(app){
    const species=app.state.targetSpecies;
    const decision=app.decisionSnapshot?.()||null;
    const personal=window.CastVectorPersonalBrain?.summary?.(app)||null;
    const bait=app.baitIntelligence?.(species)||{};
    const safety=app.safetyAssessment?.()||{level:0,status:'Review conditions'};
    const bestScout=(app.state.scout?.results||[])[0]||null;
    const backupSpot=this.chooseScoutBackup(app);
    const c=this.conditions(app);

    const primary={
      species,
      location:bestScout?.name||app.state.location.name,
      lat:Number(bestScout?.lat??app.state.location.lat),
      lon:Number(bestScout?.lon??app.state.location.lon),
      score:Number(decision?.score??app.currentScore?.()??0),
      window:decision?.window?.label||app.departurePlan?.()?.window?.label||'Best loaded window',
      bait:bait.primary||'Match local forage',
      rig:bait.rig||'Match terminal tackle to conditions',
      presentation:bait.presentation||'Start with a controlled presentation',
      personalMatch:personal?.best?.personalMatch??null
    };

    const backup={
      species:decision?.target?.name&&decision.target.name!==species?decision.target.name:species,
      location:backupSpot?.name||app.state.location.name,
      lat:Number(backupSpot?.lat??app.state.location.lat),
      lon:Number(backupSpot?.lon??app.state.location.lon),
      score:Number(backupSpot?.score??Math.max(0,primary.score-8)),
      bait:bait.backup||bait.primary||'Alternate local forage',
      rig:bait.rig||'Match terminal tackle to conditions',
      reason:backupSpot?'Alternate Scout location':'Alternate presentation at current destination'
    };

    return {
      id:Date.now(),
      created:new Date().toISOString(),
      primary,backup,
      safety:{level:safety.level,status:safety.status},
      baseline:{...c},
      trigger:{noCatchMoveMinutes:75,noCatchAdjustMinutes:35,windDelta:5,waveDelta:1.2},
      status:'ready'
    };
  },

  ensurePlan(app){
    const state=this.ensureState(app);
    if(!state.plan)state.plan=this.buildPlan(app);
    return state.plan;
  },

  delta(a,b){
    return Number.isFinite(a)&&Number.isFinite(b)?a-b:0;
  },

  evaluate(app){
    const state=this.ensureState(app),plan=this.ensurePlan(app),mins=this.sessionMinutes(app);
    const catches=app.sessionCatches?.()||[];
    const c=this.conditions(app),base=plan.baseline||{};
    const tips=[];
    let phase='STAY ON PLAN',tone='go',action='Hold the primary plan';

    const windDelta=Math.abs(this.delta(c.wind,base.wind));
    const waveDelta=Math.abs(this.delta(c.wave,base.wave));
    const last=catches[0]||null;
    const lastCatchAge=last?Math.max(0,Math.floor((Date.now()-new Date(last.date).getTime())/60000)):null;

    if(plan.safety.level>=2){
      phase='SAFETY HOLD';tone='hold';action='Review official warnings before continuing';
      tips.push({kind:'SAFETY',title:'Pause the game plan',detail:plan.safety.status});
    }else{
      if(last&&lastCatchAge<=25){
        phase='REPEAT THE PATTERN';tone='go';action='Stay close to what just produced';
        tips.push({kind:'CATCH',title:'Repeat the successful presentation',detail:'Keep the productive bait, depth and retrieve consistent before changing multiple variables.'});
      }else if(catches.length===0&&mins>=plan.trigger.noCatchMoveMinutes){
        phase='MOVE WINDOW';tone='watch';action='Compare and move to the backup spot';
        tips.push({kind:'MOVE',title:'The primary spot has had enough time',detail:'Use the backup location or Scout alternative rather than continuing to burn the same water.'});
      }else if(catches.length===0&&mins>=plan.trigger.noCatchAdjustMinutes){
        phase='ADJUST ONE VARIABLE';tone='watch';action='Make one controlled change';
        tips.push({kind:'ADJUST',title:'Change one thing only',detail:'Try the backup bait, depth, or retrieve speed so CastVector can isolate what improves the session.'});
      }

      if(windDelta>=plan.trigger.windDelta){
        tips.push({kind:'WIND',title:'Wind has shifted materially',detail:'Re-check casting angle and protection. A sheltered side may now fish better.'});
        if(tone==='go')tone='watch';
      }
      if(waveDelta>=plan.trigger.waveDelta){
        tips.push({kind:'SURF',title:'Surf changed from the starting plan',detail:'Reassess troughs, cleaner water and safer structure before staying committed to the same zone.'});
        if(tone==='go')tone='watch';
      }
      const liveGuide=window.CastVectorLiveGuide?.advice?.(app);
      if(liveGuide?.tips?.[0])tips.push({kind:'LIVE',title:liveGuide.tips[0].title,detail:liveGuide.tips[0].detail});
    }

    if(!tips.length)tips.push({kind:'PLAN',title:'Primary plan still makes sense',detail:'Conditions and session results have not created a strong reason to change yet.'});

    return {plan,mins,catches,c,phase,tone,action,tips:tips.slice(0,5),last,lastCatchAge};
  },

  render(app){
    const root=app.$('tripCopilotPanel');if(!root)return;
    const state=this.ensureState(app),r=this.evaluate(app),p=r.plan;
    app.$('tripCopilotBadge').textContent=r.phase;
    app.$('tripCopilotBadge').className='trip-copilot-badge '+r.tone;
    app.$('tripCopilotHeadline').textContent=r.action;
    app.$('tripCopilotStatus').textContent=(app.state.goMode?.active?'LIVE SESSION':'PRE-TRIP')+' • '+r.mins+' min • '+r.catches.length+' catch'+(r.catches.length===1?'':'es');

    app.$('tripCopilotPrimary').innerHTML=
      '<strong>'+app.escape(p.primary.species)+' • '+app.escape(p.primary.location)+'</strong>'+
      '<span>'+app.escape(p.primary.window)+' • '+Math.round(p.primary.score)+'/100</span>'+
      '<small>'+app.escape(app.titleCase?.(p.primary.bait)||p.primary.bait)+' • '+app.escape(p.primary.rig)+'</small>';

    app.$('tripCopilotBackup').innerHTML=
      '<strong>'+app.escape(p.backup.location)+'</strong>'+
      '<span>'+app.escape(p.backup.reason)+' • '+Math.round(p.backup.score)+'/100</span>'+
      '<small>'+app.escape(app.titleCase?.(p.backup.bait)||p.backup.bait)+'</small>';

    app.$('tripCopilotTips').innerHTML=r.tips.map((t,i)=>
      '<article class="copilot-tip '+(i===0?'primary':'')+'"><span>'+app.escape(t.kind)+'</span><div><strong>'+app.escape(t.title)+'</strong><p>'+app.escape(t.detail)+'</p></div></article>'
    ).join('');

    const pm=p.primary.personalMatch;
    app.$('tripCopilotPersonal').textContent=pm==null?'Learning':pm+'% personal match';
    app.$('tripCopilotSafety').textContent=p.safety.status||'Review conditions';
  },

  rebuild(app){
    const state=this.ensureState(app);
    state.plan=this.buildPlan(app);state.lastUpdate=new Date().toISOString();
    state.history.unshift({at:state.lastUpdate,event:'rebuilt',planId:state.plan.id});
    state.history=state.history.slice(0,20);
    app.save?.();this.render(app);app.showToast?.('Trip Copilot rebuilt the game plan.');
  },

  useBackup(app){
    const p=this.ensurePlan(app),b=p.backup;
    if(!Number.isFinite(b.lat)||!Number.isFinite(b.lon))return app.showToast?.('No backup location is available yet.');
    app.state.location={key:'copilot-backup',name:b.location,lat:b.lat,lon:b.lon,source:'Trip Copilot backup'};
    app.onLocationChanged?.();app.navigate?.('map');app.showToast?.('Backup spot loaded.');
  },

  usePrimary(app){
    const p=this.ensurePlan(app),a=p.primary;
    app.state.location={key:'copilot-primary',name:a.location,lat:a.lat,lon:a.lon,source:'Trip Copilot primary'};
    app.state.targetSpecies=a.species;app.onLocationChanged?.();app.navigate?.('home');app.showToast?.('Primary game plan loaded.');
  }
};

window.CastVectorTripCopilot=copilot;
const app=window.CastVector;if(!app)return;

const prevAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevAll();copilot.render(this);return out;};

const prevStart=app.startGoMode?.bind(app);
if(prevStart)app.startGoMode=function(){
  const out=prevStart();
  const s=copilot.ensureState(this);s.active=true;s.plan=copilot.buildPlan(this);s.lastUpdate=new Date().toISOString();this.save?.();copilot.render(this);return out;
};

const prevEnd=app.endGoMode?.bind(app);
if(prevEnd)app.endGoMode=function(){
  const out=prevEnd();
  const s=copilot.ensureState(this);s.active=false;s.lastUpdate=new Date().toISOString();this.save?.();copilot.render(this);return out;
};

document.addEventListener('click',e=>{
  if(e.target.closest('#tripCopilotRebuild'))copilot.rebuild(app);
  if(e.target.closest('#tripCopilotPrimaryBtn'))copilot.usePrimary(app);
  if(e.target.closest('#tripCopilotBackupBtn'))copilot.useBackup(app);
});

setInterval(()=>{if(app.state.goMode?.active)copilot.render(app);},60000);
copilot.ensureState(app);copilot.render(app);
})();