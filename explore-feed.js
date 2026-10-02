(function(){
'use strict';
const E={
  version:'7.1.0',
  mapTools:[],
  setup(){
    const app=window.CastVector;if(!app)return;
    this.setupMap(app);
    this.setupFeed(app);
    this.bind(app);
    this.renderMapSheet(app);
  },
  setupMap(app){
    const view=document.getElementById('view-map');if(!view)return;
    const head=view.querySelector('.page-head'),map=document.getElementById('leafletMap')?.closest('.map-panel');
    if(head){
      const h1=head.querySelector('h1'),p=head.querySelector('.page-subtitle');
      if(h1)h1.textContent='Explore';
      if(p)p.textContent='Tap the map to analyze a spot, then open deeper tools only when you need them.';
    }
    if(!document.getElementById('map7Nav')){
      const nav=document.createElement('div');nav.id='map7Nav';nav.className='map7-nav';
      nav.innerHTML='<button class="map7-chip active" type="button" data-map7-tool="map">Map</button><button class="map7-chip" type="button" data-map7-tool="scout">Scout</button><button class="map7-chip" type="button" data-map7-tool="compare">Compare</button><button class="map7-chip" type="button" data-map7-tool="water">Water</button><button class="map7-chip" type="button" data-map7-tool="data">Data</button>';
      head?.after(nav);
    }
    if(map){
      const nav=document.getElementById('map7Nav');nav?.after(map);
      map.classList.add('map7-hero');
      if(!document.getElementById('map7SpotSheet')){
        const sheet=document.createElement('div');sheet.id='map7SpotSheet';sheet.className='map7-spot-sheet idle';
        sheet.innerHTML='<div><span class="eyebrow">FISH HERE</span><strong id="map7SpotTitle">Tap anywhere on the map</strong><small id="map7SpotMeta">CastVector will analyze that exact point.</small></div><div class="map7-sheet-score"><strong id="map7SpotScore">—</strong><span>/100</span></div><div class="map7-sheet-actions"><button id="map7SpotUse" class="primary-button small" type="button" disabled>Use spot</button><button id="map7SpotSave" class="secondary-button small" type="button" disabled>Save</button><button id="map7SpotDetails" class="ghost-button small" type="button">Details</button></div>';
        map.appendChild(sheet);
      }
    }
    const defs=[
      ['scout',view.querySelector('.scout-command-panel')],
      ['compare',document.getElementById('spotCompareProPanel')],
      ['water',document.getElementById('waterIntelPanel')],
      ['data',document.getElementById('dataTrustPanel')],
      ['details',document.getElementById('spotDNAPanel')]
    ];
    this.mapTools=defs.filter(x=>x[1]);
    this.mapTools.forEach(([key,el])=>{el.dataset.map7Section=key;el.classList.add('map7-secondary');el.hidden=true;});
    [view.querySelector('.map-intel-hero'),document.getElementById('topSpotCard')].filter(Boolean).forEach(el=>{el.classList.add('map7-secondary','map7-legacy');el.hidden=true;});
    this.patchSpotDNA(app);
  },
  patchSpotDNA(app){
    const d=window.CastVectorSpotDNA;if(!d||d._map7Patched)return;
    d._map7Patched=true;
    const oldRender=d.render?.bind(d);
    if(oldRender)d.render=function(a){const out=oldRender(a);E.renderMapSheet(a);return out;};
    d.openPanel=function(a){E.renderMapSheet(a);};
  },
  showMapTool(key){
    document.querySelectorAll('.map7-chip').forEach(b=>b.classList.toggle('active',b.dataset.map7Tool===key));
    this.mapTools.forEach(([k,el])=>el.hidden=k!==key);
    if(key==='map'){
      this.mapTools.forEach(([,el])=>el.hidden=true);
      document.querySelector('.map7-hero')?.scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      const el=this.mapTools.find(x=>x[0]===key)?.[1];
      el?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },
  renderMapSheet(app){
    const sheet=document.getElementById('map7SpotSheet');if(!sheet)return;
    const st=app.state.spotDNA||{},r=st.result;
    if(st.status==='loading'){
      sheet.className='map7-spot-sheet loading';
      document.getElementById('map7SpotTitle').textContent='Analyzing this water…';
      document.getElementById('map7SpotMeta').textContent='Reading exact-point weather, marine, species and access signals.';
      return;
    }
    if(!r){
      sheet.className='map7-spot-sheet idle';
      document.getElementById('map7SpotTitle').textContent='Tap anywhere on the map';
      document.getElementById('map7SpotMeta').textContent='CastVector will answer “Fish here?” for that point.';
      document.getElementById('map7SpotScore').textContent='—';
      document.getElementById('map7SpotUse').disabled=true;document.getElementById('map7SpotSave').disabled=true;
      return;
    }
    const top=r.species?.[0],access=r.access?.verified?'Mapped access nearby':'Access unverified',personal=r.personal?.score!=null?' • '+r.personal.score+'% personal match':'';
    sheet.className='map7-spot-sheet ready '+(r.call?.tone||'');
    document.getElementById('map7SpotTitle').textContent=(top?.name||'Fishing')+' • '+(r.call?.call||'Fish here');
    document.getElementById('map7SpotMeta').textContent=access+' • '+(top?.score||'—')+' species score'+personal;
    document.getElementById('map7SpotScore').textContent=r.call?.score??top?.score??'—';
    document.getElementById('map7SpotUse').disabled=false;document.getElementById('map7SpotSave').disabled=false;
  },
  setupFeed(app){
    const view=document.getElementById('view-community');if(!view)return;
    const head=view.querySelector('.page-head');
    if(head){
      const h1=head.querySelector('h1'),p=head.querySelector('.page-subtitle');
      if(h1)h1.textContent='Community';
      if(p)p.textContent='Real catches, useful fishing intel and live conversation—without exposing private spots.';
    }
    if(!document.getElementById('feed7Tabs')){
      const tabs=document.createElement('div');tabs.id='feed7Tabs';tabs.className='feed7-tabs';
      tabs.innerHTML='<button class="feed7-tab active" type="button" data-feed7="catches">Catches</button><button class="feed7-tab" type="button" data-feed7="live">Live</button><button class="feed7-tab" type="button" data-feed7="challenges">Challenges</button>';
      head?.after(tabs);
    }
    const tabs=document.getElementById('feed7Tabs'),controls=view.querySelector('.community-controls'),feed=document.getElementById('communityFeedPanel'),chat=document.getElementById('communityLivePanel'),mode=view.querySelector('.community-mode-panel'),challenges=document.getElementById('communityChallengesPanel');
    if(tabs&&controls)tabs.after(controls);
    if(controls&&feed)controls.after(feed);
    if(feed&&chat)feed.after(chat);
    if(chat&&mode)chat.after(mode);
    if(chat)chat.hidden=true;if(challenges)challenges.hidden=true;if(mode)mode.classList.add('feed7-secondary');
    view.classList.add('feed7-view');
    this.setFeedMode(app,'catches',false);
  },
  setFeedMode(app,mode,scroll=true){
    const view=document.getElementById('view-community');if(!view)return;
    const feed=document.getElementById('communityFeedPanel'),controls=view.querySelector('.community-controls'),chat=document.getElementById('communityLivePanel'),ch=document.getElementById('communityChallengesPanel');
    document.querySelectorAll('.feed7-tab').forEach(b=>b.classList.toggle('active',b.dataset.feed7===mode));
    if(mode==='live'){
      if(feed)feed.hidden=true;if(controls)controls.hidden=true;if(ch)ch.hidden=true;if(chat)chat.hidden=false;
    }else if(mode==='challenges'){
      if(feed)feed.hidden=true;if(controls)controls.hidden=true;if(chat)chat.hidden=true;
      app.setCommunityTab?.('challenges');if(ch)ch.hidden=false;
    }else{
      if(chat)chat.hidden=true;if(ch)ch.hidden=true;if(controls)controls.hidden=false;
      app.setCommunityTab?.('feed');if(feed)feed.hidden=false;
    }
    if(scroll)view.querySelector('.page-head')?.scrollIntoView({behavior:'smooth',block:'start'});
  },
  bind(app){
    document.addEventListener('click',e=>{
      const m=e.target.closest('[data-map7-tool]');if(m){this.showMapTool(m.dataset.map7Tool);return;}
      if(e.target.closest('#map7SpotUse')){window.CastVectorSpotDNA?.useAsDestination?.(app);return;}
      if(e.target.closest('#map7SpotSave')){window.CastVectorSpotDNA?.save?.(app);return;}
      if(e.target.closest('#map7SpotDetails')){this.showMapTool('details');return;}
      const f=e.target.closest('[data-feed7]');if(f){this.setFeedMode(app,f.dataset.feed7);return;}
    });
  }
};
window.CastVectorExploreFeed=E;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>E.setup());else E.setup();
})();