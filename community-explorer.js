(function(){
'use strict';

const CE={
  version:'13.0.0',
  followKey:'castvector-community-species-follows-v130',
  mapLayer:null,

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchCommunity(app);
    this.patchRenders(app);
    this.bind(app);
    this.populateSpecies(app);
    this.render(app);
  },

  installUI(app){
    const community=document.getElementById('view-community');
    if(community&&!document.getElementById('communityExplorerPanel')){
      const p=document.createElement('section');p.id='communityExplorerPanel';p.className='panel community-explorer-panel';
      p.innerHTML=
        '<div class="ce-head"><div><div class="eyebrow">COMMUNITY EXPLORER • 13.0</div><h2>What’s actually biting nearby?</h2><p>Real shared catches only. Demo posts never influence these numbers.</p></div><span id="ceTrustBadge" class="ce-badge">REAL SHARES ONLY</span></div>'+
        '<div class="ce-controls">'+
          '<select id="ceSpecies" class="select-control"><option value="all">All species</option></select>'+
          '<select id="ceRadius" class="select-control"><option value="5">5 miles</option><option value="10">10 miles</option><option value="25" selected>25 miles</option><option value="50">50 miles</option></select>'+
          '<select id="ceDays" class="select-control"><option value="3">Last 3 days</option><option value="7">Last 7 days</option><option value="14" selected>Last 14 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>'+
          '<select id="ceSort" class="select-control"><option value="recent">Newest</option><option value="likes">Most liked</option><option value="length">Largest reported</option></select>'+
          '<select id="cePrecision" class="select-control"><option value="all">Any shared area</option><option value="exact">Exact public spots</option><option value="general">General-area shares</option></select>'+
          '<label class="ce-check"><input id="cePhotos" type="checkbox"/><span>Photos only</span></label>'+
        '</div>'+
        '<div class="ce-summary">'+
          '<article><span>REAL SHARES</span><strong id="ceCount">0</strong><small id="ceCountMeta">Near selected water</small></article>'+
          '<article><span>TOP SPECIES</span><strong id="ceTopSpecies">—</strong><small>Filtered sample</small></article>'+
          '<article><span>TOP BAIT</span><strong id="ceTopBait">—</strong><small>Filtered sample</small></article>'+
          '<article><span>LARGEST REPORTED</span><strong id="ceLargest">—</strong><small>Shared size only</small></article>'+
          '<article><span>LATEST SHARE</span><strong id="ceLatest">—</strong><small>Real Community post</small></article>'+
          '<article><span>AVG SCORE</span><strong id="ceAvgScore">—</strong><small>When shared</small></article>'+
        '</div>'+
        '<div id="ceInsight" class="ce-insight">Community Explorer will summarize real catches around the selected fishing water.</div>'+
        '<div class="ce-actions"><button id="ceMapBtn" class="primary-button small" type="button">Map filtered catches</button><button id="ceFollowSpeciesBtn" class="secondary-button small" type="button">Follow selected species</button><button id="ceUseSpeciesBtn" class="secondary-button small" type="button">Target selected species</button><button id="ceRefreshBtn" class="ghost-button small" type="button">Refresh Community</button></div>'+
        '<div id="ceResults" class="ce-results"></div>';
      const wr=document.getElementById('waterReportPanel'),pulse=document.getElementById('communityPulsePanel');
      if(wr)wr.after(p);else if(pulse)pulse.after(p);else community.prepend(p);
    }

    const home=document.getElementById('view-home');
    if(home&&!document.getElementById('localBitePulse')){
      const p=document.createElement('section');p.id='localBitePulse';p.className='panel local-bite-pulse';p.hidden=true;
      p.innerHTML='<div><div class="eyebrow">LOCAL BITE PULSE • 13.0</div><h3 id="lbpTitle">Real catches are showing up nearby</h3><p id="lbpMeta">Community activity near your selected water.</p></div><button id="lbpOpenBtn" class="secondary-button small" type="button">Explore</button>';
      const smart=document.getElementById('smartPulsePanel'),brain=document.getElementById('brain3Panel');
      if(smart)smart.after(p);else if(brain)brain.after(p);else home.appendChild(p);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('speciesWatchPanel')){
      const p=document.createElement('section');p.id='speciesWatchPanel';p.className='panel species-watch-panel';
      p.innerHTML='<div class="ce-head"><div><div class="eyebrow">SPECIES WATCH • 13.0</div><h2>Follow the fish you care about</h2></div><span id="speciesWatchBadge" class="ce-badge">0 FOLLOWED</span></div><p class="ce-note">CastVector checks real Community shares for followed species around your selected water. Hidden locations stay hidden.</p><div id="speciesWatchList" class="species-watch-list"></div>';
      const water=document.getElementById('waterWatchlistPanel'),toolkit=document.getElementById('anglerToolkitPanel');
      if(water)water.after(p);else if(toolkit)toolkit.after(p);else profile.appendChild(p);
    }
  },

  follows(){
    try{const x=JSON.parse(localStorage.getItem(this.followKey)||'[]');return Array.isArray(x)?x:[];}catch(_){return[];}
  },

  saveFollows(list){try{localStorage.setItem(this.followKey,JSON.stringify(list.slice(0,20)));}catch(_){}},

  realPosts(app){
    const cloud=(app._cloudCommunityPosts||[]).filter(p=>!p.demo);
    const local=(app.normalizeLocalCommunityPosts?.()||[]).filter(p=>!p.demo);
    const out=[],seen=new Set();
    [...cloud,...local].forEach(p=>{const k=String(p.id);if(!seen.has(k)){seen.add(k);out.push(p);}});
    return out;
  },

  precision(p){
    if(p.locationPrecision)return p.locationPrecision;
    if(p.water==='Location hidden'||!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lon)))return'hidden';
    return p.local?'general':'general';
  },

  locatedPosts(app){
    const center=app.state.location||{},radius=Number(document.getElementById('ceRadius')?.value)||25,days=Number(document.getElementById('ceDays')?.value)||14,species=document.getElementById('ceSpecies')?.value||'all',precision=document.getElementById('cePrecision')?.value||'all',photos=!!document.getElementById('cePhotos')?.checked,cutoff=Date.now()-days*86400000;
    return this.realPosts(app).filter(p=>{
      const lat=Number(p.lat),lon=Number(p.lon),date=new Date(p.date||0).getTime(),prec=this.precision(p);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)<1)return false;
      if(app.haversine(Number(center.lat),Number(center.lon),lat,lon)>radius)return false;
      if(Number.isFinite(date)&&date<cutoff)return false;
      if(species!=='all'&&p.species!==species)return false;
      if(precision!=='all'&&prec!==precision)return false;
      if(photos&&!p.photo)return false;
      return true;
    });
  },

  sorted(app){
    const rows=[...this.locatedPosts(app)],sort=document.getElementById('ceSort')?.value||'recent';
    if(sort==='likes')rows.sort((a,b)=>Number(b.likes||0)-Number(a.likes||0)||new Date(b.date||0)-new Date(a.date||0));
    else if(sort==='length')rows.sort((a,b)=>Number(b.length||0)-Number(a.length||0)||Number(b.weight||0)-Number(a.weight||0));
    else rows.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
    return rows;
  },

  mode(arr){
    const m=new Map();arr.filter(v=>v&&String(v).trim()).forEach(v=>{const k=String(v).trim();m.set(k,1+(m.get(k)||0));});
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },

  speciesOptions(app){
    return [...new Set(this.realPosts(app).map(p=>p.species).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  },

  populateSpecies(app){
    const e=document.getElementById('ceSpecies');if(!e)return;
    const current=e.value||'all',names=this.speciesOptions(app);
    e.innerHTML='<option value="all">All species</option>'+names.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
    e.value=names.includes(current)?current:'all';
  },

  stats(app,rows){
    const topSpecies=this.mode(rows.map(p=>p.species)),topBait=this.mode(rows.map(p=>p.bait).filter(x=>x&&x!=='Not listed'));
    const lengths=rows.map(p=>Number(p.length)).filter(x=>Number.isFinite(x)&&x>0),weights=rows.map(p=>Number(p.weight)).filter(x=>Number.isFinite(x)&&x>0),scores=rows.map(p=>Number(p.score)).filter(Number.isFinite);
    const newest=rows.map(p=>new Date(p.date||0)).filter(d=>Number.isFinite(d.getTime())).sort((a,b)=>b-a)[0]||null;
    return{topSpecies,topBait,maxLength:lengths.length?Math.max(...lengths):null,maxWeight:weights.length?Math.max(...weights):null,avgScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null,newest};
  },

  renderExplorer(app){
    const rows=this.sorted(app),s=this.stats(app,rows),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('ceCount',rows.length);set('ceCountMeta',(Number(document.getElementById('ceRadius')?.value)||25)+' mi • '+(Number(document.getElementById('ceDays')?.value)||14)+' days');
    set('ceTopSpecies',s.topSpecies||'—');set('ceTopBait',s.topBait||'—');
    set('ceLargest',s.maxLength?Math.round(s.maxLength*10)/10+' in':s.maxWeight?Math.round(s.maxWeight*10)/10+' lb':'—');
    set('ceLatest',s.newest?app.prettyDate(s.newest.toISOString()):'—');set('ceAvgScore',s.avgScore==null?'—':s.avgScore+'/100');

    const insight=document.getElementById('ceInsight');
    if(insight){
      const parts=[];
      if(rows.length)parts.push(rows.length+' real shared catch'+(rows.length===1?'':'es')+' match these filters');
      if(s.topSpecies)parts.push(s.topSpecies+' is the most-reported species');
      if(s.topBait)parts.push(s.topBait+' is the most-reported bait');
      if(s.avgScore!=null)parts.push('average shared CastVector score '+s.avgScore+'/100');
      insight.textContent=parts.length?parts.join(' • ')+'. Community samples may be incomplete, so use this as supporting evidence—not a guarantee.':'No real shared catches match these filters yet. Demo posts are intentionally excluded.';
    }

    const box=document.getElementById('ceResults');if(box)box.innerHTML=rows.length?rows.slice(0,40).map(p=>{
      const prec=this.precision(p),meta=[app.prettyDate(p.date),p.water,prec==='exact'?'Exact public share':'General area'].filter(Boolean).join(' • '),size=[p.length&&p.length+' in',p.weight&&p.weight+' lb'].filter(Boolean).join(' • ');
      return '<article class="ce-result"><div class="ce-result-main">'+(p.photo?'<img src="'+p.photo+'" alt="'+app.escape(p.species)+' catch"/>':'<div class="ce-result-fallback">'+app.escape(app.species?.[p.species]?.abbr||'CV')+'</div>')+'<div><strong>'+app.escape(p.species||'Catch')+(size?' • '+app.escape(size):'')+'</strong><span>'+app.escape(meta)+'</span><small>'+app.escape([p.bait&&'Bait: '+p.bait,p.score&&'Score '+p.score,p.likes&&p.likes+' like'+(p.likes===1?'':'s')].filter(Boolean).join(' • ')||'Shared catch')+'</small></div></div><button type="button" data-ce-map="'+app.escape(String(p.id))+'">Map</button></article>';
    }).join(''):'<div class="empty-state">No real Community catches match these filters.</div>';

    const selected=document.getElementById('ceSpecies')?.value||'all',follow=document.getElementById('ceFollowSpeciesBtn'),use=document.getElementById('ceUseSpeciesBtn');
    if(follow){follow.disabled=selected==='all';follow.textContent=selected==='all'?'Choose species to follow':this.isFollowing(selected)?'Following '+selected+' ✓':'Follow '+selected;}
    if(use)use.disabled=selected==='all';
  },

  isFollowing(species){return this.follows().some(x=>x.species===species);},

  toggleFollow(app,species){
    if(!species||species==='all')return;
    const list=this.follows(),i=list.findIndex(x=>x.species===species);
    if(i>=0){list.splice(i,1);app.showToast?.(species+' removed from Species Watch.');}
    else{list.unshift({species,followedAt:new Date().toISOString(),lastSeenAt:new Date().toISOString()});app.showToast?.(species+' added to Species Watch.');}
    this.saveFollows(list);this.render(app);
  },

  speciesNearby(app,species,radius=50){
    const l=app.state.location||{};
    return this.realPosts(app).filter(p=>p.species===species&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&app.haversine(Number(l.lat),Number(l.lon),Number(p.lat),Number(p.lon))<=radius);
  },

  renderFollows(app){
    const list=this.follows(),box=document.getElementById('speciesWatchList'),badge=document.getElementById('speciesWatchBadge');if(badge)badge.textContent=list.length+' FOLLOWED';if(!box)return;
    box.innerHTML=list.length?list.map(f=>{
      const rows=this.speciesNearby(app,f.species,50).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)),newRows=rows.filter(p=>new Date(p.date||0).getTime()>new Date(f.lastSeenAt||f.followedAt||0).getTime()),s=this.stats(app,rows);
      return '<article class="species-watch-row"><div><strong>'+app.escape(f.species)+'</strong><span>'+rows.length+' real share'+(rows.length===1?'':'s')+' within 50 mi'+(newRows.length?' • '+newRows.length+' NEW':'')+'</span><small>'+(s.topBait?'Top bait: '+app.escape(s.topBait):'No bait trend yet')+(s.newest?' • latest '+app.escape(app.prettyDate(s.newest.toISOString())):'')+'</small></div><div><button type="button" data-sw-target="'+app.escape(f.species)+'">Target</button><button type="button" data-sw-view="'+app.escape(f.species)+'">View</button><button type="button" data-sw-del="'+app.escape(f.species)+'">×</button></div></article>';
    }).join(''):'<div class="empty-state">Follow a species in Community Explorer and new nearby activity will appear here.</div>';
  },

  renderHomePulse(app){
    const panel=document.getElementById('localBitePulse');if(!panel)return;
    const l=app.state.location||{},cutoff=Date.now()-7*86400000,rows=this.realPosts(app).filter(p=>{
      const lat=Number(p.lat),lon=Number(p.lon),date=new Date(p.date||0).getTime();
      return Number.isFinite(lat)&&Number.isFinite(lon)&&app.haversine(Number(l.lat),Number(l.lon),lat,lon)<=25&&date>=cutoff;
    });
    panel.hidden=!rows.length;if(!rows.length)return;
    const s=this.stats(app,rows),title=document.getElementById('lbpTitle'),meta=document.getElementById('lbpMeta');
    if(title)title.textContent=rows.length+' real catch'+(rows.length===1?'':'es')+' shared nearby this week';
    if(meta)meta.textContent=[s.topSpecies&&s.topSpecies+' leads',s.topBait&&s.topBait+' most reported',s.newest&&'latest '+app.prettyDate(s.newest.toISOString())].filter(Boolean).join(' • ');
  },

  clearMap(app){
    if(this.mapLayer&&app.state.map){try{app.state.map.removeLayer(this.mapLayer);}catch(_){}}
    this.mapLayer=null;
  },

  mapFiltered(app){
    app.navigate?.('map');setTimeout(()=>{
      app.ensureMap?.();const map=app.state.map;if(!map||!window.L)return;
      this.clearMap(app);const rows=this.sorted(app),g=L.layerGroup(),bounds=[];
      rows.forEach(p=>{
        const lat=Number(p.lat),lon=Number(p.lon),prec=this.precision(p);if(!Number.isFinite(lat)||!Number.isFinite(lon)||prec==='hidden')return;
        const layer=prec==='exact'
          ?L.circleMarker([lat,lon],{radius:7,weight:2,fillOpacity:.82})
          :L.circle([lat,lon],{radius:5000,weight:1,fillOpacity:.045,opacity:.5});
        layer.bindPopup('<div class="cc-popup"><strong>'+app.escape(p.species||'Catch')+'</strong><br><span>'+app.escape(prec==='exact'?'Exact public share':'General area share')+'</span><br><small>'+app.escape(p.bait||'Bait not listed')+'</small></div>');
        layer.addTo(g);bounds.push([lat,lon]);
      });
      g.addTo(map);this.mapLayer=g;if(bounds.length)map.fitBounds(bounds,{padding:[25,25],maxZoom:12});app.showToast?.(bounds.length+' filtered Community location'+(bounds.length===1?'':'s')+' mapped.');
    },180);
  },

  mapPost(app,id){
    const p=this.realPosts(app).find(x=>String(x.id)===String(id));if(!p||!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lon)))return;
    app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();app.state.map?.setView([Number(p.lat),Number(p.lon)],this.precision(p)==='exact'?14:10);},160);
  },

  patchCommunity(app){
    if(app._communityExplorerPatched)return;app._communityExplorerPatched=true;
    const old=app.loadCloudCommunity?.bind(app);
    if(old)app.loadCloudCommunity=async function(opts={}){const out=await old(opts);CE.populateSpecies(this);CE.render(this);return out;};
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();CE.render(this);return out;};
  },

  render(app){this.renderExplorer(app);this.renderFollows(app);this.renderHomePulse(app);},

  bind(app){
    document.addEventListener('change',e=>{
      if(['ceSpecies','ceRadius','ceDays','ceSort','cePrecision','cePhotos'].includes(e.target.id))this.renderExplorer(app);
    });
    document.addEventListener('click',e=>{
      if(e.target.closest('#ceMapBtn')){this.mapFiltered(app);return;}
      if(e.target.closest('#ceRefreshBtn')){app.loadCloudCommunity?.({quiet:false});return;}
      if(e.target.closest('#ceFollowSpeciesBtn')){this.toggleFollow(app,document.getElementById('ceSpecies')?.value);return;}
      if(e.target.closest('#ceUseSpeciesBtn')){const s=document.getElementById('ceSpecies')?.value;if(s&&s!=='all'){app.setSpecies?.(s);app.showToast?.(s+' set as your target species.');}return;}
      if(e.target.closest('#lbpOpenBtn')){app.navigate?.('community');setTimeout(()=>document.getElementById('communityExplorerPanel')?.scrollIntoView({behavior:'smooth'}),120);return;}
      const map=e.target.closest('[data-ce-map]');if(map){this.mapPost(app,map.dataset.ceMap);return;}
      const target=e.target.closest('[data-sw-target]');if(target){app.setSpecies?.(target.dataset.swTarget);app.navigate?.('forecast');return;}
      const view=e.target.closest('[data-sw-view]');if(view){const s=view.dataset.swView,f=this.follows().find(x=>x.species===s);if(f){f.lastSeenAt=new Date().toISOString();this.saveFollows(this.follows().map(x=>x.species===s?f:x));}app.navigate?.('community');setTimeout(()=>{const sel=document.getElementById('ceSpecies');if(sel){sel.value=s;this.renderExplorer(app);}document.getElementById('communityExplorerPanel')?.scrollIntoView({behavior:'smooth'});},120);return;}
      const del=e.target.closest('[data-sw-del]');if(del){this.saveFollows(this.follows().filter(x=>x.species!==del.dataset.swDel));this.render(app);return;}
    });
  }
};

window.CastVectorCommunityExplorer=CE;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>CE.install());else CE.install();
})();