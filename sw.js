// バースデー PWA: 初回のオンライン表示で必要なファイルを保存し、以降はオフラインでも動かします。
// index.html などを更新したら、下の VERSION の数字を上げてください（古い保存を入れ替えます）。
const VERSION="v10",CACHE="birthday-"+VERSION;
const LOCAL=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
const REMOTE=["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await Promise.allSettled(LOCAL.map(u=>c.add(u)));
  await Promise.allSettled(REMOTE.map(u=>fetch(new Request(u,{mode:"no-cors"})).then(r=>c.put(u,r))));
}).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("birthday-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  const ok=u.origin===location.origin||/(^|\.)(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);if(!ok)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;if(res)return res;
    if(r.mode==="navigate")return c.match("./index.html");
    return new Response("",{status:504})}))});
