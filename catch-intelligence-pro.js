(function(){
'use strict';

const C={
  version:'12.5.0',
  app(){return window.CastVector;},

  install(){
    const app=this.app();if(!app)return;
    this.installUI(app);
    this.patchCatch(app);
    this.patchRenders(app);
    this.bind(app);
    this.populateFilters(app);
    this.render(app);
  },

  installUI(app){
    const log=document.getElementById('view-logbook');
    if(log&&!document.getElementById('catchIntelProPanel')){
      const p=document.createElement('section');p.id='catchIntelProPanel';p.className='panel catch-intel-pro';
      p.innerHTML='<div class="cip-head"><div><div class="eyebrow">CATCH INTELLIGENCE PRO • 12.5</div><h2>Find the patterns in your own catches</h2></div><span id="cipBadge" class="cip-badge">LEARNING</span></div>'+
        '<div class="cip-filters"><select id="cipSpecies" class="select-control"><option value="all">All species</option></select><select id="cipDays" class="select-control"><option value="0">All time</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option></select><select id="cipTechnique" class="select-control"><option value="all">All techniques</option></select><select id="cipStructure" class="select-control"><option value="all">All structure</option></select><select id="cipOutcome" class="select-control"><option value="all">All outcomes</option><option value="released">Released</option><option value="kept">Kept</option><option value="lost">Lost / broke off</option></select><label class="cip-check"><input id="cipCurrentWater" type="checkbox"/><span>Near current water</span></label></div>'+
        '<div class="cip-summary-grid"><article><span>MATCHES</span><strong id="cipCount">0</strong><small>Filtered catches</small></article><article><span>TOP TECHNIQUE</span><strong id="cipTopTechnique">—</strong><small>Successful catches</small></article><article><span>TOP STRUCTURE</span><strong id="cipTopStructure">—</strong><small>Successful catches</small></article><article><span>DEPTH BAND</span><strong id="cipDepth">—</strong><small>Middle 60%</small></article><article><span>TOP COLOR</span><strong id="cipColor">—</strong><small>Lure / bait color</small></article><article><span>WATER CLARITY</span><strong id="cipClarity">—</strong><small>Most common</small></article></div>'+
        '<div id="cipInsight" class="cip-insight">Log catches with technique, structure and depth to build a stronger private pattern.</div>'+
        '<div id="cipCatchList" class="cip-catch-list"></div>';
      const intel=document.getElementById('catchIntelligencePanel'),analytics=document.querySelector('#view-logbook .analytics-panel');
      if(intel)intel.after(p);else if(analytics)analytics.after(p);else log.prepend(p);
    }

    const trips=document.getElementById('view-trips');
    if(trips&&!document.getElementById('tripPatternEdgePanel')){
      const p=document.createElement('section');p.id='tripPatternEdgePanel';p.className='panel trip-pattern-edge';
      p.innerHTML='<div class="cip-head"><div><div class="eyebrow">YOUR PATTERN EDGE • 12.5</div><h2>How you have actually caught this species</h2></div><span id="tpeBadge" class="cip-badge">LEARNING</span></div>'+
        '<div class="tpe-hero"><div class="tpe-score"><strong id="tpeCount">0</strong><span>CATCHES</span></div><div><h3 id="tpeTitle">Log catches to unlock a personal technique plan.</h3><p id="tpeDetail">CastVector will use your own successful catches for the selected target species.</p></div></div>'+
        '<div class="tpe-grid"><article><span>TECHNIQUE</span><strong id="tpeTechnique">—</strong></article><article><span>STRUCTURE</span><strong id="tpeStructure">—</strong></article><article><span>DEPTH</span><strong id="tpeDepth">—</strong></article><article><span>COLOR</span><strong id="tpeColor">—</strong></article><article><span>CLARITY</span><strong id="tpeClarity">—</strong></article><article><span>PRESENTATION</span><strong id="tpePresentation">—</strong></article></div>'+
        '<div id="tpeMove" class="tpe-move">Your personal pattern recommendation will appear here.</div>';
      const loadout=document.getElementById('tripLoadoutPanel');if(loadout)loadout.after(p);else trips.appendChild(p);
    }

    const brain=document.getElementById('brain3Panel');
    if(brain&&!document.getElementById('brain3TechniqueEdge')){
      const d=document.createElement('div');d.id='brain3TechniqueEdge';d.className='brain3-technique-edge';
      d.innerHTML='<span>TECHNIQUE EDGE</span><strong id="brain3Technique">Still learning</strong><small id="brain3TechniqueMeta">Add technique and structure when logging catches.</small>';
      brain.appendChild(d);
    }
  },

  successful(c){return String(c?.details?.outcome||'released')!=='lost';},

  mode(arr){
    const m=new Map();arr.filter(v=>v!=null&&String(v).trim()!=='').forEach(v=>{const k=String(v).trim();m.set(k,1+(m.get(k)||0));});
    return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  },

  percentileBand(arr){
    const x=arr.map(Number).filter(v=>Number.isFinite(v)&&v>=0).sort((a,b)=>a-b);if(!x.length)return null;
    const lo=x[Math.floor((x.length-1)*.2)],hi=x[Math.floor((x.length-1)*.8)],mid=x[Math.floor((x.length-1)*.5)];
    return{lo,hi,mid,count:x.length};
  },

  nearCurrent(app,c,radius=25){
    if(!Number.isFinite(Number(c.lat))||!Number.isFinite(Number(c.lon)))return false;
    const l=app.state.location||{};return app.haversine(Number(l.lat),Number(l.lon),Number(c.lat),Number(c.lon))<=radius;
  },

  filtered(app){
    const species=document.getElementById('cipSpecies')?.value||'all',days=Number(document.getElementById('cipDays')?.value)||0,tech=document.getElementById('cipTechnique')?.value||'all',structure=document.getElementById('cipStructure')?.value||'all',outcome=document.getElementById('cipOutcome')?.value||'all',current=!!document.getElementById('cipCurrentWater')?.checked,cutoff=days?Date.now()-days*86400000:0;
    return (app.state.catches||[]).filter(c=>{
      if(species!=='all'&&c.species!==species)return false;
      if(cutoff&&new Date(c.date||0).getTime()<cutoff)return false;
      if(tech!=='all'&&String(c.details?.technique||'')!==tech)return false;
      if(structure!=='all'&&String(c.details?.structure||'')!==structure)return false;
      if(outcome!=='all'&&String(c.details?.outcome||'released')!==outcome)return false;
      if(current&&!this.nearCurrent(app,c,25))return false;
      return true;
    });
  },

  pattern(catches){
    const good=catches.filter(c=>this.successful(c));
    const depths=this.percentileBand(good.map(c=>c.details?.depth));
    return{
      count:catches.length,good:good.length,
      technique:this.mode(good.map(c=>c.details?.technique)),
      structure:this.mode(good.map(c=>c.details?.structure)),
      color:this.mode(good.map(c=>c.details?.color)),
      clarity:this.mode(good.map(c=>c.details?.clarity)),
      presentation:this.mode(good.map(c=>c.details?.presentation)),
      bait:this.mode(good.map(c=>c.bait)),
      depths,
      releaseRate:good.length?Math.round(good.filter(c=>String(c.details?.outcome||'released')==='released').length/good.length*100):null
    };
  },

  targetPattern(app){
    const rows=(app.state.catches||[]).filter(c=>c.species===app.state.targetSpecies&&this.successful(c));
    return this.pattern(rows);
  },

  populateFilters(app){
    const species=document.getElementById('cipSpecies'),tech=document.getElementById('cipTechnique'),structure=document.getElementById('cipStructure');
    if(species){
      const current=species.value||'all',names=[...new Set((app.state.catches||[]).map(c=>c.species).filter(Boolean))].sort();
      species.innerHTML='<option value="all">All species</option>'+names.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
      species.value=names.includes(current)?current:'all';
    }
    if(tech){
      const current=tech.value||'all',vals=[...new Set((app.state.catches||[]).map(c=>c.details?.technique).filter(Boolean))].sort();
      tech.innerHTML='<option value="all">All techniques</option>'+vals.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
      tech.value=vals.includes(current)?current:'all';
    }
    if(structure){
      const current=structure.value||'all',vals=[...new Set((app.state.catches||[]).map(c=>c.details?.structure).filter(Boolean))].sort();
      structure.innerHTML='<option value="all">All structure</option>'+vals.map(n=>'<option value="'+app.escape(n)+'">'+app.escape(n)+'</option>').join('');
      structure.value=vals.includes(current)?current:'all';
    }
  },

  renderExplorer(app){
    const rows=this.filtered(app),p=this.pattern(rows),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('cipCount',rows.length);set('cipTopTechnique',p.technique||'—');set('cipTopStructure',p.structure||'—');set('cipDepth',p.depths?(p.depths.lo===p.depths.hi?Number(p.depths.mid).toFixed(1)+' ft':Number(p.depths.lo).toFixed(1)+'–'+Number(p.depths.hi).toFixed(1)+' ft'):'—');set('cipColor',p.color||'—');set('cipClarity',p.clarity||'—');
    const badge=document.getElementById('cipBadge');if(badge)badge.textContent=p.good>=8?'STRONG':p.good>=4?'GROWING':p.good?'LEARNING':'NEEDS DATA';
    const insight=document.getElementById('cipInsight');
    if(insight){
      const parts=[];if(p.technique)parts.push(p.technique+' is your most common successful technique');if(p.structure)parts.push(p.structure+' is your top structure');if(p.bait)parts.push(p.bait+' leads your bait history');if(p.depths)parts.push('most logged success sits around '+Number(p.depths.lo).toFixed(1)+'–'+Number(p.depths.hi).toFixed(1)+' ft');
      insight.textContent=parts.length?parts.join(' • ')+'.':'These filters do not have enough detailed catches yet. Add technique, structure, depth and color when you log fish.';
    }
    const box=document.getElementById('cipCatchList');if(box)box.innerHTML=rows.length?rows.slice(0,30).map(c=>{
      const d=c.details||{},chips=[d.technique,d.structure,d.depth?d.depth+' ft':'',d.clarity,d.color,d.outcome].filter(Boolean);
      return '<article class="cip-catch-row '+(c.isPB?'pb':'')+'"><div><strong>'+app.escape(c.species)+(c.isPB?' • PB':'')+'</strong><span>'+app.escape(app.prettyDate(c.date))+' • '+app.escape(c.location||'Fishing location')+'</span><small>'+app.escape([c.bait,...chips].filter(Boolean).join(' • ')||'Catch details not listed')+'</small></div><b>'+((c.length?app.escape(String(c.length))+' in':'')+(c.length&&c.weight?' • ':'')+(c.weight?app.escape(String(c.weight))+' lb':''))+'</b></article>';
    }).join(''):'<div class="empty-state">No catches match these filters.</div>';
  },

  renderTripEdge(app){
    const p=this.targetPattern(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('tpeCount',p.good);set('tpeTechnique',p.technique||'—');set('tpeStructure',p.structure||'—');set('tpeDepth',p.depths?(Number(p.depths.lo).toFixed(1)+'–'+Number(p.depths.hi).toFixed(1)+' ft'):'—');set('tpeColor',p.color||'—');set('tpeClarity',p.clarity||'—');set('tpePresentation',p.presentation||'—');
    const badge=document.getElementById('tpeBadge');if(badge)badge.textContent=p.good>=8?'STRONG':p.good>=4?'GROWING':p.good?'LEARNING':'START';
    set('tpeTitle',p.good?('Your '+app.state.targetSpecies+' pattern is taking shape'):'Log '+app.state.targetSpecies+' catches to unlock a personal technique plan.');
    const details=[];if(p.bait)details.push('bait: '+p.bait);if(p.technique)details.push('technique: '+p.technique);if(p.structure)details.push('structure: '+p.structure);if(p.depths)details.push('depth: '+Number(p.depths.lo).toFixed(1)+'–'+Number(p.depths.hi).toFixed(1)+' ft');
    set('tpeDetail',p.good?'Based only on '+p.good+' successful catch'+(p.good===1?'':'es')+' you logged.':'CastVector keeps this private unless you explicitly share a catch.');
    set('tpeMove',details.length?'Personal starting move • '+details.join(' • ')+'. Compare this with today’s live conditions before committing.':'Your personal pattern recommendation will appear here.');
  },

  renderBrainEdge(app){
    const p=this.targetPattern(app),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const strong=[p.technique,p.structure,p.depths?(Number(p.depths.mid).toFixed(1)+' ft'):''].filter(Boolean);
    set('brain3Technique',strong.length?strong.join(' • '):'Still learning');
    set('brain3TechniqueMeta',p.good?p.good+' successful '+app.state.targetSpecies+' catch'+(p.good===1?'':'es')+' with detail fields.':'Add technique, structure and depth when logging catches.');
  },

  patchCatch(app){
    if(app._catchIntelProPatched)return;app._catchIntelProPatched=true;
    const old=app.saveCatch?.bind(app);
    if(old)app.saveCatch=function(){
      const species=this.$('catchSpecies')?.value||this.state.targetSpecies,len=Number(this.$('catchLength')?.value)||0,weight=Number(this.$('catchWeight')?.value)||0;
      const existing=(this.state.catches||[]).filter(c=>c.species===species),priorLen=Math.max(0,...existing.map(c=>Number(c.length)||0)),priorWeight=Math.max(0,...existing.map(c=>Number(c.weight)||0));
      const before=this.state.catches?.[0]?.id,out=old(),item=this.state.catches?.[0];
      if(item&&item.id!==before){
        const pbLen=len>0&&len>priorLen,pbWeight=weight>0&&weight>priorWeight;
        if(pbLen||pbWeight){
          item.isPB=true;item.pbLength=pbLen;item.pbWeight=pbWeight;this.save?.();
          this.showToast?.('New personal best '+species+(pbLen&&pbWeight?' by length and weight!':pbLen?' by length!':' by weight!'));
        }
        C.populateFilters(this);C.render(this);
      }
      return out;
    };
  },

  patchRenders(app){
    const all=app.renderAll?.bind(app);if(all)app.renderAll=function(){const out=all();C.render(this);return out;};
    const log=app.renderLogbook?.bind(app);if(log)app.renderLogbook=function(){const out=log();C.populateFilters(this);C.renderExplorer(this);return out;};
    const trips=app.renderTrips?.bind(app);if(trips)app.renderTrips=function(){const out=trips();C.renderTripEdge(this);return out;};
  },

  render(app){this.renderExplorer(app);this.renderTripEdge(app);this.renderBrainEdge(app);},

  bind(app){
    document.addEventListener('change',e=>{
      if(['cipSpecies','cipDays','cipTechnique','cipStructure','cipOutcome','cipCurrentWater'].includes(e.target.id))this.renderExplorer(app);
    });
  }
};

window.CastVectorCatchIntelligence=C;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>C.install());else C.install();
})();