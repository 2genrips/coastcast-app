(function(){
'use strict';

const P={
  version:'14.5.0',
  clarityKey:'castvector-water-clarity-v145',
  useBackup:false,

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchOffline(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const forecast=document.getElementById('view-forecast');
    if(forecast&&!document.getElementById('presentationEnginePanel')){
      const panel=document.createElement('section');panel.id='presentationEnginePanel';panel.className='panel presentation-engine-panel';
      panel.innerHTML=
        '<div class="pe-head"><div><div class="eyebrow">PRESENTATION ENGINE • 14.5</div><h2>Exactly how should I fish it?</h2><p>Conditions + species behavior + your private catch history + what is in your tackle box.</p></div><span id="peConfidence" class="pe-badge">BUILDING</span></div>'+
        '<div class="pe-clarity"><span>WATER CLARITY</span><div class="pe-clarity-options"><button type="button" data-pe-clarity="unknown">Unknown</button><button type="button" data-pe-clarity="clear">Clear</button><button type="button" data-pe-clarity="stained">Stained</button><button type="button" data-pe-clarity="murky">Murky</button></div></div>'+
        '<div class="pe-hero"><div class="pe-lure"><span id="peRole">PRIMARY</span><strong id="peBait">—</strong><small id="peRig">—</small></div><div class="pe-call"><strong id="peCall">Build a live forecast first.</strong><p id="peWhy">CastVector will turn the current conditions into a specific presentation.</p></div></div>'+
        '<div class="pe-grid"><article><span>COLOR</span><strong id="peColor">—</strong><small id="peColorWhy">Visibility</small></article><article><span>SIZE</span><strong id="peSize">—</strong><small id="peSizeWhy">Profile</small></article><article><span>DEPTH</span><strong id="peDepth">—</strong><small id="peDepthWhy">Water column</small></article><article><span>RETRIEVE</span><strong id="peRetrieve">—</strong><small id="peRetrieveWhy">Cadence</small></article><article><span>TECHNIQUE</span><strong id="peTechnique">—</strong><small id="peTechniqueWhy">Method</small></article><article><span>TACKLE</span><strong id="peOwned">—</strong><small id="peOwnedWhy">Your inventory</small></article></div>'+
        '<div id="pePersonal" class="pe-personal"></div>'+
        '<div class="pe-actions"><button id="peBackupBtn" class="secondary-button" type="button">Try backup bait</button><button id="peTripBtn" class="primary-button" type="button">Use in my trip</button><button id="peShopBtn" class="ghost-button" type="button">Add missing tackle</button></div>';
      const species=document.getElementById('speciesCommandPanel'),bite=document.getElementById('biteGridPanel');
      if(species)species.after(panel);else if(bite)bite.before(panel);else forecast.appendChild(panel);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('tripPresentationCard')){
      const card=document.createElement('section');card.id='tripPresentationCard';card.className='panel trip-presentation-card';
      card.innerHTML='<div class="pe-head"><div><div class="eyebrow">RIGHT-NOW PRESENTATION • 14.5</div><h2 id="tpcTitle">Your exact starting setup</h2></div><span id="tpcBadge" class="pe-badge">READY</span></div><div class="tpc-main"><div><span>THROW</span><strong id="tpcBait">—</strong><small id="tpcColor">—</small></div><div><span>WORK IT</span><strong id="tpcRetrieve">—</strong><small id="tpcDepth">—</small></div><div><span>RIG</span><strong id="tpcRig">—</strong><small id="tpcOwned">—</small></div></div><button id="tpcOpenBtn" class="secondary-button small" type="button">Fine-tune presentation</button>';
      const loadout=document.getElementById('tripLoadoutPanel'),pattern=document.getElementById('tripPatternEdgePanel');
      if(pattern)pattern.after(card);else if(loadout)loadout.after(card);else trips.appendChild(card);
    }
  },

  locationKey(app){
    const l=app.state.location||{};return Number(l.lat).toFixed(2)+','+Number(l.lon).toFixed(2);
  },

  clarity(app){
    try{const all=JSON.parse(localStorage.getItem(this.clarityKey)||'{}')||{};return all[this.locationKey(app)]||'unknown';}catch(_){return'unknown';}
  },

  setClarity(app,value){
    const allowed=['unknown','clear','stained','murky'];if(!allowed.includes(value))return;
    try{const all=JSON.parse(localStorage.getItem(this.clarityKey)||'{}')||{};all[this.locationKey(app)]=value;localStorage.setItem(this.clarityKey,JSON.stringify(all));}catch(_){}
    this.render(app);
  },

  successfulCatches(app,species){
    return (app.state.catches||[]).filter(c=>c.species===species&&String(c.details?.outcome||'released')!=='lost');
  },

  mode(arr){
    const m=new Map();arr.filter(v=>v!=null&&String(v).trim()).forEach(v=>{const k=String(v).trim();m.set(k,1+(m.get(k)||0));});
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },

  personal(app,species){
    const c=this.successfulCatches(app,species);
    const depths=c.map(x=>Number(x.details?.depth)).filter(v=>Number.isFinite(v)&&v>=0).sort((a,b)=>a-b);
    const mid=depths.length?depths[Math.floor((depths.length-1)/2)]:null;
    return{
      count:c.length,
      color:this.mode(c.map(x=>x.details?.color)),
      technique:this.mode(c.map(x=>x.details?.technique)),
      structure:this.mode(c.map(x=>x.details?.structure)),
      clarity:this.mode(c.map(x=>x.details?.clarity)),
      presentation:this.mode(c.map(x=>x.details?.presentation)),
      depth:mid
    };
  },

  isNaturalBait(name){
    return /shrimp|mullet|crab|herring|minnow|pilchard|worm|cricket|sand flea|clam|bunker|cut bait|live bait|liver|bluegill|shad|crawler|barnacle|salmon belly/i.test(String(name||''));
  },

  sizeClass(species){
    if(/Bluegill|Crappie|Pompano|Surfperch|Brook Trout/i.test(species))return'small';
    if(/Tarpon|Muskellunge|Trevally|Pacific Halibut|Lingcod/i.test(species))return'large';
    return'medium';
  },

  sizeRecommendation(species,score,natural){
    if(natural)return this.sizeClass(species)==='large'?'Large natural forage':'Match local forage size';
    const base=this.sizeClass(species),slow=score<62,hot=score>=82;
    if(base==='small')return slow?'1.5–2.5 in':'2–3 in';
    if(base==='large')return slow?'4–6 in':hot?'7–10 in':'5–8 in';
    return slow?'2.5–3.5 in':hot?'4–6 in':'3–5 in';
  },

  colorRecommendation({clarity,natural,lowLight,rain,personal}){
    if(personal?.color)return{value:personal.color,why:'Your successful catch history'};
    if(natural)return{value:'Natural / match forage',why:'Natural bait presentation'};
    if(lowLight)return{value:clarity==='clear'?'Pearl / bone':'Black / purple silhouette',why:'Low-light contrast'};
    if(clarity==='murky')return{value:'Chartreuse / black / high contrast',why:'Maximum visibility in dirty water'};
    if(clarity==='stained')return{value:'White-chartreuse / gold',why:'Flash + contrast in stained water'};
    if(clarity==='clear')return{value:'Natural / translucent / silver',why:'Subtle profile in clear water'};
    if(rain>=55)return{value:'White / chartreuse',why:'Higher visibility in darker conditions'};
    return{value:'Natural forage color',why:'Clarity not specified'};
  },

  depthRecommendation(app,species,score,personal){
    if(Number.isFinite(personal?.depth))return{value:Math.round(personal.depth)+' ft',why:'Median depth from your successful catches'};
    const cfg=app.species?.[species]||{},c=app.state.data?.current||{},water=Number(c.waterTemp),range=cfg.water||[],mid=range.length===2?(Number(range[0])+Number(range[1]))/2:null;
    const hour=new Date().getHours(),lowLight=hour<9||hour>=17;
    if(Number.isFinite(water)&&Number.isFinite(mid)&&water>mid+6)return{value:'Deeper / shaded water',why:'Water is warmer than this species’ ideal center'};
    if(Number.isFinite(water)&&Number.isFinite(mid)&&water<mid-6)return{value:'Slow near stable depth / bottom',why:'Cold water favors stability'};
    if(lowLight&&score>=70)return{value:'Shallow edge / upper half',why:'Low light + active fish'};
    if(score<62)return{value:'Bottom / cover / transition',why:'Lower activity favors holding water'};
    return{value:'Mid-depth near structure',why:'Balanced current conditions'};
  },

  retrieveRecommendation(app,score,natural){
    const c=app.state.data?.current||{},wind=Number(c.windSpeed),water=Number(c.waterTemp),species=app.state.targetSpecies,cfg=app.species?.[species]||{},mid=Array.isArray(cfg.water)?(Number(cfg.water[0])+Number(cfg.water[1]))/2:null;
    if(natural)return{value:'Natural drift / minimal movement',why:'Let scent and current do the work'};
    if(Number.isFinite(water)&&Number.isFinite(mid)&&water<mid-5)return{value:'Slow • long pauses',why:'Cold-water metabolism'};
    if(score>=84)return{value:'Medium-fast • reaction pace',why:'High activity score'};
    if(score<62)return{value:'Slow • bottom contact • pauses',why:'Finesse a lower-activity bite'};
    if(Number.isFinite(wind)&&wind>=15)return{value:'Steady / assertive',why:'Maintain feel in stronger wind'};
    return{value:'Medium • pause on structure',why:'Balanced activity'};
  },

  techniqueRecommendation(app,natural,personal){
    if(personal?.technique)return{value:personal.technique,why:'Your most successful logged technique'};
    const style=app.state.fishingStyle||'',species=app.state.targetSpecies;
    if(natural)return{value:/river|wade/i.test(style)?'Drift / bottom seam':'Bottom / natural presentation',why:'Match natural bait to current and structure'};
    if(/Trout|Salmon/i.test(species))return{value:'Current seam / controlled retrieve',why:'Target travel lanes and seams'};
    if(/Bass|Snook|Red Drum|Speckled Trout/i.test(species))return{value:'Cover water → slow at structure',why:'Find active fish, then work high-percentage cover'};
    return{value:'Structure-first casting',why:'Start where bait and structure intersect'};
  },

  tackleMatch(app,bait,color){
    const items=app.state.tackleBox||[],q=String(bait||'').toLowerCase(),ct=String(color||'').toLowerCase();
    const match=items.find(i=>{
      const n=(String(i.name||'')+' '+String(i.notes||'')).toLowerCase();
      const baitTokens=q.split(/[^a-z0-9]+/).filter(x=>x.length>3);
      const colorTokens=ct.split(/[^a-z0-9]+/).filter(x=>x.length>3);
      return (n.includes(q)||baitTokens.some(t=>n.includes(t)))&&(colorTokens.length===0||colorTokens.some(t=>n.includes(t))||this.isNaturalBait(bait));
    });
    if(match&&Number(match.qty)>0)return{status:'READY',item:match};
    if(match)return{status:'OUT',item:match};
    const loose=items.find(i=>{const n=String(i.name||'').toLowerCase();return n.includes(q)||q.includes(n);});
    if(loose&&Number(loose.qty)>0)return{status:'READY',item:loose};
    return{status:'MISSING',item:match||loose||null};
  },

  model(app){
    const species=app.state.targetSpecies,baitIntel=app.baitIntelligence?.(species)||{},bait=this.useBackup?(baitIntel.backup||baitIntel.primary):(baitIntel.primary||baitIntel.backup),natural=this.isNaturalBait(bait),score=Number(app.speciesTodayScore?.(species)??app.currentScore?.()??0),clarity=this.clarity(app),personal=this.personal(app,species),c=app.state.data?.current||{},hour=new Date().getHours(),lowLight=hour<9||hour>=17,rain=Number(c.rain)||0;
    const color=this.colorRecommendation({clarity,natural,lowLight,rain,personal}),size=this.sizeRecommendation(species,score,natural),depth=this.depthRecommendation(app,species,score,personal),retrieve=this.retrieveRecommendation(app,score,natural),technique=this.techniqueRecommendation(app,natural,personal),tackle=this.tackleMatch(app,bait,color.value);
    let confidence=55;
    confidence+=Math.min(18,personal.count*3);
    if(clarity!=='unknown')confidence+=8;
    confidence+=Math.round((app.dataConfidence?.().score||0)*.15);
    confidence=Math.max(45,Math.min(97,confidence));
    const activity=score>=82?'aggressive':score>=68?'moderate':'cautious';
    const call=(personal.count>=3?'Your history + live conditions':'Species behavior + live conditions')+' point to a '+activity+' presentation.';
    const why=[score+'/100 species score',clarity==='unknown'?'clarity not specified':clarity+' water',lowLight?'low-light window':'daylight window'];
    if(personal.count>=3)why.push(personal.count+' successful personal catches');
    return{species,bait,baitIntel,natural,score,clarity,personal,color,size,depth,retrieve,technique,tackle,confidence,call,why:why.join(' • ')};
  },

  addMissing(app){
    const m=this.model(app),list=app.state.shoppingList||[],seen=new Set(list.map(x=>String(x.name).toLowerCase()));
    const add=(name,reason)=>{const k=String(name||'').toLowerCase();if(name&&!seen.has(k)){seen.add(k);list.push({name,reason,done:false});}};
    if(m.tackle.status!=='READY')add(m.bait,'Presentation Engine • '+m.color.value+' • '+m.size);
    const rigMatch=(app.state.tackleBox||[]).some(i=>String(i.name).toLowerCase().includes(String(m.baitIntel.rig||'').toLowerCase()));
    if(m.baitIntel.rig&&!rigMatch)add(m.baitIntel.rig,'Presentation Engine recommended rig');
    app.state.shoppingList=list.slice(0,30);app.save?.();app.renderTackleBox?.();app.showToast?.('Missing presentation tackle added to your shopping list.');
  },

  useTrip(app){
    const m=this.model(app);
    app.state.presentationPlan={version:'14.5.0',at:new Date().toISOString(),species:m.species,bait:m.bait,color:m.color.value,size:m.size,depth:m.depth.value,retrieve:m.retrieve.value,technique:m.technique.value,rig:m.baitIntel.rig||'',confidence:m.confidence,clarity:m.clarity};
    app.save?.({cloud:false});app.navigate?.('trips');this.render(app);app.showToast?.('Presentation added to your trip plan.');
  },

  patchOffline(app){
    if(app._peOfflinePatched)return;app._peOfflinePatched=true;
    const old=app.saveOfflinePack?.bind(app);
    if(old)app.saveOfflinePack=function(){
      const before=(this.state.offlinePacks||[]).map(x=>x.id),out=old(),p=(this.state.offlinePacks||[]).find(x=>!before.includes(x.id));
      if(p){const m=P.model(this);p.presentation={species:m.species,bait:m.bait,color:m.color.value,size:m.size,depth:m.depth.value,retrieve:m.retrieve.value,technique:m.technique.value,rig:m.baitIntel.rig||'',confidence:m.confidence,clarity:m.clarity};this.save?.({cloud:false});}
      return out;
    };
  },

  render(app){
    const m=this.model(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('peConfidence',m.confidence+'% CONFIDENCE');set('peRole',this.useBackup?'BACKUP':'PRIMARY');set('peBait',m.bait||'—');set('peRig',m.baitIntel.rig||'Rig not set');set('peCall',m.call);set('peWhy',m.why);
    set('peColor',m.color.value);set('peColorWhy',m.color.why);set('peSize',m.size);set('peSizeWhy',m.natural?'Match forage':'Species + activity profile');set('peDepth',m.depth.value);set('peDepthWhy',m.depth.why);set('peRetrieve',m.retrieve.value);set('peRetrieveWhy',m.retrieve.why);set('peTechnique',m.technique.value);set('peTechniqueWhy',m.technique.why);set('peOwned',m.tackle.status);set('peOwnedWhy',m.tackle.item?m.tackle.item.name:'Not matched in My Tackle Box');
    document.querySelectorAll('[data-pe-clarity]').forEach(b=>b.classList.toggle('active',b.dataset.peClarity===m.clarity));
    const personal=document.getElementById('pePersonal');
    if(personal)personal.innerHTML=m.personal.count?'<strong>YOUR PROOF</strong><span>'+m.personal.count+' successful '+app.escape(m.species)+' catches'+(m.personal.color?' • '+app.escape(m.personal.color)+' top color':'')+(m.personal.technique?' • '+app.escape(m.personal.technique)+' top technique':'')+(Number.isFinite(m.personal.depth)?' • median '+Math.round(m.personal.depth)+' ft':'')+'</span>':'<strong>PERSONAL MODEL IS LEARNING</strong><span>Add technique, color, depth and structure when logging catches and CastVector will personalize this setup.</span>';
    const backup=document.getElementById('peBackupBtn');if(backup)backup.textContent=this.useBackup?'Use primary bait':'Try backup bait';

    set('tpcBait',m.bait||'—');set('tpcColor',m.color.value+' • '+m.size);set('tpcRetrieve',m.retrieve.value);set('tpcDepth',m.depth.value);set('tpcRig',m.baitIntel.rig||'—');set('tpcOwned',m.tackle.status==='READY'?'In your tackle box':'Needs tackle check');set('tpcBadge',m.confidence+'%');
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();P.render(this);return out;};
    const log=app.renderLogbook?.bind(app);if(log)app.renderLogbook=function(){const out=log();P.render(this);return out;};
    const tackle=app.renderTackleBox?.bind(app);if(tackle)app.renderTackleBox=function(){const out=tackle();P.render(this);return out;};
  },

  bind(app){
    document.addEventListener('click',e=>{
      const c=e.target.closest('[data-pe-clarity]');if(c){this.setClarity(app,c.dataset.peClarity);return;}
      if(e.target.closest('#peBackupBtn')){this.useBackup=!this.useBackup;this.render(app);return;}
      if(e.target.closest('#peTripBtn')){this.useTrip(app);return;}
      if(e.target.closest('#peShopBtn')){this.addMissing(app);return;}
      if(e.target.closest('#tpcOpenBtn')){app.navigate?.('forecast');setTimeout(()=>document.getElementById('presentationEnginePanel')?.scrollIntoView({behavior:'smooth',block:'start'}),100);return;}
    });
  }
};

window.CastVectorPresentationEngine=P;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>P.install());else P.install();
})();