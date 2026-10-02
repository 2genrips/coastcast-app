(function(){
'use strict';

const Atlas={
  version:'7.4.0',
  layer:null,

  app(){return window.CastVector;},

  ensureState(app){
    if(!app.state.patternAtlas) app.state.patternAtlas={species:'all',mapVisible:false,selectedId:null};
    return app.state.patternAtlas;
  },

  validCatches(app){
    return (app.state.catches||[]).filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lon)));
  },

  recencyWeight(date){
    const age=Math.max(0,(Date.now()-new Date(date||0).getTime())/86400000);
    if(age<=30)return 1;
    if(age<=90)return .9;
    if(age<=180)return .78;
    if(age<=365)return .66;
    return .52;
  },

  catchTime(app,c){
    return app.catchTimeBucket?.(c.date)||'Unknown';
  },

  catchTide(app,c){
    return app.catchTide?.(c)||c.conditionData?.tide||'Unknown';
  },

  cluster(app){
    const state=this.ensureState(app),all=this.validCatches(app);
    const catches=state.species==='all'?all:all.filter(c=>c.species===state.species);
    const clusters=[],radius=.32;

    catches.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(c=>{
      const lat=Number(c.lat),lon=Number(c.lon);
      let best=null,bestD=Infinity;
      for(const z of clusters){
        const d=app.haversine(lat,lon,z.lat,z.lon);
        if(d<=radius&&d<bestD){best=z;bestD=d;}
      }
      if(!best){
        best={id:'zone-'+clusters.length+'-'+Math.round(lat*1000)+'-'+Math.round(lon*1000),lat,lon,catches:[]};
        clusters.push(best);
      }
      best.catches.push(c);
      const n=best.catches.length;
      best.lat=((best.lat*(n-1))+lat)/n;best.lon=((best.lon*(n-1))+lon)/n;
    });

    return clusters.map(z=>this.summarize(app,z)).sort((a,b)=>b.patternScore-a.patternScore);
  },

  summarize(app,z){
    const cs=z.catches||[],speciesCounts={},baitCounts={},tideCounts={},timeCounts={},sessionIds=new Set();
    let weighted=0,weights=0,scoreSum=0,scoreN=0,depths=[];
    cs.forEach(c=>{
      speciesCounts[c.species]=(speciesCounts[c.species]||0)+1;
      const bait=String(c.bait||'').trim();if(bait)baitCounts[bait]=(baitCounts[bait]||0)+1;
      const tide=this.catchTide(app,c);if(tide&&tide!=='Unknown')tideCounts[tide]=(tideCounts[tide]||0)+1;
      const time=this.catchTime(app,c);if(time&&time!=='Unknown')timeCounts[time]=(timeCounts[time]||0)+1;
      if(c.sessionId)sessionIds.add(c.sessionId);
      const w=this.recencyWeight(c.date);weighted+=w;weights++;
      if(Number.isFinite(Number(c.score))){scoreSum+=Number(c.score);scoreN++;}
      const d=Number(c.depthDNA?.center?.depthFeet??c.depthDNA?.depthFeet);
      if(Number.isFinite(d))depths.push(d);
    });
    const mode=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
    const latest=cs.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    const avgScore=scoreN?Math.round(scoreSum/scoreN):null;
    const recency=weights?weighted/weights:0;
    const repeat=Math.min(1,cs.length/6);
    const sessions=Math.max(1,sessionIds.size);
    const sessionSignal=Math.min(1,sessions/3);
    const quality=avgScore==null?.65:Math.max(.35,Math.min(1,avgScore/100));
    const patternScore=Math.round(Math.min(99,45+repeat*22+recency*14+sessionSignal*8+quality*10));
    const confidence=cs.length>=6?'HIGH':cs.length>=3?'MEDIUM':'LEARNING';
    const topSpecies=mode(speciesCounts),topBait=mode(baitCounts),bestTide=mode(tideCounts),bestTime=mode(timeCounts);
    const avgDepth=depths.length?depths.reduce((a,b)=>a+b,0)/depths.length:null;
    const label=latest?.location&&latest.location!=='Current location'?latest.location:'Private catch zone';
    return{
      ...z,label,patternScore,confidence,catchCount:cs.length,sessionCount:sessions,
      topSpecies,topBait,bestTide,bestTime,avgScore,avgDepth,
      latestDate:latest?.date||null,speciesCounts,baitCounts
    };
  },

  allSpecies(app){
    const set=[...new Set(this.validCatches(app).map(c=>c.species).filter(Boolean))];
    return set.sort();
  },

  install(){
    const app=this.app();if(!app)return;
    this.ensureState(app);
    this.installLogbook(app);
    this.installMap(app);
    this.patchCatchSave(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
  },

  installLogbook(app){
    const view=document.getElementById('view-logbook');if(!view||document.getElementById('patternAtlasPanel'))return;
    const panel=document.createElement('section');
    panel.id='patternAtlasPanel';panel.className='panel pattern-atlas-panel';
    panel.innerHTML=
      '<div class="atlas-head"><div><div class="eyebrow">PATTERN ATLAS • PRIVATE HOTSPOTS 7.4</div><h2>Your own fishing map gets smarter every trip</h2></div><span id="atlasBadge" class="atlas-badge">PRIVATE</span></div>'+
      '<p class="atlas-note">CastVector groups your saved catch coordinates into private productive zones. Nothing here is published to Community unless you explicitly share a catch separately.</p>'+
      '<div class="atlas-toolbar"><select id="atlasSpeciesFilter" class="select-control"><option value="all">All species</option></select><button id="atlasMapToggle" class="secondary-button small" type="button">Show hotspots on map</button></div>'+
      '<div id="atlasHero" class="atlas-hero"></div>'+
      '<div id="atlasZones" class="atlas-zones"></div>';
    const insight=view.querySelector('.catch-intelligence-panel')||view.querySelector('.stats-grid');
    if(insight)insight.after(panel);else view.appendChild(panel);
  },

  installMap(app){
    const view=document.getElementById('view-map');if(!view)return;
    const nav=document.getElementById('map7Nav');
    if(nav&&!nav.querySelector('[data-map7-tool="patterns"]')){
      const b=document.createElement('button');b.className='map7-chip';b.type='button';b.dataset.map7Tool='patterns';b.textContent='Patterns';
      nav.appendChild(b);
    }
    let panel=document.getElementById('atlasMapPanel');
    if(!panel){
      panel=document.createElement('section');panel.id='atlasMapPanel';panel.className='panel atlas-map-panel map7-secondary';panel.hidden=true;
      panel.innerHTML='<div class="atlas-head"><div><div class="eyebrow">PRIVATE PATTERN MAP</div><h2>Productive water from your own logbook</h2></div><span class="atlas-badge">PRIVATE</span></div><div id="atlasMapSummary" class="atlas-map-summary"></div><div id="atlasMapList" class="atlas-map-list"></div>';
      const hero=document.querySelector('#view-map .map7-hero');if(hero)hero.after(panel);else view.appendChild(panel);
    }
    const E=window.CastVectorExploreFeed;
    if(E&&Array.isArray(E.mapTools)&&!E.mapTools.some(x=>x[0]==='patterns'))E.mapTools.push(['patterns',panel]);
  },

  patchCatchSave(app){
    if(app._atlasCatchPatched)return;app._atlasCatchPatched=true;
    const old=app.saveCatch?.bind(app);if(!old)return;
    app.saveCatch=function(){
      const before=new Set((this.state.catches||[]).map(c=>c.id));
      const out=old();
      const c=(this.state.catches||[]).find(x=>!before.has(x.id));
      if(c)Atlas.enrichDepth(this,c);
      Atlas.render(this);
      Atlas.renderMapLayer(this);
      return out;
    };
  },

  async enrichDepth(app,c){
    const D=window.CastVectorDepthIntel;
    if(!D||!Number.isFinite(Number(c.lat))||!Number.isFinite(Number(c.lon))||c.depthDNA)return;
    try{
      const center=await D.sample(app,Number(c.lat),Number(c.lon));
      if(center?.underwater){
        c.depthDNA={center,depthFeet:center.depthFeet,source:'NOAA/NCEI BAG'};
        app.save?.();this.render(app);
      }
    }catch(_){}
  },

  patchRenders(app){
    const log=app.renderLogbook?.bind(app);
    if(log)app.renderLogbook=function(){const out=log();Atlas.render(this);return out;};
    const map=app.renderMapLayers?.bind(app);
    if(map)app.renderMapLayers=function(){const out=map();setTimeout(()=>Atlas.renderMapLayer(this),0);return out;};
  },

  render(app){
    const state=this.ensureState(app),zones=this.cluster(app),species=this.allSpecies(app);
    const filter=document.getElementById('atlasSpeciesFilter');
    if(filter){
      const value=state.species;
      filter.innerHTML='<option value="all">All species</option>'+species.map(s=>'<option value="'+app.escape(s)+'">'+app.escape(s)+'</option>').join('');
      filter.value=species.includes(value)||value==='all'?value:'all';
    }
    const hero=document.getElementById('atlasHero'),box=document.getElementById('atlasZones');
    if(hero){
      if(!zones.length){
        hero.innerHTML='<div class="atlas-empty"><strong>No private hotspots yet.</strong><span>Log catches with location data or use Track My Water. CastVector will build your Pattern Atlas automatically.</span></div>';
      }else{
        const z=zones[0];
        hero.innerHTML='<div class="atlas-hero-score"><strong>'+z.patternScore+'</strong><span>BEST ZONE</span></div><div class="atlas-hero-copy"><strong>'+app.escape(z.label)+'</strong><span>'+z.catchCount+' catches • '+z.sessionCount+' trip'+(z.sessionCount===1?'':'s')+' • '+app.escape(z.confidence)+' confidence</span><small>'+app.escape(z.topSpecies)+' • '+app.escape(z.topBait)+' • '+app.escape(z.bestTide)+' • '+app.escape(z.bestTime)+(z.avgDepth!=null?' • avg '+Math.round(z.avgDepth)+' ft depth':'')+'</small></div><button class="primary-button small" type="button" data-atlas-analyze="'+app.escape(z.id)+'">Analyze now</button>';
      }
    }
    if(box){
      box.innerHTML=zones.length?zones.slice(0,12).map((z,i)=>this.zoneCard(app,z,i)).join(''):'';
    }
    const summary=document.getElementById('atlasMapSummary');
    if(summary)summary.textContent=zones.length?zones.length+' private productive zone'+(zones.length===1?'':'s')+' built from '+zones.reduce((n,z)=>n+z.catchCount,0)+' located catches.':'Log located catches to build private hotspots.';
    const mapList=document.getElementById('atlasMapList');
    if(mapList)mapList.innerHTML=zones.length?zones.slice(0,8).map((z,i)=>this.zoneRow(app,z,i)).join(''):'<div class="empty-state">No private hotspots yet.</div>';
    const toggle=document.getElementById('atlasMapToggle');
    if(toggle)toggle.textContent=state.mapVisible?'Hide hotspots from map':'Show hotspots on map';
  },

  zoneCard(app,z,i){
    return '<article class="atlas-zone-card">'+
      '<div class="atlas-zone-top"><div><span class="atlas-zone-kicker">ZONE '+(i+1)+' • '+app.escape(z.confidence)+'</span><strong>'+app.escape(z.label)+'</strong></div><div class="atlas-zone-score">'+z.patternScore+'</div></div>'+
      '<div class="atlas-zone-metrics"><div><span>CATCHES</span><strong>'+z.catchCount+'</strong></div><div><span>TOP SPECIES</span><strong>'+app.escape(z.topSpecies)+'</strong></div><div><span>BAIT</span><strong>'+app.escape(z.topBait)+'</strong></div><div><span>TIDE</span><strong>'+app.escape(z.bestTide)+'</strong></div><div><span>TIME</span><strong>'+app.escape(z.bestTime)+'</strong></div><div><span>AVG SCORE</span><strong>'+(z.avgScore??'—')+'</strong></div></div>'+
      '<div class="atlas-zone-actions"><button class="primary-button small" type="button" data-atlas-analyze="'+app.escape(z.id)+'">Analyze today</button><button class="secondary-button small" type="button" data-atlas-map="'+app.escape(z.id)+'">Open on map</button></div>'+
      '</article>';
  },

  zoneRow(app,z,i){
    return '<button type="button" class="atlas-map-row" data-atlas-map="'+app.escape(z.id)+'"><span>#'+(i+1)+'</span><div><strong>'+app.escape(z.label)+'</strong><small>'+z.catchCount+' catches • '+app.escape(z.topSpecies)+' • '+app.escape(z.topBait)+'</small></div><b>'+z.patternScore+'</b></button>';
  },

  findZone(app,id){return this.cluster(app).find(z=>String(z.id)===String(id));},

  analyze(app,id){
    const z=this.findZone(app,id);if(!z)return;
    app.state.location={key:'pattern-atlas',name:z.label,lat:z.lat,lon:z.lon,source:'Private Pattern Atlas'};
    app.state.targetSpecies=z.topSpecies&&app.species?.[z.topSpecies]?z.topSpecies:app.state.targetSpecies;
    app.onLocationChanged?.();
    app.navigate?.('map');
    setTimeout(()=>{
      app.ensureMap?.();app.state.map?.setView([z.lat,z.lon],15);
      window.CastVectorSpotDNA?.analyze?.(app,z.lat,z.lon,z.label);
    },220);
    app.showToast?.('Private hotspot loaded with today’s live intelligence.');
  },

  openMap(app,id){
    const z=this.findZone(app,id);if(!z)return;
    this.ensureState(app).mapVisible=true;app.save?.();
    app.navigate?.('map');
    setTimeout(()=>{app.ensureMap?.();app.state.map?.setView([z.lat,z.lon],15);this.renderMapLayer(app);},180);
  },

  renderMapLayer(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(this.layer){try{map.removeLayer(this.layer);}catch(_){}this.layer=null;}
    const st=this.ensureState(app);if(!st.mapVisible)return;
    const zones=this.cluster(app);if(!zones.length)return;
    const group=L.layerGroup();
    zones.slice(0,20).forEach((z,i)=>{
      const radius=Math.max(180,Math.min(650,180+z.catchCount*65));
      const circle=L.circle([z.lat,z.lon],{radius,weight:2,fillOpacity:.11,opacity:.75});
      circle.bindPopup('<div class="cc-popup"><strong>'+app.escape(z.label)+'</strong><br><span>Private Pattern Zone • '+z.catchCount+' catches</span><br><b>'+z.patternScore+'/100 pattern strength</b><br><small>'+app.escape(z.topSpecies)+' • '+app.escape(z.topBait)+' • '+app.escape(z.bestTide)+'</small></div>');
      circle.addTo(group);
      L.marker([z.lat,z.lon],{icon:app.markerIcon('saved',String(i+1))}).bindPopup('<strong>'+app.escape(z.label)+'</strong><br>Private hotspot • '+z.patternScore+'/100').addTo(group);
    });
    group.addTo(map);this.layer=group;
  },

  bind(app){
    document.addEventListener('change',e=>{
      if(e.target.id==='atlasSpeciesFilter'){
        const s=this.ensureState(app);s.species=e.target.value||'all';app.save?.();this.render(app);this.renderMapLayer(app);
      }
    });
    document.addEventListener('click',e=>{
      const a=e.target.closest('[data-atlas-analyze]');if(a){this.analyze(app,a.dataset.atlasAnalyze);return;}
      const m=e.target.closest('[data-atlas-map]');if(m){this.openMap(app,m.dataset.atlasMap);return;}
      if(e.target.closest('#atlasMapToggle')){
        const s=this.ensureState(app);s.mapVisible=!s.mapVisible;app.save?.();this.render(app);
        if(s.mapVisible){app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();this.renderMapLayer(app);},150);}
        else this.renderMapLayer(app);
      }
    });
  }
};

window.CastVectorPatternAtlas=Atlas;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>Atlas.install());else Atlas.install();
})();