(function(){
'use strict';
const hub={
 version:'6.9.0',
 ensure(app){if(!app.state.speciesCommand)app.state.speciesCommand={selected:app.state.targetSpecies};return app.state.speciesCommand;},
 model(app,species=app.state.targetSpecies){
  const cfg=app.species?.[species]||{},extra=app.speciesExtras?.[species]||{},bait=app.baitIntelligence?.(species)||{};
  const seasonal=app.seasonalScore?.(species)??null,personal=window.CastVectorPersonalBrain?.summary?.(app),ranked=app.rankSpecies?.()||[];
  const live=ranked.find(x=>x.name===species)||{score:app.speciesTodayScore?.(species)??app.currentScore?.()??0};
  const c=app.state.data?.current||{},tide=app.currentTideLabel?.()||'—';
  const structure=(app.state.waterIntel?.structures||[]).slice(0,5);
  const access=(app.state.smartPanMap?.places||[]).slice(0,5);
  const spot=(app.state.opportunityRadar?.results||[]).find(x=>x.species===species)||app.state.opportunityRadar?.results?.[0]||null;
  return{species,cfg,extra,bait,seasonal,personal,live,c,tide,structure,access,spot};
 },
 render(app){
  const root=app.$('speciesCommandPanel');if(!root)return;
  const s=this.ensure(app),m=this.model(app,s.selected||app.state.targetSpecies);
  app.$('speciesCommandName').textContent=m.species;
  app.$('speciesCommandScore').textContent=Math.round(m.live.score||0);
  app.$('speciesCommandSeason').textContent=m.seasonal==null?'—':m.seasonal+'/100';
  app.$('speciesCommandPersonal').textContent=m.personal?.species===m.species&&m.personal?.best?.personalMatch!=null?m.personal.best.personalMatch+'%':'Learning';
  app.$('speciesCommandHabitat').textContent=m.extra.habitat||m.cfg.note||'Coastal structure and moving water';
  app.$('speciesCommandBait').textContent=app.titleCase?.(m.bait.primary||'')||m.bait.primary||'—';
  app.$('speciesCommandBackup').textContent=app.titleCase?.(m.bait.backup||'')||m.bait.backup||'—';
  app.$('speciesCommandRig').textContent=m.bait.rig||'—';
  app.$('speciesCommandPresentation').textContent=m.bait.presentation||'—';
  app.$('speciesCommandConditions').innerHTML=[
   ['WATER',Number.isFinite(Number(m.c.waterTemp))?app.fmt(m.c.waterTemp,0)+'°F':'—'],
   ['WIND',Number.isFinite(Number(m.c.windSpeed))?app.fmt(m.c.windSpeed,0)+' mph':'—'],
   ['SURF',Number.isFinite(Number(m.c.waveHeight))?app.fmt(m.c.waveHeight,1)+' ft':'—'],
   ['TIDE',m.tide]
  ].map(x=>'<div><span>'+x[0]+'</span><strong>'+app.escape(String(x[1]))+'</strong></div>').join('');
  app.$('speciesCommandSpot').textContent=m.spot?m.spot.name:'Current fishing location';
  app.$('speciesCommandStructure').innerHTML=m.structure.length?m.structure.map(x=>'<div class="species-cmd-row"><strong>'+app.escape(x.type)+'</strong><span>'+app.escape(x.name)+'</span></div>').join(''):'<div class="empty-state">No mapped structure in the current map view.</div>';
  app.$('speciesCommandAccess').innerHTML=m.access.length?m.access.map(x=>'<div class="species-cmd-row"><strong>'+app.escape(x.type||'Access')+'</strong><span>'+app.escape(x.name)+'</span></div>').join(''):'<div class="empty-state">No mapped access in the current map view.</div>';
  const names=(app.coastRegionSpecies?.()||Object.keys(app.species||{})).slice(0,12);
  app.$('speciesCommandSelector').innerHTML=names.map(n=>'<button type="button" class="species-cmd-chip '+(n===m.species?'active':'')+'" data-species-command="'+app.escape(n)+'">'+app.escape(n)+'</button>').join('');
 },
 set(app,name){if(!app.species?.[name])return;this.ensure(app).selected=name;app.state.targetSpecies=name;app.recalculateScores?.();app.save?.();app.renderAll?.();},
 plan(app){const s=this.ensure(app);if(s.selected&&app.species?.[s.selected])app.state.targetSpecies=s.selected;app.buildCommandPlan?.({navigateToTrips:true,toast:true});},
 regs(app){app.navigate?.('home');setTimeout(()=>app.$('regulationCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80);}
};
window.CastVectorSpeciesCommand=hub;
const app=window.CastVector;if(!app)return;
const prev=app.renderAll.bind(app);app.renderAll=function(){const out=prev();hub.render(this);return out;};
document.addEventListener('click',e=>{const s=e.target.closest('[data-species-command]');if(s)return hub.set(app,s.dataset.speciesCommand);if(e.target.closest('#speciesCommandPlanBtn'))return hub.plan(app);if(e.target.closest('#speciesCommandRegsBtn'))return hub.regs(app);});
hub.ensure(app);hub.render(app);
})();