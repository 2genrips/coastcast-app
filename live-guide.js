(function(){
'use strict';
const guide={
  version:'5.9.0',
  phase(app){
    const c=app.state.data?.current||{},tide=String(app.currentTideLabel?.()||'').toLowerCase(),now=new Date(),hour=now.getHours();
    const wind=Number(c.windSpeed)||0,wave=Number(c.waveHeight)||0,rain=Number(c.rain)||0;
    let phase='STEADY',tone='watch',score=60,reasons=[];
    if(/rising|falling|moving/.test(tide)){score+=18;reasons.push('moving water');}
    if(hour>=5&&hour<=9){score+=14;reasons.push('morning low light');}
    else if(hour>=17&&hour<=20){score+=10;reasons.push('evening low light');}
    if(wind<=8){score+=10;reasons.push('manageable wind');}else if(wind>=16){score-=16;reasons.push('strong wind penalty');}
    if(wave<=3){score+=7;}else if(wave>=5){score-=14;reasons.push('rough surf');}
    if(rain>=60){score-=8;reasons.push('high rain risk');}
    score=Math.max(20,Math.min(98,Math.round(score)));
    if(score>=85){phase='BITE BUILDING';tone='go';}
    else if(score>=72){phase='GOOD WINDOW';tone='go';}
    else if(score<52){phase='REPOSITION / ADJUST';tone='hold';}
    return {phase,tone,score,reasons,wind,wave,tide};
  },
  sessionStats(app){
    const catches=app.sessionCatches?.()||[],g=app.state.goMode||{},started=g.startedAt?new Date(g.startedAt):null;
    const minutes=started?Math.max(0,Math.floor((Date.now()-started.getTime())/60000)):0;
    const last=catches[0]||null;
    return {catches,minutes,last};
  },
  advice(app){
    const p=this.phase(app),s=this.sessionStats(app),bait=app.state.goMode?.baitPlan||app.baitIntelligence?.()||{},tips=[];
    if(p.score>=82){
      tips.push({kind:'NOW',title:'Stay on this window',detail:'Conditions are lining up. Keep the productive presentation in the water and avoid unnecessary moves.'});
    }
    if(/rising|falling|moving/.test(p.tide))tips.push({kind:'TIDE',title:'Fish moving water',detail:'Prioritize current seams, cuts, troughs, points and structure where bait is likely to be pushed.'});
    if(p.wind>=14)tips.push({kind:'WIND',title:'Protect your presentation',detail:'Move to a more wind-protected angle if available, shorten casts if needed, and keep contact with the lure or bait.'});
    if(p.wave>=4)tips.push({kind:'SURF',title:'Work protected water',detail:'Look for cleaner pockets, trough edges and breaks in the surf instead of forcing the roughest water.'});
    if(s.minutes>=45&&s.catches.length===0)tips.push({kind:'ADJUST',title:'No catch yet — make one controlled change',detail:'Switch either location, depth, retrieve speed, or bait—but only one at a time so CastVector can learn what changed.'});
    if(s.minutes>=90&&s.catches.length===0)tips.push({kind:'MOVE',title:'Consider a location change',detail:'You have given this water a fair window. Use Scout to compare a more protected or better-scoring nearby option.'});
    if(s.last){
      const recentMin=Math.max(0,Math.floor((Date.now()-new Date(s.last.date).getTime())/60000));
      if(recentMin<=30)tips.unshift({kind:'PATTERN',title:'Repeat what just worked',detail:'Your most recent catch is fresh. Stay close to that depth, presentation and bait before making a major change.'});
    }
    if(bait.backup&&s.minutes>=35)tips.push({kind:'BACKUP',title:'Backup presentation ready',detail:'If the primary stops producing, try '+(app.titleCase?.(bait.backup)||bait.backup)+' before leaving the area.'});
    if(!tips.length)tips.push({kind:'WATCH',title:'Hold the plan and watch the water',detail:'CastVector is monitoring the loaded conditions. Log each catch so the session guidance can adapt.'});
    return {phase:p,stats:s,bait,tips:tips.slice(0,5)};
  },
  render(app){
    const panel=app.$('liveGuidePanel');if(!panel)return;
    const active=!!app.state.goMode?.active;
    panel.classList.toggle('inactive',!active);
    if(!active){
      app.$('liveGuideBadge').textContent='START A TRIP';
      app.$('liveGuideBadge').className='live-guide-badge';
      app.$('liveGuideHeadline').textContent='Live Guide activates when Go Fishing Mode starts.';
      app.$('liveGuideSummary').textContent='Start a trip and CastVector will watch your session timing, loaded conditions and catches to suggest the next move.';
      app.$('liveGuideTips').innerHTML='';
      app.$('liveGuideStats').innerHTML='';
      return;
    }
    const r=this.advice(app),p=r.phase,s=r.stats;
    app.$('liveGuideBadge').textContent=p.phase;
    app.$('liveGuideBadge').className='live-guide-badge '+p.tone;
    app.$('liveGuideHeadline').textContent=p.score>=82?'The bite window is working in your favor.':p.score<52?'Conditions say adjust before burning more time.':'Stay alert—the session is still developing.';
    app.$('liveGuideSummary').textContent='Live Guide is combining session time, tide, wind, surf and your logged catches for '+(app.state.goMode.species||app.state.targetSpecies)+'.';
    app.$('liveGuideStats').innerHTML=[
      ['LIVE SCORE',p.score+'/100'],
      ['SESSION',app.formatDuration?.(s.minutes)||s.minutes+' min'],
      ['CATCHES',String(s.catches.length)],
      ['WIND',Math.round(p.wind)+' mph']
    ].map(x=>'<div><span>'+app.escape(x[0])+'</span><strong>'+app.escape(x[1])+'</strong></div>').join('');
    app.$('liveGuideTips').innerHTML=r.tips.map((t,i)=>'<article class="live-guide-tip '+(i===0?'primary':'')+'"><span>'+app.escape(t.kind)+'</span><div><strong>'+app.escape(t.title)+'</strong><p>'+app.escape(t.detail)+'</p></div></article>').join('');
    const last=app.$('liveGuideLastCatch');if(last)last.textContent=s.last?('Last catch: '+s.last.species+(s.last.bait?' • '+s.last.bait:'')+' • '+new Date(s.last.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})):'No catch logged this session yet.';
  },
  suggestMove(app){
    const r=this.advice(app),top=r.tips[0];if(top)app.showToast?.(top.title+': '+top.detail);
  },
  openScout(app){app.navigate?.('map');setTimeout(()=>{if(!(app.state.scout?.results||[]).length)app.runScout?.();},120);},
  logAdjustment(app){
    const note=prompt('What did you change? Example: switched to paddletail, moved 50 yards, slowed retrieve.');
    if(!note)return;
    const g=app.state.goMode||{};g.adjustments=[{id:Date.now(),at:new Date().toISOString(),note:String(note).slice(0,240),score:this.phase(app).score},...(g.adjustments||[])].slice(0,30);
    app.state.goMode=g;app.save?.();this.render(app);app.showToast?.('Adjustment logged. CastVector will keep it with this session.');
  }
};
window.CastVectorLiveGuide=guide;
const app=window.CastVector;if(!app)return;
const prevRenderAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevRenderAll();guide.render(this);return out;};
const prevRenderGo=app.renderGoMode?.bind(app);
if(prevRenderGo)app.renderGoMode=function(){const out=prevRenderGo();guide.render(this);return out;};
document.addEventListener('click',e=>{
  if(e.target.closest('#liveGuideNextMoveBtn'))guide.suggestMove(app);
  if(e.target.closest('#liveGuideScoutBtn'))guide.openScout(app);
  if(e.target.closest('#liveGuideAdjustBtn'))guide.logAdjustment(app);
  if(e.target.closest('#liveGuideCatchBtn'))app.openSessionCatch?.();
});
guide.render(app);
setInterval(()=>{if(app.state.goMode?.active)guide.render(app);},60000);
})();