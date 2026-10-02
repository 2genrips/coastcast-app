(function(){
'use strict';
const compare={
  version:'6.8.0',
  ensure(app){
    if(!app.state.spotComparePro) app.state.spotComparePro={selectedIds:[],results:[],status:'idle',lastRun:null};
    if(!Array.isArray(app.state.spotComparePro.selectedIds)) app.state.spotComparePro.selectedIds=[];
    if(!Array.isArray(app.state.spotComparePro.results)) app.state.spotComparePro.results=[];
    return app.state.spotComparePro;
  },
  candidates(app){
    const out=[],seen=[];
    const add=(x,source)=>{
      const lat=Number(x.lat),lon=Number(x.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
      if(seen.some(s=>app.haversine(s.lat,s.lon,lat,lon)<0.04))return;
      seen.push({lat,lon});
      out.push({id:String(x.id||source+'-'+out.length),name:x.name||'Fishing spot',lat,lon,source,type:x.type||source});
    };
    add(app.state.location,'Current');
    (app.state.waypoints||[]).forEach(x=>add(x,'Saved'));
    (app.state.scout?.results||[]).slice(0,5).forEach(x=>add(x,'Scout'));
    (app.state.smartPanMap?.places||[]).slice(0,8).forEach(x=>add(x,'Map'));
    return out.slice(0,15);
  },
  toggle(app,id){
    const s=this.ensure(app),ids=s.selectedIds;
    const i=ids.indexOf(id);
    if(i>=0)ids.splice(i,1);
    else{
      if(ids.length>=3)return app.showToast?.('Spot Compare Pro supports up to 3 spots at a time.');
      ids.push(id);
    }
    app.save?.();this.render(app);
  },
  async analyzeOne(app,spot){
    const dna=window.CastVectorSpotDNA;
    const c=await dna.exactConditions(app,spot.lat,spot.lon);
    const species=dna.scoreSpecies(app,c);
    const top=species[0]||{name:app.state.targetSpecies,score:0};
    const personal=dna.personalMatch(app,top.name,{...c,tide:'',time:c.time});
    const access=dna.accessAssessment(app,spot.lat,spot.lon);
    const structures=dna.structureAssessment(app,spot.lat,spot.lon);
    const shops=dna.shopAssessment(app,spot.lat,spot.lon);
    let score=Number(top.score||0);
    if(personal?.score!=null)score=Math.round(score*.7+personal.score*.3);
    if(access.verified)score+=4;
    if(structures.length)score+=3;
    score=Math.max(0,Math.min(100,score));
    return {spot,conditions:c,species,top,personal,access,structures,shops,score};
  },
  async run(app){
    const s=this.ensure(app),all=this.candidates(app),chosen=s.selectedIds.map(id=>all.find(x=>x.id===id)).filter(Boolean);
    if(chosen.length<2)return app.showToast?.('Choose at least 2 spots to compare.');
    s.status='loading';s.results=[];this.render(app);
    const rows=[];
    for(const spot of chosen){
      try{rows.push(await this.analyzeOne(app,spot));}catch(_){}
    }
    rows.sort((a,b)=>b.score-a.score);
    s.results=rows;s.status=rows.length?'ready':'error';s.lastRun=new Date().toISOString();
    app.save?.();this.render(app);
    if(rows[0])app.showToast?.(rows[0].spot.name+' is the strongest current Compare Pro match.');
  },
  render(app){
    const root=app.$('spotCompareProPanel');if(!root)return;
    const s=this.ensure(app),cands=this.candidates(app);
    app.$('spotCompareProBadge').textContent=s.status==='loading'?'ANALYZING':s.results.length?'COMPARED':'READY';
    app.$('spotCompareProCandidates').innerHTML=cands.map(x=>{
      const on=s.selectedIds.includes(x.id);
      return '<button type="button" class="compare-pro-candidate '+(on?'active':'')+'" data-compare-pro-id="'+app.escape(x.id)+'">'+
        '<strong>'+app.escape(x.name)+'</strong><span>'+app.escape(x.source)+'</span></button>';
    }).join('');
    app.$('spotCompareProCount').textContent=s.selectedIds.length+'/3 selected';
    const run=app.$('spotCompareProRun');if(run)run.disabled=s.selectedIds.length<2||s.status==='loading';

    if(!s.results.length){
      app.$('spotCompareProResults').innerHTML='<div class="empty-state">Choose 2–3 spots, then compare exact-point fishing conditions.</div>';
      return;
    }
    const winner=s.results[0];
    app.$('spotCompareProResults').innerHTML=s.results.map((r,i)=>{
      const c=r.conditions,access=r.access.verified?'Mapped access signal':'Access unverified';
      return '<article class="compare-pro-card '+(i===0?'winner':'')+'">'+
        '<div class="compare-pro-rank">'+(i===0?'BEST NOW':'#'+(i+1))+'</div>'+
        '<div class="compare-pro-title"><strong>'+app.escape(r.spot.name)+'</strong><b>'+r.score+'</b></div>'+
        '<div class="compare-pro-grid">'+
          '<div><span>TOP TARGET</span><strong>'+app.escape(r.top.name)+'</strong><small>'+r.top.score+'/100 species score</small></div>'+
          '<div><span>PERSONAL</span><strong>'+(r.personal?.score!=null?r.personal.score+'%':'Learning')+'</strong><small>'+(r.personal? r.personal.confidence+'% confidence':'Log catches')+'</small></div>'+
          '<div><span>WIND</span><strong>'+ (Number.isFinite(c.wind)?app.fmt(c.wind,0)+' mph':'—') +'</strong><small>'+app.escape(app.compass?.(c.windDir)||'')+'</small></div>'+
          '<div><span>SURF</span><strong>'+ (Number.isFinite(c.wave)?app.fmt(c.wave,1)+' ft':'—') +'</strong><small>'+ (Number.isFinite(c.period)?app.fmt(c.period,0)+' sec':'—') +'</small></div>'+
          '<div><span>ACCESS</span><strong>'+app.escape(access)+'</strong><small>'+app.escape(r.access.best?.name||'No nearby mapped access')+'</small></div>'+
          '<div><span>STRUCTURE</span><strong>'+r.structures.length+'</strong><small>within 4 mi</small></div>'+
          '<div><span>TACKLE</span><strong>'+r.shops.length+'</strong><small>within 12 mi</small></div>'+
        '</div>'+
        '<div class="compare-pro-actions"><button type="button" class="'+(i===0?'primary-button':'secondary-button')+'" data-compare-pro-use="'+app.escape(r.spot.id)+'">'+(i===0?'Use best spot':'Use this spot')+'</button></div>'+
      '</article>';
    }).join('');
    app.$('spotCompareProSummary').textContent=winner.spot.name+' is currently the strongest combined match at '+winner.score+'/100.';
  },
  use(app,id){
    const s=this.ensure(app),r=s.results.find(x=>x.spot.id===id);if(!r)return;
    app.state.location={key:'compare-pro',name:r.spot.name,lat:r.spot.lat,lon:r.spot.lon,source:'Spot Compare Pro'};
    app.state.targetSpecies=r.top.name;app.onLocationChanged?.();app.navigate?.('home');app.showToast?.('Compare Pro winner loaded.');
  }
};
window.CastVectorSpotComparePro=compare;
const app=window.CastVector;if(!app)return;
const prev=app.renderAll.bind(app);app.renderAll=function(){const out=prev();compare.render(this);return out;};
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-compare-pro-id]');if(c){compare.toggle(app,c.dataset.compareProId);return;}
  if(e.target.closest('#spotCompareProRun')){compare.run(app);return;}
  const u=e.target.closest('[data-compare-pro-use]');if(u){compare.use(app,u.dataset.compareProUse);}
});
compare.ensure(app);compare.render(app);
})();