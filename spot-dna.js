(function(){
'use strict';

const spotDNA={
  version:'6.4.0',

  ensureState(app){
    if(!app.state.spotDNA) app.state.spotDNA={status:'idle',selected:null,result:null,lastScan:null};
    return app.state.spotDNA;
  },

  nearby(app,items,lat,lon,miles=3){
    return (items||[]).map(x=>({...x,_distance:app.haversine(lat,lon,Number(x.lat),Number(x.lon))}))
      .filter(x=>Number.isFinite(x._distance)&&x._distance<=miles)
      .sort((a,b)=>a._distance-b._distance);
  },

  async exactConditions(app,lat,lon){
    const wx=new URLSearchParams({
      latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'2',
      temperature_unit:'fahrenheit',wind_speed_unit:'mph',
      current:'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
      hourly:'temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,pressure_msl'
    });
    const marine=new URLSearchParams({
      latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'2',
      length_unit:'imperial',cell_selection:'sea',
      current:'wave_height,wave_period,sea_surface_temperature',
      hourly:'wave_height,wave_period,sea_surface_temperature'
    });

    const [w,m]=await Promise.all([
      app.fetchJSON('https://api.open-meteo.com/v1/forecast?'+wx.toString(),12000),
      app.fetchJSON('https://marine-api.open-meteo.com/v1/marine?'+marine.toString(),12000).catch(()=>null)
    ]);

    const wc=w.current||{},mc=m?.current||{},now=w.current?.time||new Date().toISOString();
    const water=Number.isFinite(Number(mc.sea_surface_temperature))?app.cToF(Number(mc.sea_surface_temperature)):Number(app.state.data?.current?.waterTemp);
    return {
      temp:Number(wc.temperature_2m),
      wind:Number(wc.wind_speed_10m),
      windDir:Number(wc.wind_direction_10m),
      rain:Number(wc.precipitation??0),
      pressure:Number(wc.pressure_msl),
      wave:Number(mc.wave_height),
      period:Number(mc.wave_period),
      water,
      time:now,
      weatherCode:Number(wc.weather_code),
      source:{weather:!!w,marine:!!m}
    };
  },

  scoreSpecies(app,c){
    return Object.keys(app.species||{}).map(name=>{
      const score=app.calculateScore({
        wind:c.wind,rain:c.rain,wave:c.wave,water:c.water,
        tide:'',time:c.time,pressure:c.pressure
      },name,false);
      return {name,score};
    }).sort((a,b)=>b.score-a.score);
  },

  personalMatch(app,species,c){
    const brain=window.CastVectorPersonalBrain;if(!brain)return null;
    const catches=brain.profileCatches(app,species);if(!catches.length)return null;
    const sims=catches.map(catchItem=>({catch:catchItem,sim:brain.similarity(app,c,catchItem)}))
      .filter(x=>Number.isFinite(x.sim)).sort((a,b)=>b.sim-a.sim);
    const top=sims.slice(0,Math.min(5,sims.length));
    return {
      score:top.length?Math.round(app.average(top.map(x=>x.sim))):null,
      confidence:Math.min(98,Math.round(18+catches.length*8+Math.min(20,top.length*4))),
      catches:catches.length,
      top
    };
  },

  accessAssessment(app,lat,lon){
    const pan=app.state.smartPanMap||{},base=app.state.mapPOIs||[];
    const all=[...(pan.places||[]),...base];
    const nearby=this.nearby(app,all,lat,lon,2.5);
    const publicish=nearby.filter(x=>/public|permissive/i.test(String(x.accessConfidence||x.tags?.access||''))||/official|verified/i.test(String(x.sourceConfidence||x.source||'')));
    const best=publicish[0]||nearby[0]||null;
    return {
      nearby:nearby.slice(0,6),
      best,
      verified:!!(best&&(/public|permissive/i.test(String(best.accessConfidence||best.tags?.access||''))||/official|verified/i.test(String(best.sourceConfidence||best.source||''))))
    };
  },

  structureAssessment(app,lat,lon){
    const items=app.state.waterIntel?.structures||[];
    return this.nearby(app,items,lat,lon,4).slice(0,8);
  },

  shopAssessment(app,lat,lon){
    const pan=app.state.smartPanMap||{},live=app.state.data?.shops||[];
    const all=[...(pan.shops||[]),...live];
    const rows=this.nearby(app,all,lat,lon,12);
    const seen=[];
    for(const s of rows){
      const key=String(s.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
      if(seen.some(x=>x.key===key||app.haversine(x.lat,x.lon,s.lat,s.lon)<0.04))continue;
      seen.push({key,lat:s.lat,lon:s.lon,...s});
    }
    return seen.slice(0,6);
  },

  buildCall(result){
    const access=result.access,top=result.species[0],pm=result.personal;
    let score=top?.score||0;
    if(pm?.score!=null)score=Math.round(score*.72+pm.score*.28);
    if(result.structures.length)score=Math.min(99,score+3);
    let call='FISHABLE',tone='watch';
    if(score>=86){call='STRONG FISH HERE';tone='go';}
    else if(score>=72){call='PROMISING';tone='go';}
    else if(score<55){call='WEAK WINDOW';tone='hold';}
    if(!access.verified)call+=' • ACCESS UNVERIFIED';
    return {score,call,tone};
  },

  async analyze(app,lat,lon,label='Dropped pin'){
    const state=this.ensureState(app);
    state.status='loading';state.selected={lat:Number(lat),lon:Number(lon),label};this.render(app);
    try{
      const c=await this.exactConditions(app,lat,lon);
      const species=this.scoreSpecies(app,c);
      const topSpecies=species[0]?.name||app.state.targetSpecies;
      const personal=this.personalMatch(app,topSpecies,{...c,tide:'',time:c.time});
      const access=this.accessAssessment(app,lat,lon);
      const structures=this.structureAssessment(app,lat,lon);
      const shops=this.shopAssessment(app,lat,lon);
      const result={lat:Number(lat),lon:Number(lon),label,conditions:c,species,personal,access,structures,shops};
      result.call=this.buildCall(result);
      state.result=result;state.status='ready';state.lastScan=new Date().toISOString();
      this.render(app);this.openPanel(app);
      return result;
    }catch(e){
      state.status='error';state.result=null;this.render(app);app.showToast?.('Could not load exact-point conditions for that map point.');
      return null;
    }
  },

  openPanel(app){
    const el=app.$('spotDNAPanel');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  },

  render(app){
    const root=app.$('spotDNAPanel');if(!root)return;
    const state=this.ensureState(app);
    if(state.status==='loading'){
      app.$('spotDNABadge').textContent='ANALYZING';
      app.$('spotDNAHeadline').textContent='Reading exact-point conditions…';
      return;
    }
    if(state.status==='error'){
      app.$('spotDNABadge').textContent='SOURCE ISSUE';
      app.$('spotDNAHeadline').textContent='That point could not be analyzed.';
      return;
    }
    const r=state.result;
    if(!r){
      app.$('spotDNABadge').textContent='TAP MAP';
      app.$('spotDNAHeadline').textContent='Tap anywhere on the map to ask “Fish here?”';
      app.$('spotDNASummary').textContent='CastVector will analyze exact-point conditions, target species, access, nearby structure, tackle stores and your personal catch history.';
      return;
    }

    app.$('spotDNABadge').textContent=r.call.call;
    app.$('spotDNABadge').className='spot-dna-badge '+r.call.tone;
    app.$('spotDNAHeadline').textContent=(r.species[0]?.name||'Fishing')+' • '+r.call.score+'/100 at this point';
    app.$('spotDNASummary').textContent=r.access.verified?
      'CastVector found a nearby mapped access signal, but you should still verify current rules, hours and site conditions before fishing.':
      'Fishing conditions can be analyzed here, but public/legal access is not verified for this exact point.';

    const c=r.conditions;
    app.$('spotDNAMetrics').innerHTML=[
      ['TOP TARGET',r.species[0]?.name||'—',(r.species[0]?.score||'—')+'/100'],
      ['WATER',Number.isFinite(c.water)?app.fmt(c.water,0)+'°F':'—','Exact-point marine feed'],
      ['WIND',Number.isFinite(c.wind)?app.fmt(c.wind,0)+' mph':'—',app.compass?.(c.windDir)||''],
      ['SURF',Number.isFinite(c.wave)?app.fmt(c.wave,1)+' ft':'—',Number.isFinite(c.period)?app.fmt(c.period,0)+' sec period':'—'],
      ['PERSONAL MATCH',r.personal?.score!=null?r.personal.score+'%':'Learning',r.personal? r.personal.confidence+'% confidence':'Log catches to unlock'],
      ['ACCESS',r.access.verified?'MAPPED SIGNAL':'UNVERIFIED',r.access.best?.name||'No nearby access pin']
    ].map(x=>'<article><span>'+app.escape(x[0])+'</span><strong>'+app.escape(String(x[1]))+'</strong><small>'+app.escape(String(x[2]))+'</small></article>').join('');

    app.$('spotDNASpecies').innerHTML=r.species.slice(0,5).map((x,i)=>
      '<div class="spot-dna-row"><span>#'+(i+1)+'</span><strong>'+app.escape(x.name)+'</strong><b>'+x.score+'</b></div>'
    ).join('');

    app.$('spotDNAStructure').innerHTML=r.structures.length?r.structures.slice(0,5).map(x=>
      '<div class="spot-dna-detail"><strong>'+app.escape(x.type)+'</strong><span>'+app.escape(x.name)+' • '+app.fmt(x._distance,1)+' mi</span><small>Mapped structure only; access not implied.</small></div>'
    ).join(''):'<div class="empty-state">No mapped reef/wreck/breakwater structure found within 4 miles.</div>';

    app.$('spotDNAAccess').innerHTML=r.access.nearby.length?r.access.nearby.slice(0,5).map(x=>
      '<div class="spot-dna-detail"><strong>'+app.escape(x.name)+'</strong><span>'+app.escape(x.type||'Access')+' • '+app.fmt(x._distance,1)+' mi</span><small>'+app.escape(x.accessConfidence||x.sourceConfidence||'Access not explicitly confirmed')+'</small></div>'
    ).join(''):'<div class="empty-state">No mapped access point found within 2.5 miles.</div>';

    app.$('spotDNAShops').innerHTML=r.shops.length?r.shops.slice(0,5).map(x=>
      '<button type="button" class="spot-dna-shop" data-dna-shop="'+app.escape(String(x.name))+'"><strong>'+app.escape(x.name)+'</strong><span>'+app.fmt(x._distance,1)+' mi • '+app.escape(x.trustLabel||'Fishing-store match')+'</span></button>'
    ).join(''):'<div class="empty-state">No high-confidence bait/tackle result found within 12 miles.</div>';

    const history=app.$('spotDNAHistory');
    if(history)history.innerHTML=r.personal?.top?.length?r.personal.top.slice(0,4).map(x=>
      '<div class="spot-dna-detail"><strong>'+x.sim+'% similar past catch</strong><span>'+app.escape(app.prettyDate(x.catch.date))+(x.catch.bait?' • '+app.escape(x.catch.bait):'')+'</span></div>'
    ).join(''):'<div class="empty-state">Log catches with conditions to unlock exact-point personal matching.</div>';
  },

  useAsDestination(app){
    const r=this.ensureState(app).result;if(!r)return;
    const name=r.access.best?.name||'Fish Here pin';
    app.state.location={key:'fish-here',name,lat:r.lat,lon:r.lon,source:'Spot DNA • tapped map point'};
    app.onLocationChanged?.();app.navigate?.('home');app.showToast?.('Spot DNA point is now your fishing destination.');
  },

  route(app){
    const r=this.ensureState(app).result;if(!r)return;
    window.open(app.mapsUrl(r.lat,r.lon,r.access.best?.name||'Fish Here pin'),'_blank','noopener');
  },

  save(app){
    const r=this.ensureState(app).result;if(!r)return;
    const exists=(app.state.waypoints||[]).some(w=>app.haversine(w.lat,w.lon,r.lat,r.lon)<.03);
    if(exists)return app.showToast?.('That point is already saved.');
    app.state.waypoints.unshift({id:Date.now(),name:r.access.best?.name||'Spot DNA pin',notes:'Spot DNA '+r.call.score+'/100 • '+(r.species[0]?.name||'Fishing'),lat:r.lat,lon:r.lon,privacy:'private'});
    app.save?.();app.renderWaypoints?.();app.renderMapLayers?.();app.showToast?.('Spot DNA point saved privately.');
  },

  bindMap(app){
    const map=app.state.map;if(!map||map._castVectorSpotDNABound)return;
    map._castVectorSpotDNABound=true;
    map.on('click',e=>{
      if(!e?.latlng)return;
      this.analyze(app,e.latlng.lat,e.latlng.lng,'Tapped map point');
    });
  }
};

window.CastVectorSpotDNA=spotDNA;
const app=window.CastVector;if(!app)return;

const originalEnsure=app.ensureMap.bind(app);
app.ensureMap=function(){
  const out=originalEnsure();
  setTimeout(()=>spotDNA.bindMap(this),0);
  return out;
};

const prevAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevAll();spotDNA.render(this);return out;};

document.addEventListener('click',e=>{
  if(e.target.closest('#spotDNAUseBtn')){spotDNA.useAsDestination(app);return;}
  if(e.target.closest('#spotDNARouteBtn')){spotDNA.route(app);return;}
  if(e.target.closest('#spotDNASaveBtn')){spotDNA.save(app);return;}
  const shop=e.target.closest('[data-dna-shop]');
  if(shop){
    const r=spotDNA.ensureState(app).result;
    const s=r?.shops?.find(x=>x.name===shop.dataset.dnaShop);
    if(s)window.open(app.mapsUrl(s.lat,s.lon,s.name),'_blank','noopener');
  }
});

spotDNA.ensureState(app);
if(app.state.map)spotDNA.bindMap(app);
spotDNA.render(app);
})();