(function(){
'use strict';

const N={
  version:'15.0.0',
  tab:'contributors',

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
    if(community&&!document.getElementById('anglerNetworkPanel')){
      const p=document.createElement('section');p.id='anglerNetworkPanel';p.className='panel angler-network-panel';
      p.innerHTML=
        '<div class="an-head"><div><div class="eyebrow">ANGLER NETWORK • 15.0</div><h2>Real anglers around this water</h2><p>Boards are built only from real shared catches. Hidden locations never appear in water rankings.</p></div><span id="anTrustBadge" class="an-badge">REAL SHARES ONLY</span></div>'+
        '<div class="an-controls"><select id="anRadius" class="select-control"><option value="10">10 miles</option><option value="25" selected>25 miles</option><option value="50">50 miles</option></select><select id="anDays" class="select-control"><option value="7" selected>This week</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><select id="anSpecies" class="select-control"><option value="all">All species</option></select></div>'+
        '<div class="an-summary"><article><span>REAL SHARES</span><strong id="anShares">0</strong><small>Matching this board</small></article><article><span>CONTRIBUTORS</span><strong id="anContributors">0</strong><small>Distinct anglers</small></article><article><span>HELPFUL REACTIONS</span><strong id="anLikes">0</strong><small>Community likes</small></article><article><span>ACTIVE WATERS</span><strong id="anWaters">0</strong><small>Generalized waters</small></article></div>'+
        '<div class="an-tabs"><button type="button" data-an-tab="contributors" class="active">Contributors</button><button type="button" data-an-tab="trophies">Trophy Board</button><button type="button" data-an-tab="waters">Active Waters</button></div>'+
        '<div id="anBoard" class="an-board"></div>'+
        '<div id="anInsight" class="an-insight">Community boards will grow as real catches are shared.</div>'+
        '<div class="an-actions"><button id="anRefreshBtn" class="primary-button small" type="button">Refresh Community</button><button id="anChallengeBtn" class="secondary-button small" type="button">My challenges</button><button id="anInviteBtn" class="ghost-button small" type="button">Invite an angler</button></div>';
      const ce=document.getElementById('communityExplorerPanel'),pulse=document.getElementById('communityPulsePanel');
      if(ce)ce.after(p);else if(pulse)pulse.after(p);else community.prepend(p);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('communityReputationPanel')){
      const p=document.createElement('section');p.id='communityReputationPanel';p.className='panel community-reputation-panel';
      p.innerHTML='<div class="an-head"><div><div class="eyebrow">COMMUNITY CONTRIBUTION • 15.0</div><h2>Your signal in the network</h2></div><span id="crLevel" class="an-badge">STARTING</span></div>'+
        '<div class="cr-grid"><article><strong id="crShares">0</strong><span>Real shares</span></article><article><strong id="crLikes">0</strong><span>Helpful reactions</span></article><article><strong id="crSpecies">0</strong><span>Species shared</span></article><article><strong id="crWaters">0</strong><span>Waters shared</span></article></div>'+
        '<div id="crNext" class="cr-next">Share a real catch when you are comfortable contributing. Exact location is optional.</div>';
      const sw=document.getElementById('speciesWatchPanel'),toolkit=document.getElementById('anglerToolkitPanel');
      if(sw)sw.after(p);else if(toolkit)toolkit.after(p);else profile.appendChild(p);
    }
  },

  realPosts(app){
    const ce=window.CastVectorCommunityExplorer;
    if(ce?.realPosts)return ce.realPosts(app).filter(p=>!p.demo);
    const cloud=(app._cloudCommunityPosts||[]).filter(p=>!p.demo);
    const local=(app.normalizeLocalCommunityPosts?.()||[]).filter(p=>!p.demo);
    const out=[],seen=new Set();
    [...cloud,...local].forEach(p=>{const k=String(p.id);if(!seen.has(k)){seen.add(k);out.push(p);}});
    return out;
  },

  precision(p){
    return window.CastVectorCommunityExplorer?.precision?.(p)||p.locationPrecision||'hidden';
  },

  contributorKey(p){
    if(p.userId)return'user:'+p.userId;
    if(p.own)return'own';
    return'name:'+String(p.user||'Angler').trim().toLowerCase();
  },

  boardPosts(app){
    const radius=Number(document.getElementById('anRadius')?.value)||25,days=Number(document.getElementById('anDays')?.value)||7,species=document.getElementById('anSpecies')?.value||'all',l=app.state.location||{},cutoff=Date.now()-days*86400000;
    return this.realPosts(app).filter(p=>{
      const date=new Date(p.date||0).getTime();
      if(Number.isFinite(date)&&date<cutoff)return false;
      if(species!=='all'&&p.species!==species)return false;
      const lat=Number(p.lat),lon=Number(p.lon);
      if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)>1){
        if(app.haversine(Number(l.lat),Number(l.lon),lat,lon)>radius)return false;
      }else if(!p.own)return false;
      return true;
    });
  },

  waterName(app,p){
    if(this.precision(p)==='hidden')return null;
    const w=String(p.water||'').trim();
    if(!w||w==='Location hidden')return null;
    return app.generalizeWater?.(w)||w;
  },

  contributors(app,rows){
    const map=new Map();
    rows.forEach(p=>{
      const key=this.contributorKey(p),x=map.get(key)||{key,name:p.own?'You':p.user||'CastVector Angler',own:!!p.own,shares:0,likes:0,species:new Set(),waters:new Set(),latest:0};
      x.shares++;x.likes+=Number(p.likes)||0;if(p.species)x.species.add(p.species);
      const w=this.waterName(app,p);if(w)x.waters.add(w);
      x.latest=Math.max(x.latest,new Date(p.date||0).getTime()||0);map.set(key,x);
    });
    return [...map.values()].map(x=>({...x,speciesCount:x.species.size,waterCount:x.waters.size,score:x.shares*10+x.species.size*4+Math.min(30,x.likes*2)})).sort((a,b)=>b.score-a.score||b.latest-a.latest);
  },

  trophyRows(app,rows){
    const species=document.getElementById('anSpecies')?.value||'all',groups=new Map();
    rows.forEach(p=>{
      const len=Number(p.length)||0,w=Number(p.weight)||0;if(len<=0&&w<=0)return;
      const key=species==='all'?String(p.species||'Unknown'):species,old=groups.get(key);
      const metric=len>0?len:w,oldMetric=old?(old.length>0?old.length:old.weight):0;
      if(!old||metric>oldMetric)groups.set(key,{...p,length:len,weight:w});
    });
    return [...groups.values()].sort((a,b)=>(Number(b.length)||0)-(Number(a.length)||0)||(Number(b.weight)||0)-(Number(a.weight)||0));
  },

  waters(app,rows){
    const map=new Map();
    rows.forEach(p=>{
      const name=this.waterName(app,p);if(!name)return;
      const x=map.get(name)||{name,shares:0,species:new Map(),likes:0,latest:0};
      x.shares++;x.likes+=Number(p.likes)||0;if(p.species)x.species.set(p.species,1+(x.species.get(p.species)||0));x.latest=Math.max(x.latest,new Date(p.date||0).getTime()||0);map.set(name,x);
    });
    return [...map.values()].map(x=>({...x,topSpecies:[...x.species.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'})).sort((a,b)=>b.shares-a.shares||b.latest-a.latest);
  },

  populateSpecies(app){
    const el=document.getElementById('anSpecies');if(!el)return;
    const current=el.value||'all',names=[...new Set(this.realPosts(app).map(p=>p.species).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    el.innerHTML='<option value="all">All species</option>'+names.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
    el.value=names.includes(current)?current:'all';
  },

  renderSummary(app,rows){
    const contributors=this.contributors(app,rows),waters=this.waters(app,rows),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('anShares',rows.length);set('anContributors',contributors.length);set('anLikes',rows.reduce((n,p)=>n+(Number(p.likes)||0),0));set('anWaters',waters.length);
    const badge=document.getElementById('anTrustBadge');if(badge)badge.textContent=rows.length?'REAL SHARES ONLY':'NETWORK GROWING';
  },

  renderContributors(app,rows){
    const c=this.contributors(app,rows),box=document.getElementById('anBoard');if(!box)return;
    box.innerHTML=c.length?c.slice(0,12).map((x,i)=>'<article class="an-rank-row"><span class="an-rank">#'+(i+1)+'</span><div><strong>'+app.escape(x.name)+'</strong><small>'+x.shares+' share'+(x.shares===1?'':'s')+' • '+x.speciesCount+' species • '+x.likes+' helpful reaction'+(x.likes===1?'':'s')+'</small></div><b>'+x.score+' pts</b></article>').join(''):'<div class="empty-state">No real contributors match this board yet.</div>';
  },

  renderTrophies(app,rows){
    const t=this.trophyRows(app,rows),box=document.getElementById('anBoard');if(!box)return;
    box.innerHTML=t.length?t.slice(0,16).map(x=>{
      const size=x.length?Math.round(x.length*10)/10+' in':Math.round(x.weight*10)/10+' lb';
      return '<article class="an-trophy-row"><div class="an-trophy-mark">★</div><div><strong>'+app.escape(x.species||'Catch')+' • '+app.escape(size)+'</strong><small>'+app.escape(x.own?'You':x.user||'CastVector Angler')+' • '+app.escape(app.prettyDate(x.date))+'</small></div><span>'+(Number(x.likes)||0)+' ♥</span></article>';
    }).join(''):'<div class="empty-state">No reported catch sizes match this board yet.</div>';
  },

  renderWaters(app,rows){
    const w=this.waters(app,rows),box=document.getElementById('anBoard');if(!box)return;
    box.innerHTML=w.length?w.slice(0,14).map((x,i)=>'<article class="an-water-row"><span>#'+(i+1)+'</span><div><strong>'+app.escape(x.name)+'</strong><small>'+x.shares+' real share'+(x.shares===1?'':'s')+' • '+app.escape(x.topSpecies)+' leads • '+x.likes+' reactions</small></div></article>').join(''):'<div class="empty-state">No privacy-safe water activity matches this board yet.</div>';
  },

  renderInsight(app,rows){
    const box=document.getElementById('anInsight');if(!box)return;
    const contrib=this.contributors(app,rows),waters=this.waters(app,rows),parts=[];
    if(rows.length)parts.push(rows.length+' real share'+(rows.length===1?'':'s')+' in this board');
    if(contrib[0])parts.push((contrib[0].own?'You':contrib[0].name)+' leads community contribution');
    if(waters[0])parts.push(waters[0].name+' has the most shared activity');
    box.textContent=parts.length?parts.join(' • ')+'. Contribution points reward real sharing, species variety and helpful reactions—not fish size.':'This board is intentionally empty until real anglers share catches.';
  },

  myStats(app){
    const rows=this.realPosts(app).filter(p=>p.own),likes=rows.reduce((n,p)=>n+(Number(p.likes)||0),0),species=new Set(rows.map(p=>p.species).filter(Boolean)),waters=new Set(rows.map(p=>this.waterName(app,p)).filter(Boolean));
    return{shares:rows.length,likes,species:species.size,waters:waters.size};
  },

  renderProfile(app){
    const s=this.myStats(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('crShares',s.shares);set('crLikes',s.likes);set('crSpecies',s.species);set('crWaters',s.waters);
    const score=s.shares*10+s.species*4+Math.min(30,s.likes*2),level=score>=150?'ANCHOR':score>=75?'REGULAR':score>=25?'CONTRIBUTOR':score>0?'NEW SHARE':'STARTING';
    set('crLevel',level);
    set('crNext',s.shares===0?'Share a real catch when you are comfortable contributing. General-area and hidden-location options protect your spot.':s.shares<3?'A few more real shares will strengthen Community intelligence around your waters.':s.likes<3?'Helpful details—bait, conditions and technique—give other anglers more to react to.':'Your real shares are actively improving CastVector Community intelligence.');
  },

  render(app){
    const rows=this.boardPosts(app);this.renderSummary(app,rows);this.renderInsight(app,rows);this.renderProfile(app);
    document.querySelectorAll('[data-an-tab]').forEach(b=>b.classList.toggle('active',b.dataset.anTab===this.tab));
    if(this.tab==='trophies')this.renderTrophies(app,rows);else if(this.tab==='waters')this.renderWaters(app,rows);else this.renderContributors(app,rows);
  },

  openChallenges(app){
    app.state.community.tab='challenges';app.save?.();app.navigate?.('community');app.renderCommunity?.();
    setTimeout(()=>document.getElementById('communityChallengesPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
  },

  async invite(app){
    const text='I’m testing CastVector — a fishing app that helps decide where, when and how to fish. Join me and share real catches without giving away private spots.';
    const url='https://2genrips.github.io/coastcast-app/';
    try{if(navigator.share){await navigator.share({title:'CastVector Fishing',text,url});return;}}catch(e){if(e?.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(text+' '+url);app.showToast?.('CastVector invite copied.');}catch(_){app.showToast?.('Could not share the invite.');}
  },

  patchCommunity(app){
    if(app._anglerNetworkPatched)return;app._anglerNetworkPatched=true;
    const old=app.loadCloudCommunity?.bind(app);
    if(old)app.loadCloudCommunity=async function(opts={}){
      const out=await old(opts);N.populateSpecies(this);N.render(this);return out;
    };
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();N.render(this);return out;};
  },

  bind(app){
    document.addEventListener('change',e=>{if(['anRadius','anDays','anSpecies'].includes(e.target.id))this.render(app);});
    document.addEventListener('click',e=>{
      const tab=e.target.closest('[data-an-tab]');if(tab){this.tab=tab.dataset.anTab;this.render(app);return;}
      if(e.target.closest('#anRefreshBtn')){app.loadCloudCommunity?.({quiet:false});return;}
      if(e.target.closest('#anChallengeBtn')){this.openChallenges(app);return;}
      if(e.target.closest('#anInviteBtn')){this.invite(app);return;}
    });
  }
};

window.CastVectorAnglerNetwork=N;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>N.install());else N.install();
})();