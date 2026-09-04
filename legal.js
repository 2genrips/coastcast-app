(()=>{
  const cfg=window.COASTCAST_CONFIG||{};
  const email=String(cfg.supportEmail||'').trim();
  document.querySelectorAll('[data-support-email]').forEach(el=>{
    if(email){el.textContent=email;if(el.tagName==='A')el.href=`mailto:${email}`;}
    else{el.textContent='Support email will be published before store release.';if(el.tagName==='A')el.removeAttribute('href');}
  });
  document.querySelectorAll('[data-legal-entity]').forEach(el=>el.textContent=cfg.legalEntity||'CastVector');
})();
