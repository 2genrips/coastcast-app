(function(){
'use strict';

const T={
  version:'9.6.0',
  modesKey:'castvector-map-modes-v96',
  loadoutKey:'castvector-trip-loadout-v96',

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchCatch(app);
    this.patchRenders(app);
    this.bind(app);
    this.renderAll(app);
  },

  installUI(app){
    const dock=document.querySelector('#mapProDock .map-pro-topline');
    if(dock&&!document.getElementById('mapModesBtn')){
      const b=document.createElement('button');b.id='mapModesBtn';b.className='map-pro-focus-btn';b.type='button';b.innerHTML='◫ <span>Modes</span>';
      dock.appendChild(b);
    }

    if(!document.getElementById('mapModesDialog')){
      const d=document.createElement('dialog');d.id='mapModesDialog';d.className='sheet-dialog toolkit-dialog';
      d.innerHTML='<div class="sheet-card toolkit-sheet">'+
        '<div class="tk-head"><div><div class="eyebrow">MAP MODES • 9.6</div><h2>One-tap fishing maps</h2><p>Save the exact map style and fishing layers you use for different kinds of trips.</p></div><button id="mapModesClose" class="icon-button" type="button">×</button></div>'+
        '<div class="map-mode-presets"><button type="button" data-map-preset="scout">Scout</button><button type="button" data-map-preset="access">Access</button><button type="button" data-map-preset="offshore">Offshore</button><button type="button" data-map-preset="history">My History</button><button type="button" data-map-preset="weather">Weather</button></div>'+
        '<div class="tk-subhead">YOUR SAVED MODES</div><div id="mapModeList" class="map-mode-list"></div>'+
        '<div class="map-mode-save"><input id="mapModeName" class="text-control" maxlength="30" placeholder="My bass scouting map"/><button id="saveMapModeBtn" class="primary-button" type="button">Save current map</button></div>'+
      '</div>';
      document.body.appendChild(d);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('tripLoadoutPanel')){
      const p=document.createElement('section');p.id='tripLoadoutPanel';p.className='panel trip-loadout-panel';
      p.innerHTML='<div class="tk-head"><div><div class="eyebrow">TRIP LOADOUT • 9.6</div><h2>Pack what this trip actually needs</h2></div><span id="loadoutBadge" class="tk-badge">CHECKING</span></div>'+
        '<div class="loadout-summary"><div><span>PRIMARY BAIT</span><strong id="loadoutPrimary">—</strong></div><div><span>BACKUP</span><strong id="loadoutBackup">—</strong></div><div><span>RIG</span><strong id="loadoutRig">—</strong></div><div><span>READY</span><strong id="loadoutReady">—</strong></div></div>'+
        '<div id="loadoutList" class="loadout-list"></div>'+
        '<div class="loadout-actions"><button id="loadoutShoppingBtn" class="secondary-button small" type="button">Add missing to shopping list</button><button id="loadoutPackAllBtn" class="primary-button small" type="button">Mark packed</button></div>';
      const gear=document.getElementById('gearPlannerPanel');if(gear)gear.after(p);else trips.appendChild(p);
    }

    const catchForm=document.getElementById('catchForm');
    if(catchForm&&!document.getElementById('catchTechnique')){
      const notes=document.getElementById('catchNotes')?.closest('.field-group');
      const box=document.createElement('div');box.id='catchDetailFields';box.className='catch-detail-fields';
      box.innerHTML=
        '<div class="two-col"><label class="field-group"><span>Technique</span><select id="catchTechnique" class="select-control"><option value="">Not listed</option><option>Bottom fishing</option><option>Casting</option><option>Jigging</option><option>Trolling</option><option>Drifting</option><option>Float fishing</option><option>Topwater</option><option>Fly fishing</option><option>Live bait</option><option>Other</option></select></label><label class="field-group"><span>Lure / bait color</span><input id="catchColor" class="text-control" maxlength="40" placeholder="Pearl, chartreuse, natural…"/></label></div>'+
        '<div class="two-col"><label class="field-group"><span>Depth caught (ft)</span><input id="catchDepth" class="text-control" type="number" min="0" max="3000" step="0.5" inputmode="decimal"/></label><label class="field-group"><span>Water clarity</span><select id="catchClarity" class="select-control"><option value="">Not listed</option><option>Clear</option><option>Stained</option><option>Murky</option><option>Dirty</option></select></label></div>'+
        '<div class="two-col"><label class="field-group"><span>Structure</span><select id="catchStructure" class="select-control"><option value="">Not listed</option><option>Open water</option><option>Grass / weeds</option><option>Rock</option><option>Dock / pier</option><option>Wood / laydown</option><option>Drop-off / ledge</option><option>Creek / channel</option><option>Jetty / inlet</option><option>Reef / wreck</option><option>Beach / trough</option><option>Other</option></select></label><label class="field-group"><span>Outcome</span><select id="catchOutcome" class="select-control"><option value="released">Released</option><option value="kept">Kept</option><option value="lost">Lost / broke off</option></select></label></div>'+
        '<label class="field-group"><span>Presentation / retrieve</span><input id="catchPresentation" class="text-control" maxlength="100" placeholder="Slow roll, dead stick, 2-hop pause, drifting…"/></label>';
      if(notes)notes.before(box);else catchForm.appendChild(box);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('anglerToolkitPanel')){
      const p=document.createElement('section');p.id='anglerToolkitPanel';p.className='panel angler-toolkit-panel';
      p.innerHTML='<div class="tk-head"><div><div class="eyebrow">ANGLER TOOLKIT • 9.6</div><h2>Your fishing library</h2></div><span class="tk-badge">PERSONAL</span></div>'+
        '<div class="toolkit-launch-grid"><button id="speciesGuideBtn" type="button"><strong>Species Guide</strong><span>Habitat, bait, temps & rigs</span></button><button id="trophyBoardBtn" type="button"><strong>Trophy Board</strong><span>Your personal bests</span></button><button id="mapModesProfileBtn" type="button"><strong>Map Modes</strong><span>Saved layer setups</span></button><button id="tackleIntelBtn" type="button"><strong>Tackle Match</strong><span>What you own vs what you need</span></button></div>';
      const core=document.getElementById('coreProfilePanel');if(core)core.after(p);else profile.appendChild(p);
    }

    if(!document.getElementById('speciesGuideDialog')){
      const d=document.createElement('dialog');d.id='speciesGuideDialog';d.className='sheet-dialog toolkit-dialog';
      d.innerHTML='<div class="sheet-card toolkit-sheet">'+
        '<div class="tk-head"><div><div class="eyebrow">SPECIES GUIDE • 9.6</div><h2>Know your target</h2><p>CastVector’s species intelligence in one searchable library.</p></div><button id="speciesGuideClose" class="icon-button" type="button">×</button></div>'+
        '<input id="speciesGuideSearch" class="text-control" placeholder="Search bass, trout, red drum…"/>'+
        '<div id="speciesGuideList" class="species-guide-list"></div>'+
      '</div>';document.body.appendChild(d);
    }

    if(!document.getElementById('trophyBoardDialog')){
      const d=document.createElement('dialog');d.id='trophyBoardDialog';d.className='sheet-dialog toolkit-dialog';
      d.innerHTML='<div class="sheet-card toolkit-sheet"><div class="tk-head"><div><div class="eyebrow">TROPHY BOARD • 9.6</div><h2>Your personal bests</h2><p>Built only from catches you log.</p></div><button id="trophyBoardClose" class="icon-button" type="button">×</button></div><div id="trophyBoardList" class="trophy-board-list"></div></div>';
      document.body.appendChild(d);
    }
  },

  patchCatch(app){
    if(app._toolkitCatchPatched)return;app._toolkitCatchPatched=true;
    const old=app.saveCatch?.bind(app);
    if(old)app.saveCatch=function(){
      const details={
        technique:this.$('catchTechnique')?.value||'',
        color:(this.$('catchColor')?.value||'').trim(),
        depth:this.$('catchDepth')?.value||'',
        clarity:this.$('catchClarity')?.value||'',
        structure:this.$('catchStructure')?.value||'',
        outcome:this.$('catchOutcome')?.value||'released',
        presentation:(this.$('catchPresentation')?.value||'').trim()
      };
      const before=this.state.catches?.[0]?.id;
      const out=old();
      const item=this.state.catches?.[0];
      if(item&&item.id!==before){
        item.details=details;this.save?.();
        T.renderTrophy(this);T.renderSpeciesGuide(this);
      }
      return out;
    };
  },

  modes(){
    try{const x=JSON.parse(localStorage.getItem(this.modesKey)||'[]');return Array.isArray(x)?x:[];}catch(_){return[];}
  },
  saveModes(x){try{localStorage.setItem(this.modesKey,JSON.stringify(x.slice(0,12)));}catch(_){}},

  currentMapState(app){
    const mp=window.CastVectorMapPro,aa=window.CastVectorAnglerAdvantage,core=window.CastVectorCompetitiveCore,batch=window.CastVectorBatchUpgrades,atlas=window.CastVectorPatternAtlas,depth=window.CastVectorDepthIntel;
    return{
      basemap:mp?.activeBase||'hybrid',filter:app.state.mapFilter||'all',
      depth:!!depth?.enabled,patterns:!!atlas?.ensureState?.(app)?.mapVisible,
      public:!!core?.accessLayer,community:!!core?.communityLayer,radar:!!aa?.prefs?.().radar,
      warnings:!!aa?.prefs?.().warnings,heat:!!batch?.heatLayer
    };
  },

  saveMapMode(app){
    const input=document.getElementById('mapModeName'),name=(input?.value||'').trim();if(!name)return app.showToast?.('Give this map mode a name.');
    const list=this.modes().filter(x=>x.name.toLowerCase()!==name.toLowerCase());
    list.unshift({id:Date.now(),name,state:this.currentMapState(app)});this.saveModes(list);if(input)input.value='';this.renderModes(app);app.showToast?.(name+' map mode saved.');
  },

  async setToggle(app,key,want){
    const aa=window.CastVectorAnglerAdvantage,core=window.CastVectorCompetitiveCore,batch=window.CastVectorBatchUpgrades,atlas=window.CastVectorPatternAtlas,depth=window.CastVectorDepthIntel;
    if(key==='depth'&&!!depth?.enabled!==want){want?depth.showOverlay?.(app,'survey'):depth.hideOverlay?.(app);}
    if(key==='patterns'&&!!atlas?.ensureState?.(app)?.mapVisible!==want){const st=atlas.ensureState(app);st.mapVisible=want;atlas.saveState?.(app);atlas.renderMapLayer?.(app);}
    if(key==='public'&&!!core?.accessLayer!==want)core?.togglePublic?.(app);
    if(key==='community'&&!!core?.communityLayer!==want)await core?.toggleCommunity?.(app);
    if(key==='radar'&&!!aa?.prefs?.().radar!==want){want?aa?.showRadar?.(app,true):aa?.hideRadar?.(app,true);}
    if(key==='warnings'&&!!aa?.prefs?.().warnings!==want)aa?.toggleWarnings?.(app);
    if(key==='heat'&&!!batch?.heatLayer!==want)batch?.toggleHeat?.(app);
  },

  async applyMapMode(app,mode){
    if(!mode?.state)return;
    app.navigate?.('map');await new Promise(r=>setTimeout(r,180));app.ensureMap?.();
    const mp=window.CastVectorMapPro,s=mode.state;
    if(mp?.setBasemap&&s.basemap)mp.setBasemap(app,s.basemap,true);
    if(mp?.setFilter&&s.filter)mp.setFilter(app,s.filter);
    for(const key of ['depth','patterns','public','community','radar','warnings','heat'])await this.setToggle(app,key,!!s[key]);
    this.renderModes(app);app.showToast?.(mode.name+' map mode loaded.');
  },

  preset(name){
    const p={
      scout:{basemap:'hybrid',filter:'recommended',depth:true,patterns:false,public:false,community:false,radar:false,warnings:true,heat:false},
      access:{basemap:'hybrid',filter:'access',depth:false,patterns:false,public:true,community:false,radar:false,warnings:true,heat:false},
      offshore:{basemap:'hybrid',filter:'structure',depth:true,patterns:false,public:false,community:false,radar:false,warnings:true,heat:false},
      history:{basemap:'aerial',filter:'spots',depth:false,patterns:true,public:false,community:true,radar:false,warnings:false,heat:true},
      weather:{basemap:'street',filter:'all',depth:false,patterns:false,public:false,community:false,radar:true,warnings:true,heat:false}
    };
    return{id:'preset-'+name,name:name[0].toUpperCase()+name.slice(1),state:p[name]};
  },

  renderModes(app){
    const box=document.getElementById('mapModeList');if(!box)return;
    const list=this.modes();
    box.innerHTML=list.length?list.map(m=>'<article class="map-mode-row"><div><strong>'+app.escape(m.name)+'</strong><span>'+app.escape(String(m.state.basemap||'map'))+' • '+app.escape(String(m.state.filter||'all'))+' • '+Object.entries(m.state).filter(([k,v])=>!['basemap','filter'].includes(k)&&v).map(([k])=>k).join(', ')+'</span></div><div><button class="mini-button" type="button" data-mode-use="'+m.id+'">Use</button><button class="mini-button" type="button" data-mode-del="'+m.id+'">Delete</button></div></article>').join(''):'<div class="empty-state">Save your current Map Pro setup and it will appear here.</div>';
  },

  fuzzyOwned(app,name){
    const q=String(name||'').toLowerCase(),tokens=q.split(/[^a-z0-9]+/).filter(x=>x.length>2);
    return (app.state.tackleBox||[]).find(t=>{
      const n=String(t.name||'').toLowerCase();
      return n.includes(q)||q.includes(n)||tokens.some(tok=>n.includes(tok));
    })||null;
  },

  loadout(app){
    const bait=app.baitIntelligence?.()||{},gear=app.gearItems?.()||[],rows=[],seen=new Set();
    const add=(name,category,reason,priority=1)=>{
      if(!name)return;const key=String(name).toLowerCase();if(seen.has(key))return;seen.add(key);
      const owned=this.fuzzyOwned(app,name),qty=owned?Number(owned.qty)||0:0;
      rows.push({name,category,reason,priority,owned,qty,ready:qty>0,packed:false});
    };
    add(bait.primary,'Bait / Lure','Primary recommendation',3);add(bait.backup,'Bait / Lure','Backup recommendation',2);
    if(bait.rig)add(bait.rig,'Rig','Recommended rig',3);
    gear.slice(0,10).forEach(g=>add(g.name,g.category,g.why||g.reason||'Smart Gear Planner',/Safety/i.test(g.category)?3:1));
    const stored=this.loadoutState(app),packed=new Set(stored.packed||[]);
    rows.forEach(r=>r.packed=packed.has(r.name));
    return{bait,rows};
  },

  loadoutId(app){return [app.state.location?.name,app.state.targetSpecies,app.state.fishingStyle].join('|');},
  loadoutState(app){try{const all=JSON.parse(localStorage.getItem(this.loadoutKey)||'{}');return all[this.loadoutId(app)]||{packed:[]};}catch(_){return{packed:[]};}},
  saveLoadoutState(app,state){try{const all=JSON.parse(localStorage.getItem(this.loadoutKey)||'{}');all[this.loadoutId(app)]=state;localStorage.setItem(this.loadoutKey,JSON.stringify(all));}catch(_){}},

  renderLoadout(app){
    const d=this.loadout(app),missing=d.rows.filter(x=>!x.ready),packed=d.rows.filter(x=>x.packed).length;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('loadoutPrimary',d.bait.primary||'—');set('loadoutBackup',d.bait.backup||'—');set('loadoutRig',d.bait.rig||'—');set('loadoutReady',(d.rows.length-missing.length)+'/'+d.rows.length);
    set('loadoutBadge',missing.length?'NEEDS '+missing.length:'READY');
    const box=document.getElementById('loadoutList');if(box)box.innerHTML=d.rows.map((r,i)=>'<label class="loadout-row '+(r.ready?'owned':'missing')+' '+(r.packed?'packed':'')+'"><input type="checkbox" data-loadout-pack="'+i+'" '+(r.packed?'checked':'')+'/><div><strong>'+app.escape(r.name)+'</strong><span>'+app.escape(r.reason)+' • '+app.escape(r.category)+'</span></div><b>'+(r.ready?'OWN '+r.qty:'MISSING')+'</b></label>').join('');
  },

  addMissingToShopping(app){
    const d=this.loadout(app),existing=new Set((app.state.shoppingList||[]).map(x=>String(x.name).toLowerCase()));
    d.rows.filter(x=>!x.ready).forEach(x=>{if(!existing.has(x.name.toLowerCase())){app.state.shoppingList.push({name:x.name,reason:'Trip Loadout • '+x.reason,done:false});existing.add(x.name.toLowerCase());}});
    app.state.shoppingList=(app.state.shoppingList||[]).slice(0,30);app.save?.();app.renderTackleBox?.();this.renderLoadout(app);app.showToast?.('Missing Trip Loadout items added to your shopping list.');
  },

  togglePacked(app,index){
    const d=this.loadout(app),row=d.rows[Number(index)];if(!row)return;
    const state=this.loadoutState(app),s=new Set(state.packed||[]);s.has(row.name)?s.delete(row.name):s.add(row.name);state.packed=[...s];this.saveLoadoutState(app,state);this.renderLoadout(app);
  },

  packAll(app){const d=this.loadout(app);this.saveLoadoutState(app,{packed:d.rows.map(x=>x.name)});this.renderLoadout(app);app.showToast?.('Trip Loadout marked packed.');},

  allSpecies(app){return Object.keys(app.species||{}).sort((a,b)=>a.localeCompare(b));},

  renderSpeciesGuide(app,query=''){
    const box=document.getElementById('speciesGuideList');if(!box)return;
    const q=String(query).trim().toLowerCase(),names=this.allSpecies(app).filter(n=>!q||n.toLowerCase().includes(q)||String(app.speciesExtras?.[n]?.habitat||'').toLowerCase().includes(q));
    box.innerHTML=names.map(n=>{
      const cfg=app.species[n]||{},ex=app.speciesExtras?.[n]||{},play=app.baitPlaybook?.[n]||{},catches=(app.state.catches||[]).filter(c=>c.species===n),pb=Math.max(0,...catches.map(c=>Number(c.length)||0));
      const rig=play.rigs?.[app.state.fishingStyle]||Object.values(play.rigs||{})[0]||'Match rig to structure';
      return '<article class="species-guide-card"><div><span>'+app.escape(cfg.abbr||n.slice(0,2).toUpperCase())+'</span><div><strong>'+app.escape(n)+'</strong><small>'+catches.length+' logged • '+(pb?pb+' in PB':'no PB yet')+'</small></div></div><p>'+app.escape(cfg.note||ex.habitat||'Species guidance available in CastVector.')+'</p><div class="species-guide-facts"><span>Water <b>'+app.escape((cfg.water||[]).join('–'))+(cfg.water?'°F':'')+'</b></span><span>Habitat <b>'+app.escape(ex.habitat||'—')+'</b></span><span>Start <b>'+app.escape((ex.bait||[])[0]||'—')+'</b></span><span>Rig <b>'+app.escape(rig)+'</b></span></div><button type="button" data-species-use="'+app.escape(n)+'">Target this species</button></article>';
    }).join('')||'<div class="empty-state">No species matched that search.</div>';
  },

  renderTrophy(app){
    const box=document.getElementById('trophyBoardList');if(!box)return;
    const groups=new Map();
    (app.state.catches||[]).forEach(c=>{const old=groups.get(c.species),len=Number(c.length)||0,w=Number(c.weight)||0;if(!old||len>old.len||(len===old.len&&w>old.weight))groups.set(c.species,{catch:c,len,weight:w});});
    const rows=[...groups.values()].sort((a,b)=>b.len-a.len||b.weight-a.weight);
    box.innerHTML=rows.length?rows.map((x,i)=>'<article class="trophy-row"><span>#'+(i+1)+'</span><div><strong>'+app.escape(x.catch.species)+'</strong><small>'+app.prettyDate(x.catch.date)+' • '+app.escape(x.catch.location||'Fishing location')+'</small></div><b>'+(x.len?x.len+' in':'')+(x.len&&x.weight?' • ':'')+(x.weight?x.weight+' lb':'')+'</b></article>').join(''):'<div class="empty-state">Log catch length or weight and your personal bests will appear here.</div>';
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();T.renderAll(this);return out;};
    const trips=app.renderTrips?.bind(app);if(trips)app.renderTrips=function(){const out=trips();T.renderLoadout(this);return out;};
  },

  renderAll(app){this.renderModes(app);this.renderLoadout(app);this.renderSpeciesGuide(app,document.getElementById('speciesGuideSearch')?.value||'');this.renderTrophy(app);},

  bind(app){
    document.addEventListener('click',async e=>{
      if(e.target.closest('#mapModesBtn')||e.target.closest('#mapModesProfileBtn')){this.renderModes(app);const d=document.getElementById('mapModesDialog');if(d&&!d.open)d.showModal();return;}
      if(e.target.closest('#mapModesClose')){document.getElementById('mapModesDialog')?.close();return;}
      if(e.target.closest('#saveMapModeBtn')){this.saveMapMode(app);return;}
      const preset=e.target.closest('[data-map-preset]');if(preset){document.getElementById('mapModesDialog')?.close();await this.applyMapMode(app,this.preset(preset.dataset.mapPreset));return;}
      const use=e.target.closest('[data-mode-use]');if(use){const m=this.modes().find(x=>String(x.id)===String(use.dataset.modeUse));document.getElementById('mapModesDialog')?.close();await this.applyMapMode(app,m);return;}
      const del=e.target.closest('[data-mode-del]');if(del){this.saveModes(this.modes().filter(x=>String(x.id)!==String(del.dataset.modeDel)));this.renderModes(app);return;}
      if(e.target.closest('#loadoutShoppingBtn')||e.target.closest('#tackleIntelBtn')){if(e.target.closest('#tackleIntelBtn')){app.navigate?.('trips');setTimeout(()=>document.getElementById('tripLoadoutPanel')?.scrollIntoView({behavior:'smooth'}),100);}else this.addMissingToShopping(app);return;}
      if(e.target.closest('#loadoutPackAllBtn')){this.packAll(app);return;}
      const pack=e.target.closest('[data-loadout-pack]');if(pack){this.togglePacked(app,pack.dataset.loadoutPack);return;}
      if(e.target.closest('#speciesGuideBtn')){this.renderSpeciesGuide(app);const d=document.getElementById('speciesGuideDialog');if(d&&!d.open)d.showModal();return;}
      if(e.target.closest('#speciesGuideClose')){document.getElementById('speciesGuideDialog')?.close();return;}
      const sp=e.target.closest('[data-species-use]');if(sp){app.setSpecies?.(sp.dataset.speciesUse);document.getElementById('speciesGuideDialog')?.close();app.navigate?.('forecast');return;}
      if(e.target.closest('#trophyBoardBtn')){this.renderTrophy(app);const d=document.getElementById('trophyBoardDialog');if(d&&!d.open)d.showModal();return;}
      if(e.target.closest('#trophyBoardClose')){document.getElementById('trophyBoardDialog')?.close();return;}
    });
    document.addEventListener('input',e=>{if(e.target.id==='speciesGuideSearch')this.renderSpeciesGuide(app,e.target.value);});
  }
};

window.CastVectorAnglerToolkit=T;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>T.install());else T.install();
})();