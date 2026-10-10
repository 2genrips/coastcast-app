import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const fail=(msg)=>{console.error('SMOKE FAIL:',msg);process.exitCode=1;};
const ok=(msg)=>console.log('SMOKE OK:',msg);
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

const index=read('index.html');
const pkg=JSON.parse(read('package.json'));
const gradle=read('android-native/app/build.gradle');
const sw=read('sw.js');

const localRefs=[...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(m=>m[1].split('?')[0])
  .filter(x=>!/^https?:|^#|^mailto:|^tel:/.test(x)&&!x.startsWith('data:'));
for(const ref of [...new Set(localRefs)]){
  if(!fs.existsSync(path.join(root,ref)))fail('Missing index asset '+ref);
}
ok('all local index assets exist');

const jsFiles=fs.readdirSync(root).filter(x=>x.endsWith('.js'));
for(const file of jsFiles){
  try{new vm.Script(read(file),{filename:file});}
  catch(e){fail(file+' syntax: '+e.message);}
}
ok('parsed '+jsFiles.length+' root JavaScript files');

const requiredIds=['view-home','view-map','view-trips','view-community','view-profile','quickAnswerPanel','discoverHomeBtn'];
for(const id of requiredIds){
  if(id==='discoverHomeBtn'){
    if(!read('universal-discover.js').includes("action.id='discoverHomeBtn'"))fail('Discover Home action wiring missing');
  }else if(!index.includes('id="'+id+'"'))fail('Missing required DOM id '+id);
}
ok('critical navigation and Home wiring present');

const version='11.5.0';
if(pkg.version!==version)fail('package version mismatch: '+pkg.version);
if(!index.includes('brand-version">'+version+'<'))fail('brand version mismatch');
if(!sw.includes("castvector-v"+version))fail('service worker cache version mismatch');
if(!gradle.includes("versionName '"+version+"'"))fail('Android versionName mismatch');
if(!gradle.includes('versionCode 115001'))fail('Android versionCode mismatch');
ok('release versions aligned');

const requiredModules=['smart-home.js','explore-feed.js','session-replay.js','depth-intelligence.js','pattern-atlas.js','freshwater-mode.js','universal-discover.js','runtime-resilience.js','map-pro.js','angler-advantage.js','competitive-core.js','batch-upgrades.js','launch-candidate.js','daily-driver.js','angler-toolkit.js','water-reports.js'];
for(const f of requiredModules){
  if(!index.includes('src="'+f+'?v='+version+'"'))fail('Module not loaded: '+f);
  if(!sw.includes("'./"+f+"?v="+version+"'"))fail('Module not cached: '+f);
}
ok('major feature modules loaded and cached');

if(!read('.github/workflows/android-closed-test.yml').includes('"build-tools;36.0.0"'))fail('Android build-tools baseline changed');
ok('Android build-tools baseline remains 36.0.0');

const mainActivity=read('android-native/app/src/main/java/com/castvector/fishing/MainActivity.java');
const weatherWorker=read('android-native/app/src/main/java/com/castvector/fishing/WeatherWatchWorker.java');
if(!gradle.includes("androidx.work:work-runtime:2.12.0"))fail('WorkManager dependency missing');
if(!mainActivity.includes('enableSafetyWatch'))fail('Native safety-watch bridge missing');
if(!mainActivity.includes('REQ_NOTIFICATIONS'))fail('Native notification permission bridge missing');
if(!weatherWorker.includes('api.weather.gov/alerts/active?point='))fail('NWS point-alert worker endpoint missing');
if(!weatherWorker.includes('Periodic') && !mainActivity.includes('PeriodicWorkRequest'))fail('Periodic background safety scheduling missing');
ok('native background safety-watch wiring present');

if(process.exitCode)process.exit(process.exitCode);
console.log('CastVector smoke checks passed.');