(function(){
'use strict';

const brain={
  version:'6.3.0',

  profileCatches(app,species){
    return (app.state.catches||[]).filter(c=>c.species===species&&c.conditionData).slice(0,80);
  },

  normalizeTide(v){
    const s=String(v||'').toLowerCase();
    if(/rising|incoming/.test(s))return'rising';
    if(/falling|outgoing/.test(s))return'falling';
    if(/high/.test(s))return'high';
    if(/low/.test(s))return'low';
    if(/moving/.test(s))return'moving';
    return s||'unknown';
  },

  similarity(app,forecast,catchItem){
    const p=catchItem.conditionData||{};
    let total=0,weight=0;
    const add=(sim,w)=>{if(Number.isFinite(sim)){total+=Math.max(0,Math.min(1,sim))*w;weight+=w;}};

    add(Number.isFinite(Number(p.water))&&Number.isFinite(Number(forecast.water))?1-Math.abs(Number(p.water)-Number(forecast.water))/16:null,24);
    add(Number.isFinite(Number(p.wind))&&Number.isFinite(Number(forecast.wind))?1-Math.abs(Number(p.wind)-Number(forecast.wind))/14:null,18);
    add(Number.isFinite(Number(p.wave))&&Number.isFinite(Number(forecast.wave))?1-Math.abs(Number(p.wave)-Number(forecast.wave))/4:null,17);
    add(Number.isFinite(Number(p.pressure))&&Number.isFinite(Number(forecast.pressure))?1-Math.abs(Number(p.pressure)-Number(forecast.pressure))/18:null,9);
    add(Number.isFinite(Number(p.rain))&&Number.isFinite(Number(forecast.rain))?1-Math.abs(Number(p.rain)-Number(forecast.rain))/55:null,5);

    const pt=this.normalizeTide(p.tide),ft=this.normalizeTide(forecast.tide);
    if(pt!=='unknown'&&ft!=='unknown')add(pt===ft?1:(pt==='moving'&&(ft==='rising'||ft==='falling'))?.8:.25,14);

    const catchHour=Number.isFinite(Number(p.hour))?Number(p.hour):new Date(catchItem.date).getHours();
    const forecastHour=app.extractHour(forecast.time);
    if(Number.isFinite(catchHour)&&Number.isFinite(forecastHour)){
      const diff=Math.min(Math.abs(catchHour-forecastHour),24-Math.abs(catchHour-forecastHour));
      add(1-diff/8,13);
    }
    return weight?Math.round(total/weight*100):null;
  },

  windowCandidates(app,species){
    const d=app.state.data||{},rows=[];
    for(let dayIndex=0;dayIndex<7;dayIndex++){
      const hours=(d.hours||[]).filter(h=>h.dateIndex===dayIndex).slice(0,24);
      if(!hours.length)continue;
      const scored=hours.map(h=>{
        const conditions={wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??d.current?.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current?.pressure};
        return {...h,conditions,castScore:app.calculateScore(conditions,species)};
      });
      for(let i=0;i<scored.length;i+=2){
        const block=scored.slice(i,i+3);if(!block.length)continue;
        rows.push({
          dayIndex,
          day:d.days?.[dayIndex]||{},
          label:block.length>1?(block[0].time+' – '+block[block.length-1].time):block[0].time,
          score:Math.round(app.average(block.map(x=>x.castScore))),
          best:block.reduce((a,b)=>!a||b.castScore>a.castScore?b:a,null),
          rows:block
        });
      }
    }
    return rows;
  },

  evaluateWindow(app,species,window,catches){
    if(!catches.length)return {...window,personalMatch:null,personalConfidence:0,closest:[],personalBait:null};
    const forecast=window.best?.conditions||{};
    const sims=catches.map(c=>({catch:c,sim:this.similarity(app,forecast,c)})).filter(x=>Number.isFinite(x.sim)).sort((a,b)=>b.sim-a.sim);
    const top=sims.slice(0,Math.min(5,sims.length));
    const personalMatch=top.length?Math.round(app.average(top.map(x=>x.sim))):null;
    const baitVotes={};
    top.forEach(x=>{const b=String(x.catch.bait||'').trim();if(b)baitVotes[b]=(baitVotes[b]||0)+(x.sim/100);});
    const personalBait=Object.entries(baitVotes).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
    const confidence=Math.min(98,Math.round(18+catches.length*8+Math.min(20,top.length*4)));
    const blended=personalMatch==null?window.score:Math.round(window.score*.58+personalMatch*.42);
    return {...window,personalMatch,personalConfidence:confidence,closest:top,personalBait,blended};
  },

  forecast(app,species=app.state.targetSpecies){
    const catches=this.profileCatches(app,species);
    const rows=this.windowCandidates(app,species).map(w=>this.evaluateWindow(app,species,w,catches));
    rows.sort((a,b)=>(b.blended??b.score)-(a.blended??a.score));
    const top=rows.slice(0,7);
    const historyTopBait=app.mode?.(catches.map(c=>String(c.bait||'').trim()).filter(Boolean))||'Not enough data';
    const bestTide=app.mode?.(catches.map(c=>app.catchTide?.(c)).filter(Boolean))||'Not enough data';
    const bestTime=app.mode?.(catches.map(c=>app.catchTimeBucket?.(c.date)).filter(Boolean))||'Not enough data';
    const dataDepth=Math.min(100,Math.round(catches.length*9));
    return {species,catches,rows,top,historyTopBait,bestTide,bestTime,dataDepth};
  },

  summary(app){
    const f=this.forecast(app);
    const best=f.top[0]||null;
    const matchCount=best?best.closest.filter(x=>x.sim>=72).length:0;
    let headline='Log catches to unlock your personal forecast.';
    if(best&&f.catches.length){
      headline=best.personalMatch>=85?('Upcoming conditions strongly resemble your successful '+f.species+' trips.'):
        best.personalMatch>=70?('A good personal '+f.species+' pattern is showing up in the forecast.'):
        ('CastVector found the closest upcoming match to your '+f.species+' history.');
    }
    return {...f,best,matchCount,headline};
  },

  render(app){
    const root=app.$('personalBrainPanel');if(!root||!app.state.data)return;
    const r=this.summary(app),b=r.best;
    app.$('personalBrainDepth').textContent=r.dataDepth+'%';
    app.$('personalBrainCatchCount').textContent=r.catches.length+' '+r.species+' catch'+(r.catches.length===1?'':'es');
    app.$('personalBrainHeadline').textContent=r.headline;

    if(!b){
      app.$('personalBrainMatch').textContent='—';
      app.$('personalBrainWindow').textContent='Need forecast data';
      app.$('personalBrainConfidence').textContent='Learning';
      app.$('personalBrainTimeline').innerHTML='';
      return;
    }

    app.$('personalBrainMatch').textContent=b.personalMatch==null?'—':b.personalMatch+'%';
    app.$('personalBrainWindow').textContent=(b.day?.day||b.day?.date||'Best day')+' • '+b.label;
    app.$('personalBrainConfidence').textContent=b.personalMatch==null?'Needs catches':b.personalConfidence+'% confidence';
    app.$('personalBrainBait').textContent=app.titleCase?.(b.personalBait||r.historyTopBait)||b.personalBait||r.historyTopBait;
    app.$('personalBrainTide').textContent=r.bestTide;
    app.$('personalBrainTime').textContent=r.bestTime;
    app.$('personalBrainSimilar').textContent=b.personalMatch==null?'0 similar catches':b.closest.filter(x=>x.sim>=72).length+' strong historical match'+(b.closest.filter(x=>x.sim>=72).length===1?'':'es');

    app.$('personalBrainTimeline').innerHTML=r.top.map((w,i)=>{
      const cls=w.personalMatch>=85?'prime':w.personalMatch>=70?'good':w.personalMatch>=55?'fair':'low';
      return '<button type="button" class="brain-window '+cls+'" data-brain-day="'+w.dayIndex+'">'+
        '<span>'+(i===0?'BEST PERSONAL MATCH':app.escape(w.day?.day||w.day?.date||('Day '+(w.dayIndex+1))))+'</span>'+
        '<strong>'+(w.personalMatch==null?'—':w.personalMatch+'%')+'</strong>'+
        '<small>'+app.escape(w.label)+' • CastScore '+w.score+'</small>'+
      '</button>';
    }).join('');

    app.$('personalBrainClosest').innerHTML=b.closest.length?b.closest.slice(0,4).map(x=>{
      const c=x.catch;
      return '<div class="brain-history-row"><div><strong>'+app.escape(c.species)+' • '+x.sim+'% similar</strong><small>'+app.escape(app.prettyDate(c.date))+(c.bait?' • '+app.escape(c.bait):'')+'</small></div><span>'+app.escape(app.catchTide?.(c)||'Saved conditions')+'</span></div>';
    }).join(''):'<div class="empty-state">Log '+app.escape(r.species)+' catches with conditions to unlock historical matches.</div>';

    app.$('personalBrainWhy').textContent=b.personalMatch==null?
      'CastVector is using the general forecast until you log successful catches for this species.':
      'Personal Match compares upcoming water temperature, wind, surf, pressure, tide and time of day with your own successful catches. It does not guarantee fish will bite.';
  },

  useWindow(app,dayIndex){
    const r=this.forecast(app),w=r.rows.filter(x=>x.dayIndex===Number(dayIndex)).sort((a,b)=>(b.blended??b.score)-(a.blended??a.score))[0];
    if(!w)return;
    app.state.forecastDay=w.dayIndex;
    app.state.departure.selectedWindow={dayIndex:w.dayIndex,startIndex:w.rows?.[0]?.index??0,label:w.label,score:w.score,species:r.species,bestTime:w.best?.time||'',selectedAt:new Date().toISOString()};
    app.save?.();app.renderAll?.();app.navigate?.('forecast');app.showToast?.('Loaded your strongest personal-match window.');
  },

  buildPersonalTrip(app){
    const r=this.summary(app),b=r.best;if(!b)return app.showToast?.('Load forecast data first.');
    app.state.forecastDay=b.dayIndex;
    app.state.targetSpecies=r.species;
    app.state.departure.selectedWindow={dayIndex:b.dayIndex,startIndex:b.rows?.[0]?.index??0,label:b.label,score:b.score,species:r.species,bestTime:b.best?.time||'',selectedAt:new Date().toISOString()};
    app.buildCommandPlan?.();
  }
};

window.CastVectorPersonalBrain=brain;
const app=window.CastVector;if(!app)return;

const prevAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevAll();brain.render(this);return out;};

document.addEventListener('click',e=>{
  const w=e.target.closest('[data-brain-day]');
  if(w){brain.useWindow(app,Number(w.dataset.brainDay));return;}
  if(e.target.closest('#personalBrainTripBtn')){brain.buildPersonalTrip(app);return;}
  if(e.target.closest('#personalBrainLogBtn')){app.navigate?.('logbook');return;}
});

brain.render(app);
})();