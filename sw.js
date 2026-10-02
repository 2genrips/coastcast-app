const CACHE='castvector-v6.8.0';
const CORE=['./','./index.html','./styles.css?v=6.8.0','./app.js?v=6.8.0','./decision-engine.js?v=6.8.0','./take-me-fishing.js?v=6.8.0','./live-guide.js?v=6.8.0','./data-map-intelligence.js?v=6.8.0','./smart-pan-map.js?v=6.8.0','./water-intelligence.js?v=6.8.0','./personal-fishing-brain.js?v=6.8.0','./spot-dna.js?v=6.8.0','./trip-copilot.js?v=6.8.0','./opportunity-radar.js?v=6.8.0','./bitegrid.js?v=6.8.0','./spot-compare-pro.js?v=6.8.0','./chat.css?v=6.8.0','./decision-engine.css?v=6.8.0','./take-me-fishing.css?v=6.8.0','./live-guide.css?v=6.8.0','./data-map-intelligence.css?v=6.8.0','./smart-pan-map.css?v=6.8.0','./water-intelligence.css?v=6.8.0','./personal-fishing-brain.css?v=6.8.0','./spot-dna.css?v=6.8.0','./trip-copilot.css?v=6.8.0','./opportunity-radar.css?v=6.8.0','./bitegrid.css?v=6.8.0','./spot-compare-pro.css?v=6.8.0','./chat.js?v=6.8.0','./native-billing-hook.js?v=6.8.0','./manifest.webmanifest','./coastcast-config.js?v=6.8.0','./icon-192.png','./icon-512.png','./icon-192-v56.png','./icon-512-v56.png','./apple-touch-icon.png','./favicon-32.png','./brand-emblem.png','./brand-watermark.png','./privacy.html','./terms.html','./support.html','./delete-account.html'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
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
