(function(){
'use strict';

const G={
  version:'15.5.0',
  maxImportBytes:5*1024*1024,
  maxWaypoints:300,
  maxTrackPoints:1500,

  app(){return window.CastVector;},
  native(){return window.CastVectorNative||null;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchReplay(app);
    this.patchRenders(app);
    this.bind(app);
    this.render(app);
  },

  installUI(app){
    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('gpsInteropPanel')){
      const p=document.createElement('section');p.id='gpsInteropPanel';p.className='panel gps-interop-panel';
      p.innerHTML=
        '<div class="gpx-head"><div><div class="eyebrow">GPS INTEROP • 15.5</div><h2>Take your fishing data with you</h2><p>Export standard GPX files for private waypoints and tracked routes, or import GPX data back into CastVector.</p></div><span id="gpxBadge" class="gpx-badge">PRIVATE</span></div>'+
        '<div class="gpx-summary"><article><strong id="gpxWaypointCount">0</strong><span>Private waypoints</span></article><article><strong id="gpxRouteCount">0</strong><span>Tracked routes</span></article><article><strong id="gpxImportedCount">0</strong><span>Imported routes</span></article></div>'+
        '<div class="gpx-actions"><button id="gpxExportWaypointsBtn" class="primary-button" type="button">Export waypoints GPX</button><button id="gpxImportBtn" class="secondary-button" type="button">Import GPX</button><input id="gpxImportInput" type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" hidden /></div>'+
        '<div id="gpxStatus" class="gpx-status">Nothing has left this device. GPX exports include exact coordinates only when you explicitly export/share them.</div>'+
        '<div class="gpx-privacy"><strong>EXACT-LOCATION PRIVACY</strong><span>GPX is designed for precise GPS coordinates. Treat exported files like private fishing data. CastVector does not publish them to Community.</span></div>';
      const vault=document.querySelector('#view-profile .data-vault-panel'),core=document.getElementById('coreProfilePanel');
      if(vault)vault.before(p);else if(core)core.after(p);else profile.appendChild(p);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('routeExportPanel')){
      const p=document.createElement('section');p.id='routeExportPanel';p.className='panel route-export-panel';
      p.innerHTML='<div class="gpx-head"><div><div class="eyebrow">ROUTE EXPORT • 15.5</div><h2>Share a tracked fishing route</h2></div><span class="gpx-badge">GPX 1.1</span></div><div id="routeExportList" class="route-export-list"></div>';
      const replay=document.getElementById('sessionReplayPanel'),offline=document.getElementById('offlineProLauncher');
      if(replay)replay.after(p);else if(offline)offline.after(p);else trips.appendChild(p);
    }
  },

  escapeXml(v){
    return String(v??'').replace(/[<>&'"]/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;' }[c]));
  },

  safeName(v,fallback='CastVector'){
    const s=String(v||fallback).trim().replace(/[\u0000-\u001f<>:"/\\|?*]+/g,' ').replace(/\s+/g,' ').slice(0,80);
    return s||fallback;
  },

  fileName(v,suffix=''){
    return this.safeName(v,'castvector').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)+(suffix?'-'+suffix:'')+'.gpx';
  },

  gpxWrap(name,body){
    return '<?xml version="1.0" encoding="UTF-8"?>\n'+
      '<gpx version="1.1" creator="CastVector '+this.version+'" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n'+
      '  <metadata><name>'+this.escapeXml(name)+'</name><desc>Private fishing GPS data exported explicitly from CastVector.</desc><time>'+new Date().toISOString()+'</time></metadata>\n'+body+'\n</gpx>';
  },

  waypointsGpx(app){
    const rows=(app.state.waypoints||[]).filter(w=>Number.isFinite(Number(w.lat))&&Number.isFinite(Number(w.lon))).slice(0,1000);
    const body=rows.map(w=>'  <wpt lat="'+Number(w.lat).toFixed(7)+'" lon="'+Number(w.lon).toFixed(7)+'"><name>'+this.escapeXml(w.name||'CastVector waypoint')+'</name><desc>'+this.escapeXml(w.notes||'Private CastVector fishing waypoint')+'</desc><type>Fishing Spot</type></wpt>').join('\n');
    return{content:this.gpxWrap('CastVector Private Waypoints',body),count:rows.length,name:this.fileName('CastVector-waypoints')};
  },

  routeGpx(app,history){
    const r=history?.routeReplay||{},pts=(r.points||[]).filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon)));
    const body='  <trk><name>'+this.escapeXml(history.location||'CastVector fishing route')+'</name><desc>Private Session Replay route • '+Number(r.distanceMiles||0).toFixed(2)+' miles</desc><trkseg>\n'+
      pts.map(p=>'    <trkpt lat="'+Number(p.lat).toFixed(7)+'" lon="'+Number(p.lon).toFixed(7)+'">'+(p.at?'<time>'+this.escapeXml(new Date(p.at).toISOString())+'</time>':'')+'</trkpt>').join('\n')+
      '\n  </trkseg></trk>';
    return{content:this.gpxWrap(history.location||'CastVector Fishing Route',body),count:pts.length,name:this.fileName(history.location||'CastVector-route','route')};
  },

  async shareFile(app,name,content){
    if(!content)return false;
    const n=this.native();
    if(n?.shareGpx){
      try{
        const result=n.shareGpx(String(name),String(content));
        if(result==='ok'||result==='shared'||result==='queued'){app.showToast?.('GPX share sheet opened.');return true;}
      }catch(_){}
    }
    try{
      const blob=new Blob([content],{type:'application/gpx+xml'}),file=new File([blob],name,{type:'application/gpx+xml'});
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
        await navigator.share({title:'CastVector GPX',text:'Private fishing GPS data exported from CastVector.',files:[file]});return true;
      }
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      app.showToast?.('GPX export downloaded.');return true;
    }catch(e){
      if(e?.name==='AbortError')return false;
      app.showToast?.('Could not export the GPX file.');return false;
    }
  },

  async exportWaypoints(app){
    const g=this.waypointsGpx(app);
    if(!g.count)return app.showToast?.('Save at least one waypoint first.');
    if(!confirm('This GPX contains exact coordinates for '+g.count+' private waypoint'+(g.count===1?'':'s')+'. Share it only with apps or people you trust.'))return;
    const ok=await this.shareFile(app,g.name,g.content);
    if(ok)this.status('Exported '+g.count+' private waypoint'+(g.count===1?'':'s')+'.');
  },

  findHistory(app,sessionId){
    return (app.state.goMode?.history||[]).find(h=>String(h.sessionId)===String(sessionId));
  },

  async exportRoute(app,sessionId){
    const h=this.findHistory(app,sessionId);if(!h?.routeReplay?.points?.length)return app.showToast?.('That route has no GPS points to export.');
    const g=this.routeGpx(app,h);
    if(!confirm('This GPX contains the exact route from this fishing session ('+g.count+' GPS points). Share it only with apps or people you trust.'))return;
    const ok=await this.shareFile(app,g.name,g.content);
    if(ok)this.status('Exported private route from '+(h.location||'fishing session')+'.');
  },

  text(el,name){
    const n=el?.getElementsByTagName(name)?.[0];return String(n?.textContent||'').trim();
  },

  sample(points,max){
    if(points.length<=max)return points;
    const out=[],step=(points.length-1)/(max-1);
    for(let i=0;i<max;i++)out.push(points[Math.round(i*step)]);
    return out;
  },

  parseGpx(text){
    const doc=new DOMParser().parseFromString(text,'application/xml');
    if(doc.querySelector('parsererror'))throw new Error('Invalid GPX/XML file.');
    const root=doc.documentElement;if(!root||root.localName!=='gpx')throw new Error('This file is not GPX.');
    const waypoints=[...doc.getElementsByTagName('wpt')].slice(0,this.maxWaypoints).map(n=>({
      lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon')),
      name:this.text(n,'name').slice(0,100)||'Imported waypoint',
      notes:(this.text(n,'desc')||'Imported from GPX').slice(0,240)
    })).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));

    const routePoints=[...doc.getElementsByTagName('rtept')].map(n=>({lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon')),at:this.text(n,'time')||null})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
    const tracks=[...doc.getElementsByTagName('trk')].map((trk,i)=>{
      const name=this.text(trk,'name').slice(0,100)||'Imported GPX track '+(i+1);
      let pts=[...trk.getElementsByTagName('trkpt')].map(n=>({lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon')),at:this.text(n,'time')||null})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
      pts=this.sample(pts,this.maxTrackPoints);return{name,points:pts};
    }).filter(x=>x.points.length>=2);
    if(routePoints.length>=2)tracks.push({name:'Imported GPX route',points:this.sample(routePoints,this.maxTrackPoints)});
    return{waypoints,tracks:tracks.slice(0,12)};
  },

  importWaypoint(app,w){
    const duplicate=(app.state.waypoints||[]).some(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon))&&app.haversine(Number(x.lat),Number(x.lon),w.lat,w.lon)<0.02);
    if(duplicate)return false;
    app.state.waypoints.unshift({id:'gpx-wpt-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:w.name,notes:w.notes+' • Imported GPX • private',lat:w.lat,lon:w.lon,privacy:'private',imported:true});
    return true;
  },

  importTrack(app,t){
    const pts=t.points.map(p=>({lat:p.lat,lon:p.lon,at:p.at&&Number.isFinite(new Date(p.at).getTime())?new Date(p.at).toISOString():null,nativeBackground:false})),withTime=pts.map((p,i)=>({...p,at:p.at||new Date(Date.now()+i*1000).toISOString()}));
    let distance=0;for(let i=1;i<withTime.length;i++){const d=app.haversine(withTime[i-1].lat,withTime[i-1].lon,withTime[i].lat,withTime[i].lon);if(Number.isFinite(d))distance+=d;}
    const first=withTime[0],last=withTime[withTime.length-1],startMs=new Date(first.at).getTime(),endMs=new Date(last.at).getTime(),minutes=Math.max(0,Math.round((endMs-startMs)/60000)),id='gpx-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);
    app.state.goMode=app.state.goMode||{};app.state.goMode.history=Array.isArray(app.state.goMode.history)?app.state.goMode.history:[];
    app.state.goMode.history.unshift({
      sessionId:id,location:t.name,species:'Imported route',startedAt:first.at,endedAt:last.at,minutes,catchCount:0,imported:true,
      routeReplay:{version:'15.5.0',privacy:'private-local',points:withTime,events:[],distanceMiles:distance,startedAt:first.at,endedAt:last.at,catchCount:0,catchIds:[],avgScore:null,start:{lat:first.lat,lon:first.lon},end:{lat:last.lat,lon:last.lon}}
    });
    app.state.goMode.history=app.state.goMode.history.slice(0,50);
    return true;
  },

  async importFile(app,file){
    if(!file)return;
    if(file.size>this.maxImportBytes)return app.showToast?.('GPX file is too large. Keep imports under 5 MB.');
    try{
      const parsed=this.parseGpx(await file.text());
      let w=0,t=0;parsed.waypoints.forEach(x=>{if(this.importWaypoint(app,x))w++;});parsed.tracks.forEach(x=>{if(this.importTrack(app,x))t++;});
      app.save?.({cloud:false});app.renderWaypoints?.();app.renderMapLayers?.();app.renderTrips?.();window.CastVectorSessionReplay?.render?.(app);this.render(app);
      this.status('Imported '+w+' waypoint'+(w===1?'':'s')+' and '+t+' route'+(t===1?'':'s')+'. Exact imported coordinates remain private/local by default.');
      app.showToast?.('GPX import complete.');
    }catch(e){
      this.status('Import failed: '+String(e?.message||'Invalid GPX file'));app.showToast?.('That GPX file could not be imported.');
    }
  },

  patchReplay(app){
    const replay=window.CastVectorSessionReplay;if(!replay||replay._gpxPatched)return;replay._gpxPatched=true;
    const old=replay.render?.bind(replay);
    if(old)replay.render=function(a){
      const out=old(a);
      document.querySelectorAll('#replayHistory .replay-history-card').forEach(card=>{
        if(card.querySelector('[data-gpx-route]'))return;
        const map=card.querySelector('[data-replay-map]');if(!map)return;
        const b=document.createElement('button');b.type='button';b.className='ghost-button small';b.dataset.gpxRoute=map.dataset.replayMap;b.textContent='Export GPX';
        map.insertAdjacentElement('afterend',b);
      });
      G.render(a);return out;
    };
  },

  routeRows(app){
    return (app.state.goMode?.history||[]).filter(h=>h.routeReplay?.points?.length>=2).slice(0,12);
  },

  render(app){
    const routes=this.routeRows(app),wps=(app.state.waypoints||[]).filter(w=>Number.isFinite(Number(w.lat))&&Number.isFinite(Number(w.lon))),imported=routes.filter(r=>r.imported).length,set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('gpxWaypointCount',wps.length);set('gpxRouteCount',routes.length);set('gpxImportedCount',imported);
    const box=document.getElementById('routeExportList');
    if(box)box.innerHTML=routes.length?routes.map(r=>'<article class="route-export-row"><div><strong>'+app.escape(r.location||'Fishing route')+'</strong><span>'+app.escape(app.prettyDate(r.startedAt||r.routeReplay?.startedAt))+' • '+Number(r.routeReplay?.distanceMiles||0).toFixed(2)+' mi • '+r.routeReplay.points.length+' points'+(r.imported?' • IMPORTED':'')+'</span></div><button type="button" class="secondary-button small" data-gpx-route="'+app.escape(String(r.sessionId))+'">Export GPX</button></article>').join(''):'<div class="empty-state">Track a fishing session or import a GPX route to see routes here.</div>';
  },

  status(msg){const e=document.getElementById('gpxStatus');if(e)e.textContent=msg;},

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();G.render(this);return out;};
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#gpxExportWaypointsBtn')){this.exportWaypoints(app);return;}
      if(e.target.closest('#gpxImportBtn')){document.getElementById('gpxImportInput')?.click();return;}
      const route=e.target.closest('[data-gpx-route]');if(route){this.exportRoute(app,route.dataset.gpxRoute);return;}
    });
    document.addEventListener('change',e=>{
      if(e.target.id==='gpxImportInput'){
        const file=e.target.files?.[0];e.target.value='';this.importFile(app,file);
      }
    });
  }
};

window.CastVectorGpxInterop=G;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>G.install());else G.install();
})();