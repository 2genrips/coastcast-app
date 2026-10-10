const CACHE='castvector-v12.0.0';
const OFFLINE_MAP_CACHE='castvector-offline-map-v90';
const CORE=['./','./index.html','./styles.css?v=12.0.0','./app.js?v=12.0.0','./decision-engine.js?v=12.0.0','./take-me-fishing.js?v=12.0.0','./live-guide.js?v=12.0.0','./data-map-intelligence.js?v=12.0.0','./smart-pan-map.js?v=12.0.0','./water-intelligence.js?v=12.0.0','./personal-fishing-brain.js?v=12.0.0','./spot-dna.js?v=12.0.0','./trip-copilot.js?v=12.0.0','./opportunity-radar.js?v=12.0.0','./bitegrid.js?v=12.0.0','./spot-compare-pro.js?v=12.0.0','./species-command.js?v=12.0.0','./smart-home.js?v=12.0.0','./explore-feed.js?v=12.0.0','./depth-intelligence.js?v=12.0.0','./session-replay.js?v=12.0.0','./pattern-atlas.js?v=12.0.0','./freshwater-mode.js?v=12.0.0','./universal-discover.js?v=12.0.0','./map-pro.js?v=12.0.0','./angler-advantage.js?v=12.0.0','./competitive-core.js?v=12.0.0','./batch-upgrades.js?v=12.0.0','./launch-candidate.js?v=12.0.0','./daily-driver.js?v=12.0.0','./angler-toolkit.js?v=12.0.0','./water-reports.js?v=12.0.0','./always-on-angler.js?v=12.0.0','./runtime-resilience.js?v=12.0.0','./chat.css?v=12.0.0','./decision-engine.css?v=12.0.0','./take-me-fishing.css?v=12.0.0','./live-guide.css?v=12.0.0','./data-map-intelligence.css?v=12.0.0','./smart-pan-map.css?v=12.0.0','./water-intelligence.css?v=12.0.0','./personal-fishing-brain.css?v=12.0.0','./spot-dna.css?v=12.0.0','./trip-copilot.css?v=12.0.0','./opportunity-radar.css?v=12.0.0','./bitegrid.css?v=12.0.0','./spot-compare-pro.css?v=12.0.0','./species-command.css?v=12.0.0','./smart-home.css?v=12.0.0','./explore-feed.css?v=12.0.0','./session-replay.css?v=12.0.0','./depth-intelligence.css?v=12.0.0','./pattern-atlas.css?v=12.0.0','./freshwater-mode.css?v=12.0.0','./universal-discover.css?v=12.0.0','./runtime-resilience.css?v=12.0.0','./map-pro.css?v=12.0.0','./angler-advantage.css?v=12.0.0','./competitive-core.css?v=12.0.0','./batch-upgrades.css?v=12.0.0','./launch-candidate.css?v=12.0.0','./daily-driver.css?v=12.0.0','./angler-toolkit.css?v=12.0.0','./water-reports.css?v=12.0.0','./always-on-angler.css?v=12.0.0','./chat.js?v=12.0.0','./native-billing-hook.js?v=12.0.0','./manifest.webmanifest','./coastcast-config.js?v=12.0.0','./icon-192.png','./icon-512.png','./icon-192-v56.png','./icon-512-v56.png','./apple-touch-icon.png','./favicon-32.png','./brand-emblem.png','./brand-watermark.png','./privacy.html','./terms.html','./support.html','./delete-account.html'];
const ESSENTIAL=['./','./index.html','./styles.css?v=12.0.0','./app.js?v=12.0.0'];
const OPTIONAL=CORE.filter(x=>!ESSENTIAL.includes(x));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ESSENTIAL);
    await Promise.allSettled(OPTIONAL.map(async asset=>{
      const response=await fetch(asset,{cache:'reload'});
      if(response.ok)await cache.put(asset,response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==OFFLINE_MAP_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const offlineTileHost=url.hostname==='basemap.nationalmap.gov'||url.hostname==='a.tile.openstreetmap.org'||url.hostname==='b.tile.openstreetmap.org'||url.hostname==='c.tile.openstreetmap.org';
  if(url.origin!==location.origin&&offlineTileHost){
    event.respondWith((async()=>{
      const saved=await caches.open(OFFLINE_MAP_CACHE);
      try{
        const fresh=await fetch(event.request);
        if(fresh&&(fresh.ok||fresh.type==='opaque'))saved.put(event.request,fresh.clone());
        return fresh;
      }catch(_){
        return (await saved.match(event.request))||new Response('',{status:504,statusText:'Offline map tile unavailable'});
      }
    })());
    return;
  }
  if(url.origin!==location.origin)return;

  const isNavigation=event.request.mode==='navigate'||event.request.headers.get('accept')?.includes('text/html');
  if(isNavigation){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);cache.put('./index.html',response.clone());}
      return response;
    }).catch(async()=>await caches.match('./index.html')||await caches.match('./')));
    return;
  }

  const refresh=fetch(event.request).then(async response=>{
    if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());}
    return response;
  });
  event.waitUntil(refresh.catch(()=>{}));
  event.respondWith(caches.match(event.request).then(cached=>{
    if(cached)return cached;
    return refresh.catch(()=>new Response('',{status:504,statusText:'Offline'}));
  }));
});


// Push-ready hooks for the future CastVector notification backend.
self.addEventListener('push',event=>{
  let payload={title:'CastVector fishing alert',body:'A saved fishing watch has an update.',url:'./index.html#trips'};
  try{const incoming=event.data?.json();if(incoming)payload={...payload,...incoming};}catch(_){try{payload.body=event.data?.text()||payload.body;}catch(__){}}
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:'./icon-192-v56.png',badge:'./favicon-32.png',data:{url:payload.url||'./index.html#trips'},tag:payload.tag||'castvector-alert'}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const target=event.notification?.data?.url||'./index.html#trips';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate(target);return c.focus();}}return clients.openWindow?clients.openWindow(target):undefined;}));
});
