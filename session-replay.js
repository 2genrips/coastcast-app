(function(){
'use strict';
const Replay={
  version:'9.5.0',
  watchId:null,
  replayLayer:null,

  app(){return window.CastVector;},

  activeTrack(app){
    const g=app.state.goMode||{};
    return g.active&&g.sessionId&&g.track?.sessionId===g.sessionId?g.track:null;
  },

  ensureTrack(app){
    const g=app.state.goMode||{};
    if(!g.active||!g.sessionId)return null;
    if(!g.track||g.track.sessionId!==g.sessionId){
      g.track={
        sessionId:g.sessionId,
        startedAt:g.startedAt||new Date().toISOString(),
        points:[],events:[],distanceMiles:0,lastGpsAt:null,status:'ready',
        privacy:'private',location:g.location?.name||app.state.location.name
      };
      app.save?.({cloud:false});
    }
    return g.track;
  },

  snapshot(app){
    const c=app.state.data?.current||{};
    return{
      score:Number(app.currentScore?.()||0),
      wind:Number(c.windSpeed),wave:Number(c.waveHeight),water:Number(c.waterTemp),
      tide:app.currentTideLabel?.()||'',species:app.state.goMode?.species||app.state.targetSpecies
    };
  },

  start(app){
    const t=this.ensureTrack(app);if(!t)return;
    if(this.watchId!=null)return;
    if(!navigator.geolocation){
      t.status='unavailable';app.save?.({cloud:false});this.render(app);return;
    }
    t.status='requesting';this.render(app);
    try{
      this.watchId=navigator.geolocation.watchPosition(
        pos=>this.onPosition(app,pos),
        err=>this.onError(app,err),
        {enableHighAccuracy:true,maximumAge:5000,timeout:20000}
      );
    }catch(_){
      t.status='unavailable';this.watchId=null;app.save?.({cloud:false});this.render(app);
    }
  },

  stop(app){
    if(this.watchId!=null&&navigator.geolocation){
      try{navigator.geolocation.clearWatch(this.watchId);}catch(_){}
    }
    this.watchId=null;
    const t=app.state.goMode?.track;if(t){t.status='stopped';app.save?.({cloud:false});}
  },

  onError(app,err){
    const t=this.ensureTrack(app);if(!t)return;
    t.status=err?.code===1?'permission-denied':'gps-waiting';
    t.lastError=String(err?.message||'GPS unavailable');
    app.save?.({cloud:false});this.render(app);
  },

  onPosition(app,pos){
    const t=this.ensureTrack(app);if(!t)return;
    const lat=Number(pos.coords.latitude),lon=Number(pos.coords.longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const at=new Date(pos.timestamp||Date.now()).toISOString();
    const prev=t.points[t.points.length-1]||null;
    const miles=prev?app.haversine(prev.lat,prev.lon,lat,lon):0;
    const elapsed=prev?Math.max(0,(new Date(at)-new Date(prev.at))/1000):Infinity;
    if(prev&&miles<0.008&&elapsed<25)return;
    const snap=this.snapshot(app);
    const point={
      lat,lon,at,accuracy:Number(pos.coords.accuracy)||null,
      speedMph:Number.isFinite(Number(pos.coords.speed))?Math.max(0,Number(pos.coords.speed)*2.23694):null,
      ...snap
    };
    t.points.push(point);
    if(t.points.length>1200)t.points=t.points.slice(-1200);
    t.distanceMiles=Number(t.distanceMiles||0)+(Number.isFinite(miles)?miles:0);
    t.lastGpsAt=at;t.status='tracking';
    app.save?.({cloud:false});this.render(app);
  },

  addEvent(app,type,label,detail=''){
    const t=this.ensureTrack(app);if(!t)return;
    const p=t.points[t.points.length-1]||null;
    t.events.push({
      id:Date.now(),type,label,detail,at:new Date().toISOString(),
      lat:p?.lat??null,lon:p?.lon??null,...this.snapshot(app)
    });
    t.events=t.events.slice(-100);
    app.save?.({cloud:false});this.render(app);
    app.showToast?.(label+' marked on this trip.');
  },

  attachCatch(app,catchItem){
    const t=this.ensureTrack(app);if(!t||!catchItem)return;
    const p=t.points[t.points.length-1]||null;
    if(p){
      catchItem.lat=p.lat;catchItem.lon=p.lon;catchItem.gpsAccuracy=p.accuracy;
    }
    t.events.push({
      id:Date.now(),type:'catch',label:catchItem.species,detail:catchItem.bait||'Catch logged',
      catchId:catchItem.id,at:catchItem.date||new Date().toISOString(),
      lat:p?.lat??catchItem.lat,lon:p?.lon??catchItem.lon,...this.snapshot(app)
    });
    app.save?.({cloud:false});this.render(app);
  },

  finalize(app,track,historyItem){
    if(!track||!historyItem)return;
    const points=Array.isArray(track.points)?track.points:[];
    const catches=(app.state.catches||[]).filter(c=>c.sessionId===track.sessionId);
    const start=points[0],end=points[points.length-1];
    const scores=points.map(x=>Number(x.score)).filter(Number.isFinite);
    historyItem.routeReplay={
      version:'7.2.0',privacy:'private',
      points:points.slice(0,1200),
      events:(track.events||[]).slice(0,100),
      distanceMiles:Number(track.distanceMiles||0),
      startedAt:track.startedAt,
      endedAt:historyItem.endedAt||new Date().toISOString(),
      catchCount:catches.length,
      catchIds:catches.map(c=>c.id),
      avgScore:scores.length?Math.round(app.average(scores)):null,
      start:{lat:start?.lat??historyItem.lat,lon:start?.lon??historyItem.lon},
      end:{lat:end?.lat??null,lon:end?.lon??null}
    };
  },

  svg(track,catches=[]){
    const pts=track?.points||[];if(pts.length<2)return'<div class="replay-empty">Keep CastVector open during a live trip to build a GPS route replay.</div>';
    const lats=pts.map(p=>p.lat),lons=pts.map(p=>p.lon),minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);
    const latSpan=Math.max(.0001,maxLat-minLat),lonSpan=Math.max(.0001,maxLon-minLon);
    const xy=p=>({x:6+88*((p.lon-minLon)/lonSpan),y:94-88*((p.lat-minLat)/latSpan)});
    const poly=pts.map(p=>{const q=xy(p);return q.x.toFixed(1)+','+q.y.toFixed(1)}).join(' ');
    const marks=(track.events||[]).filter(e=>e.type==='catch'&&Number.isFinite(e.lat)&&Number.isFinite(e.lon)).map(e=>{const q=xy(e);return'<circle cx="'+q.x.toFixed(1)+'" cy="'+q.y.toFixed(1)+'" r="2.8" class="replay-catch-dot"/>';}).join('');
    return'<svg class="replay-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="'+poly+'" class="replay-route-line"/>'+marks+'<circle cx="'+xy(pts[0]).x.toFixed(1)+'" cy="'+xy(pts[0]).y.toFixed(1)+'" r="2.4" class="replay-start-dot"/></svg>';
  },

  panel(){
    let el=document.getElementById('sessionReplayPanel');if(el)return el;
    const trips=document.getElementById('view-trips'),go=document.getElementById('goModePanel');if(!trips)return null;
    el=document.createElement('section');el.id='sessionReplayPanel';el.className='panel session-replay-panel';
    el.innerHTML='<div class="replay-head"><div><div class="eyebrow">TRACK MY WATER • SESSION REPLAY 7.2</div><h2>Your trip becomes fishing intelligence</h2></div><span id="replayStatusBadge" class="replay-badge">READY</span></div><div id="replayActive"></div><div class="replay-mark-actions" id="replayMarkActions" hidden><button type="button" class="secondary-button small" data-replay-mark="bite">Mark bite</button><button type="button" class="secondary-button small" data-replay-mark="move">Mark move</button><button type="button" class="secondary-button small" data-replay-mark="bait">Mark bait change</button></div><div class="replay-subhead">PAST SESSION REPLAYS</div><div id="replayHistory" class="replay-history"></div>';
    if(go)go.after(el);else trips.appendChild(el);
    return el;
  },

  render(app){
    const panel=this.panel();if(!panel)return;
    const t=this.activeTrack(app),active=!!app.state.goMode?.active;
    const badge=document.getElementById('replayStatusBadge'),box=document.getElementById('replayActive'),marks=document.getElementById('replayMarkActions');
    if(active&&t){
      const pts=t.points||[],last=pts[pts.length-1],mins=Math.max(0,Math.floor((Date.now()-new Date(t.startedAt))/60000));
      badge.textContent=t.status==='tracking'?'TRACKING':'GPS '+String(t.status||'READY').toUpperCase();
      badge.className='replay-badge '+(t.status==='tracking'?'live':'');
      box.innerHTML='<div class="replay-live-card"><div class="replay-live-map">'+this.svg(t)+'</div><div class="replay-live-stats"><div><span>TIME</span><strong>'+app.formatDuration(mins)+'</strong></div><div><span>DISTANCE</span><strong>'+Number(t.distanceMiles||0).toFixed(2)+' mi</strong></div><div><span>GPS POINTS</span><strong>'+pts.length+'</strong></div><div><span>CATCHES</span><strong>'+app.sessionCatches().length+'</strong></div></div><p>'+(t.status==='permission-denied'?'Location permission is off. The fishing session still works, but route recording is paused.':'Route is private and records only while this live CastVector session is open.')+'</p></div>';
      marks.hidden=false;
    }else{
      badge.textContent='READY';badge.className='replay-badge';
      box.innerHTML='<div class="replay-idle"><strong>Start Go Fishing Mode to record your route.</strong><span>CastVector can connect movement, catches and condition changes into a private session replay.</span></div>';
      marks.hidden=true;
    }
    const hist=(app.state.goMode?.history||[]).filter(x=>x.routeReplay);
    const h=document.getElementById('replayHistory');
    h.innerHTML=hist.length?hist.slice(0,12).map(x=>{
      const r=x.routeReplay||{},catchCount=Number(r.catchCount??x.catchCount??0);
      return'<article class="replay-history-card"><div class="replay-thumb">'+this.svg(r)+'</div><div class="replay-history-main"><strong>'+app.escape(x.location||'Fishing trip')+'</strong><span>'+new Date(x.startedAt||r.startedAt).toLocaleDateString()+' • '+app.formatDuration(x.minutes||0)+'</span><small>'+Number(r.distanceMiles||0).toFixed(2)+' mi tracked • '+catchCount+' catch'+(catchCount===1?'':'es')+(r.avgScore!=null?' • avg score '+r.avgScore:'')+'</small></div><button class="secondary-button small" type="button" data-replay-map="'+app.escape(String(x.sessionId))+'">View route</button></article>';
    }).join(''):'<div class="empty-state">Completed tracked trips will appear here.</div>';
  },

  viewOnMap(app,sessionId){
    const h=(app.state.goMode?.history||[]).find(x=>String(x.sessionId)===String(sessionId)),r=h?.routeReplay;if(!r?.points?.length)return;
    app.navigate?.('map');
    setTimeout(()=>{
      app.ensureMap?.();const map=app.state.map;if(!map||!window.L)return;
      if(this.replayLayer){try{map.removeLayer(this.replayLayer);}catch(_){}}
      const group=L.layerGroup();
      const latlngs=r.points.map(p=>[p.lat,p.lon]);
      L.polyline(latlngs,{weight:5,opacity:.9}).addTo(group);
      (r.events||[]).filter(e=>e.type==='catch'&&Number.isFinite(e.lat)&&Number.isFinite(e.lon)).forEach(e=>L.circleMarker([e.lat,e.lon],{radius:7,weight:2,fillOpacity:.9}).bindPopup('<strong>'+app.escape(e.label||'Catch')+'</strong><br>'+app.escape(e.detail||'')).addTo(group));
      group.addTo(map);this.replayLayer=group;
      try{map.fitBounds(L.latLngBounds(latlngs).pad(.18));}catch(_){}
      app.showToast?.('Session Replay route loaded on the map.');
    },220);
  },

  bind(app){
    const start=app.startGoMode?.bind(app);
    if(start)app.startGoMode=function(){const out=start();Replay.ensureTrack(this);Replay.start(this);Replay.render(this);return out;};

    const end=app.endGoMode?.bind(app);
    if(end)app.endGoMode=function(){
      const sessionId=this.state.goMode?.sessionId,track=this.state.goMode?.track?JSON.parse(JSON.stringify(this.state.goMode.track)):null;
      Replay.stop(this);const out=end();
      const item=(this.state.goMode?.history||[]).find(x=>x.sessionId===sessionId);
      Replay.finalize(this,track,item);this.state.goMode.track=null;this.save?.();Replay.render(this);this.renderTrips?.();return out;
    };

    const saveCatch=app.saveCatch?.bind(app);
    if(saveCatch)app.saveCatch=function(){
      const active=this.state.goMode?.active,sessionId=this.state.goMode?.sessionId,before=new Set((this.state.catches||[]).map(c=>c.id));
      const out=saveCatch();
      if(active){
        const c=(this.state.catches||[]).find(x=>x.sessionId===sessionId&&!before.has(x.id));
        Replay.attachCatch(this,c);
      }
      return out;
    };

    const rg=app.renderGoMode?.bind(app);
    if(rg)app.renderGoMode=function(){const out=rg();Replay.render(this);return out;};

    const rt=app.renderTrips?.bind(app);
    if(rt)app.renderTrips=function(){const out=rt();Replay.render(this);return out;};

    document.addEventListener('click',e=>{
      const mark=e.target.closest('[data-replay-mark]');
      if(mark){
        const type=mark.dataset.replayMark;
        const labels={bite:'Bite / strike',move:'Moved to new water',bait:'Changed bait / presentation'};
        Replay.addEvent(app,type,labels[type]||'Trip marker');return;
      }
      const map=e.target.closest('[data-replay-map]');if(map)Replay.viewOnMap(app,map.dataset.replayMap);
    });

    if(app.state.goMode?.active){this.ensureTrack(app);this.start(app);}
  },

  init(){const app=this.app();if(!app)return;this.panel();this.bind(app);this.render(app);}
};
window.CastVectorSessionReplay=Replay;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>Replay.init());else Replay.init();
})();