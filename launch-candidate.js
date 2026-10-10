(function(){
'use strict';

const LC={
  version:'10.0.0',
  pendingEnable:false,

  app(){return window.CastVector;},
  native(){return window.CastVectorNative||null;},

  install(){
    const app=this.app();if(!app)return;
    this.applyRegulationSources(app);
    this.installUI(app);
    this.bind(app);
    this.renderBuild(app);
    this.refreshSafety(app);
    window.addEventListener('castvector:native-ready',()=>{this.renderBuild(app);this.refreshSafety(app);});
    window.addEventListener('castvector:notification-permission',e=>{
      if(e?.detail?.granted&&this.pendingEnable){this.pendingEnable=false;this.enableSafety(app);}
      else if(this.pendingEnable){this.pendingEnable=false;app.showToast?.('Notification permission is needed for Android background safety alerts.');}
      this.refreshSafety(app);
    });
  },

  applyRegulationSources(app){
    const direct={
      AR:{name:'Arkansas Game & Fish Commission',url:'https://www.agfc.com/regulations/'},
      ID:{name:'Idaho Fish and Game',url:'https://idfg.idaho.gov/rules/fish'},
      IN:{name:'Indiana DNR Fish & Wildlife',url:'https://www.in.gov/dnr/fish-and-wildlife/fishing/fishing-guide-and-regulations/'},
      IA:{name:'Iowa DNR',url:'https://www.iowadnr.gov/things-do/fishing/regulations-laws'},
      MI:{name:'Michigan DNR',url:'https://www.michigan.gov/dnr/things-to-do/fishing/fishing-regulations'},
      MN:{name:'Minnesota DNR',url:'https://www.dnr.state.mn.us/regulations/fishing/index.html'},
      MO:{name:'Missouri Department of Conservation',url:'https://mdc.mo.gov/fishing/regulations'},
      MT:{name:'Montana Fish, Wildlife & Parks',url:'https://fwp.mt.gov/fish/regulations'},
      NE:{name:'Nebraska Game & Parks',url:'https://outdoornebraska.gov/guides-maps/fishing-guides-reports/fishing-guide/'},
      NM:{name:'New Mexico Department of Game & Fish',url:'https://wildlife.dgf.nm.gov/home/publications/'},
      ND:{name:'North Dakota Game & Fish',url:'https://gf.nd.gov/regulations/fishing'},
      PA:{name:'Pennsylvania Fish & Boat Commission',url:'https://www.pa.gov/agencies/fishandboat/fishing/regulations'},
      TN:{name:'Tennessee Wildlife Resources Agency',url:'https://www.tn.gov/twra/fishing-regs.html'},
      UT:{name:'Utah Division of Wildlife Resources',url:'https://wildlife.utah.gov/guidebooks?sec=01'},
      WV:{name:'West Virginia DNR',url:'https://wvdnr.gov/fishing/fishing-regulations/'},
      WI:{name:'Wisconsin DNR',url:'https://dnr.wisconsin.gov/topic/fishing/regulations'},
      WY:{name:'Wyoming Game & Fish Department',url:'https://wgfd.wyo.gov/Regulations/Fish/Fishing-Regulation'}
    };
    Object.entries(direct).forEach(([code,src])=>{
      const cur=app.regulationSources?.[code];
      if(!cur||cur.fallback)app.regulationSources[code]={...src,verifiedDirect:true};
    });
  },

  installUI(app){
    const weather=document.querySelector('#aaWeatherDialog .aa-weather-sheet');
    if(weather&&!document.getElementById('nativeSafetyPanel')){
      const panel=document.createElement('section');panel.id='nativeSafetyPanel';panel.className='native-safety-panel';
      panel.innerHTML='<div class="lc-head"><div><div class="eyebrow">ANDROID BACKGROUND SAFETY • 10.0</div><h3>Keep watching after CastVector closes</h3></div><span id="nativeSafetyBadge" class="lc-badge">CHECKING</span></div>'+
        '<p class="native-safety-note">Optional Android-only watch for new high-impact National Weather Service alerts at the fishing destination you choose. Android schedules this inexactly to protect battery.</p>'+
        '<div class="native-safety-grid"><article><span>WATCHING</span><strong id="nativeWatchName">—</strong><small id="nativeWatchLocation">Selected fishing location</small></article><article><span>LAST CHECK</span><strong id="nativeWatchChecked">—</strong><small id="nativeWatchStatus">No background check yet</small></article><article><span>ACTIVE ALERTS</span><strong id="nativeWatchAlerts">—</strong><small id="nativeWatchEvent">NWS high-impact alerts only</small></article><article><span>NOTIFICATIONS</span><strong id="nativeNotifyStatus">—</strong><small>Android permission</small></article></div>'+
        '<div class="native-safety-actions"><button id="nativeWatchEnable" class="primary-button small" type="button">Enable background watch</button><button id="nativeWatchCheck" class="secondary-button small" type="button">Check now</button><button id="nativeWatchDisable" class="ghost-button small" type="button">Disable</button></div>'+
        '<p class="native-safety-foot">This is a supplemental planning/safety feature, not an emergency warning system. Android may delay periodic background work because of battery optimization. Always follow official NWS/local alerts.</p>';
      const note=weather.querySelector('.aa-source-note');if(note)note.before(panel);else weather.appendChild(panel);
    }

    const profile=document.getElementById('view-profile');
    if(profile&&!document.getElementById('buildHealthPanel')){
      const p=document.createElement('section');p.id='buildHealthPanel';p.className='panel build-health-panel';
      p.innerHTML='<div class="lc-head"><div><div class="eyebrow">BUILD HEALTH • 10.0</div><h2>Know exactly what version is running</h2></div><span id="buildHealthBadge" class="lc-badge">CHECKING</span></div>'+
        '<div class="build-health-grid"><article><span>WEB ENGINE</span><strong id="buildWebVersion">10.0.0</strong><small>Live CastVector interface</small></article><article><span>ANDROID PACKAGE</span><strong id="buildAndroidVersion">WEB / PWA</strong><small id="buildAndroidMeta">Native package not detected</small></article><article><span>DATA HEALTH</span><strong id="buildDataHealth">—</strong><small>Current live-source status</small></article><article><span>RUNTIME ERRORS</span><strong id="buildRuntimeErrors">0</strong><small>This app session</small></article></div>'+
        '<div id="buildHealthCall" class="build-health-call">Checking app versions…</div>'+
        '<div class="build-health-actions"><button id="buildDiagnosticsBtn" class="secondary-button small" type="button">Share diagnostics</button><button id="buildPlayStoreBtn" class="ghost-button small" type="button">Open Play Store</button></div>';
      const core=document.getElementById('coreProfilePanel');if(core)core.after(p);else profile.appendChild(p);
    }
  },

  parseStatus(raw){
    if(!raw)return{available:false,enabled:false};
    if(typeof raw==='object')return raw;
    try{return JSON.parse(raw);}catch(_){return{available:false,enabled:false};}
  },

  nativeStatus(){
    const n=this.native();
    if(!n?.getSafetyWatchStatus)return{available:false,enabled:false};
    try{return this.parseStatus(n.getSafetyWatchStatus());}catch(_){return{available:false,enabled:false};}
  },

  renderSafetyStatus(app,status){
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const badge=document.getElementById('nativeSafetyBadge'),enable=document.getElementById('nativeWatchEnable'),check=document.getElementById('nativeWatchCheck'),disable=document.getElementById('nativeWatchDisable');
    if(!status.available){
      set('nativeWatchName','ANDROID BUILD REQUIRED');set('nativeWatchChecked','—');set('nativeWatchAlerts','—');set('nativeNotifyStatus','—');
      set('nativeWatchStatus','Available in the Google Play Android package');
      if(badge){badge.textContent='WEB ONLY';badge.className='lc-badge';}
      if(enable)enable.disabled=true;if(check)check.disabled=true;if(disable)disable.disabled=true;return;
    }
    const selected=app.state.location||{},same=status.enabled&&status.name&&String(status.name)===String(selected.name);
    set('nativeWatchName',status.enabled?(status.name||'Selected fishing location'):'OFF');
    set('nativeWatchLocation',status.enabled?(same?'Matches current destination':'Watching a different saved destination'):'Enable when you want background monitoring');
    set('nativeWatchChecked',status.lastChecked?new Date(Number(status.lastChecked)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'NOT YET');
    set('nativeWatchStatus',status.lastStatus==='error'?(status.lastError||'Last check failed'):status.lastStatus==='retry'?'Retry scheduled':status.enabled?'Android background work enabled':'Background watch is off');
    set('nativeWatchAlerts',status.lastAlertCount==null?'—':String(status.lastAlertCount));
    set('nativeWatchEvent',status.lastEvent||'No high-impact event recorded');
    set('nativeNotifyStatus',status.notificationGranted?'ALLOWED':'NEEDS PERMISSION');
    if(badge){badge.textContent=status.enabled?'WATCHING':'OFF';badge.className='lc-badge '+(status.enabled?'live':'');}
    if(enable){enable.disabled=false;enable.textContent=status.enabled?(same?'Update / recheck this location':'Switch watch to this location'):'Enable background watch';}
    if(check)check.disabled=!status.enabled;if(disable)disable.disabled=!status.enabled;
  },

  refreshSafety(app){
    this.renderSafetyStatus(app,this.nativeStatus());
  },

  enableSafety(app){
    const n=this.native();if(!n?.enableSafetyWatch)return app.showToast?.('Background safety watch is available in the Android Play build.');
    const st=this.nativeStatus();
    if(!st.notificationGranted){
      this.pendingEnable=true;
      try{n.requestNotificationPermission?.();app.showToast?.('Allow CastVector notifications to enable background safety alerts.');}catch(_){this.pendingEnable=false;}
      return;
    }
    const l=app.state.location||{};
    try{
      const result=n.enableSafetyWatch(Number(l.lat),Number(l.lon),String(l.name||'Selected fishing location'));
      if(result==='enabled'){app.showToast?.('Android background safety watch enabled for '+(l.name||'this fishing location')+'.');}
      else if(result==='permission_required'){this.pendingEnable=true;n.requestNotificationPermission?.();}
      else app.showToast?.('Could not enable the background safety watch.');
    }catch(_){app.showToast?.('Could not enable the background safety watch.');}
    setTimeout(()=>this.refreshSafety(app),350);
  },

  disableSafety(app){
    const n=this.native();if(!n?.disableSafetyWatch)return;
    try{n.disableSafetyWatch();app.showToast?.('Android background safety watch disabled.');}catch(_){}
    setTimeout(()=>this.refreshSafety(app),250);
  },

  checkSafety(app){
    const n=this.native();if(!n?.checkSafetyWatchNow)return;
    try{
      const r=n.checkSafetyWatchNow();
      app.showToast?.(r==='queued'?'Background NWS check queued.':'Enable the background safety watch first.');
    }catch(_){app.showToast?.('Could not queue a background safety check.');}
    setTimeout(()=>this.refreshSafety(app),1200);
  },

  versionParts(v){
    return String(v||'0').replace(/[^0-9.].*$/,'').split('.').map(x=>Number(x)||0);
  },

  compareVersions(a,b){
    const x=this.versionParts(a),y=this.versionParts(b),n=Math.max(x.length,y.length);
    for(let i=0;i<n;i++){if((x[i]||0)>(y[i]||0))return 1;if((x[i]||0)<(y[i]||0))return-1;}return 0;
  },

  renderBuild(app){
    const native=this.native(),android=native?.version||null,web=this.version;
    const health=window.CastVectorReliability?.statusModel?.(app),errors=window.CastVectorReliability?.errors?.length||0;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('buildWebVersion',web);set('buildAndroidVersion',android||'WEB / PWA');set('buildAndroidMeta',android?'Installed Google Play/native package':'Native package not detected');
    set('buildDataHealth',health?.label||'CHECK');set('buildRuntimeErrors',String(errors));
    const badge=document.getElementById('buildHealthBadge'),call=document.getElementById('buildHealthCall');
    if(!android){if(badge)badge.textContent='WEB';if(call)call.textContent='You are using the web/PWA experience. Native-only background safety monitoring is unavailable.';return;}
    const cmp=this.compareVersions(android,web);
    if(cmp<0){if(badge){badge.textContent='UPDATE NEEDED';badge.className='lc-badge warn';}if(call)call.textContent='The live CastVector web engine is '+web+', but the installed Android package is '+android+'. Update through your testing/Play track when the next native release is published.';}
    else{if(badge){badge.textContent='ALIGNED';badge.className='lc-badge live';}if(call)call.textContent='Web engine and Android package are aligned at '+android+'.';}
  },

  diagnostics(app){
    const n=this.nativeStatus(),health=window.CastVectorReliability?.statusModel?.(app),providers=[...(window.CastVectorReliability?.providers?.values?.()||[])];
    const errors=(window.CastVectorReliability?.errors||[]).slice(0,5);
    return [
      'CastVector diagnostics',
      'Web engine: '+this.version,
      'Android package: '+(this.native()?.version||'not detected'),
      'Location: '+(app.state.location?.name||'not selected'),
      'Live data: '+(app.state.live?'on':'off'),
      'Data health: '+(health?.label||'unknown'),
      'Source health: '+JSON.stringify(app.state.sourceHealth||{}),
      'Background safety watch: '+(n.enabled?'enabled':'disabled')+(n.name?' • '+n.name:''),
      'Last native watch status: '+(n.lastStatus||'n/a')+(n.lastChecked?' • '+new Date(Number(n.lastChecked)).toISOString():''),
      'Providers: '+providers.map(p=>p.name+':'+p.status).join(', '),
      'Runtime errors: '+errors.length,
      ...errors.map(e=>' - '+e.kind+': '+e.message),
      'User agent: '+navigator.userAgent
    ].join('\n');
  },

  async shareDiagnostics(app){
    const text=this.diagnostics(app);
    try{if(navigator.share){await navigator.share({title:'CastVector diagnostics',text});return;}}catch(e){if(e?.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(text);app.showToast?.('CastVector diagnostics copied.');}catch(_){app.showToast?.('Could not share diagnostics.');}
  },

  bind(app){
    document.addEventListener('click',e=>{
      if(e.target.closest('#nativeWatchEnable')){this.enableSafety(app);return;}
      if(e.target.closest('#nativeWatchDisable')){this.disableSafety(app);return;}
      if(e.target.closest('#nativeWatchCheck')){this.checkSafety(app);return;}
      if(e.target.closest('#buildDiagnosticsBtn')){this.shareDiagnostics(app);return;}
      if(e.target.closest('#buildPlayStoreBtn')){window.open('https://play.google.com/store/apps/details?id=com.castvector.fishing','_blank','noopener');return;}
    });
    const oldRender=app.renderAll?.bind(app);
    if(oldRender)app.renderAll=function(){const out=oldRender();LC.renderBuild(this);LC.refreshSafety(this);return out;};
  }
};

window.CastVectorLaunchCandidate=LC;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>LC.install());else LC.install();
})();