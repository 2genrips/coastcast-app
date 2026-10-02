(function(){
'use strict';

const waterIntel={
  version:'6.2.0',
  cacheMs:24*60*60*1000,
  debounceMs:950,

  ensureState(app){
    if(!app.state.waterIntel) app.state.waterIntel={status:'idle',structures:[],stations:[],lastKey:null,lastScan:null};
    if(!Array.isArray(app.state.waterIntel.structures)) app.state.waterIntel.structures=[];
    if(!Array.isArray(app.state.waterIntel.stations)) app.state.waterIntel.stations=[];
    return app.state.waterIntel;
  },

  viewportKey(map){
    const c=map.getCenter(),z=map.getZoom();
    return [Number(c.lat).toFixed(2),Number(c.lng).toFixed(2),z].join(':');
  },

  boundsBox(map){
    const b=map.getBounds();
    return [b.getSouth(),b.getWest(),b.getNorth(),b.getEast()];
  },

  async stationCatalog(app){
    const key='castvector-noaa-stations-v62';
    try{
      const raw=localStorage.getItem(key);
      if(raw){
        const v=JSON.parse(raw);
        if(v&&Date.now()-Number(v.savedAt||0)<this.cacheMs&&Array.isArray(v.items))return v.items;
      }
    }catch(_){}
    const types=['waterlevels','tidepredictions','currents','currentpredictions'];
    const out=[],seen=new Set();
    for(const type of types){
      try{
        const url='https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type='+encodeURIComponent(type);
        const data=await app.fetchJSON(url,12000);
        const rows=data?.stations||data?.stationList||[];
        for(const s of rows){
          const lat=Number(s.lat),lon=Number(s.lng??s.lon);
          if(!s.id||!Number.isFinite(lat)||!Number.isFinite(lon))continue;
          const k=String(s.id);
          const existing=out.find(x=>x.id===k);
          const label=type==='currents'?'Current observation':type==='currentpredictions'?'Current prediction':type==='waterlevels'?'Water-level observation':'Tide prediction';
          if(existing){
            if(!existing.types.includes(label))existing.types.push(label);
          }else{
            out.push({id:k,name:s.name||('NOAA '+k),lat,lon,types:[label],source:'NOAA CO-OPS'});
            seen.add(k);
          }
        }
      }catch(_){}
    }
    try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),items:out}));}catch(_){}
    return out;
  },

  filterStationsToMap(map,stations){
    const b=map.getBounds();
    return stations.filter(s=>b.pad(.12).contains([s.lat,s.lon])).slice(0,60);
  },

  structureQuery(map){
    const [s,w,n,e]=this.boundsBox(map).map(x=>Number(x).toFixed(6));
    const box=[s,w,n,e].join(',');
    return '[out:json][timeout:18];('+
      'nwr('+box+')[man_made="breakwater"];'+
      'nwr('+box+')[man_made="groyne"];'+
      'nwr('+box+')[natural="reef"];'+
      'nwr('+box+')['+'"'+'seamark:type'+'"'+='+"="+']["seamark:type"="wreck"];'+
      'nwr('+box+')['+'"'+'seamark:type'+'"'+='+"="+']["seamark:type"="obstruction"];'+
      'nwr('+box+')[historic="wreck"];'+
    ');out center tags;';
  },

  structureType(t){
    if(t.man_made==='breakwater')return'Breakwater';
    if(t.man_made==='groyne')return'Groyne';
    if(t.natural==='reef')return'Reef';
    if(t.historic==='wreck'||t['seamark:type']==='wreck')return'Wreck';
    if(t['seamark:type']==='obstruction')return'Obstruction';
    return'Fishing structure';
  },

  async loadStructures(app,map){
    const query=this.structureQuery(map),out=[];
    for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter']){
      try{
        const data=await app.fetchOverpass(endpoint,query,10000);
        for(const e of (data?.elements||[])){
          const t=e.tags||{},lat=Number(e.lat??e.center?.lat),lon=Number(e.lon??e.center?.lon);
          if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
          const type=this.structureType(t),name=String(t.name||type).trim();
          const id='water-'+String(e.type||'x')+'-'+String(e.id);
          out.push({
            id,name,type,lat,lon,
            source:'OpenStreetMap mapped structure',
            fishingAccess:false,
            note:'Mapped water/shore structure. Access, safety and fishing legality are not implied.',
            tags:t
          });
        }
        break;
      }catch(_){}
    }
    const clean=[];
    for(const p of out){
      if(clean.some(x=>app.haversine(x.lat,x.lon,p.lat,p.lon)<0.03&&x.type===p.type))continue;
      clean.push(p);
    }
    return clean.slice(0,100);
  },

  async scan(app,{force=false}={}){
    const map=app.state.map;if(!map)return;
    const state=this.ensureState(app),key=this.viewportKey(map);
    if(!force&&state.lastKey===key&&state.status!=='error')return;
    if(map.getZoom()<9){state.status='zoom';this.renderPanel(app);return;}
    state.lastKey=key;state.status='loading';this.renderPanel(app);
    try{
      const [catalog,structures]=await Promise.all([
        this.stationCatalog(app),
        this.loadStructures(app,map)
      ]);
      state.stations=this.filterStationsToMap(map,catalog);
      state.structures=structures;
      state.status='live';state.lastScan=new Date().toISOString();
    }catch(_){state.status='error';}
    this.renderPanel(app);this.renderLayers(app);
  },

  bind(app){
    const map=app.state.map;if(!map||map._castVectorWaterIntelBound)return;
    map._castVectorWaterIntelBound=true;
    let timer=null;
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>this.scan(app),this.debounceMs);};
    map.on('moveend',schedule);
    map.on('zoomend',schedule);
    setTimeout(()=>this.scan(app),500);
  },

  sourceSummary(app){
    const d=app.state.data?.current||{},o=app.state.oceanNetwork||{};
    return {
      water:Number.isFinite(Number(d.waterTemp))?app.fmt(d.waterTemp,0)+'°F':'—',
      wave:Number.isFinite(Number(d.waveHeight))?app.fmt(d.waveHeight,1)+' ft':'—',
      period:Number.isFinite(Number(d.wavePeriod))?app.fmt(d.wavePeriod,0)+' sec':'—',
      tide:app.currentTideLabel?.()||'—',
      buoy:o.station?.name||app.state.selectedTideStation?.name||'Nearest loaded station'
    };
  },

  renderPanel(app){
    const state=this.ensureState(app),box=app.$('waterIntelPanel');if(!box)return;
    const s=this.sourceSummary(app);
    app.$('waterIntelBadge').textContent=state.status==='live'?'LIVE MAP':state.status==='loading'?'SCANNING':state.status==='zoom'?'ZOOM IN':state.status==='error'?'SOURCE ISSUE':'READY';
    app.$('waterIntelStructures').textContent=String(state.structures.length);
    app.$('waterIntelStations').textContent=String(state.stations.length);
    app.$('waterIntelTemp').textContent=s.water;
    app.$('waterIntelWave').textContent=s.wave;
    app.$('waterIntelPeriod').textContent=s.period;
    app.$('waterIntelTide').textContent=s.tide;
    app.$('waterIntelStationName').textContent=s.buoy;
    app.$('waterIntelStructureList').innerHTML=state.structures.length?state.structures.slice(0,6).map(x=>'<div class="water-intel-row"><span>'+app.escape(x.type)+'</span><strong>'+app.escape(x.name)+'</strong><small>'+app.escape(x.note)+'</small></div>').join(''):'<div class="empty-state">Pan or zoom the map to scan mapped structures.</div>';
    app.$('waterIntelStationList').innerHTML=state.stations.length?state.stations.slice(0,6).map(x=>'<button type="button" class="water-intel-station-row" data-water-station="'+app.escape(x.id)+'"><span>NOAA '+app.escape(x.id)+'</span><strong>'+app.escape(x.name)+'</strong><small>'+app.escape(x.types.join(' • '))+'</small></button>').join(''):'<div class="empty-state">No NOAA station is inside this map view.</div>';
  },

  markerIcon(app,kind,label){
    return app.markerIcon(kind,label);
  },

  renderLayers(app){
    const map=app.state.map;if(!map||!window.L)return;
    const state=this.ensureState(app);
    for(const layer of (app.state.mapLayers.waterintel||[])){try{map.removeLayer(layer);}catch(_){}}
    app.state.mapLayers.waterintel=[];
    const filter=app.state.mapFilter||'all';
    const showStructures=filter==='all'||filter==='structure';
    const showStations=filter==='all'||filter==='stations';
    if(showStructures){
      for(const p of state.structures){
        const abbr=p.type==='Breakwater'?'BW':p.type==='Groyne'?'G':p.type==='Reef'?'RF':p.type==='Wreck'?'W':'!';
        const popup='<div class="cc-popup"><strong>'+app.escape(p.name)+'</strong><br><span>'+app.escape(p.type)+'</span><br><small>Mapped structure • not verified public access</small></div>';
        const m=L.marker([p.lat,p.lon],{icon:this.markerIcon(app,'structure',abbr)}).bindPopup(popup);
        m.addTo(map);app.state.mapLayers.waterintel.push(m);
      }
    }
    if(showStations){
      for(const s of state.stations){
        const popup='<div class="cc-popup"><strong>'+app.escape(s.name)+'</strong><br><span>NOAA CO-OPS '+app.escape(s.id)+'</span><br><small>'+app.escape(s.types.join(' • '))+'</small></div>';
        const m=L.marker([s.lat,s.lon],{icon:this.markerIcon(app,'station','N')}).bindPopup(popup);
        m.addTo(map);app.state.mapLayers.waterintel.push(m);
      }
    }
  },

  openStation(app,id){
    const s=this.ensureState(app).stations.find(x=>String(x.id)===String(id));if(!s)return;
    window.open('https://tidesandcurrents.noaa.gov/stationhome.html?id='+encodeURIComponent(s.id),'_blank','noopener');
  },

  refresh(app){this.scan(app,{force:true});}
};

window.CastVectorWaterIntel=waterIntel;
const app=window.CastVector;if(!app)return;

const originalEnsure=app.ensureMap.bind(app);
app.ensureMap=function(){
  const out=originalEnsure();
  setTimeout(()=>waterIntel.bind(this),0);
  return out;
};

const originalRenderMap=app.renderMapLayers.bind(app);
app.renderMapLayers=function(){
  const out=originalRenderMap();
  setTimeout(()=>waterIntel.renderLayers(this),0);
  return out;
};

const originalFilter=app.applyMapFilter.bind(app);
app.applyMapFilter=function(){
  const out=originalFilter();
  setTimeout(()=>waterIntel.renderLayers(this),0);
  return out;
};

const prevAll=app.renderAll.bind(app);
app.renderAll=function(){const out=prevAll();waterIntel.renderPanel(this);return out;};

document.addEventListener('click',e=>{
  const st=e.target.closest('[data-water-station]');
  if(st){waterIntel.openStation(app,st.dataset.waterStation);return;}
  if(e.target.closest('#waterIntelRefresh')){waterIntel.refresh(app);return;}
});

waterIntel.ensureState(app);
if(app.state.map)waterIntel.bind(app);
waterIntel.renderPanel(app);
})();