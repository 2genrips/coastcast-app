(function(){
'use strict';

const W={
  version:'11.5.0',
  key:'castvector-water-watchlist-v115',

  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchCommunity(app);
    this.patchDiscover(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const community=document.getElementById('view-community');
    if(community&&!document.getElementById('waterReportPanel')){
      const p=document.createElement('section');p.id='waterReportPanel';p.className='panel water-report-panel';
      p.innerHTML='<div class="wr-head"><div><div class="eyebrow">WATER REPORT • 11.5</div><h2>What is this water telling you?</h2></div><button id="followWaterBtn" class="wr-follow" type="button">Follow water</button></div>'+
        '<div class="wr-hero"><div><span>WATER</span><strong id="wrWaterName">—</strong><small id="wrWaterMeta">Selected CastVector location</small></div><div class="wr-score"><strong id="wrScore">—</strong><span>LIVE SCORE</span></div></div>'+
        '<div class="wr-grid"><article><span>REAL SHARES</span><strong id="wrCommunity">0</strong><small>Within 25 miles</small></article><article><span>14-DAY TREND</span><strong id="wrTrend">—</strong><small id="wrTrendMeta">Community activity</small></article><article><span>TOP SPECIES</span><strong id="wrSpecies">—</strong><small>Shared-catch sample</small></article><article><span>TOP BAIT</span><strong id="wrBait">—</strong><small>Shared-catch sample</small></article><article><span>YOUR CATCHES</span><strong id="wrPersonal">0</strong><small id="wrPersonalMeta">Near this water</small></article><article><span>TROPHY SIGNAL</span><strong id="wrTrophy">—</strong><small id="wrTrophyMeta">Based on shared sizes</small></article></div>'+
        '<div id="wrInsight" class="wr-insight">Water Report will combine current conditions, real Community catches and your private history.</div>'+
        '<div class="wr-actions"><button id="wrOpenMap" class="primary-button small" type="button">Open Map Pro</button><button id="wrRefreshCommunity" class="secondary-button small" type="button">Refresh report</button><button id="wrTripBtn" class="secondary-button small" type="button">Build trip here</button></div>';
      const pulse=document.getElementById('communityPulsePanel');if(pulse)pulse.after(p);else community.prepend(p);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('waterWatchlistPanel')){
      const p=document.createElement('section');p.id='waterWatchlistPanel';p.className='panel water-watchlist-panel';
      p.innerHTML='<div class="wr-head"><div><div class="eyebrow">WATER WATCHLIST • 11.5</div><h2>Your waters at a glance</h2></div><span id="watchlistBadge" class="wr-badge">0 FOLLOWED</span></div>'+
        '<p class="wr-note">Follow waters you care about. CastVector can refresh a small watchlist against live conditions and surface real Community activity when available.</p>'+
        '<div id="waterWatchlist" class="water-watchlist"></div>'+
        '<div class="wr-actions"><button id="watchlistRefreshBtn" class="primary-button small" type="button">Refresh watched waters</button><button id="watchlistCurrentBtn" class="secondary-button small" type="button">Follow current water</button></div>';
      const tk=document.getElementById('anglerToolkitPanel');if(tk)tk.after(p);else profile.appendChild(p);
    }

    const dock=document.querySelector('#mapProDock .map-pro-topline');
    if(dock&&!document.getElementById('waterReportMapBtn')){
      const b=document.createElement('button');b.id='waterReportMapBtn';b.className='map-pro-focus-btn';b.type='button';b.innerHTML='≈ <span>Report</span>';dock.appendChild(b);
    }

    if(!document.getElementById('waterReportDialog')){
      const d=document.createElement('dialog');d.id='waterReportDialog';d.className='sheet-dialog wr-dialog';
      d.innerHTML='<div class="sheet-card wr-sheet"><div class="wr-head"><div><div class="eyebrow">CASTVECTOR WATER REPORT • 11.5</div><h2 id="wrDialogTitle">Water report</h2><p>Real community activity + your private catches + current conditions. No demo posts are used.</p></div><button id="wrDialogClose" class="icon-button" type="button">×</button></div><div id="wrDialogBody" class="wr-dialog-body"></div><div class="wr-actions"><button id="wrDialogFollow" class="primary-button small" type="button">Follow this water</button><button id="wrDialogTrip" class="secondary-button small" type="button">Build trip</button><button id="wrDialogMap" class="secondary-button small" type="button">Map</button></div></div>';
      document.body.appendChild(d);
    }
  },

  list(){
    try{const x=JSON.parse(localStorage.getItem(this.key)||'[]');return Array.isArray(x)?x:[];}catch(_){return[];}
  },

  saveList(list){
    try{localStorage.setItem(this.key,JSON.stringify(list.slice(0,12)));}catch(_){}
  },

  id(lat,lon){return Number(lat).toFixed(3)+','+Number(lon).toFixed(3);},

  currentEntry(app){
    const l=app.state.location||{},id=this.id(l.lat,l.lon);
    return this.list().find(x=>x.id===id)||null;
  },

  followCurrent(app){
    const l=app.state.location||{},id=this.id(l.lat,l.lon),list=this.list(),idx=list.findIndex(x=>x.id===id);
    if(idx>=0){
      list.splice(idx,1);this.saveList(list);app.showToast?.('Water removed from your watchlist.');
    }else{
      list.unshift({id,name:l.name,lat:Number(l.lat),lon:Number(l.lon),source:l.source||'CastVector',followedAt:new Date().toISOString(),lastSeenAt:new Date().toISOString(),lastReport:null});
      this.saveList(list);app.showToast?.((l.name||'Water')+' added to your watchlist.');
    }
    this.render(app);
  },

  realPosts(app){
    const batch=window.CastVectorBatchUpgrades;
    if(batch?.realCommunityPosts)return batch.realCommunityPosts(app);
    const cloud=(app._cloudCommunityPosts||[]).filter(p=>!p.demo),local=(app.normalizeLocalCommunityPosts?.()||[]).filter(p=>!p.demo),seen=new Set(),out=[];
    [...cloud,...local].forEach(p=>{const id=String(p.id);if(!seen.has(id)){seen.add(id);out.push(p);}});
    return out;
  },

  nearPosts(app,lat,lon,radius=25){
    return this.realPosts(app).filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&app.haversine(lat,lon,Number(p.lat),Number(p.lon))<=radius);
  },

  nearPersonal(app,lat,lon,radius=15){
    return (app.state.catches||[]).filter(c=>Number.isFinite(Number(c.lat))&&Number.isFinite(Number(c.lon))&&app.haversine(lat,lon,Number(c.lat),Number(c.lon))<=radius);
  },

  mode(arr){
    const m=new Map();arr.filter(Boolean).forEach(v=>m.set(String(v),1+(m.get(String(v))||0)));
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },

  report(app,lat=Number(app.state.location?.lat),lon=Number(app.state.location?.lon),name=app.state.location?.name){
    const posts=this.nearPosts(app,lat,lon,25),personal=this.nearPersonal(app,lat,lon,15),now=Date.now(),d14=14*86400000;
    const recent=posts.filter(p=>now-new Date(p.date||0).getTime()<=d14),prior=posts.filter(p=>{const age=now-new Date(p.date||0).getTime();return age>d14&&age<=d14*2;});
    let trend='QUIET',trendDetail='No real Community activity in the last 14 days.';
    if(recent.length){
      const delta=recent.length-prior.length;
      trend=delta>=3?'UP':delta<=-3?'DOWN':'STEADY';
      trendDetail=recent.length+' shared catch'+(recent.length===1?'':'es')+' in 14 days • '+(delta>0?'+':'')+delta+' vs prior 14 days';
    }
    const species=this.mode(posts.map(p=>p.species)),bait=this.mode(posts.map(p=>p.bait).filter(x=>x&&x!=='Not listed'));
    const lengths=posts.map(p=>Number(p.length)).filter(x=>Number.isFinite(x)&&x>0),weights=posts.map(p=>Number(p.weight)).filter(x=>Number.isFinite(x)&&x>0);
    const trophyLen=lengths.length?Math.max(...lengths):null,trophyWeight=weights.length?Math.max(...weights):null;
    const personalBait=this.mode(personal.map(c=>c.bait).filter(Boolean)),personalSpecies=this.mode(personal.map(c=>c.species));
    const followed=this.list().find(x=>x.id===this.id(lat,lon));
    const newest=posts.map(p=>new Date(p.date||0).getTime()).filter(Number.isFinite).sort((a,b)=>b-a)[0]||0;
    const unseen=followed?posts.filter(p=>new Date(p.date||0).getTime()>new Date(followed.lastSeenAt||followed.followedAt||0).getTime()).length:0;
    return{
      name:name||'Fishing water',lat,lon,posts,recent,prior,trend,trendDetail,species,bait,personal,personalBait,personalSpecies,
      trophyLen,trophyWeight,followed:!!followed,unseen,newest,
      score:this.id(lat,lon)===this.id(app.state.location?.lat,app.state.location?.lon)?app.currentScore?.():followed?.lastReport?.score??null,
      bestTime:followed?.lastReport?.bestTime||null,wind:followed?.lastReport?.wind??null,wave:followed?.lastReport?.wave??null
    };
  },

  renderReport(app){
    const r=this.report(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('wrWaterName',r.name);set('wrWaterMeta',(app.state.location?.source||'CastVector')+(r.followed?' • FOLLOWING':''));
    set('wrScore',r.score==null?'—':r.score);set('wrCommunity',r.posts.length);set('wrTrend',r.trend);set('wrTrendMeta',r.trendDetail);
    set('wrSpecies',r.species||'—');set('wrBait',r.bait||'—');set('wrPersonal',r.personal.length);
    set('wrPersonalMeta',r.personal.length?(r.personalSpecies||'Your catches')+(r.personalBait?' • '+r.personalBait:''):'No private catches nearby yet');
    set('wrTrophy',r.trophyLen?Math.round(r.trophyLen*10)/10+' in':r.trophyWeight?Math.round(r.trophyWeight*10)/10+' lb':'—');
    set('wrTrophyMeta',r.trophyLen||r.trophyWeight?'Largest size in the real shared sample':'Shared sample has no size data yet');
    const insight=document.getElementById('wrInsight');
    if(insight){
      const parts=[];
      if(r.recent.length)parts.push(r.recent.length+' real catch share'+(r.recent.length===1?'':'s')+' recently');
      if(r.species)parts.push(r.species+' leads the shared sample');
      if(r.bait)parts.push(r.bait+' is the most-reported bait');
      if(r.personal.length)parts.push('you have '+r.personal.length+' private catch'+(r.personal.length===1?'':'es')+' near here');
      insight.textContent=parts.length?parts.join(' • ')+'. Community samples can be incomplete; treat them as supporting evidence, not a guarantee.':'Not enough real Community data yet. Your live forecast and private history remain the stronger signals.';
    }
    const follow=document.getElementById('followWaterBtn');if(follow)follow.textContent=r.followed?'Following ✓':'Follow water';
  },

  renderDialog(app,report=null){
    const r=report||this.report(app),title=document.getElementById('wrDialogTitle'),body=document.getElementById('wrDialogBody');
    if(title)title.textContent=r.name;
    if(body)body.innerHTML=
      '<div class="wr-dialog-hero"><div><span>LIVE / CACHED SCORE</span><strong>'+(r.score==null?'—':r.score+'/100')+'</strong></div><div><span>RECENT REAL SHARES</span><strong>'+r.recent.length+'</strong></div><div><span>TOP SPECIES</span><strong>'+app.escape(r.species||'—')+'</strong></div><div><span>TOP BAIT</span><strong>'+app.escape(r.bait||'—')+'</strong></div></div>'+
      '<div class="wr-dialog-copy"><strong>'+app.escape(r.trend)+' activity trend</strong><span>'+app.escape(r.trendDetail)+'</span></div>'+
      '<div class="wr-report-list">'+
        '<div><span>Your private catches nearby</span><b>'+r.personal.length+'</b></div>'+
        '<div><span>Largest shared length</span><b>'+(r.trophyLen?Math.round(r.trophyLen*10)/10+' in':'—')+'</b></div>'+
        '<div><span>Best window</span><b>'+app.escape(r.bestTime||'Load this water for live timing')+'</b></div>'+
        '<div><span>Unseen shares since your last check</span><b>'+r.unseen+'</b></div>'+
      '</div>'+
      '<p class="wr-caveat">Community metrics only use real shared catches visible to CastVector. Hidden locations are never exposed, and small samples can be noisy.</p>';
    const b=document.getElementById('wrDialogFollow');if(b)b.textContent=r.followed?'Unfollow water':'Follow this water';
    this._dialogReport=r;
  },

  openDialog(app,report=null){
    this.renderDialog(app,report);const d=document.getElementById('waterReportDialog');if(d&&!d.open)d.showModal();
    if(report?.followed)this.markSeen(report);
  },

  markSeen(report){
    const list=this.list(),x=list.find(w=>w.id===this.id(report.lat,report.lon));if(!x)return;
    x.lastSeenAt=new Date().toISOString();this.saveList(list);
  },

  renderWatchlist(app){
    const list=this.list(),box=document.getElementById('waterWatchlist'),badge=document.getElementById('watchlistBadge');
    if(badge)badge.textContent=list.length+' FOLLOWED';
    if(!box)return;
    box.innerHTML=list.length?list.map(w=>{
      const r=this.report(app,w.lat,w.lon,w.name),rep=w.lastReport||{},status=Number.isFinite(Number(rep.score))?Number(rep.score)>=80?'HOT':Number(rep.score)>=65?'GOOD':'WATCH':'NOT REFRESHED';
      return '<article class="water-watch-row"><div class="water-watch-score"><strong>'+(Number.isFinite(Number(rep.score))?rep.score:'—')+'</strong><span>/100</span></div><div><strong>'+app.escape(w.name)+'</strong><small>'+app.escape(status)+(rep.bestTime?' • '+app.escape(rep.bestTime):'')+(r.unseen?' • '+r.unseen+' NEW SHARE'+(r.unseen===1?'':'S'):'')+'</small></div><div class="water-watch-actions"><button type="button" data-water-use="'+app.escape(w.id)+'">Use</button><button type="button" data-water-report="'+app.escape(w.id)+'">Report</button><button type="button" data-water-del="'+app.escape(w.id)+'">×</button></div></article>';
    }).join(''):'<div class="empty-state">Follow a lake, river, beach, inlet or other fishing destination and it will appear here.</div>';
  },

  async refreshWatchlist(app){
    const list=this.list();if(!list.length)return app.showToast?.('Follow a water first.');
    const btn=document.getElementById('watchlistRefreshBtn');if(btn){btn.disabled=true;btn.textContent='Refreshing…';}
    const oldPeriod=app.state.scout?.period,oldSpecies=app.state.scout?.species;
    app.state.scout.period='today';app.state.scout.species=app.state.targetSpecies;
    for(const w of list.slice(0,8)){
      try{
        const r=await app.scoutEvaluateSpot?.({id:w.id,name:w.name,lat:w.lat,lon:w.lon,type:'Followed water',source:'Water Watchlist',match:72});
        if(r)w.lastReport={score:r.score,bestTime:r.bestTime,wind:r.wind,wave:r.wave,water:r.water,rain:r.rain,checkedAt:new Date().toISOString()};
      }catch(_){
        if(!w.lastReport)w.lastReport={score:null,checkedAt:new Date().toISOString(),error:true};
      }
    }
    app.state.scout.period=oldPeriod;app.state.scout.species=oldSpecies;this.saveList(list);this.renderWatchlist(app);this.renderReport(app);
    if(btn){btn.disabled=false;btn.textContent='Refresh watched waters';}
    app.showToast?.('Water Watchlist refreshed.');
  },

  useWater(app,id){
    const w=this.list().find(x=>x.id===id);if(!w)return;
    app.state.location={key:'watched-water',name:w.name,lat:Number(w.lat),lon:Number(w.lon),source:'Water Watchlist'};app.onLocationChanged?.();app.navigate?.('home');app.showToast?.(w.name+' loaded.');
  },

  removeWater(app,id){
    this.saveList(this.list().filter(x=>x.id!==id));this.render(app);app.showToast?.('Water removed from watchlist.');
  },

  buildTrip(app,report=null){
    const r=report||this.report(app);
    if(this.id(r.lat,r.lon)!==this.id(app.state.location?.lat,app.state.location?.lon)){
      app.state.location={key:'watched-water',name:r.name,lat:r.lat,lon:r.lon,source:'Water Report'};app.onLocationChanged?.();
    }
    app.navigate?.('trips');setTimeout(()=>window.CastVectorTakeMeFishing?.build?.(app),220);
  },

  patchCommunity(app){
    if(app._waterReportCommunity)return;app._waterReportCommunity=true;
    const old=app.loadCloudCommunity?.bind(app);
    if(old)app.loadCloudCommunity=async function(opts={}){const out=await old(opts);W.render(this);return out;};
  },

  patchDiscover(app){
    const d=window.CastVectorDiscover;if(!d||d._waterWatchPatched)return;d._waterWatchPatched=true;
    const old=d.pool?.bind(d);
    if(old)d.pool=function(a,p,env){
      const base=old(a,p,env),watched=W.list();
      watched.forEach(w=>{
        if(base.some(x=>a.haversine(x.lat,x.lon,w.lat,w.lon)<.1))return;
        const distance=a.haversine(Number(a.state.location.lat),Number(a.state.location.lon),Number(w.lat),Number(w.lon));
        if(distance<=p.radius*1.15)base.push({id:'watched-'+w.id,name:w.name,lat:Number(w.lat),lon:Number(w.lon),distance,type:'Followed water',sourceKind:'Water Watchlist',source:'Water Watchlist',match:Number(w.lastReport?.score)||76,verified:false});
      });
      return base.sort((x,y)=>Number(y.match||0)-Number(x.match||0)||x.distance-y.distance).slice(0,12);
    };
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();W.render(this);return out;};
  },

  render(app){this.renderReport(app);this.renderWatchlist(app);},

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#followWaterBtn')||e.target.closest('#watchlistCurrentBtn')){this.followCurrent(app);return;}
      if(e.target.closest('#wrOpenMap')){app.navigate?.('map');return;}
      if(e.target.closest('#wrRefreshCommunity')){app.loadCloudCommunity?.({quiet:false});return;}
      if(e.target.closest('#wrTripBtn')){this.buildTrip(app);return;}
      if(e.target.closest('#watchlistRefreshBtn')){this.refreshWatchlist(app);return;}
      if(e.target.closest('#waterReportMapBtn')){this.openDialog(app);return;}
      if(e.target.closest('#wrDialogClose')){document.getElementById('waterReportDialog')?.close();return;}
      if(e.target.closest('#wrDialogFollow')){
        const r=this._dialogReport||this.report(app);
        if(this.id(r.lat,r.lon)!==this.id(app.state.location?.lat,app.state.location?.lon)){
          const list=this.list(),idx=list.findIndex(x=>x.id===this.id(r.lat,r.lon));
          if(idx>=0)list.splice(idx,1);else list.unshift({id:this.id(r.lat,r.lon),name:r.name,lat:r.lat,lon:r.lon,source:'Water Report',followedAt:new Date().toISOString(),lastSeenAt:new Date().toISOString(),lastReport:null});
          this.saveList(list);this.render(app);this.renderDialog(app,{...r,followed:idx<0});
        }else this.followCurrent(app);
        return;
      }
      if(e.target.closest('#wrDialogTrip')){document.getElementById('waterReportDialog')?.close();this.buildTrip(app,this._dialogReport);return;}
      if(e.target.closest('#wrDialogMap')){document.getElementById('waterReportDialog')?.close();const r=this._dialogReport||this.report(app);app.navigate?.('map');setTimeout(()=>{app.ensureMap?.();app.state.map?.setView([r.lat,r.lon],13);},140);return;}
      const use=e.target.closest('[data-water-use]');if(use){this.useWater(app,use.dataset.waterUse);return;}
      const rep=e.target.closest('[data-water-report]');if(rep){const w=this.list().find(x=>x.id===rep.dataset.waterReport);if(w){const r=this.report(app,w.lat,w.lon,w.name);this.markSeen(r);this.openDialog(app,r);}return;}
      const del=e.target.closest('[data-water-del]');if(del){this.removeWater(app,del.dataset.waterDel);return;}
    });
  }
};

window.CastVectorWaterReports=W;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>W.install());else W.install();
})();