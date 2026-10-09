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

const version='8.2.0';
if(pkg.version!==version)fail('package version mismatch: '+pkg.version);
if(!index.includes('brand-version">'+version+'<'))fail('brand version mismatch');
if(!sw.includes("castvector-v"+version))fail('service worker cache version mismatch');
if(!gradle.includes("versionName '"+version+"'"))fail('Android versionName mismatch');
if(!gradle.includes('versionCode 82001'))fail('Android versionCode mismatch');
ok('release versions aligned');

const requiredModules=['smart-home.js','explore-feed.js','session-replay.js','depth-intelligence.js','pattern-atlas.js','freshwater-mode.js','universal-discover.js','runtime-resilience.js','map-pro.js'];
for(const f of requiredModules){
  if(!index.includes('src="'+f+'?v='+version+'"'))fail('Module not loaded: '+f);
  if(!sw.includes("'./"+f+"?v="+version+"'"))fail('Module not cached: '+f);
}
ok('major feature modules loaded and cached');

if(!read('.github/workflows/android-closed-test.yml').includes('"build-tools;36.0.0"'))fail('Android build-tools baseline changed');
ok('Android build-tools baseline remains 36.0.0');

if(process.exitCode)process.exit(process.exitCode);
console.log('CastVector smoke checks passed.');