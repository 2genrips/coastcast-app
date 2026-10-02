(function(){
'use strict';

const FW={
  version:'7.5.0',
  storageKey:'castvector-water-mode-v75',
  speciesNames:[
    'Largemouth Bass','Smallmouth Bass','Spotted Bass','Crappie','Bluegill',
    'Channel Catfish','Flathead Catfish','Walleye','Rainbow Trout','Brown Trout','Brook Trout','Muskellunge','Striped Bass'
  ],
  coastSpecies:null,

  app(){return window.CastVector;},

  ensure(app){
    if(!app.state.waterMode){
      let saved=null;try{saved=JSON.parse(localStorage.getItem(this.storageKey)||'null');}catch(_){}
      app.state.waterMode={mode:'coast',freshwaterType:'Lake / reservoir',...(saved||{})};
    }
    if(!app.state.freshwaterIQ)app.state.freshwaterIQ={status:'idle',station:null,flow:null,gage:null,tempF:null,observedAt:null,waters:[],lastUpdate:null};
    return app.state.waterMode;
  },

  save(app){try{localStorage.setItem(this.storageKey,JSON.stringify(this.ensure(app)));}catch(_){}},

  addSpecies(app){
    const add=(name,cfg,extra,play)=>{app.species[name]=cfg;app.speciesExtras[name]=extra;app.baitPlaybook[name]=play;};
    add('Largemouth Bass',{icon:'B',abbr:'LB',water:[62,82],tideBias:0,waveIdeal:[0,2],note:'Warm-water cover, edges, points and low-light feeding windows score highest.'},{bait:['soft plastic','spinnerbait','topwater'],habitat:'weed edges, docks, laydowns, points and shallow cover'},{rigs:{'Bank fishing':'Texas rig / spinnerbait','Kayak fishing':'Texas rig / moving bait','Freshwater boat':'Texas rig / crankbait','River / wade':'Spinnerbait / soft plastic'},presentation:'Work cover methodically; slow down when the bite is pressured and speed up around active fish.',terminal:'10–20 lb line matched to cover'});
    add('Smallmouth Bass',{icon:'B',abbr:'SMB',water:[55,75],tideBias:0,waveIdeal:[0,2],note:'Rock, current seams, points and cooler clear water receive extra weight.'},{bait:['tube jig','ned rig','jerkbait'],habitat:'rock, current breaks, shoals, points and clear-water structure'},{rigs:{'Bank fishing':'Ned rig / tube','Kayak fishing':'Tube / jerkbait','Freshwater boat':'Drop-shot / jerkbait','River / wade':'Tube / inline spinner'},presentation:'Target current breaks and rock transitions; keep bottom contact when fish are holding deep.',terminal:'6–12 lb fluorocarbon or braid-to-leader'});
    add('Spotted Bass',{icon:'B',abbr:'SPB',water:[58,78],tideBias:0,waveIdeal:[0,2],note:'Reservoir points, suspended bait and rocky structure score well.'},{bait:['shaky head','swimbait','jerkbait'],habitat:'reservoir points, rocky banks, brush and suspended bait'},{rigs:{'Bank fishing':'Shaky head','Kayak fishing':'Swimbait / shaky head','Freshwater boat':'Drop-shot / swimbait','River / wade':'Small swimbait'},presentation:'Follow bait and depth transitions; spotted bass often suspend off points and cover.',terminal:'8–15 lb line'});
    add('Crappie',{icon:'C',abbr:'CR',water:[55,75],tideBias:0,waveIdeal:[0,1.5],note:'Brush, docks, creek channels and low-light periods receive extra weight.'},{bait:['crappie jig','minnow','small grub'],habitat:'brush piles, docks, creek channels and standing timber'},{rigs:{'Bank fishing':'Slip float / jig','Kayak fishing':'Vertical jig','Freshwater boat':'Spider rig / jig','River / wade':'Float and jig'},presentation:'Fish vertically or slowly through suspended schools and brush edges.',terminal:'4–8 lb line'});
    add('Bluegill',{icon:'B',abbr:'BG',water:[65,85],tideBias:0,waveIdeal:[0,1.5],note:'Warm shallow cover, spawning flats and calm conditions score well.'},{bait:['worm','small jig','cricket'],habitat:'shallow cover, docks, weed edges and spawning flats'},{rigs:{'Bank fishing':'Float rig','Kayak fishing':'Light jig / float','Freshwater boat':'Light jig','River / wade':'Float rig'},presentation:'Keep presentations small and close to cover.',terminal:'2–6 lb line'});
    add('Channel Catfish',{icon:'C',abbr:'CC',water:[68,85],tideBias:0,waveIdeal:[0,2],note:'Warm water, scent, current edges and deeper holes receive extra weight.'},{bait:['cut bait','chicken liver','stink bait'],habitat:'channel edges, holes, flats near deeper water and current breaks'},{rigs:{'Bank fishing':'Slip-sinker rig','Kayak fishing':'Slip-sinker rig','Freshwater boat':'Santee / slip rig','River / wade':'Slip-sinker rig'},presentation:'Keep bait near bottom where scent can move through current.',terminal:'20–40 lb leader • circle hook'});
    add('Flathead Catfish',{icon:'F',abbr:'FC',water:[70,86],tideBias:0,waveIdeal:[0,2],note:'Warm nights, deep wood, current breaks and live bait score best.'},{bait:['live bluegill','live shad','large cut bait'],habitat:'deep holes, wood, outside bends and heavy current breaks'},{rigs:{'Bank fishing':'Heavy slip-sinker','Kayak fishing':'Heavy slip rig','Freshwater boat':'Heavy bottom rig','River / wade':'Heavy slip-sinker'},presentation:'Place live bait tight to cover or along the edge of deep holes.',terminal:'40–80 lb leader'});
    add('Walleye',{icon:'W',abbr:'WA',water:[45,68],tideBias:0,waveIdeal:[0,2],note:'Cool water, low light, points and depth transitions receive extra weight.'},{bait:['jig and minnow','jerkbait','crawler harness'],habitat:'points, drop-offs, reefs, creek channels and low-light flats'},{rigs:{'Bank fishing':'Jig / jerkbait','Kayak fishing':'Jig / trolling rig','Freshwater boat':'Jig / trolling harness','River / wade':'Jig / minnow'},presentation:'Fish depth transitions slowly and prioritize dawn, dusk and cloudy periods.',terminal:'6–12 lb line'});
    add('Rainbow Trout',{icon:'T',abbr:'RT',water:[45,60],tideBias:0,waveIdeal:[0,1.5],note:'Cold oxygenated water, current seams and low-light windows score best.'},{bait:['inline spinner','small spoon','worm'],habitat:'cool runs, pools, seams and lake inlets'},{rigs:{'Bank fishing':'Spinner / light float','Kayak fishing':'Small spoon / troll','Freshwater boat':'Light troll / spoon','River / wade':'Spinner / nymph'},presentation:'Keep the presentation natural in current and avoid overly warm water.',terminal:'4–8 lb line'});
    add('Brown Trout',{icon:'T',abbr:'BT',water:[44,62],tideBias:0,waveIdeal:[0,1.5],note:'Cool water, structure, overcast conditions and low-light feeding windows score well.'},{bait:['jerkbait','spinner','nymph'],habitat:'undercut banks, pools, rock, wood and current seams'},{rigs:{'Bank fishing':'Jerkbait / spinner','Kayak fishing':'Jerkbait','Freshwater boat':'Small crankbait / troll','River / wade':'Nymph / streamer'},presentation:'Work structure and low-light windows with natural or erratic presentations.',terminal:'4–10 lb leader'});
    add('Brook Trout',{icon:'T',abbr:'BK',water:[42,58],tideBias:0,waveIdeal:[0,1],note:'Cold headwaters, shade and clean current receive the strongest weight.'},{bait:['small spinner','nymph','worm'],habitat:'cold shaded streams, plunge pools and pocket water'},{rigs:{'Bank fishing':'Light spinner','Kayak fishing':'Light spinner','Freshwater boat':'Small spoon','River / wade':'Nymph / dry fly'},presentation:'Use subtle presentations in cold clean water and small pockets.',terminal:'2–6 lb line'});
    add('Muskellunge',{icon:'M',abbr:'MU',water:[50,68],tideBias:0,waveIdeal:[0,2],note:'Cool-to-moderate water, weed edges, points and large bait movement score best.'},{bait:['large jerkbait','bucktail','large swimbait'],habitat:'weed edges, points, breaks and large forage concentrations'},{rigs:{'Bank fishing':'Heavy casting setup','Kayak fishing':'Heavy casting setup','Freshwater boat':'Heavy casting / trolling','River / wade':'Heavy jerkbait'},presentation:'Cover high-percentage structure with large presentations and controlled speed.',terminal:'Heavy leader appropriate for large toothy fish'});
  },

  freshwaterStyles(){return['Bank fishing','Kayak fishing','Freshwater boat','River / wade'];},

  installUI(app){
    const loc=document.querySelector('#view-home .location-hero');
    if(loc&&!document.getElementById('waterModeSwitch')){
      const bar=document.createElement('div');bar.id='waterModeSwitch';bar.className='water-mode-switch';
      bar.innerHTML='<button type="button" data-water-mode="coast">Coast</button><button type="button" data-water-mode="freshwater">Freshwater</button>';
      loc.appendChild(bar);
    }

    const settings=document.getElementById('fishingStyleSetting');
    if(settings)this.freshwaterStyles().forEach(v=>{if(![...settings.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=v;settings.appendChild(o);}});

    const mapView=document.getElementById('view-map');
    if(mapView&&!document.getElementById('freshwaterIQPanel')){
      const panel=document.createElement('section');panel.id='freshwaterIQPanel';panel.className='panel freshwater-iq-panel map7-secondary';panel.hidden=true;
      panel.innerHTML='<div class="fresh-head"><div><div class="eyebrow">FRESHWATER IQ • USGS 7.5</div><h2>Live lake & river context</h2></div><span id="freshBadge" class="fresh-badge">READY</span></div><p class="fresh-note">USGS monitoring data varies by waterbody. CastVector shows the nearest current readings it can verify and keeps forecast scoring separate from missing measurements.</p><div class="fresh-metrics"><article><span>WATER TEMP</span><strong id="freshTemp">—</strong><small>Nearest reporting station</small></article><article><span>STREAMFLOW</span><strong id="freshFlow">—</strong><small>cfs when reported</small></article><article><span>GAGE HEIGHT</span><strong id="freshGage">—</strong><small>ft when reported</small></article><article><span>STATION</span><strong id="freshStation">—</strong><small id="freshObserved">No live reading yet</small></article></div><div class="fresh-actions"><button id="freshRefreshBtn" class="primary-button small" type="button">Refresh USGS water data</button><button id="freshScanBtn" class="secondary-button small" type="button">Find nearby waters</button></div><div id="freshWaterList" class="fresh-water-list"></div>';
      const hero=document.querySelector('#view-map .map7-hero');if(hero)hero.after(panel);else mapView.appendChild(panel);
      const nav=document.getElementById('map7Nav');
      if(nav&&!nav.querySelector('[data-map7-tool="freshwater"]')){const b=document.createElement('button');b.className='map7-chip';b.type='button';b.dataset.map7Tool='freshwater';b.textContent='Freshwater';nav.appendChild(b);}
      const E=window.CastVectorExploreFeed;if(E&&Array.isArray(E.mapTools)&&!E.mapTools.some(x=>x[0]==='freshwater'))E.mapTools.push(['freshwater',panel]);
    }
  },

  mode(app){return this.ensure(app).mode;},

  setMode(app,mode){
    const s=this.ensure(app);s.mode=mode==='freshwater'?'freshwater':'coast';this.save(app);
    if(s.mode==='freshwater'){
      if(!this.speciesNames.includes(app.state.targetSpecies))app.state.targetSpecies='Largemouth Bass';
      if(!this.freshwaterStyles().includes(app.state.fishingStyle))app.state.fishingStyle='Bank fishing';
      app.state.scout.species=app.state.targetSpecies;
      this.loadUSGS(app);
    }else{
      if(this.speciesNames.includes(app.state.targetSpecies))app.state.targetSpecies='Red Drum';
      if(this.freshwaterStyles().includes(app.state.fishingStyle))app.state.fishingStyle='Surf fishing';
    }
    app.save?.();app.populateSpeciesControls?.();app.recalculateScores?.();app.renderAll?.();this.render(app);
    app.showToast?.(s.mode==='freshwater'?'Freshwater Mode is on.':'Coastal Mode is on.');
  },

  patchSpeciesControls(app){
    const original=app.populateSpeciesControls?.bind(app);
    app.populateSpeciesControls=function(){
      const fresh=FW.mode(this)==='freshwater';
      const names=fresh?FW.speciesNames.filter(n=>this.species[n]):Object.keys(this.species).filter(n=>!FW.speciesNames.includes(n)||n==='Striped Bass');
      const chips=this.$('speciesChips');
      if(chips){
        chips.innerHTML=names.map(name=>'<button type="button" class="species-chip '+(name===this.state.targetSpecies?'active':'')+'" data-species="'+this.escape(name)+'"><span class="species-chip-mark">'+this.escape(this.species[name].abbr||name.slice(0,2).toUpperCase())+'</span><span>'+this.escape(name)+'</span></button>').join('');
        this.$$('.species-chip').forEach(btn=>btn.addEventListener('click',()=>this.setSpecies(btn.dataset.species)));
      }
      ['targetSpecies','catchSpecies','tripSpecies','alertSpecies'].forEach(id=>{
        const el=this.$(id);if(!el)return;const prefix=id==='targetSpecies'?'':'<option value="">Select species</option>';
        el.innerHTML=prefix+names.map(n=>'<option value="'+this.escape(n)+'">'+this.escape(n)+'</option>').join('');
      });
      if(this.$('targetSpecies'))this.$('targetSpecies').value=this.state.targetSpecies;
      if(this.$('catchSpecies'))this.$('catchSpecies').value=this.state.targetSpecies;
      if(this.$('tripSpecies'))this.$('tripSpecies').value=this.state.targetSpecies;
      if(this.$('communitySpeciesFilter'))this.$('communitySpeciesFilter').innerHTML='<option value="all">All species</option>'+names.map(n=>'<option value="'+this.escape(n)+'">'+this.escape(n)+'</option>').join('');
    };
  },

  patchRegionSpecies(app){
    const old=app.coastRegionSpecies?.bind(app);
    app.coastRegionSpecies=function(){return FW.mode(this)==='freshwater'?FW.speciesNames.filter(n=>this.species[n]):old();};
  },

  patchScore(app){
    const old=app.calculateScore?.bind(app);
    app.calculateScore=function(c,speciesName=this.state.targetSpecies,includeHistory=true){
      if(FW.mode(this)!=='freshwater'||!FW.speciesNames.includes(speciesName))return old(c,speciesName,includeHistory);
      const cfg=this.species[speciesName]||this.species['Largemouth Bass'];
      let score=35;const wind=this.num(c.wind,8),rain=this.num(c.rain,0);
      const fw=this.state.freshwaterIQ||{};const water=this.num(fw.tempF??c.water,68);
      if(wind<=5)score+=14;else if(wind<=10)score+=10;else if(wind<=15)score+=5;else if(wind>20)score-=12;
      if(rain<=20)score+=5;else if(rain<=50)score+=2;else if(rain>=75)score-=8;
      const min=cfg.water[0],max=cfg.water[1],mid=(min+max)/2,half=Math.max(2,(max-min)/2);
      if(water>=min&&water<=max)score+=6+Math.round(Math.max(0,1-Math.abs(water-mid)/half)*10);
      else score-=Math.min(14,Math.round(Math.abs(water<(min)?min-water:water-max)*.9+2));
      const hour=this.extractHour(c.time);if(hour>=5&&hour<=9)score+=9;else if(hour>=17&&hour<=20)score+=7;else if(hour>=11&&hour<=15)score-=2;
      const pressure=this.num(c.pressure,1015);if(pressure>=1008&&pressure<=1024)score+=4;
      if(Number.isFinite(Number(fw.flow))&&(speciesName.includes('Trout')||speciesName==='Smallmouth Bass'||speciesName==='Walleye'))score+=3;
      if(includeHistory)score+=this.historyAdjustment(speciesName,{wind,wave:.5,water});
      return Math.round(Math.max(25,Math.min(98,score)));
    };
  },

  patchBait(app){
    const old=app.baitIntelligence?.bind(app);
    app.baitIntelligence=function(species=this.state.targetSpecies){
      if(FW.mode(this)!=='freshwater'||!FW.speciesNames.includes(species))return old(species);
      const extra=this.speciesExtras[species]||{bait:['soft plastic','live bait'],habitat:'freshwater structure'},play=this.baitPlaybook[species]||{},history=this.baitHistoryForSpecies(species);
      const base=[...(extra.bait||[])],primary=history.top&&(base.some(b=>history.top[0].includes(b.toLowerCase())||b.toLowerCase().includes(history.top[0])))?base.find(b=>history.top[0].includes(b.toLowerCase())||b.toLowerCase().includes(history.top[0])):base[0];
      const backup=base.find(b=>b!==primary)||base[1]||'live bait';
      const rig=play.rigs?.[this.state.fishingStyle]||Object.values(play.rigs||{})[0]||'Simple freshwater rig';
      const temp=this.state.freshwaterIQ?.tempF;
      return{species,primary,backup,rig,presentation:play.presentation||('Work '+extra.habitat+'.'),terminal:play.terminal||'Match line and tackle to cover',confidence:Math.min(98,62+Math.min(20,history.count*4)+(Number.isFinite(temp)?10:0)),history,primaryWhy:history.top?'Your logbook supports this starting bait.':'Best starting match for this freshwater target and fishing style.',backupWhy:'Use this when depth, cover or activity changes.'};
    };
  },

  bbox(app,miles=18){
    const l=app.state.location||{},lat=Number(l.lat),lon=Number(l.lon),dLat=miles/69,dLon=miles/(69*Math.max(.2,Math.cos(lat*Math.PI/180)));
    return [lon-dLon,lat-dLat,lon+dLon,lat+dLat];
  },

  async latestParameter(app,code){
    const q=new URLSearchParams({bbox:this.bbox(app).join(','),parameter_code:code,limit:'100',f:'json'});
    return app.fetchJSON('https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items?'+q.toString(),12000);
  },

  nearestFeature(app,features){
    const l=app.state.location||{},rows=(features||[]).map(f=>{
      const c=f.geometry?.coordinates||[],lon=Number(c[0]),lat=Number(c[1]);
      return{f,lat,lon,d:app.haversine(Number(l.lat),Number(l.lon),lat,lon)};
    }).filter(x=>Number.isFinite(x.d)).sort((a,b)=>a.d-b.d);
    return rows[0]||null;
  },

  async loadUSGS(app){
    const iq=app.state.freshwaterIQ;iq.status='loading';this.render(app);
    try{
      const [flow,gage,temp]=await Promise.all([this.latestParameter(app,'00060'),this.latestParameter(app,'00065'),this.latestParameter(app,'00010')]);
      const rf=this.nearestFeature(app,flow.features),rg=this.nearestFeature(app,gage.features),rt=this.nearestFeature(app,temp.features);
      const nearest=[rf,rg,rt].filter(Boolean).sort((a,b)=>a.d-b.d)[0]||null;
      const prop=x=>x?.f?.properties||{};
      iq.flow=rf?Number(prop(rf).value):null;iq.gage=rg?Number(prop(rg).value):null;
      const c=rt?Number(prop(rt).value):null;iq.tempF=Number.isFinite(c)?c*9/5+32:null;
      iq.station=prop(nearest)?.monitoring_location_name||prop(nearest)?.monitoring_location_id||null;
      iq.stationId=prop(nearest)?.monitoring_location_id||null;iq.distance=nearest?.d??null;
      iq.observedAt=prop(nearest)?.time||null;iq.status=nearest?'live':'no-station';iq.lastUpdate=new Date().toISOString();
      if(Number.isFinite(iq.tempF)&&app.state.data?.current)app.state.data.current.waterTemp=iq.tempF;
      app.recalculateScores?.();app.renderAll?.();
    }catch(e){iq.status='error';}
    this.render(app);
  },

  async scanWaters(app){
    const iq=app.state.freshwaterIQ,l=app.state.location||{};
    iq.status='scanning';this.render(app);
    const query='[out:json][timeout:20];(nwr["natural"="water"]["name"](around:30000,'+l.lat+','+l.lon+');nwr["water"~"lake|reservoir|pond"]["name"](around:30000,'+l.lat+','+l.lon+');nwr["waterway"~"river|stream"]["name"](around:30000,'+l.lat+','+l.lon+'););out center tags;';
    try{
      const data=await app.fetchOverpass('https://overpass.private.coffee/api/interpreter',query,12000).catch(()=>app.fetchOverpass('https://overpass-api.de/api/interpreter',query,12000));
      const rows=(data.elements||[]).map(e=>{const lat=Number(e.lat??e.center?.lat),lon=Number(e.lon??e.center?.lon),name=e.tags?.name,type=e.tags?.water||e.tags?.waterway||e.tags?.natural||'water';return{name,lat,lon,type,distance:app.haversine(Number(l.lat),Number(l.lon),lat,lon)};}).filter(x=>x.name&&Number.isFinite(x.distance)&&x.distance<=30).sort((a,b)=>a.distance-b.distance);
      const seen=new Set();iq.waters=rows.filter(x=>{const k=x.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;}).slice(0,20);iq.status='live';
    }catch(_){iq.waters=[];iq.status='error';}
    this.render(app);
  },

  render(app){
    const s=this.ensure(app),fresh=s.mode==='freshwater';
    document.querySelectorAll('[data-water-mode]').forEach(b=>b.classList.toggle('active',b.dataset.waterMode===s.mode));
    const switcher=document.getElementById('waterModeSwitch');if(switcher)switcher.classList.toggle('freshwater',fresh);
    const navFresh=document.querySelector('[data-map7-tool="freshwater"]');if(navFresh)navFresh.hidden=!fresh;
    if(document.getElementById('quickConditionsNote'))document.getElementById('quickConditionsNote').textContent=fresh?'Wind • freshwater':'Wind • surf';
    const iq=app.state.freshwaterIQ||{};
    const panel=document.getElementById('freshwaterIQPanel');
    if(panel){
      const badge=document.getElementById('freshBadge');badge.textContent=iq.status==='loading'?'LOADING':iq.status==='scanning'?'SCANNING':iq.status==='live'?'USGS LIVE':iq.status==='no-station'?'NO NEARBY STATION':iq.status==='error'?'SOURCE ISSUE':'READY';
      document.getElementById('freshTemp').textContent=Number.isFinite(iq.tempF)?iq.tempF.toFixed(1)+'°F':'—';
      document.getElementById('freshFlow').textContent=Number.isFinite(iq.flow)?Math.round(iq.flow).toLocaleString()+' cfs':'—';
      document.getElementById('freshGage').textContent=Number.isFinite(iq.gage)?iq.gage.toFixed(2)+' ft':'—';
      document.getElementById('freshStation').textContent=iq.station||'—';
      document.getElementById('freshObserved').textContent=iq.observedAt?(new Date(iq.observedAt).toLocaleString()+(Number.isFinite(iq.distance)?' • '+iq.distance.toFixed(1)+' mi away':'')):'No live reading yet';
      const list=document.getElementById('freshWaterList');
      list.innerHTML=(iq.waters||[]).length?(iq.waters||[]).slice(0,10).map((w,i)=>'<button type="button" class="fresh-water-row" data-fresh-water="'+i+'"><span>#'+(i+1)+'</span><div><strong>'+app.escape(w.name)+'</strong><small>'+app.escape(w.type)+' • '+w.distance.toFixed(1)+' mi</small></div><b>Use</b></button>').join(''):'<div class="empty-state">Find nearby lakes, reservoirs, ponds, rivers and streams from the Explore tab.</div>';
    }
  },

  useWater(app,index){
    const w=app.state.freshwaterIQ?.waters?.[Number(index)];if(!w)return;
    app.state.location={key:'freshwater',name:w.name,lat:w.lat,lon:w.lon,source:'Freshwater discovery'};
    app.onLocationChanged?.();this.loadUSGS(app);app.navigate?.('home');app.showToast?.(w.name+' loaded in Freshwater Mode.');
  },

  bind(app){
    document.addEventListener('click',e=>{
      const m=e.target.closest('[data-water-mode]');if(m){this.setMode(app,m.dataset.waterMode);return;}
      if(e.target.closest('#freshRefreshBtn')){this.loadUSGS(app);return;}
      if(e.target.closest('#freshScanBtn')){this.scanWaters(app);return;}
      const w=e.target.closest('[data-fresh-water]');if(w)this.useWater(app,w.dataset.freshWater);
    });
    const oldLoc=app.onLocationChanged?.bind(app);
    if(oldLoc)app.onLocationChanged=function(){const out=oldLoc();if(FW.mode(this)==='freshwater')setTimeout(()=>FW.loadUSGS(this),80);return out;};
    const oldRender=app.renderAll?.bind(app);
    if(oldRender)app.renderAll=function(){const out=oldRender();FW.render(this);return out;};
  },

  init(){
    const app=this.app();if(!app)return;this.ensure(app);this.coastSpecies=Object.keys(app.species);
    this.addSpecies(app);this.patchSpeciesControls(app);this.patchRegionSpecies(app);this.patchScore(app);this.patchBait(app);this.installUI(app);this.bind(app);
    if(this.mode(app)==='freshwater'){
      if(!this.speciesNames.includes(app.state.targetSpecies))app.state.targetSpecies='Largemouth Bass';
      if(!this.freshwaterStyles().includes(app.state.fishingStyle))app.state.fishingStyle='Bank fishing';
      this.loadUSGS(app);
    }
    app.populateSpeciesControls?.();app.recalculateScores?.();app.renderAll?.();this.render(app);
  }
};

window.CastVectorFreshwater=FW;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>FW.init());else FW.init();
})();