(function(){
'use strict';

const MP={
  version:'8.2.0',
  prefsKey:'castvector-map-pro-v82',
  baseLayers:{},
  activeBase:'hybrid',
  focus:false,
  tileErrors:0,
  scaleControl:null,

  app(){return window.CastVector;},

  prefs(){
    let saved={};try{saved=JSON.parse(localStorage.getItem(this.prefsKey)||'{}')||{};}catch(_){}
    return {basemap:saved.basemap||'hybrid',focus:false};
  },

  savePrefs(){
    try{localStorage.setItem(this.prefsKey,JSON.stringify({basemap:this.activeBase}));}catch(_){}
  },

  install(){
    const app=this.app();if(!app)return;
    this.activeBase=this.prefs().basemap;
    this.installUI(app);
    this.patchMap(app);
    this.bind(app);
    this.ensure(app);
  },

  installUI(app){
    const panel=document.querySelector('#view-map .map-panel');
    if(!panel||document.getElementById('mapProDock'))return;

    const dock=document.createElement('div');
    dock.id='mapProDock';dock.className='map-pro-dock';
    dock.innerHTML=
      '<div class="map-pro-topline">'+
        '<div class="map-pro-brand"><span>MAP PRO • 8.2</span><strong>Fishing layers</strong></div>'+
        '<div class="map-pro-basemaps" role="group" aria-label="Map style">'+
          '<button type="button" data-mappro-base="street">Street</button>'+
          '<button type="button" data-mappro-base="hybrid">Hybrid</button>'+
          '<button type="button" data-mappro-base="aerial">Aerial</button>'+
          '<button type="button" data-mappro-base="topo">Topo</button>'+
        '</div>'+
        '<button id="mapProFocusBtn" class="map-pro-focus-btn" type="button" aria-label="Focus map">⛶ <span>Focus</span></button>'+
      '</div>'+
      '<div class="map-pro-layers" role="group" aria-label="Fishing map layers">'+
        '<button type="button" data-mappro-filter="all" class="active">All</button>'+
        '<button type="button" data-mappro-filter="recommended">Top</button>'+
        '<button type="button" data-mappro-filter="access">Access</button>'+
        '<button type="button" data-mappro-filter="spots">Saved</button>'+
        '<button type="button" data-mappro-filter="catches">Catches</button>'+
        '<button type="button" data-mappro-filter="shops">Bait</button>'+
        '<button type="button" data-mappro-filter="structure">Structure</button>'+
        '<button type="button" data-mappro-special="depth">Depth</button>'+
        '<button type="button" data-mappro-special="patterns">Patterns</button>'+
      '</div>'+
      '<div class="map-pro-readout">'+
        '<span id="mapProStyle">HYBRID</span>'+
        '<strong id="mapProCoords">—</strong>'+
        '<span id="mapProZoom">Z—</span>'+
        '<span id="mapProLayerState">ALL LAYERS</span>'+
      '</div>';

    const toolbar=panel.querySelector('.map-toolbar');
    if(toolbar)toolbar.after(dock);else panel.prepend(dock);

    const map=document.getElementById('leafletMap');
    if(map&&!document.getElementById('mapProSourceNote')){
      const note=document.createElement('div');note.id='mapProSourceNote';note.className='map-pro-source-note';
      note.innerHTML='<span>Basemap</span><strong id="mapProSourceLabel">USGS Imagery Topo</strong><small>Fishing planning map • verify access locally</small>';
      map.after(note);
    }
  },

  patchMap(app){
    if(app._mapProPatched)return;app._mapProPatched=true;
    const original=app.ensureMap?.bind(app);
    if(!original)return;
    app.ensureMap=function(){
      const out=original();
      setTimeout(()=>MP.ensure(this),0);
      return out;
    };
  },

  makeLayer(url,attribution,opts={}){
    return L.tileLayer(url,{
      maxZoom:20,
      maxNativeZoom:16,
      attribution,
      updateWhenIdle:true,
      keepBuffer:3,
      ...opts
    });
  },

  discoverStreetLayer(map){
    let found=null;
    map.eachLayer(layer=>{
      if(found||!layer?._url)return;
      if(String(layer._url).includes('openstreetmap.org'))found=layer;
    });
    return found;
  },

  ensure(app){
    const map=app.state.map;if(!map||!window.L)return;
    if(map._castVectorMapPro){
      this.updateReadout(app);return;
    }
    map._castVectorMapPro=true;

    const street=this.discoverStreetLayer(map)||this.makeLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      '&copy; OpenStreetMap contributors',
      {maxNativeZoom:19}
    );

    this.baseLayers={
      street,
      hybrid:this.makeLayer(
        'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
        'USGS The National Map'
      ),
      aerial:this.makeLayer(
        'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
        'USGS The National Map'
      ),
      topo:this.makeLayer(
        'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
        'USGS The National Map'
      )
    };

    Object.entries(this.baseLayers).forEach(([key,layer])=>{
      layer.on('tileerror',()=>this.onTileError(app,key));
      layer.on('load',()=>{if(key===this.activeBase)this.tileErrors=0;});
    });

    if(!this.scaleControl){
      try{this.scaleControl=L.control.scale({imperial:true,metric:false,position:'bottomleft',maxWidth:110}).addTo(map);}catch(_){}
    }

    map.on('moveend zoomend',()=>this.updateReadout(app));
    this.setBasemap(app,this.activeBase,true);
    this.updateReadout(app);
  },

  onTileError(app,key){
    if(key!==this.activeBase||key==='street')return;
    this.tileErrors++;
    if(this.tileErrors<5)return;
    this.tileErrors=0;
    this.setBasemap(app,'street');
    app.showToast?.('Map imagery could not load. CastVector switched to Street map.');
  },

  setBasemap(app,key,silent=false){
    const map=app.state.map;if(!map||!this.baseLayers[key])return;
    Object.values(this.baseLayers).forEach(layer=>{if(map.hasLayer(layer))map.removeLayer(layer);});
    this.baseLayers[key].addTo(map);
    try{this.baseLayers[key].bringToBack();}catch(_){}
    this.activeBase=key;this.tileErrors=0;this.savePrefs();
    document.querySelectorAll('[data-mappro-base]').forEach(b=>b.classList.toggle('active',b.dataset.mapproBase===key));
    const labels={street:'OpenStreetMap',hybrid:'USGS Imagery + Topo',aerial:'USGS Imagery',topo:'USGS Topo'};
    const src=document.getElementById('mapProSourceLabel');if(src)src.textContent=labels[key]||key;
    if(!silent)app.showToast?.((labels[key]||key)+' map loaded.');
    this.updateReadout(app);
  },

  setFilter(app,key){
    app.state.mapFilter=key;
    app.applyMapFilter?.();
    document.querySelectorAll('[data-map-filter]').forEach(b=>b.classList.toggle('active',b.dataset.mapFilter===key));
    document.querySelectorAll('[data-mappro-filter]').forEach(b=>b.classList.toggle('active',b.dataset.mapproFilter===key));
    this.updateReadout(app);
  },

  toggleDepth(app,button){
    const d=window.CastVectorDepthIntel;if(!d)return app.showToast?.('Depth Intelligence is not available yet.');
    if(d.enabled){d.hideOverlay(app);button.classList.remove('active');app.showToast?.('Depth overlay hidden.');}
    else{d.showOverlay(app,'survey');button.classList.add('active');app.showToast?.('NOAA survey depth overlay on.');}
  },

  togglePatterns(app,button){
    const a=window.CastVectorPatternAtlas;if(!a)return app.showToast?.('Pattern Atlas is not available yet.');
    const st=a.ensureState?.(app)||app.state.patternAtlas||{};
    st.mapVisible=!st.mapVisible;
    a.saveState?.(app);app.save?.();a.renderMapLayer?.(app);a.render?.(app);
    button.classList.toggle('active',!!st.mapVisible);
    app.showToast?.(st.mapVisible?'Private Pattern Atlas shown.':'Private Pattern Atlas hidden.');
  },

  toggleFocus(app){
    this.focus=!this.focus;
    document.body.classList.toggle('map-pro-focus',this.focus);
    const b=document.getElementById('mapProFocusBtn');
    if(b){b.classList.toggle('active',this.focus);b.innerHTML=this.focus?'× <span>Exit</span>':'⛶ <span>Focus</span>';}
    setTimeout(()=>app.state.map?.invalidateSize?.(),100);
  },

  updateReadout(app){
    const map=app.state.map;if(!map)return;
    const c=map.getCenter?.();
    const coords=document.getElementById('mapProCoords');
    const zoom=document.getElementById('mapProZoom');
    const style=document.getElementById('mapProStyle');
    const layer=document.getElementById('mapProLayerState');
    if(coords&&c)coords.textContent=c.lat.toFixed(4)+', '+c.lng.toFixed(4);
    if(zoom)zoom.textContent='Z'+map.getZoom();
    if(style)style.textContent=String(this.activeBase||'street').toUpperCase();
    if(layer)layer.textContent=String(app.state.mapFilter||'all').toUpperCase()+' LAYERS';

    const p=window.CastVectorPatternAtlas?.ensureState?.(app);
    const depth=window.CastVectorDepthIntel;
    const pb=document.querySelector('[data-mappro-special="patterns"]');
    const db=document.querySelector('[data-mappro-special="depth"]');
    if(pb)pb.classList.toggle('active',!!p?.mapVisible);
    if(db)db.classList.toggle('active',!!depth?.enabled);
  },

  bind(app){
    document.addEventListener('click',e=>{
      const base=e.target.closest('[data-mappro-base]');
      if(base){this.setBasemap(app,base.dataset.mapproBase);return;}
      const filter=e.target.closest('[data-mappro-filter]');
      if(filter){this.setFilter(app,filter.dataset.mapproFilter);return;}
      const special=e.target.closest('[data-mappro-special]');
      if(special){
        if(special.dataset.mapproSpecial==='depth')this.toggleDepth(app,special);
        if(special.dataset.mapproSpecial==='patterns')this.togglePatterns(app,special);
        return;
      }
      if(e.target.closest('#mapProFocusBtn')){this.toggleFocus(app);return;}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.focus)this.toggleFocus(app);});
    const prev=app.renderMapLayers?.bind(app);
    if(prev)app.renderMapLayers=function(){const out=prev();setTimeout(()=>MP.updateReadout(this),0);return out;};
  }
};

window.CastVectorMapPro=MP;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>MP.install());else MP.install();
})();