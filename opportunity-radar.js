(function(){
'use strict';

const radar={
  version:'6.6.0',

  ensureState(app){
    if(!app.state.opportunityRadar) app.state.opportunityRadar={status:'idle',results:[],lastRun:null,species:app.state.targetSpecies};
    if(!Array.isArray(app.state.opportunityRadar.results)) app.state.opportunityRadar.results=[];
    return app.state.opportunityRadar;
  },

  candidates(app){
    const out=[],seen=[];
    const add=(x,source)=>{
      const lat=Number(x.lat),lon=Number(x.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
      if(seen.some(s=>app.haversine(s.lat,s.lon,lat,lon)<0.05))return;
      seen.push({lat,lon});
      out.push({id:String(x.id||source+'-'+out.length),name:x.name||'Fishing spot',lat,lon,source});
    };
    add(app.state.location,'Current location');
    (app.state.waypoints||[]).forEach(x=>add(x,'Saved spot'));
    (app.state.scout?.results||[]).slice(0,3).forEach(x=>add(x,'Scout'));
    return out.slice(0,8);
  },

  personalForDay(app,species,day){
    const brain=window.CastVectorPersonalBrain;if(!brain)return null;
    const catches=brain.profileCatches(app,species);if(!catches.length)return null;
    const cond={water:Number(day.water),wind:Number(day.wind),wave:Number(day.wave),pressure:Number(day.pressure),rain:Number(day.rain),tide:day.tide||'',time:day.rawTime||day.date||new Date().toISOString()};
    const sims=catches.map(c=>brain.similarity(app,cond,c)).filter(Number.isFinite).sort((a,b)=>b-a);
    if(!sims.length)return null;
    return {score:Math.round(app.average(sims.slice(0,Math.min(5,sims.length)))),confidence:Math.min(98,18+catches.length*8)};
  },

  flatten(app,scans,species){
    const rows=[];
    for(const spot of scans){
      for(let i=0;i<(spot.days||[]).length;i++){
        const d=spot.days[i];if(!d)continue;
        const personal=this.personalForDay(app,species,d);
        const readiness=Math.round((Number(d.score||0)*0.72)+(personal?.score!=null?personal.score*0.28:Number(d.score||0)*0.28));
        rows.push({
          id:spot.id+'-'+i,name:spot.name,lat:Number(spot.lat),lon:Number(spot.lon),source:spot.source||'Coast Watch',
          dayIndex:i,day:d.day||d.date||('Day '+(i+1)),date:d.date||'',score:Number(d.score||0),
          window:d.window?.label||d.bestWindow||'Best loaded window',
          wind:Number(d.wind),wave:Number(d.wave),water:Number(d.water),rain:Number(d.rain),
          personalMatch:personal?.score??null,personalConfidence:personal?.confidence??0,
          opportunity:Math.max(0,Math.min(100,readiness))
        });
      }
    }
    rows.sort((a,b)=>b.opportunity-a.opportunity||b.score-a.score);
    return rows.slice(0,20);
  },

  async scan(app){
    const state=this.ensureState(app),spots=this.candidates(app),species=app.state.targetSpecies;
    if(!spots.length)return app.showToast?.('Save at least one fishing spot first.');
    state.status='loading';state.species=species;this.render(app);
    const scans=[];
    for(const spot of spots){
      try{
        const r=await app.scanFavoriteSpot(spot,species);
        if(r&&!r.error)scans.push({...r,source:spot.source});
      }catch(_){}
    }
    state.results=this.flatten(app,scans,species);
    state.status=state.results.length?'ready':'empty';
    state.lastRun=new Date().toISOString();
    app.save?.();this.render(app);
    app.showToast?.(state.results.length?'Opportunity Radar ranked your next fishing windows.':'No radar opportunities could be built from the loaded forecast.');
  },

  badge(score){
    if(score>=88)return{label:'PRIME',cls:'prime'};
    if(score>=78)return{label:'STRONG',cls:'strong'};
    if(score>=66)return{label:'WATCH',cls:'watch'};
    return{label:'LOWER',cls:'low'};
  },

  render(app){
    const root=app.$('opportunityRadarPanel');if(!root)return;
    const state=this.ensureState(app),rows=state.results||[];
    app.$('opportunityRadarBadge').textContent=state.status==='loading'?'SCANNING':rows.length?'LIVE RADAR':'READY';
    app.$('opportunityRadarSubtitle').textContent=rows.length?
      'Ranked across '+new Set(rows.map(x=>x.name)).size+' spot'+(new Set(rows.map(x=>x.name)).size===1?'':'s')+' • '+state.species:
      'Scan your current location, saved spots and Scout choices to find the strongest upcoming opportunities.';
    app.$('opportunityRadarLast').textContent=state.lastRun?'Updated '+app.prettyDate(state.lastRun):'Not scanned yet';

    if(!rows.length){
      app.$('opportunityRadarTop').innerHTML='<div class="empty-state">Run Opportunity Radar to rank the next seven days across your fishing spots.</div>';
      app.$('opportunityRadarList').innerHTML='';
      return;
    }

    const top=rows[0],b=this.badge(top.opportunity);
    app.$('opportunityRadarTop').innerHTML=
      '<div class="radar-top-score '+b.cls+'"><strong>'+top.opportunity+'</strong><span>'+b.label+'</span></div>'+
      '<div class="radar-top-copy"><strong>'+app.escape(top.name)+' • '+app.escape(top.day)+'</strong>'+
      '<span>'+app.escape(top.window)+' • CastScore '+top.score+'</span>'+
      '<small>'+(top.personalMatch==null?'Personal model still learning':top.personalMatch+'% personal match')+' • '+(Number.isFinite(top.wind)?app.fmt(top.wind,0)+' mph wind':'')+'</small></div>'+
      '<button type="button" class="primary-button" data-radar-plan="'+app.escape(top.id)+'">Plan this</button>';

    app.$('opportunityRadarList').innerHTML=rows.slice(1,10).map((r,i)=>{
      const badge=this.badge(r.opportunity);
      return '<button type="button" class="radar-row" data-radar-open="'+app.escape(r.id)+'">'+
        '<span class="radar-rank">#'+(i+2)+'</span>'+
        '<div><strong>'+app.escape(r.name)+'</strong><small>'+app.escape(r.day)+' • '+app.escape(r.window)+(r.personalMatch==null?'':' • '+r.personalMatch+'% personal')+'</small></div>'+
        '<b class="'+badge.cls+'">'+r.opportunity+'</b>'+
      '</button>';
    }).join('');
  },

  find(app,id){return (this.ensureState(app).results||[]).find(x=>String(x.id)===String(id));},

  load(app,id,plan=false){
    const r=this.find(app,id);if(!r)return;
    app.state.location={key:'radar',name:r.name,lat:r.lat,lon:r.lon,source:'Opportunity Radar'};
    app.state.forecastDay=r.dayIndex;
    app.state.targetSpecies=this.ensureState(app).species||app.state.targetSpecies;
    app.onLocationChanged?.();
    if(plan){
      app.state.departure.selectedWindow={dayIndex:r.dayIndex,startIndex:0,label:r.window,score:r.score,species:app.state.targetSpecies,bestTime:'',selectedAt:new Date().toISOString()};
      setTimeout(()=>app.buildCommandPlan?.({navigateToTrips:true,toast:true}),120);
    }else{
      app.navigate?.('forecast');
      app.showToast?.('Opportunity loaded.');
    }
  }
};

window.CastVectorOpportunityRadar=radar;
const app=window.CastVector;if(!app)return;

const prevAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevAll();radar.render(this);return out;};

document.addEventListener('click',e=>{
  if(e.target.closest('#opportunityRadarRun')){radar.scan(app);return;}
  const plan=e.target.closest('[data-radar-plan]');if(plan){radar.load(app,plan.dataset.radarPlan,true);return;}
  const open=e.target.closest('[data-radar-open]');if(open){radar.load(app,open.dataset.radarOpen,false);}
});

radar.ensureState(app);radar.render(app);
})();