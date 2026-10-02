(function(){
'use strict';
const grid={
  version:'6.7.0',
  ensure(app){
    if(!app.state.biteGrid) app.state.biteGrid={species:app.state.targetSpecies,day:0};
    return app.state.biteGrid;
  },
  speciesList(app){
    const list=(app.coastRegionSpecies?.()||Object.keys(app.species||{})).slice(0,8);
    const target=app.state.targetSpecies;
    return [target,...list.filter(x=>x!==target)].slice(0,6);
  },
  hourRows(app,day){
    return (app.state.data?.hours||[]).filter(h=>Number(h.dateIndex)===Number(day)).slice(0,24);
  },
  personal(app,species,h){
    const brain=window.CastVectorPersonalBrain;if(!brain)return null;
    const catches=brain.profileCatches(app,species);if(!catches.length)return null;
    const f={water:h.water??app.state.data?.current?.waterTemp,wind:h.wind,wave:h.wave,pressure:h.pressure??app.state.data?.current?.pressure,rain:h.rain,tide:h.tide||'',time:h.rawTime||h.time};
    const sims=catches.map(c=>brain.similarity(app,f,c)).filter(Number.isFinite).sort((a,b)=>b-a).slice(0,5);
    return sims.length?Math.round(app.average(sims)):null;
  },
  score(app,species,h){
    const base=app.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??app.state.data?.current?.waterTemp,tide:h.tide||'',time:h.rawTime||h.time,pressure:h.pressure??app.state.data?.current?.pressure},species,false);
    const pm=this.personal(app,species,h);
    return {base,personal:pm,blended:pm==null?base:Math.round(base*.72+pm*.28)};
  },
  model(app){
    const state=this.ensure(app),species=this.speciesList(app),day=Number(state.day)||0,hours=this.hourRows(app,day);
    const cells=[];
    for(const sp of species) for(const h of hours){ const s=this.score(app,sp,h); cells.push({species:sp,hour:h,score:s.blended,base:s.base,personal:s.personal}); }
    const best=cells.slice().sort((a,b)=>b.score-a.score)[0]||null;
    return {species,hours,cells,best,day};
  },
  cls(n){return n>=88?'prime':n>=78?'strong':n>=66?'watch':'low';},
  render(app){
    const root=app.$('biteGridPanel');if(!root||!app.state.data)return;
    const m=this.model(app),days=(app.state.data.days||[]).slice(0,7);
    app.$('biteGridDayTabs').innerHTML=days.map((d,i)=>'<button type="button" class="bitegrid-day '+(i===m.day?'active':'')+'" data-bitegrid-day="'+i+'">'+app.escape(d.day||d.date||('Day '+(i+1)))+'</button>').join('');
    app.$('biteGridSpecies').innerHTML=m.species.map(s=>'<button type="button" class="bitegrid-species '+(s===app.state.targetSpecies?'active':'')+'" data-bitegrid-species="'+app.escape(s)+'">'+app.escape(s)+'</button>').join('');
    const selected=app.state.targetSpecies;
    const rows=m.cells.filter(x=>x.species===selected);
    app.$('biteGridCells').innerHTML=rows.map(x=>'<button type="button" class="bitegrid-cell '+this.cls(x.score)+'" data-bitegrid-hour="'+app.escape(String(x.hour.time||''))+'"><span>'+app.escape(x.hour.time||'')+'</span><strong>'+x.score+'</strong><small>'+(x.personal==null?'General':'P '+x.personal+'%')+'</small></button>').join('');
    if(m.best){
      app.$('biteGridBest').innerHTML='<strong>'+app.escape(m.best.species)+' • '+app.escape(m.best.hour.time||'')+'</strong><span>'+m.best.score+'/100 combined opportunity</span><small>'+ (m.best.personal==null?'Personal model still learning':m.best.personal+'% personal match')+'</small>';
    }
    const radar=app.state.opportunityRadar?.results||[];
    const spot=radar[0];
    app.$('biteGridSpot').textContent=spot?spot.name:'Current fishing location';
  },
  setDay(app,d){this.ensure(app).day=Number(d)||0;app.save?.();this.render(app);},
  setSpecies(app,s){if(app.species?.[s]){app.state.targetSpecies=s;this.ensure(app).species=s;app.recalculateScores?.();app.save?.();app.renderAll?.();}},
  planBest(app){
    const m=this.model(app);if(!m.best)return;
    app.state.targetSpecies=m.best.species;app.state.forecastDay=m.day;
    app.state.departure.selectedWindow={dayIndex:m.day,startIndex:m.best.hour.index??0,label:m.best.hour.time||'Best BiteGrid hour',score:m.best.score,species:m.best.species,bestTime:m.best.hour.time||'',selectedAt:new Date().toISOString()};
    app.save?.();app.buildCommandPlan?.({navigateToTrips:true,toast:true});
  }
};
window.CastVectorBiteGrid=grid;
const app=window.CastVector;if(!app)return;
const prev=app.renderAll.bind(app);app.renderAll=function(){const out=prev();grid.render(this);return out;};
document.addEventListener('click',e=>{
  const d=e.target.closest('[data-bitegrid-day]');if(d){grid.setDay(app,d.dataset.bitegridDay);return;}
  const s=e.target.closest('[data-bitegrid-species]');if(s){grid.setSpecies(app,s.dataset.bitegridSpecies);return;}
  if(e.target.closest('#biteGridPlanBtn'))grid.planBest(app);
});
grid.ensure(app);grid.render(app);
})();