(function(){
'use strict';

const Depth={
  version:'7.3.0',
  BAG:'https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_bathymetry/ImageServer',
  ETOPO:'https://gis.ngdc.noaa.gov/arcgis/rest/services/etopo1/MapServer',
  overlay:null,
  relief:null,
  refreshTimer:null,
  enabled:false,
  mode:'survey',
  lastPoint:null,
  lastResult:null,

  app(){return window.CastVector;},

  ensureState(app){
    if(!app.state.depthIntel) app.state.depthIntel={enabled:false,mode:'survey',status:'idle',point:null,result:null,lastUpdate:null};
    return app.state.depthIntel;
  },

  setup(){
    const app=this.app();if(!app)return;
    this.ensureState(app);
    this.installUI(app);
    this.patchMap(app);
    this.patchSpotDNA(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const view=document.getElementById('view-map');if(!view)return;
    const nav=document.getElementById('map7Nav');
    if(nav&&!nav.querySelector('[data-map7-tool="depth"]')){
      const b=document.createElement('button');
      b.className='map7-chip';b.type='button';b.dataset.map7Tool='depth';b.textContent='Depth';
      nav.insertBefore(b,nav.querySelector('[data-map7-tool="data"]')||null);
    }

    let panel=document.getElementById('depthIntelPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='depthIntelPanel';
      panel.className='panel depth-intel-panel map7-secondary';
      panel.hidden=true;
      panel.innerHTML=
        '<div class="depth-head"><div><div class="eyebrow">DEPTH INTELLIGENCE • NOAA 7.3</div><h2>Read the bottom, not just the weather</h2></div><span id="depthIntelBadge" class="depth-badge">READY</span></div>'+
        '<p class="depth-note">High-resolution NOAA survey bathymetry appears where BAG coverage exists. Tap the map to read exact surveyed depth and nearby bottom change. Coverage varies by area and is not a substitute for official navigation charts.</p>'+
        '<div class="depth-controls">'+
          '<button id="depthSurveyToggle" class="primary-button small" type="button">Show NOAA HD depth</button>'+
          '<button id="depthReliefToggle" class="secondary-button small" type="button">Show broad relief</button>'+
          '<button id="depthHideBtn" class="ghost-button small" type="button">Hide depth</button>'+
        '</div>'+
        '<div class="depth-metrics">'+
          '<article><span>SURVEYED DEPTH</span><strong id="depthExact">—</strong><small id="depthExactMeta">Tap mapped water</small></article>'+
          '<article><span>DEPTH CHANGE</span><strong id="depthChange">—</strong><small>Nearby sampled change</small></article>'+
          '<article><span>BOTTOM SHAPE</span><strong id="depthTerrain">—</strong><small id="depthTerrainMeta">NOAA survey analysis</small></article>'+
          '<article><span>SURVEY</span><strong id="depthSurvey">—</strong><small id="depthSurveyMeta">Coverage varies</small></article>'+
        '</div>'+
        '<div id="depthDNA" class="depth-dna"><strong>Depth DNA is waiting for a map point.</strong><span>Tap water on the Explore map to analyze bottom terrain.</span></div>'+
        '<div class="depth-source-note">Source: NOAA/NCEI bathymetry services. Surveyed depths and relief are planning context only—not a navigation product.</div>';
      const mapPanel=document.querySelector('#view-map .map7-hero')||document.getElementById('leafletMap')?.closest('.map-panel');
      if(mapPanel)mapPanel.after(panel);else view.appendChild(panel);
    }

    const E=window.CastVectorExploreFeed;
    if(E&&Array.isArray(E.mapTools)&&!E.mapTools.some(x=>x[0]==='depth')) E.mapTools.push(['depth',panel]);
  },

  patchMap(app){
    const original=app.ensureMap?.bind(app);
    if(!original||app._depthMapPatched)return;
    app._depthMapPatched=true;
    app.ensureMap=function(){
      const out=original();
      setTimeout(()=>Depth.bindMap(this),0);
      return out;
    };
    if(app.state.map)this.bindMap(app);
  },

  bindMap(app){
    const map=app.state.map;if(!map||map._depthIntelBound)return;
    map._depthIntelBound=true;
    map.on('moveend zoomend',()=>{if(Depth.enabled)Depth.scheduleOverlay(app);});
    if(!window.CastVectorSpotDNA){
      map.on('click',e=>{
        if(!e?.latlng)return;
        Depth.lastPoint={lat:e.latlng.lat,lon:e.latlng.lng};
        Depth.analyze(app,e.latlng.lat,e.latlng.lng);
      });
    }
  },

  exportUrl(bounds,mode='survey'){
    const west=bounds.getWest(),south=bounds.getSouth(),east=bounds.getEast(),north=bounds.getNorth();
    const size='1200,900';
    if(mode==='relief'){
      const q=new URLSearchParams({
        bbox:[west,south,east,north].join(','),bboxSR:'4326',imageSR:'4326',size,
        format:'png32',transparent:'true',layers:'show:0',f:'image'
      });
      return this.ETOPO+'/export?'+q.toString();
    }
    const q=new URLSearchParams({
      bbox:[west,south,east,north].join(','),bboxSR:'4326',imageSR:'4326',size,
      format:'png32',transparent:'true',f:'image',
      renderingRule:JSON.stringify({rasterFunction:'ColorHillshadeBAG'})
    });
    return this.BAG+'/exportImage?'+q.toString();
  },

  showOverlay(app,mode='survey'){
    const map=app.state.map;if(!map||!window.L)return;
    this.enabled=true;this.mode=mode;
    const st=this.ensureState(app);st.enabled=true;st.mode=mode;
    this.refreshOverlay(app);
    this.render(app);
  },

  hideOverlay(app){
    const map=app.state.map;
    for(const layer of [this.overlay,this.relief])if(layer&&map){try{map.removeLayer(layer);}catch(_){}}
    this.overlay=null;this.relief=null;this.enabled=false;
    const st=this.ensureState(app);st.enabled=false;st.status='idle';
    this.render(app);
  },

  scheduleOverlay(app){
    clearTimeout(this.refreshTimer);
    this.refreshTimer=setTimeout(()=>this.refreshOverlay(app),500);
  },

  refreshOverlay(app){
    const map=app.state.map;if(!map||!window.L||!this.enabled)return;
    const bounds=map.getBounds(),url=this.exportUrl(bounds,this.mode);
    const ll=[[bounds.getSouth(),bounds.getWest()],[bounds.getNorth(),bounds.getEast()]];
    if(this.mode==='relief'){
      if(this.overlay){try{map.removeLayer(this.overlay);}catch(_){}this.overlay=null;}
      if(this.relief){try{map.removeLayer(this.relief);}catch(_){}}
      this.relief=L.imageOverlay(url,ll,{opacity:.62,interactive:false,crossOrigin:true}).addTo(map);
    }else{
      if(this.relief){try{map.removeLayer(this.relief);}catch(_){}this.relief=null;}
      if(this.overlay){try{map.removeLayer(this.overlay);}catch(_){}}
      this.overlay=L.imageOverlay(url,ll,{opacity:.72,interactive:false,crossOrigin:true}).addTo(map);
    }
    const st=this.ensureState(app);st.status='live';st.lastUpdate=new Date().toISOString();
    this.render(app);
  },

  identifyUrl(lat,lon){
    const geometry=JSON.stringify({x:Number(lon),y:Number(lat),spatialReference:{wkid:4326}});
    const q=new URLSearchParams({
      geometry,geometryType:'esriGeometryPoint',returnGeometry:'false',
      returnCatalogItems:'true',returnAllPixelValues:'true',f:'json'
    });
    return this.BAG+'/identify?'+q.toString();
  },

  parseIdentify(data){
    if(!data||data.error)return null;
    const rawCandidates=[];
    if(data.value!=null)rawCandidates.push(data.value);
    if(Array.isArray(data.values))rawCandidates.push(...data.values);
    if(Array.isArray(data.properties?.Values))rawCandidates.push(...data.properties.Values);
    if(data.pixel&&data.pixel.value!=null)rawCandidates.push(data.pixel.value);
    let raw=null;
    for(const v of rawCandidates){
      const n=Number(Array.isArray(v)?v[0]:v);
      if(Number.isFinite(n)&&n>-12000&&n<1000){raw=n;break;}
    }
    if(!Number.isFinite(raw))return null;
    const attrs=data.catalogItems?.features?.[0]?.attributes||data.catalogItems?.[0]?.attributes||{};
    const underwater=raw<0;
    return{
      rawMeters:raw,
      depthMeters:underwater?Math.abs(raw):null,
      depthFeet:underwater?Math.abs(raw)*3.28084:null,
      underwater,
      surveyId:attrs.SurveyID||attrs.Name||attrs.ProductName||'NOAA BAG',
      product:attrs.ProductName||attrs.GroupName||'Bathymetric survey'
    };
  },

  async sample(app,lat,lon){
    try{
      const data=await app.fetchJSON(this.identifyUrl(lat,lon),9000);
      return this.parseIdentify(data);
    }catch(_){return null;}
  },

  async analyze(app,lat,lon){
    const st=this.ensureState(app);st.status='loading';st.point={lat,lon};this.render(app);
    const delta=0.0015;
    const pts=[[lat,lon],[lat+delta,lon],[lat-delta,lon],[lat,lon+delta],[lat,lon-delta]];
    const values=await Promise.all(pts.map(p=>this.sample(app,p[0],p[1])));
    const center=values[0],valid=values.filter(v=>v?.underwater&&Number.isFinite(v.depthFeet));
    let change=null,terrain='No NOAA survey',note='Detailed BAG coverage is not available at this point.';
    if(valid.length){
      const depths=valid.map(v=>v.depthFeet),min=Math.min(...depths),max=Math.max(...depths);
      change=max-min;
      const centerDepth=center?.depthFeet??app.average(depths);
      const neighbors=values.slice(1).filter(v=>v?.underwater&&Number.isFinite(v.depthFeet)).map(v=>v.depthFeet);
      const avgN=neighbors.length?app.average(neighbors):centerDepth;
      if(change<3){terrain='Flat / uniform';note='Nearby surveyed samples show little depth change.';}
      else if(change<8){terrain='Gradual slope';note='Nearby surveyed samples show moderate depth transition.';}
      else if(centerDepth>avgN+4){terrain='Depression / hole';note='The center sample is notably deeper than nearby surveyed samples.';}
      else if(centerDepth<avgN-4){terrain='High spot / hump';note='The center sample is notably shallower than nearby surveyed samples.';}
      else {terrain='Sharp depth change';note='Nearby surveyed samples show a strong depth break or slope.';}
    }
    const result={
      center,changeFeet:Number.isFinite(change)?change:null,terrain,note,
      samples:valid.length,lat,lon,source:'NOAA/NCEI BAG bathymetry'
    };
    this.lastPoint={lat,lon};this.lastResult=result;
    st.result=result;st.status=center||valid.length?'ready':'no-coverage';st.lastUpdate=new Date().toISOString();
    this.render(app);this.updateSpotDNA(app,result);
    return result;
  },

  updateSpotDNA(app,result){
    const r=app.state.spotDNA?.result;if(!r)return;
    r.depthDNA=result;
    const summary=document.getElementById('spotDNASummary');
    if(summary&&result?.center?.depthFeet){
      const depth=Math.round(result.center.depthFeet);
      summary.textContent=(r.access?.verified?'Mapped access signal nearby. ':'Access is not verified for this exact point. ')+
        'NOAA surveyed depth is about '+depth+' ft here • '+result.terrain+'.';
    }
  },

  patchSpotDNA(app){
    const d=window.CastVectorSpotDNA;if(!d||d._depthPatched)return;
    d._depthPatched=true;
    const old=d.analyze?.bind(d);
    if(old)d.analyze=async function(a,lat,lon,label){
      const res=await old(a,lat,lon,label);
      Depth.analyze(a,lat,lon);
      return res;
    };
  },

  depthText(ft){return Number.isFinite(ft)?(ft<10?ft.toFixed(1):Math.round(ft))+' ft':'—';},

  render(app){
    const panel=document.getElementById('depthIntelPanel');if(!panel)return;
    const st=this.ensureState(app),r=st.result;
    const badge=document.getElementById('depthIntelBadge');
    badge.textContent=st.status==='loading'?'READING':st.status==='ready'?'SURVEY DATA':st.status==='no-coverage'?'NO HD COVERAGE':this.enabled?(this.mode==='survey'?'HD DEPTH ON':'RELIEF ON'):'READY';
    badge.className='depth-badge '+(st.status==='ready'?'live':'');
    document.getElementById('depthSurveyToggle').classList.toggle('active',this.enabled&&this.mode==='survey');
    document.getElementById('depthReliefToggle').classList.toggle('active',this.enabled&&this.mode==='relief');

    if(!r){
      document.getElementById('depthExact').textContent='—';
      document.getElementById('depthChange').textContent='—';
      document.getElementById('depthTerrain').textContent='—';
      document.getElementById('depthSurvey').textContent='—';
      return;
    }
    document.getElementById('depthExact').textContent=this.depthText(r.center?.depthFeet);
    document.getElementById('depthExactMeta').textContent=r.center?.underwater?'NOAA BAG surveyed value':'No surveyed water value at center';
    document.getElementById('depthChange').textContent=this.depthText(r.changeFeet);
    document.getElementById('depthTerrain').textContent=r.terrain;
    document.getElementById('depthTerrainMeta').textContent=r.samples+' nearby survey sample'+(r.samples===1?'':'s');
    document.getElementById('depthSurvey').textContent=r.center?.surveyId||'Coverage gap';
    document.getElementById('depthSurveyMeta').textContent=r.center?.product||'NOAA/NCEI';
    document.getElementById('depthDNA').innerHTML='<strong>'+r.terrain+(r.center?.depthFeet?' • '+this.depthText(r.center.depthFeet):'')+'</strong><span>'+r.note+' This is fishing-planning context, not navigation guidance.</span>';
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#depthSurveyToggle')){this.showOverlay(app,'survey');return;}
      if(e.target.closest('#depthReliefToggle')){this.showOverlay(app,'relief');return;}
      if(e.target.closest('#depthHideBtn')){this.hideOverlay(app);return;}
    });
  }
};

window.CastVectorDepthIntel=Depth;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>Depth.setup());else Depth.setup();
})();