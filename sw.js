const CACHE='coastcast-v1.7.0';
const CORE=['./','./index.html','./styles.css?v=1.7.0','./app.js?v=1.7.0','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-32.png','./og-image.png'];
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


// Push-ready hooks for the future CoastCast notification backend.
self.addEventListener('push',event=>{
  let payload={title:'CoastCast fishing alert',body:'A saved fishing watch has an update.',url:'./index.html#trips'};
  try{const incoming=event.data?.json();if(incoming)payload={...payload,...incoming};}catch(_){try{payload.body=event.data?.text()||payload.body;}catch(__){}}
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:'./icon-192.png',badge:'./favicon-32.png',data:{url:payload.url||'./index.html#trips'},tag:payload.tag||'coastcast-alert'}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const target=event.notification?.data?.url||'./index.html#trips';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate(target);return c.focus();}}return clients.openWindow?clients.openWindow(target):undefined;}));
});
