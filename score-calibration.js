(function(){
'use strict';

const SC={
  version:'13.5.0',
  pending:null,

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchScore(app);
    this.patchEndTrip(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('scoreCalibrationPanel')){
      const p=document.createElement('section');p.id='scoreCalibrationPanel';p.className='panel score-calibration-panel';
      p.innerHTML=
        '<div class="sc-head"><div><div class="eyebrow">FORECAST VS REALITY • 13.5</div><h2>Teach CastVector how your fishing actually goes</h2></div><span id="scBadge" class="sc-badge">LEARNING</span></div>'+
        '<p class="sc-note">Rate the bite after a real trip. After enough rated trips, CastVector can make a small personal score correction for that species. The adjustment is intentionally capped to avoid overfitting.</p>'+
        '<div class="sc-grid"><article><span>RATED TRIPS</span><strong id="scRated">0</strong><small id="scRatedMeta">Need 3+ for calibration</small></article><article><span>PERSONAL BIAS</span><strong id="scBias">—</strong><small id="scBiasMeta">Forecast vs outcome</small></article><article><span>MEAN ERROR</span><strong id="scError">—</strong><small>Lower is better</small></article><article><span>ACTIVE CORRECTION</span><strong id="scCorrection">0</strong><small>Capped at ±5 points</small></article></div>'+
        '<div id="scInsight" class="sc-insight">Complete and rate fishing trips to build your calibration.</div>'+
        '<div class="sc-actions"><button id="scRateLastBtn" class="primary-button small" type="button">Rate last trip</button><button id="scHistoryBtn" class="secondary-button small" type="button">View calibration history</button></div>'+
        '<div id="scHistory" class="sc-history" hidden></div>';
      const edge=document.getElementById('tripPatternEdgePanel'),replay=document.getElementById('sessionReplayPanel');
      if(edge)edge.after(p);else if(replay)replay.after(p);else trips.appendChild(p);
    }

    if(!document.getElementById('tripOutcomeDialog')){
      const d=document.createElement('dialog');d.id='tripOutcomeDialog';d.className='sheet-dialog sc-dialog';
      d.innerHTML=
        '<form id="tripOutcomeForm" class="sheet-card sc-sheet" method="dialog">'+
          '<div class="sc-head"><div><div class="eyebrow">TRIP OUTCOME • 13.5</div><h2>How did the water actually fish?</h2><p id="scOutcomeTrip">Rate the trip so CastVector can compare forecast with reality.</p></div><button id="scOutcomeClose" class="icon-button" type="button">×</button></div>'+
          '<div class="sc-forecast-vs"><div><span>PREDICTED</span><strong id="scPredicted">—</strong><small>CastVector score during the trip</small></div><div><span>LOGGED CATCHES</span><strong id="scCatches">0</strong><small id="scDuration">Trip duration</small></div></div>'+
          '<div class="sc-question"><span>ACTUAL BITE</span><div class="sc-choice-row"><button type="button" data-sc-bite="dead">Dead</button><button type="button" data-sc-bite="slow">Slow</button><button type="button" data-sc-bite="steady">Steady</button><button type="button" data-sc-bite="hot">Hot</button></div></div>'+
          '<div class="sc-question"><span>HOW USEFUL WAS THE PLAN?</span><div class="sc-choice-row sc-stars"><button type="button" data-sc-plan="1">1</button><button type="button" data-sc-plan="2">2</button><button type="button" data-sc-plan="3">3</button><button type="button" data-sc-plan="4">4</button><button type="button" data-sc-plan="5">5</button></div><small>1 = not useful • 5 = very useful</small></div>'+
          '<label class="field-group"><span>Optional note</span><textarea id="scOutcomeNote" class="text-control" rows="3" maxlength="220" placeholder="Fish moved deeper, bait changed, tide turned early…"></textarea></label>'+
          '<div id="scOutcomePreview" class="sc-outcome-preview">Choose the actual bite level and usefulness rating.</div>'+
          '<div class="sc-dialog-actions"><button id="scSaveOutcome" class="primary-button" type="button" disabled>Save trip outcome</button><button id="scSkipOutcome" class="ghost-button" type="button">Not now</button></div>'+
        '</form>';
      document.body.appendChild(d);
    }
  },

  rated(app,species=null){
    return (app.state.goMode?.history||[]).filter(h=>h.outcomeFeedback&&(!species||h.species===species));
  },

  predicted(history){
    const replay=Number(history?.routeReplay?.avgScore);
    const captured=Number(history?.predictedScore);
    return Number.isFinite(replay)?replay:Number.isFinite(captured)?captured:null;
  },

  actual(feedback,history){
    if(Number.isFinite(Number(feedback?.actualScore)))return Number(feedback.actualScore);
    const base={dead:25,slow:45,steady:70,hot:90}[feedback?.bite];
    if(!Number.isFinite(base))return null;
    const hours=Math.max(.5,Number(history?.minutes||30)/60),rate=Number(history?.catchCount||0)/hours;
    return Math.max(15,Math.min(98,Math.round(base+Math.min(8,rate*2.5))));
  },

  model(app,species=app.state.targetSpecies){
    const rows=this.rated(app,species).map(h=>{
      const p=this.predicted(h),a=this.actual(h.outcomeFeedback,h);
      return{history:h,predicted:p,actual:a,gap:Number.isFinite(p)&&Number.isFinite(a)?a-p:null};
    }).filter(x=>Number.isFinite(x.gap));

    if(!rows.length)return{species,count:0,bias:null,mae:null,correction:0,rows:[]};
    const gaps=rows.map(x=>x.gap),bias=gaps.reduce((a,b)=>a+b,0)/gaps.length,mae=gaps.reduce((a,b)=>a+Math.abs(b),0)/gaps.length;
    const correction=rows.length>=3?Math.max(-5,Math.min(5,Math.round(bias*.25))):0;
    return{species,count:rows.length,bias:Math.round(bias),mae:Math.round(mae),correction,rows};
  },

  patchScore(app){
    if(app._scoreCalibrationPatched)return;app._scoreCalibrationPatched=true;
    const old=app.calculateScore?.bind(app);if(!old)return;
    app.calculateScore=function(c,speciesName=this.state.targetSpecies,includeHistory=true){
      const raw=old(c,speciesName,includeHistory);
      if(!includeHistory)return raw;
      const model=SC.model(this,speciesName);
      if(model.count<3||!model.correction)return raw;
      return Math.max(0,Math.min(100,Math.round(Number(raw)+model.correction)));
    };
  },

  patchEndTrip(app){
    if(app._scoreCalibrationTripPatched)return;app._scoreCalibrationTripPatched=true;
    const old=app.endGoMode?.bind(app);if(!old)return;
    app.endGoMode=function(){
      if(!this.state.goMode?.active)return old();
      const sessionId=this.state.goMode.sessionId,predicted=Number(this.currentScore?.()||0);
      const out=old();
      const item=(this.state.goMode?.history||[]).find(h=>String(h.sessionId)===String(sessionId));
      if(item&&!Number.isFinite(Number(item.predictedScore))){item.predictedScore=predicted;this.save?.();}
      if(item&&!item.outcomeFeedback)setTimeout(()=>SC.openOutcome(this,item),220);
      return out;
    };
  },

  latestUnrated(app){
    return (app.state.goMode?.history||[]).find(h=>!h.outcomeFeedback)||null;
  },

  openOutcome(app,history){
    if(!history)return app.showToast?.('No unrated trip is available.');
    this.pending={sessionId:history.sessionId||String(history.id),bite:null,plan:null};
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('scOutcomeTrip',(history.location||'Fishing trip')+' • '+(history.species||app.state.targetSpecies)+' • '+app.formatDuration?.(history.minutes||0));
    const predicted=this.predicted(history);set('scPredicted',predicted==null?'—':Math.round(predicted)+'/100');set('scCatches',String(history.catchCount||0));set('scDuration',app.formatDuration?.(history.minutes||0)||String(history.minutes||0)+' min');
    document.querySelectorAll('[data-sc-bite],[data-sc-plan]').forEach(b=>b.classList.remove('active'));
    const note=document.getElementById('scOutcomeNote');if(note)note.value='';
    const save=document.getElementById('scSaveOutcome');if(save)save.disabled=true;
    const prev=document.getElementById('scOutcomePreview');if(prev)prev.textContent='Choose the actual bite level and usefulness rating.';
    const d=document.getElementById('tripOutcomeDialog');if(d&&!d.open)d.showModal();
  },

  currentHistory(app){
    const id=this.pending?.sessionId;
    return (app.state.goMode?.history||[]).find(h=>String(h.sessionId||h.id)===String(id))||null;
  },

  renderOutcomePreview(app){
    const p=this.pending,h=this.currentHistory(app),box=document.getElementById('scOutcomePreview'),save=document.getElementById('scSaveOutcome');
    if(!p||!h)return;
    if(save)save.disabled=!(p.bite&&p.plan);
    if(!p.bite||!p.plan){if(box)box.textContent='Choose the actual bite level and usefulness rating.';return;}
    const actual=this.actual({bite:p.bite},h),pred=this.predicted(h),gap=Number.isFinite(pred)?actual-pred:null;
    if(box)box.textContent='Reality score '+actual+'/100'+(gap==null?'':' • '+(gap>0?'+':'')+Math.round(gap)+' vs forecast')+' • plan usefulness '+p.plan+'/5';
  },

  saveOutcome(app){
    const h=this.currentHistory(app),p=this.pending;if(!h||!p?.bite||!p?.plan)return;
    const actual=this.actual({bite:p.bite},h),pred=this.predicted(h);
    h.outcomeFeedback={
      version:'13.5.0',bite:p.bite,planUsefulness:Number(p.plan),note:(document.getElementById('scOutcomeNote')?.value||'').trim(),
      actualScore:actual,predictedScore:Number.isFinite(pred)?pred:null,gap:Number.isFinite(pred)?Math.round(actual-pred):null,
      ratedAt:new Date().toISOString()
    };
    app.save?.();document.getElementById('tripOutcomeDialog')?.close();this.pending=null;this.render(app);
    const m=this.model(app,h.species||app.state.targetSpecies);
    app.showToast?.(m.count>=3?'Trip saved • personal score calibration updated.':'Trip saved • '+Math.max(0,3-m.count)+' more rated trip'+(3-m.count===1?'':'s')+' to unlock calibration.');
  },

  renderPanel(app){
    const m=this.model(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('scRated',String(m.count));set('scRatedMeta',m.count>=3?'Personal calibration active':'Need '+Math.max(0,3-m.count)+' more rated trip'+(3-m.count===1?'':'s'));
    set('scBias',m.bias==null?'—':(m.bias>0?'+':'')+m.bias);set('scError',m.mae==null?'—':m.mae+' pts');set('scCorrection',(m.correction>0?'+':'')+m.correction);
    set('scBiasMeta',m.bias==null?'Forecast vs outcome':m.bias>=6?'Your trips have fished better than forecast':m.bias<=-6?'Your trips have fished tougher than forecast':'Forecast and outcomes are fairly aligned');
    const badge=document.getElementById('scBadge');if(badge)badge.textContent=m.count>=6?'CALIBRATED':m.count>=3?'ACTIVE':m.count?'LEARNING':'START';
    const insight=document.getElementById('scInsight');
    if(insight){
      if(!m.count)insight.textContent='Complete and rate fishing trips to build your calibration.';
      else if(m.count<3)insight.textContent='CastVector has '+m.count+' rated '+m.species+' trip'+(m.count===1?'':'s')+'. Calibration waits for at least 3 samples.';
      else insight.textContent='Your '+m.species+' score correction is '+(m.correction>0?'+':'')+m.correction+' points. This is only '+Math.round(Math.abs(m.bias)*.25)+'% of the observed bias and is capped at ±5 to avoid overfitting.';
    }
    const rate=document.getElementById('scRateLastBtn');if(rate){const pending=this.latestUnrated(app);rate.disabled=!pending;rate.textContent=pending?'Rate last trip':'All recent trips rated';}

    const hist=document.getElementById('scHistory');
    if(hist)hist.innerHTML=m.rows.length?m.rows.slice(0,12).map(x=>{
      const f=x.history.outcomeFeedback||{},gap=x.gap;
      return '<article class="sc-history-row"><div><strong>'+app.escape(x.history.location||'Fishing trip')+' • '+app.escape(x.history.species||'Species')+'</strong><span>'+app.escape(app.prettyDate(x.history.endedAt||x.history.startedAt))+' • '+app.escape(String(f.bite||'').toUpperCase())+' bite • '+Number(x.history.catchCount||0)+' catch'+(Number(x.history.catchCount||0)===1?'':'es')+'</span></div><div><b>'+Math.round(x.predicted)+'</b><span>forecast</span></div><div><b>'+Math.round(x.actual)+'</b><span>reality</span></div><div class="'+(gap>=0?'positive':'negative')+'"><b>'+(gap>0?'+':'')+Math.round(gap)+'</b><span>gap</span></div></article>';
    }).join(''):'<div class="empty-state">Rated trip comparisons will appear here.</div>';
  },

  render(app){this.renderPanel(app);},

  patchRenders(app){
    const trips=app.renderTrips?.bind(app);if(trips)app.renderTrips=function(){const out=trips();SC.render(this);return out;};
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();SC.render(this);return out;};
  },

  bind(app){
    document.addEventListener('click',e=>{
      const bite=e.target.closest('[data-sc-bite]');if(bite){this.pending=this.pending||{};this.pending.bite=bite.dataset.scBite;document.querySelectorAll('[data-sc-bite]').forEach(b=>b.classList.toggle('active',b===bite));this.renderOutcomePreview(app);return;}
      const plan=e.target.closest('[data-sc-plan]');if(plan){this.pending=this.pending||{};this.pending.plan=Number(plan.dataset.scPlan);document.querySelectorAll('[data-sc-plan]').forEach(b=>b.classList.toggle('active',b===plan));this.renderOutcomePreview(app);return;}
      if(e.target.closest('#scSaveOutcome')){this.saveOutcome(app);return;}
      if(e.target.closest('#scSkipOutcome')||e.target.closest('#scOutcomeClose')){document.getElementById('tripOutcomeDialog')?.close();this.pending=null;return;}
      if(e.target.closest('#scRateLastBtn')){this.openOutcome(app,this.latestUnrated(app));return;}
      if(e.target.closest('#scHistoryBtn')){const h=document.getElementById('scHistory');if(h){h.hidden=!h.hidden;e.target.textContent=h.hidden?'View calibration history':'Hide calibration history';}return;}
    });
  }
};

window.CastVectorScoreCalibration=SC;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>SC.install());else SC.install();
})();