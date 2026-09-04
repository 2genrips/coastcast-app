(() => {
  'use strict';

  const APP = {
    state: {
      view: 'home',
      live: false,
      loading: false,
      location: { key: 'wrightsville', name: 'Wrightsville Beach, NC', lat: 34.2085, lon: -77.7964, source: 'Saved coast' },
      radius: 10,
      fishingStyle: 'Surf fishing',
      targetSpecies: 'Red Drum',
      forecastDay: 0,
      waypoints: [],
      catches: [],
      trips: 0,
      data: null,
      map: null,
      mapLayers: { spots: [], catches: [], shops: [], current: [] },
      mapFilter: 'all',
      selectedTideStation: null
    },

    presets: {
      wrightsville: { name:'Wrightsville Beach, NC', lat:34.2085, lon:-77.7964, source:'Popular coast', tideStation:'8658163' },
      carolina: { name:'Carolina Beach, NC', lat:34.0352, lon:-77.8936, source:'Popular coast' },
      topsail: { name:'Topsail Beach, NC', lat:34.3655, lon:-77.6305, source:'Popular coast' },
      surfCity: { name:'Surf City, NC', lat:34.4271, lon:-77.5461, source:'Popular coast' },
      nagsHead: { name:'Nags Head, NC', lat:35.9574, lon:-75.6241, source:'Popular coast' },
      myrtle: { name:'Myrtle Beach, SC', lat:33.6891, lon:-78.8867, source:'Popular coast' }
    },

    species: {
      'Red Drum': { icon:'🔴', water:[64,82], tideBias:8, waveIdeal:[1,4], note:'Moving water, beach cuts and inlet edges get extra weight. Water in the mid-60s through low-80s scores best.' },
      'Speckled Trout': { icon:'✨', water:[58,76], tideBias:6, waveIdeal:[0.5,2.8], note:'Cleaner water, moderate current and lower surf are favored. Dawn and dusk receive a stronger bump.' },
      'Flounder': { icon:'⬟', water:[62,78], tideBias:7, waveIdeal:[0.5,3], note:'Bottom structure and moving water matter. Moderate conditions score higher than rough surf.' },
      'Bluefish': { icon:'⚡', water:[60,78], tideBias:5, waveIdeal:[1,4.5], note:'Bait movement, moderate surf and stronger water movement can improve the score.' },
      'Spanish Mackerel': { icon:'➤', water:[68,82], tideBias:4, waveIdeal:[0.5,3], note:'Warmer, clearer water and lower-to-moderate seas score best for nearshore Spanish mackerel.' },
      'Black Drum': { icon:'●', water:[55,76], tideBias:7, waveIdeal:[0.5,3.5], note:'Structure and current get extra weight, with a broad cool-to-warm water preference.' },
      'Sheepshead': { icon:'▦', water:[58,78], tideBias:6, waveIdeal:[0.5,2.5], note:'Moderate current around structure is favored. Excessive surf and wind reduce the score more quickly.' },
      'Striped Bass': { icon:'↯', water:[48,68], tideBias:7, waveIdeal:[1,4], note:'Cooler water, moving tide and low-light windows receive extra weight.' }
    },

    mock: {
      current: {
        temp:72, feels:72, weather:'Partly cloudy', weatherCode:2, rain:10,
        windSpeed:7, windDir:45, windGust:10, pressure:1018.6,
        waveHeight:2.0, wavePeriod:9, waveDir:115, swellHeight:1.7, swellPeriod:10, swellDir:110,
        waterTemp:75
      },
      sun: { sunrise:'6:39 AM', sunset:'7:28 PM' },
      days: [
        {date:'Today',day:'THU',icon:'🌤️',high:78,low:66,wind:7,windDir:45,rain:10,wave:2.0,water:75,score:91,sunrise:'6:39 AM',sunset:'7:28 PM'},
        {date:'Fri',day:'FRI',icon:'⛅',high:80,low:68,wind:10,windDir:85,rain:20,wave:2.4,water:75,score:82,sunrise:'6:40 AM',sunset:'7:26 PM'},
        {date:'Sat',day:'SAT',icon:'☀️',high:77,low:64,wind:5,windDir:315,rain:8,wave:1.5,water:74,score:95,sunrise:'6:40 AM',sunset:'7:25 PM'},
        {date:'Sun',day:'SUN',icon:'🌥️',high:81,low:69,wind:13,windDir:135,rain:34,wave:3.1,water:75,score:74,sunrise:'6:41 AM',sunset:'7:23 PM'},
        {date:'Mon',day:'MON',icon:'🌧️',high:76,low:67,wind:15,windDir:95,rain:58,wave:4.0,water:75,score:68,sunrise:'6:42 AM',sunset:'7:22 PM'},
        {date:'Tue',day:'TUE',icon:'⛅',high:79,low:65,wind:8,windDir:5,rain:17,wave:2.1,water:74,score:88,sunrise:'6:42 AM',sunset:'7:20 PM'},
        {date:'Wed',day:'WED',icon:'☀️',high:78,low:63,wind:6,windDir:320,rain:6,wave:1.8,water:74,score:90,sunrise:'6:43 AM',sunset:'7:19 PM'}
      ],
      hours: [
        {time:'5 AM',dateIndex:0,icon:'🌙',temp:64,wind:6,windDir:45,gust:8,rain:0,wave:1.8,period:9,tide:'Rising',score:85},
        {time:'6 AM',dateIndex:0,icon:'🌅',temp:64,wind:6,windDir:45,gust:8,rain:0,wave:1.8,period:9,tide:'Rising',score:89},
        {time:'7 AM',dateIndex:0,icon:'☀️',temp:66,wind:7,windDir:45,gust:9,rain:0,wave:1.9,period:9,tide:'Rising',score:93},
        {time:'8 AM',dateIndex:0,icon:'🌤️',temp:68,wind:7,windDir:45,gust:10,rain:0,wave:2.0,period:9,tide:'Rising',score:95},
        {time:'9 AM',dateIndex:0,icon:'☀️',temp:70,wind:8,windDir:50,gust:10,rain:0,wave:2.0,period:9,tide:'High',score:91},
        {time:'10 AM',dateIndex:0,icon:'🌤️',temp:72,wind:9,windDir:55,gust:11,rain:0,wave:2.1,period:8,tide:'Falling',score:79},
        {time:'11 AM',dateIndex:0,icon:'🌤️',temp:73,wind:10,windDir:60,gust:12,rain:0,wave:2.1,period:8,tide:'Falling',score:69},
        {time:'12 PM',dateIndex:0,icon:'☁️',temp:74,wind:10,windDir:60,gust:13,rain:10,wave:2.2,period:8,tide:'Falling',score:63},
        {time:'1 PM',dateIndex:0,icon:'☁️',temp:75,wind:11,windDir:70,gust:14,rain:10,wave:2.2,period:8,tide:'Falling',score:61},
        {time:'2 PM',dateIndex:0,icon:'🌥️',temp:76,wind:11,windDir:75,gust:14,rain:10,wave:2.1,period:8,tide:'Low',score:59},
        {time:'3 PM',dateIndex:0,icon:'🌤️',temp:76,wind:10,windDir:85,gust:13,rain:10,wave:2.0,period:8,tide:'Rising',score:64},
        {time:'4 PM',dateIndex:0,icon:'☀️',temp:75,wind:9,windDir:85,gust:12,rain:5,wave:1.9,period:8,tide:'Rising',score:73},
        {time:'5 PM',dateIndex:0,icon:'☀️',temp:73,wind:8,windDir:70,gust:10,rain:5,wave:1.8,period:9,tide:'Rising',score:83},
        {time:'6 PM',dateIndex:0,icon:'🌇',temp:71,wind:7,windDir:70,gust:9,rain:5,wave:1.8,period:9,tide:'Rising',score:88},
        {time:'7 PM',dateIndex:0,icon:'🌆',temp:69,wind:6,windDir:65,gust:8,rain:5,wave:1.7,period:9,tide:'Rising',score:85}
      ],
      tides: [
        { type:'High', time:'8:34 AM', height:3.6, rawTime:'2026-09-03T08:34:00' },
        { type:'Low', time:'2:18 PM', height:0.4, rawTime:'2026-09-03T14:18:00' },
        { type:'High', time:'8:46 PM', height:3.2, rawTime:'2026-09-03T20:46:00' },
        { type:'Low', time:'2:56 AM', height:0.2, rawTime:'2026-09-04T02:56:00' }
      ],
      tideStation: { id:'8658163', name:'Wrightsville Beach, NC', distance:0.7 },
      shops: [
        {name:'Seaside Bait & Tackle',distance:1.4,lat:34.218,lon:-77.806,rating:4.8,tags:['Live bait','Surf tackle','Ice'],demo:true},
        {name:'Island Tackle Shop',distance:2.7,lat:34.226,lon:-77.819,rating:4.6,tags:['Bait','Rigs','Ice'],demo:true},
        {name:'Hooked Up Bait & Tackle',distance:4.1,lat:34.185,lon:-77.832,rating:4.4,tags:['Tackle','Line','Local tips'],demo:true}
      ],
      community: [
        {user:'CapeFearAngler',species:'Red Drum',size:'27 in',ago:'2h',bait:'Cut mullet',water:'Wrightsville Beach',text:'Good bite on the incoming tide near a trough. Released healthy.'},
        {user:'SaltLineNC',species:'Speckled Trout',size:'19 in',ago:'5h',bait:'Paddletail',water:'Masonboro area',text:'Cleaner water early. Slow retrieve near a current seam.'},
        {user:'SurfDad',species:'Bluefish',size:'',ago:'Yesterday',bait:'Metal spoon',water:'Carolina Beach',text:'Small blues were chasing bait just outside the wash.'}
      ]
    },

    $(id){ return document.getElementById(id); },
    $$(sel){ return [...document.querySelectorAll(sel)]; },

    init(){
      this.restore();
      this.populateSpeciesControls();
      this.populatePresets();
      this.bindNavigation();
      this.bindControls();
      this.ensureCatchDate();
      this.state.data = this.buildDemoData();
      this.renderAll();
      this.registerServiceWorker();
      if(this.state.live) this.loadLiveData({quiet:true});
    },

    buildDemoData(){
      return JSON.parse(JSON.stringify(this.mock));
    },

    restore(){
      try{
        const raw=localStorage.getItem('coastcast-v3-state')||localStorage.getItem('coastcast-state-v1');
        if(!raw) return;
        const saved=JSON.parse(raw);
        if(saved.location) this.state.location=saved.location;
        if(typeof saved.live==='boolean') this.state.live=saved.live;
        if(saved.radius) this.state.radius=Number(saved.radius);
        if(saved.fishingStyle) this.state.fishingStyle=saved.fishingStyle;
        if(saved.targetSpecies && this.species[saved.targetSpecies]) this.state.targetSpecies=saved.targetSpecies;
        if(Array.isArray(saved.waypoints)) this.state.waypoints=saved.waypoints;
        if(Array.isArray(saved.catches)) this.state.catches=saved.catches;
        if(Number.isFinite(saved.trips)) this.state.trips=saved.trips;
      }catch(_){ }
    },

    save(){
      const payload={
        live:this.state.live,location:this.state.location,radius:this.state.radius,
        fishingStyle:this.state.fishingStyle,targetSpecies:this.state.targetSpecies,
        waypoints:this.state.waypoints,catches:this.state.catches,trips:this.state.trips
      };
      try{ localStorage.setItem('coastcast-v3-state',JSON.stringify(payload)); }catch(_){ }
    },

    bindNavigation(){
      this.$$('.nav-button').forEach(btn=>btn.addEventListener('click',()=>this.navigate(btn.dataset.viewTarget)));
      this.$$('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>this.navigate(btn.dataset.nav)));
    },

    navigate(view){
      this.state.view=view;
      this.$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
      this.$$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.viewTarget===view));
      window.scrollTo({top:0,behavior:'smooth'});
      if(view==='forecast'){this.renderForecast();setTimeout(()=>this.renderTides(),20);}
      if(view==='map') setTimeout(()=>{this.ensureMap();this.renderMapLayers();},50);
      if(view==='logbook') this.renderLogbook();
      if(view==='community') this.renderCommunity();
    },

    bindControls(){
      this.$('locationTitleBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('mapSearchBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('settingsBtn').addEventListener('click',()=>this.openSettings());
      this.$('syncBtn').addEventListener('click',()=>this.state.live?this.loadLiveData():this.showToast('Turn on Live Data to refresh internet forecasts.'));
      this.$('liveModeBtn').addEventListener('click',()=>this.setLiveMode(!this.state.live));
      this.$('liveModeToggle').addEventListener('change',e=>this.setLiveMode(e.target.checked));
      this.$('favoriteSpotBtn').addEventListener('click',()=>this.quickSaveSpot());
      this.$('speciesInfoBtn').addEventListener('click',()=>this.openDialog('infoDialog'));
      this.$('quickPlanBtn').addEventListener('click',()=>this.openPlanner());
      this.$('plannerBtn').addEventListener('click',()=>this.openPlanner());
      this.$('findBestTripBtn').addEventListener('click',()=>this.findBestTrip());
      this.$('useMyLocationSheetBtn').addEventListener('click',()=>this.useMyLocation());
      this.$('locationSearchGoBtn').addEventListener('click',()=>this.searchLocations());
      this.$('locationSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.searchLocations();}});
      this.$('mapRecenterBtn').addEventListener('click',()=>this.recenterMap());
      this.$('addWaypointBtn').addEventListener('click',()=>this.openWaypointDialog());
      this.$('saveWaypointBtn').addEventListener('click',()=>this.saveWaypoint());
      this.$('refreshShopsBtn').addEventListener('click',()=>this.loadNearbyShops(true));
      this.$('logCatchBtn').addEventListener('click',()=>this.openCatchDialog());
      this.$('shareCatchBtn').addEventListener('click',()=>this.openCatchDialog());
      this.$('saveCatchBtn').addEventListener('click',()=>this.saveCatch());
      this.$('targetSpecies').addEventListener('change',e=>this.setSpecies(e.target.value));
      this.$('logPrivacyFilter').addEventListener('change',()=>this.renderCatchList());
      this.$('communitySpeciesFilter').addEventListener('change',()=>this.renderCommunity());
      this.$('communityRadiusFilter').addEventListener('change',()=>this.renderCommunity());
      this.$('refreshChecklistBtn').addEventListener('click',()=>{this.renderChecklist();this.showToast('Trip checklist refreshed.');});
      this.$('radiusSetting').addEventListener('change',e=>{this.state.radius=Number(e.target.value);this.save();});
      this.$('fishingStyleSetting').addEventListener('change',e=>{this.state.fishingStyle=e.target.value;this.save();this.recalculateScores();this.renderAll();});
      this.$('resetAppBtn').addEventListener('click',()=>this.resetApp());
      this.$$('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>this.setMapFilter(btn.dataset.mapFilter,btn)));
    },

    openDialog(id){
      const d=this.$(id); if(d && typeof d.showModal==='function') d.showModal();
    },
    closeDialog(id){ const d=this.$(id); if(d?.open) d.close(); },

    openSettings(){
      this.$('liveModeToggle').checked=this.state.live;
      this.$('radiusSetting').value=String(this.state.radius);
      this.$('fishingStyleSetting').value=this.state.fishingStyle;
      this.openDialog('settingsDialog');
    },

    openPlanner(){
      this.$('tripSpecies').value=this.state.targetSpecies;
      this.$('plannerResult').textContent='Choose your preferences and CoastCast will rank the week.';
      this.openDialog('plannerDialog');
    },

    openWaypointDialog(){
      this.$('waypointName').value=this.state.location.name.replace(/,.*$/,'')+' spot';
      this.$('waypointNotes').value='';
      this.$('waypointPrivacy').value='private';
      this.openDialog('waypointDialog');
    },

    openCatchDialog(){
      this.ensureCatchDate();
      this.$('catchSpecies').value=this.state.targetSpecies;
      this.$('catchSnapshot').textContent=this.snapshotConditions();
      this.openDialog('catchDialog');
    },

    ensureCatchDate(){
      const el=this.$('catchDateTime'); if(!el) return;
      const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
      el.value=d.toISOString().slice(0,16);
    },

    populateSpeciesControls(){
      const names=Object.keys(this.species);
      this.$('speciesChips').innerHTML=names.map(name=>`<button type="button" class="species-chip ${name===this.state.targetSpecies?'active':''}" data-species="${this.escape(name)}">${this.species[name].icon} ${this.escape(name)}</button>`).join('');
      this.$$('.species-chip').forEach(btn=>btn.addEventListener('click',()=>this.setSpecies(btn.dataset.species)));
      ['targetSpecies','catchSpecies','tripSpecies'].forEach(id=>{
        const el=this.$(id); if(!el) return;
        const prefix=id==='targetSpecies'?'':'<option value="">Select species</option>';
        el.innerHTML=prefix+names.map(n=>`<option value="${this.escape(n)}">${this.escape(n)}</option>`).join('');
      });
      this.$('targetSpecies').value=this.state.targetSpecies;
      this.$('catchSpecies').value=this.state.targetSpecies;
      this.$('tripSpecies').value=this.state.targetSpecies;
      this.$('communitySpeciesFilter').innerHTML='<option value="all">All species</option>'+names.map(n=>`<option value="${this.escape(n)}">${this.escape(n)}</option>`).join('');
    },

    populatePresets(){
      this.$('presetLocations').innerHTML=Object.entries(this.presets).map(([key,p])=>`<button type="button" class="preset-button" data-preset="${key}"><strong>${this.escape(p.name)}</strong><span>${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}</span></button>`).join('');
      this.$$('.preset-button').forEach(btn=>btn.addEventListener('click',()=>this.selectPreset(btn.dataset.preset)));
    },

    setSpecies(name){
      if(!this.species[name]) return;
      this.state.targetSpecies=name;
      this.save();
      this.$$('.species-chip').forEach(btn=>btn.classList.toggle('active',btn.dataset.species===name));
      this.$('targetSpecies').value=name;
      this.$('logbookTargetTitle').textContent=name;
      this.recalculateScores();
      this.renderAll();
    },

    selectPreset(key){
      const p=this.presets[key]; if(!p) return;
      this.state.location={key,name:p.name,lat:p.lat,lon:p.lon,source:p.source||'Popular coast',tideStation:p.tideStation||null};
      this.onLocationChanged();
    },

    async useMyLocation(){
      if(!navigator.geolocation){ this.showToast('Phone location is not available in this browser.'); return; }
      this.showToast('Requesting phone location…');
      navigator.geolocation.getCurrentPosition(async pos=>{
        const lat=pos.coords.latitude,lon=pos.coords.longitude;
        let name='Current location';
        try{
          const result=await this.reverseGeocode(lat,lon);
          if(result) name=result;
        }catch(_){ }
        this.state.location={key:'custom',name,lat,lon,source:'Phone GPS'};
        this.onLocationChanged();
      },err=>this.showToast(err.code===1?'Location permission was denied.':'Could not read your location.'),{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
    },

    async searchLocations(){
      const q=this.$('locationSearchInput').value.trim(); if(q.length<3){this.showToast('Enter at least 3 characters.');return;}
      const box=this.$('locationSearchResults'); box.innerHTML='<div class="empty-state">Searching…</div>';
      try{
        const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=us&q='+encodeURIComponent(q);
        const results=await this.fetchJSON(url,12000);
        if(!Array.isArray(results)||!results.length){box.innerHTML='<div class="empty-state">No locations found.</div>';return;}
        box.innerHTML=results.map((r,i)=>`<button type="button" class="search-result-button" data-search-index="${i}"><strong>${this.escape((r.display_name||'').split(',').slice(0,3).join(','))}</strong><span>${Number(r.lat).toFixed(4)}, ${Number(r.lon).toFixed(4)}</span></button>`).join('');
        this.$$('.search-result-button').forEach(btn=>btn.addEventListener('click',()=>{
          const r=results[Number(btn.dataset.searchIndex)];
          this.state.location={key:'custom',name:(r.display_name||q).split(',').slice(0,3).join(','),lat:Number(r.lat),lon:Number(r.lon),source:'Location search'};
          this.onLocationChanged();
        }));
      }catch(_){ box.innerHTML='<div class="empty-state">Search service did not respond. Try a popular coast or your phone location.</div>'; }
    },

    async reverseGeocode(lat,lon){
      const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=12`;
      const r=await this.fetchJSON(url,10000);
      const a=r.address||{};
      const place=a.city||a.town||a.village||a.county||'Current location';
      const state=a.state||'';
      return [place,state].filter(Boolean).join(', ');
    },

    onLocationChanged(){
      this.save();
      this.closeDialog('locationDialog');
      this.$('locationSearchResults').innerHTML='';
      this.state.selectedTideStation=null;
      this.state.data=this.buildDemoData();
      this.renderAll();
      this.recenterMap();
      if(this.state.live) this.loadLiveData(); else this.showToast('Fishing location updated. Turn on Live Data for real forecasts.');
    },

    setLiveMode(enabled){
      this.state.live=!!enabled; this.save();
      this.$('liveModeToggle').checked=this.state.live;
      this.renderMode();
      if(this.state.live) this.loadLiveData();
      else{this.state.data=this.buildDemoData();this.state.selectedTideStation=null;this.recalculateScores();this.renderAll();this.showToast('Demo Data is on.');}
    },

    async loadLiveData({quiet=false}={}){
      if(this.state.loading) return;
      this.state.loading=true;
      this.$('syncBtn').classList.add('spinning');
      if(!quiet) this.showToast('Loading live coastal conditions…');
      const {lat,lon}=this.state.location;
      const base=this.buildDemoData();
      const results=await Promise.allSettled([
        this.loadWeather(lat,lon),
        this.loadMarine(lat,lon),
        this.loadTides(lat,lon),
        this.loadNearbyShops(false)
      ]);
      const weather=results[0].status==='fulfilled'?results[0].value:null;
      const marine=results[1].status==='fulfilled'?results[1].value:null;
      const tideData=results[2].status==='fulfilled'?results[2].value:null;
      const shops=results[3].status==='fulfilled'&&Array.isArray(results[3].value)&&results[3].value.length?results[3].value:null;
      this.state.data=this.mergeLiveData(base,weather,marine,tideData,shops);
      this.recalculateScores();
      this.renderAll();
      this.renderMapLayers();
      this.state.loading=false;
      this.$('syncBtn').classList.remove('spinning');
      const liveCount=[weather,marine,tideData,shops].filter(Boolean).length;
      this.$('lastUpdated').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      if(!quiet) this.showToast(liveCount>=3?'Live coastal data updated.':`Live data partially updated (${liveCount}/4 sources). Demo fallbacks filled the gaps.`);
    },

    async loadWeather(lat,lon){
      const params=new URLSearchParams({
        latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'7',
        temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',
        current:'temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl',
        hourly:'temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl',
        daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset'
      });
      return this.fetchJSON('https://api.open-meteo.com/v1/forecast?'+params.toString(),14000);
    },

    async loadMarine(lat,lon){
      const params=new URLSearchParams({
        latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'7',
        length_unit:'imperial',temperature_unit:'fahrenheit',
        current:'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature',
        hourly:'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature'
      });
      return this.fetchJSON('https://marine-api.open-meteo.com/v1/marine?'+params.toString(),14000);
    },

    async loadTides(lat,lon){
      const station=await this.findNearestTideStation(lat,lon);
      if(!station) throw new Error('No NOAA tide station');
      this.state.selectedTideStation=station;
      const start=new Date(),end=new Date(); end.setDate(end.getDate()+2);
      const params=new URLSearchParams({
        product:'predictions',application:'CoastCast',begin_date:this.formatDateYYYYMMDD(start),end_date:this.formatDateYYYYMMDD(end),
        datum:'MLLW',station:station.id,time_zone:'lst_ldt',units:'english',interval:'hilo',format:'json'
      });
      const data=await this.fetchJSON('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?'+params.toString(),14000);
      const predictions=data.predictions||[];
      if(!predictions.length) throw new Error('No tide predictions');
      return {station,predictions};
    },

    async findNearestTideStation(lat,lon){
      const preset=this.presets[this.state.location.key];
      if(preset?.tideStation){
        return {id:preset.tideStation,name:preset.name.replace(/, NC|, SC/,'')+', NOAA',lat:preset.lat,lon:preset.lon,distance:this.haversine(lat,lon,preset.lat,preset.lon)};
      }
      const cached=this.readStationCache();
      let stations=cached;
      if(!stations){
        const data=await this.fetchJSON('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions',18000);
        stations=data.stationList||data.stations||[];
        if(stations.length) this.writeStationCache(stations);
      }
      let best=null;
      for(const s of stations||[]){
        const slat=Number(s.lat),slon=Number(s.lng??s.lon);
        if(!Number.isFinite(slat)||!Number.isFinite(slon)) continue;
        const d=this.haversine(lat,lon,slat,slon);
        if(!best||d<best.distance) best={id:String(s.id),name:s.name||'NOAA tide station',lat:slat,lon:slon,distance:d};
      }
      return best;
    },

    readStationCache(){
      try{
        const raw=localStorage.getItem('coastcast-noaa-stations'); if(!raw) return null;
        const obj=JSON.parse(raw); if(Date.now()-obj.savedAt>7*86400000) return null;
        return Array.isArray(obj.stations)?obj.stations:null;
      }catch(_){ return null; }
    },
    writeStationCache(stations){ try{localStorage.setItem('coastcast-noaa-stations',JSON.stringify({savedAt:Date.now(),stations}));}catch(_){ } },

    async loadNearbyShops(forceToast=false){
      const {lat,lon}=this.state.location;
      const radiusMeters=Math.round(this.state.radius*1609.344);
      const query=`[out:json][timeout:18];(node(around:${radiusMeters},${lat},${lon})[shop~"fishing|outdoor"];way(around:${radiusMeters},${lat},${lon})[shop~"fishing|outdoor"];node(around:${radiusMeters},${lat},${lon})[name~"bait|tackle",i];way(around:${radiusMeters},${lat},${lon})[name~"bait|tackle",i];);out center tags;`;
      try{
        const url='https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query);
        const data=await this.fetchJSON(url,20000);
        const shops=(data.elements||[]).map(el=>{
          const slat=Number(el.lat??el.center?.lat),slon=Number(el.lon??el.center?.lon);
          const name=el.tags?.name||'Bait & tackle';
          if(!Number.isFinite(slat)||!Number.isFinite(slon)) return null;
          return {name,lat:slat,lon:slon,distance:this.haversine(lat,lon,slat,slon),rating:null,tags:[el.tags?.shop==='fishing'?'Fishing shop':'Tackle / outdoor',el.tags?.opening_hours||'Hours not listed'].filter(Boolean),demo:false};
        }).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,8);
        if(shops.length){
          if(this.state.data) this.state.data.shops=shops;
          if(forceToast){this.renderShops();this.renderMapLayers();this.showToast(`Found ${shops.length} nearby shop${shops.length===1?'':'s'}.`);}
          return shops;
        }
        if(forceToast) this.showToast('No bait/tackle shops were returned in that radius.');
        return [];
      }catch(err){
        if(forceToast) this.showToast('Nearby shop search did not respond. Demo shops are still shown.');
        throw err;
      }
    },

    mergeLiveData(base,weather,marine,tideData,shops){
      const out=base;
      if(weather){
        const c=weather.current||{};
        out.current.temp=this.num(c.temperature_2m,out.current.temp);
        out.current.feels=this.num(c.apparent_temperature,out.current.feels);
        out.current.weatherCode=this.num(c.weather_code,out.current.weatherCode);
        out.current.weather=this.weatherText(out.current.weatherCode);
        out.current.windSpeed=this.num(c.wind_speed_10m,out.current.windSpeed);
        out.current.windDir=this.num(c.wind_direction_10m,out.current.windDir);
        out.current.windGust=this.num(c.wind_gusts_10m,out.current.windGust);
        out.current.pressure=this.num(c.pressure_msl,out.current.pressure);
        const h=weather.hourly||{};
        if(Array.isArray(h.time)&&h.time.length){
          out.hours=h.time.slice(0,Math.min(h.time.length,168)).map((time,i)=>({
            rawTime:time,time:this.hourFromIso(time),dateIndex:this.dateIndexForIso(time),icon:this.weatherIcon(h.weather_code?.[i]),
            temp:this.num(h.temperature_2m?.[i],72),feels:this.num(h.apparent_temperature?.[i],72),
            weatherCode:this.num(h.weather_code?.[i],2),rain:this.num(h.precipitation_probability?.[i],0),
            wind:this.num(h.wind_speed_10m?.[i],0),windDir:this.num(h.wind_direction_10m?.[i],0),gust:this.num(h.wind_gusts_10m?.[i],0),
            pressure:this.num(h.pressure_msl?.[i],1015),wave:2,period:8,tide:'Moving',score:70
          }));
          const nowHour=new Date(); nowHour.setMinutes(0,0,0);
          const firstFuture=out.hours.findIndex(x=>new Date(x.rawTime)>=nowHour);
          if(firstFuture>0) out.hours=out.hours.slice(firstFuture);
          out.current.rain=out.hours[0]?.rain??0;
        }
        const d=weather.daily||{};
        if(Array.isArray(d.time)){
          out.days=d.time.slice(0,7).map((time,i)=>({
            rawDate:time,date:i===0?'Today':this.shortDate(time),day:this.dayName(time),icon:this.weatherIcon(d.weather_code?.[i]),
            high:this.round(d.temperature_2m_max?.[i],78),low:this.round(d.temperature_2m_min?.[i],65),
            rain:this.round(d.precipitation_probability_max?.[i],0),wind:out.hours.find(hh=>hh.dateIndex===i)?.wind??8,
            windDir:out.hours.find(hh=>hh.dateIndex===i)?.windDir??0,wave:2,water:out.current.waterTemp,
            sunrise:this.timeFromIso(d.sunrise?.[i])||'—',sunset:this.timeFromIso(d.sunset?.[i])||'—',score:70
          }));
          out.sun={sunrise:out.days[0]?.sunrise||'—',sunset:out.days[0]?.sunset||'—'};
        }
      }
      if(marine){
        const c=marine.current||{};
        out.current.waveHeight=this.num(c.wave_height,out.current.waveHeight);
        out.current.waveDir=this.num(c.wave_direction,out.current.waveDir);
        out.current.wavePeriod=this.num(c.wave_period,out.current.wavePeriod);
        out.current.swellHeight=this.num(c.swell_wave_height,out.current.swellHeight);
        out.current.swellDir=this.num(c.swell_wave_direction,out.current.swellDir);
        out.current.swellPeriod=this.num(c.swell_wave_period,out.current.swellPeriod);
        out.current.waterTemp=this.num(c.sea_surface_temperature,out.current.waterTemp);
        const mh=marine.hourly||{};
        if(Array.isArray(mh.time)){
          const marineMap=new Map(mh.time.map((t,i)=>[t,{wave:this.num(mh.wave_height?.[i],2),waveDir:this.num(mh.wave_direction?.[i],0),period:this.num(mh.wave_period?.[i],8),swell:this.num(mh.swell_wave_height?.[i],1.5),swellDir:this.num(mh.swell_wave_direction?.[i],0),swellPeriod:this.num(mh.swell_wave_period?.[i],9),water:this.num(mh.sea_surface_temperature?.[i],out.current.waterTemp)}]));
          out.hours.forEach(h=>{
            const m=marineMap.get(h.rawTime); if(!m) return;
            h.wave=m.wave;h.waveDir=m.waveDir;h.period=m.period;h.swell=m.swell;h.swellDir=m.swellDir;h.swellPeriod=m.swellPeriod;h.water=m.water;
          });
          out.days.forEach((d,di)=>{
            const vals=out.hours.filter(h=>h.dateIndex===di&&Number.isFinite(h.wave));
            if(vals.length){d.wave=this.average(vals.map(x=>x.wave));d.water=this.average(vals.map(x=>x.water).filter(Number.isFinite));}
          });
        }
      }
      if(tideData){
        out.tideStation={...tideData.station};
        out.tides=tideData.predictions.slice(0,8).map(p=>({
          type:String(p.type||'').toUpperCase()==='H'?'High':'Low',time:this.noaaTime(p.t),height:this.num(p.v,0),rawTime:String(p.t).replace(' ','T')
        }));
      }
      if(shops) out.shops=shops;
      return out;
    },

    recalculateScores(){
      const d=this.state.data; if(!d) return;
      d.hours.forEach((h,i)=>{h.tide=this.estimateTideState(h.rawTime||null,i,d.tides);h.score=this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??d.current.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current.pressure});});
      d.days.forEach((day,i)=>{
        const hours=d.hours.filter(h=>h.dateIndex===i).slice(0,24);
        if(hours.length){
          const sorted=[...hours].sort((a,b)=>b.score-a.score);
          day.score=Math.round(this.average(sorted.slice(0,Math.min(5,sorted.length)).map(x=>x.score)));
          day.wind=Math.round(this.average(hours.map(x=>x.wind)));
          day.wave=this.average(hours.map(x=>x.wave));
          const waters=hours.map(x=>x.water).filter(Number.isFinite);if(waters.length)day.water=this.average(waters);
        }else day.score=this.calculateScore({wind:day.wind,rain:day.rain,wave:day.wave,water:day.water,tide:'Moving',time:'7 AM',pressure:d.current.pressure});
      });
      const todayHours=d.hours.filter(h=>h.dateIndex===0).slice(0,24);
      if(todayHours.length){
        const best=[...todayHours].sort((a,b)=>b.score-a.score)[0];
        d.current.score=best?.score||d.days[0]?.score||80;
      }else d.current.score=d.days[0]?.score||80;
    },

    calculateScore(c){
      const config=this.species[this.state.targetSpecies]||this.species['Red Drum'];
      let score=58;
      const wind=this.num(c.wind,8),rain=this.num(c.rain,0),wave=this.num(c.wave,2),water=this.num(c.water,72);
      if(wind<=6)score+=15;else if(wind<=10)score+=11;else if(wind<=14)score+=5;else if(wind<=18)score-=5;else score-=18;
      if(rain<=15)score+=6;else if(rain<=35)score+=2;else if(rain>=65)score-=12;else score-=4;
      if(wave>=config.waveIdeal[0]&&wave<=config.waveIdeal[1])score+=9;else if(wave>5)score-=14;else score+=2;
      if(water>=config.water[0]&&water<=config.water[1])score+=8;else if(water<config.water[0]-8||water>config.water[1]+8)score-=7;
      const tide=String(c.tide||'').toLowerCase(); if(/rising|falling|moving/.test(tide))score+=config.tideBias; if(/slack/.test(tide))score-=4;
      const hour=this.extractHour(c.time); if(hour>=5&&hour<=9)score+=8;else if(hour>=17&&hour<=20)score+=6;else if(hour>=11&&hour<=15)score-=3;
      const pressure=this.num(c.pressure,1015); if(pressure>=1008&&pressure<=1024)score+=3;
      if(this.state.fishingStyle==='Surf fishing'&&wind<=10)score+=3;
      if(this.state.fishingStyle==='Pier fishing'&&wave<=4.5)score+=2;
      return Math.round(Math.max(25,Math.min(98,score)));
    },

    scoreFactors(){
      const d=this.state.data,c=d.current,config=this.species[this.state.targetSpecies];
      const wind=c.windSpeed<=10?['positive','Favorable',`Wind ${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)} mph is manageable for ${this.state.fishingStyle.toLowerCase()}.`]:c.windSpeed<=16?['neutral','Mixed',`Wind ${this.fmt(c.windSpeed,0)} mph may affect casting and surface conditions.`]:['negative','Poor',`Strong ${this.fmt(c.windSpeed,0)} mph wind is a major penalty.`];
      const wave=c.waveHeight>=config.waveIdeal[0]&&c.waveHeight<=config.waveIdeal[1]?['positive','Favorable',`${this.fmt(c.waveHeight,1)} ft waves fit the preferred range for ${this.state.targetSpecies}.`]:c.waveHeight<=5?['neutral','Mixed',`${this.fmt(c.waveHeight,1)} ft surf is usable but not ideal.`]:['negative','Rough',`${this.fmt(c.waveHeight,1)} ft surf significantly lowers the score.`];
      const water=c.waterTemp>=config.water[0]&&c.waterTemp<=config.water[1]?['positive','In range',`${this.fmt(c.waterTemp,0)}°F water is within the preferred prototype range.`]:['neutral','Outside peak',`${this.fmt(c.waterTemp,0)}°F water is outside the app's preferred range for this species.`];
      const tide=this.currentTideLabel();
      const tideFactor=/Rising|Falling|Moving/.test(tide)?['positive','Moving water',`${tide} gets extra weight for ${this.state.targetSpecies}.`]:['neutral','Watch timing',`${tide}; moving-water periods generally score better.`];
      const rain=c.rain<=20?['positive','Low risk',`${this.fmt(c.rain,0)}% precipitation probability.`]:c.rain<=50?['neutral','Possible',`${this.fmt(c.rain,0)}% rain chance — pack for a change.`]:['negative','Wet',`${this.fmt(c.rain,0)}% rain chance lowers trip comfort and score.`];
      return [
        {icon:'🌊',title:'Tide movement',data:tideFactor},
        {icon:'🧭',title:'Wind & casting',data:wind},
        {icon:'〰️',title:'Surf / swell',data:wave},
        {icon:'💧',title:'Water temperature',data:water},
        {icon:'🌦️',title:'Weather risk',data:rain}
      ];
    },

    renderAll(){
      this.recalculateScores();
      this.renderMode();this.renderLocation();this.renderScore();this.renderSpecies();this.renderConditions();this.renderFactors();
      this.renderTides();this.renderHourly();this.renderDays();this.renderShops();this.renderForecast();this.renderChecklist();this.renderWaypoints();this.renderLogbook();this.renderCommunity();
      if(this.state.view==='map') this.renderMapLayers();
    },

    renderMode(){
      const badge=this.$('modeBadge');
      badge.classList.toggle('live',this.state.live);badge.classList.toggle('demo',!this.state.live);
      this.$('modeText').textContent=this.state.live?'Live data':'Demo data';
      this.$('liveModeBtn').textContent=this.state.live?'Use demo':'Use live data';
      this.$('liveModeToggle').checked=this.state.live;
    },

    renderLocation(){
      const l=this.state.location;
      this.$('locationName').textContent=l.name;
      this.$('locationCoords').textContent=`${Number(l.lat).toFixed(4)}, ${Number(l.lon).toFixed(4)}`;
      this.$('locationSource').textContent=l.source||'Fishing destination';
      this.$('forecastLocation').textContent=l.name;
      const saved=this.state.waypoints.some(w=>this.haversine(l.lat,l.lon,w.lat,w.lon)<0.05);
      this.$('favoriteSpotBtn').textContent=saved?'★':'☆';this.$('favoriteSpotBtn').classList.toggle('saved',saved);
    },

    renderScore(){
      const d=this.state.data;
      const todayHours=d.hours.filter(h=>h.dateIndex===0).slice(0,24);
      const best=[...todayHours].sort((a,b)=>b.score-a.score)[0]||{score:d.days[0]?.score||80};
      const score=best.score||80; const grade=this.grade(score);
      this.$('fishingScore').textContent=score;
      this.$('scoreLabel').textContent=grade.label;
      this.$('scoreLabel').className='grade-badge '+grade.className;
      this.$('dialGrade').textContent=grade.short;
      const circumference=314.16;this.$('scoreArc').style.strokeDashoffset=String(circumference*(1-score/100));
      this.$('scoreArc').style.stroke=score>=85?'var(--lime)':score>=72?'var(--cyan)':score>=58?'var(--yellow)':'var(--orange)';
      const window=this.findBestWindow(todayHours);
      this.$('bestWindow').textContent=window.label;
      this.$('bestWindowReason').textContent=window.reason;
      this.$('scoreReason').textContent=`${this.state.targetSpecies} mode: ${window.reason}. ${this.state.fishingStyle} weighting is active.`;
      this.$('intelConfidence').textContent=this.state.live?'Live-source confidence':'Demo confidence';
    },

    renderSpecies(){
      this.$$('.species-chip').forEach(b=>b.classList.toggle('active',b.dataset.species===this.state.targetSpecies));
      const cfg=this.species[this.state.targetSpecies];
      this.$('speciesInsight').innerHTML=`<strong>${cfg.icon} ${this.escape(this.state.targetSpecies)}:</strong> ${this.escape(cfg.note)}`;
      this.$('targetSpecies').value=this.state.targetSpecies;
      this.$('logbookTargetTitle').textContent=this.state.targetSpecies;
      this.$('speciesTip').textContent=cfg.note;
    },

    renderConditions(){
      const c=this.state.data.current;
      this.$('airTemp').textContent=`${this.fmt(c.temp,0)}°F`;
      this.$('feelsLike').textContent=`Feels ${this.fmt(c.feels,0)}°F`;
      this.$('weatherText').textContent=c.weather||this.weatherText(c.weatherCode);
      this.$('weatherIcon').textContent=this.weatherIcon(c.weatherCode);
      this.$('precipNow').textContent=`Rain ${this.fmt(c.rain,0)}%`;
      this.$('windNow').textContent=`${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)} mph`;
      this.$('gustNow').textContent=`Gusts ${this.fmt(c.windGust,0)} mph`;
      this.$('surfNow').textContent=`${this.fmt(c.waveHeight,1)} ft`;
      this.$('periodNow').textContent=`${this.fmt(c.wavePeriod,0)} sec • ${this.compass(c.waveDir)}`;
      this.$('waterTemp').textContent=`${this.fmt(c.waterTemp,0)}°F`;
      this.$('swellNow').textContent=`Swell ${this.fmt(c.swellHeight,1)} ft`;
      this.$('pressureNow').textContent=`${this.fmt(this.hpaToInHg(c.pressure),2)} in`;
      this.$('pressureTrend').textContent='MSL pressure';
    },

    renderFactors(){
      this.$('scoreFactors').innerHTML=this.scoreFactors().map(f=>`<div class="factor-row"><div class="factor-icon">${f.icon}</div><div><div class="factor-title">${this.escape(f.title)}</div><div class="factor-copy">${this.escape(f.data[2])}</div></div><span class="factor-score ${f.data[0]}">${this.escape(f.data[1])}</span></div>`).join('');
    },

    renderTides(){
      const d=this.state.data,tides=d.tides||[];
      const station=d.tideStation||this.mock.tideStation;
      const label=station?.name||'Nearest tide station';
      this.$('tideStationLabel').textContent=station?.distance!=null?`${label} • ${this.fmt(station.distance,1)} mi`:label;
      this.$('forecastTideStation').textContent=label;
      const html=tides.slice(0,5).map(t=>`<div class="tide-event ${t.type.toLowerCase()}"><small>${this.escape(t.type)} TIDE</small><strong>${this.escape(t.time)}</strong><span>${this.fmt(t.height,1)} ft MLLW</span></div>`).join('');
      this.$('tideEvents').innerHTML=html||'<div class="empty-state">No tide events available.</div>';
      this.$('forecastTideEvents').innerHTML=html||'<div class="empty-state">No tide events available.</div>';
      this.drawTideCanvas(this.$('tideCanvas'),tides);
      this.drawTideCanvas(this.$('forecastTideCanvas'),tides);
    },

    drawTideCanvas(canvas,tides){
      if(!canvas) return; const ctx=canvas.getContext('2d'); const rect=canvas.getBoundingClientRect();
      const scale=Math.max(1,window.devicePixelRatio||1);const w=Math.max(300,Math.round(rect.width*scale)),h=Math.max(150,Math.round(rect.height*scale));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(scale,scale);const cw=w/scale,ch=h/scale,pad=22;
      ctx.strokeStyle='rgba(194,231,247,.12)';ctx.lineWidth=1;
      for(let i=1;i<=3;i++){const y=pad+(ch-pad*2)*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(cw-pad,y);ctx.stroke();}
      const points=this.tideCurvePoints(tides,48);
      if(points.length){const vals=points.map(p=>p.v),min=Math.min(...vals),max=Math.max(...vals);ctx.beginPath();points.forEach((p,i)=>{const x=pad+(cw-pad*2)*(i/(points.length-1));const y=ch-pad-(ch-pad*2)*((p.v-min)/(Math.max(.01,max-min)));if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle='#36c6f4';ctx.lineWidth=3;ctx.lineCap='round';ctx.stroke();}
      ctx.fillStyle='#8fa9b8';ctx.font='10px system-ui';ctx.fillText('Low',pad,14);ctx.fillText('High',pad,ch-5);ctx.restore();
    },

    tideCurvePoints(tides,count){
      if(!tides||tides.length<2){return Array.from({length:count},(_,i)=>({v:2+Math.sin(i/(count-1)*Math.PI*2)*1.3}));}
      const events=tides.slice(0,4).map((t,i)=>({i:i*(count-1)/(Math.max(1,Math.min(3,tides.length-1))),v:Number(t.height)}));
      const pts=[];
      for(let x=0;x<count;x++){
        let a=events[0],b=events[events.length-1];
        for(let j=0;j<events.length-1;j++){if(x>=events[j].i&&x<=events[j+1].i){a=events[j];b=events[j+1];break;}}
        const t=(x-a.i)/Math.max(.001,b.i-a.i);const smooth=(1-Math.cos(Math.PI*Math.max(0,Math.min(1,t))))/2;pts.push({v:a.v*(1-smooth)+b.v*smooth});
      }
      return pts;
    },

    renderHourly(){
      const hours=this.state.data.hours.filter(h=>h.dateIndex===0).slice(0,12);
      this.$('hourlyStrip').innerHTML=hours.map(h=>`<div class="hour-card ${h.score>=88?'best':''}"><div class="hour-time">${this.escape(h.time)}</div><div class="hour-icon">${h.icon||this.weatherIcon(h.weatherCode)}</div><div class="hour-temp">${this.fmt(h.temp,0)}°</div><div class="hour-sub">${this.compass(h.windDir)} ${this.fmt(h.wind,0)} mph</div><div class="hour-sub">Wave ${this.fmt(h.wave,1)} ft</div><div class="hour-score">${h.score}</div></div>`).join('');
    },

    renderDays(){
      const days=this.state.data.days.slice(0,7); const best=days.reduce((a,b)=>b.score>a.score?b:a,days[0]);
      this.$('bestDaySummary').innerHTML=`<div><strong>${this.escape(best.day)} is the strongest trip day — ${best.score}/100</strong><br><span>${best.icon} ${this.fmt(best.high,0)}°/${this.fmt(best.low,0)}° • ${this.fmt(best.wind,0)} mph wind • ${this.fmt(best.rain,0)}% rain • ${this.fmt(best.wave,1)} ft surf</span></div><span class="grade-badge excellent">BEST</span>`;
      this.$('dayScores').innerHTML=days.map((d,i)=>`<button type="button" class="day-score ${d===best?'best':''}" data-day-index="${i}"><div class="day">${this.escape(d.day)}</div><div class="icon">${d.icon}</div><div class="num">${d.score}</div><div class="temps">${this.fmt(d.high,0)}° / ${this.fmt(d.low,0)}°</div></button>`).join('');
      this.$$('.day-score').forEach(b=>b.addEventListener('click',()=>{this.state.forecastDay=Number(b.dataset.dayIndex);this.navigate('forecast');this.renderForecast();}));
    },

    renderShops(){
      const shops=(this.state.data.shops||[]).slice(0,4);
      const html=shops.length?shops.map((s,i)=>this.shopHTML(s,i)).join(''):'<div class="empty-state">No bait/tackle shops loaded yet.</div>';
      this.$('baitShopList').innerHTML=html;this.$('mapShopList').innerHTML=html;
      this.bindShopLinks();
    },

    shopHTML(s,i){
      const tags=(s.tags||[]).slice(0,2).join(' • '); const dist=this.fmt(s.distance,1);
      return `<div class="list-item"><div class="list-leading">${i===0?'🪱':'🎣'}</div><div><div class="list-title">${this.escape(s.name)}</div><div class="list-sub">${dist} mi from fishing spot${tags?' • '+this.escape(tags):''}${s.demo?' • demo listing':''}</div></div><div class="list-actions"><a class="mini-button shop-directions" href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">Directions</a></div></div>`;
    },
    bindShopLinks(){},

    renderForecast(){
      const d=this.state.data,c=d.current; const days=d.days.slice(0,7);
      this.$('forecastSummaryIcon').textContent=this.weatherIcon(c.weatherCode);
      this.$('forecastSummaryTemp').textContent=`${this.fmt(c.temp,0)}°F`;
      this.$('forecastSummaryText').textContent=c.weather||this.weatherText(c.weatherCode);
      this.$('summaryFeels').textContent=`${this.fmt(c.feels,0)}°`;
      this.$('summaryWind').textContent=`${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)}`;
      this.$('summaryRain').textContent=`${this.fmt(c.rain,0)}%`;
      this.$('summarySurf').textContent=`${this.fmt(c.waveHeight,1)} ft`;
      this.$('forecastDays').innerHTML=days.map((day,i)=>`<button type="button" class="forecast-day ${i===this.state.forecastDay?'active':''}" data-forecast-index="${i}"><div class="day">${this.escape(day.day)}</div><div class="date">${this.escape(day.date||'')}</div><div class="icon">${day.icon}</div><div class="temps">${this.fmt(day.high,0)}° / ${this.fmt(day.low,0)}°</div><div class="day-score-number">${day.score}</div></button>`).join('');
      this.$$('.forecast-day').forEach(btn=>btn.addEventListener('click',()=>{this.state.forecastDay=Number(btn.dataset.forecastIndex);this.renderForecast();}));
      const selected=days[this.state.forecastDay]||days[0];
      this.$('selectedForecastDay').textContent=selected?.date||selected?.day||'Today';
      const grade=this.grade(selected?.score||70);this.$('selectedDayScore').textContent=`${selected?.score||70} / 100`;this.$('selectedDayScore').className='grade-badge '+grade.className;
      let hours=d.hours.filter(h=>h.dateIndex===this.state.forecastDay).slice(0,24);
      if(!hours.length) hours=d.hours.slice(0,24).map(h=>({...h,dateIndex:this.state.forecastDay}));
      this.$('hourlyTable').innerHTML=hours.map(h=>`<tr><td><strong>${this.escape(h.time)}</strong></td><td>${h.icon||this.weatherIcon(h.weatherCode)}</td><td>${this.fmt(h.temp,0)}°</td><td>${this.compass(h.windDir)} ${this.fmt(h.wind,0)}</td><td>${this.fmt(h.rain,0)}%</td><td>${this.fmt(h.wave,1)} ft</td><td>${this.escape(h.tide||'—')}</td><td class="${h.score>=80?'score-high':h.score>=65?'score-mid':'score-low'}">${h.score}</td></tr>`).join('');
      this.$('detailWave').textContent=`${this.fmt(c.waveHeight,1)} ft`;
      this.$('detailPeriod').textContent=`${this.fmt(c.wavePeriod,0)} sec`;
      this.$('detailWaveDir').textContent=this.compass(c.waveDir);
      this.$('detailSwell').textContent=`${this.fmt(c.swellHeight,1)} ft @ ${this.fmt(c.swellPeriod,0)} sec`;
      this.$('detailWater').textContent=`${this.fmt(c.waterTemp,0)}°F`;
      this.$('detailSunrise').textContent=selected?.sunrise||d.sun?.sunrise||'—';
      this.$('detailSunset').textContent=selected?.sunset||d.sun?.sunset||'—';
      this.$('detailRain').textContent=`${this.fmt(selected?.rain??c.rain,0)}%`;
      this.$('detailPressure').textContent=`${this.fmt(this.hpaToInHg(c.pressure),2)} in`;
      this.$('detailMoon').textContent=this.moonPhase();
    },

    renderChecklist(){
      const c=this.state.data.current; const items=[
        ['Fishing license / required permits',true],['Rods, reels and terminal tackle',true],[`Bait / lures for ${this.state.targetSpecies}`,false],['Pliers, dehooker and measuring tool',false],['Water, snacks and charged phone',false],['Sunscreen, hat and eye protection',false]
      ];
      if(c.rain>=25)items.push(['Rain shell / dry storage',false]);
      if(c.windSpeed>=12)items.push(['Heavier sinkers / wind-ready rigging',false]);
      if(c.waveHeight>=3.5)items.push(['Review surf safety before entering the water',false]);
      if(c.temp<60)items.push(['Warm layers',false]); else items.push(['Breathable clothing',false]);
      items.push(['First-aid kit and trip safety plan',false]);
      this.$('tripChecklist').innerHTML=items.map(x=>`<label class="check-row"><input type="checkbox" ${x[1]?'checked':''}/><span>${this.escape(x[0])}</span></label>`).join('');
    },

    findBestTrip(){
      const species=this.$('tripSpecies').value||this.state.targetSpecies,session=this.$('tripSession').value,maxWind=Number(this.$('tripMaxWind').value)||15;
      const days=this.state.data.days.map((d,i)=>({...d,index:i,adjusted:d.score-(d.wind>maxWind?Math.min(25,(d.wind-maxWind)*3):0)}));
      const best=days.reduce((a,b)=>b.adjusted>a.adjusted?b:a,days[0]);
      const hours=this.state.data.hours.filter(h=>h.dateIndex===best.index&&h.wind<=maxWind);
      let bestHour=hours.reduce((a,b)=>!a||b.score>a.score?b:a,null);
      if(session!=='Any time'){
        const filtered=hours.filter(h=>this.matchesSession(h.time,session));
        if(filtered.length) bestHour=filtered.reduce((a,b)=>b.score>a.score?b:a,filtered[0]);
      }
      this.state.trips+=1;this.save();this.$('tripCount').textContent=this.state.trips;
      this.$('plannerResult').innerHTML=`<strong>${this.escape(best.day)} is your best match — ${best.adjusted}/100 adjusted.</strong><br>${this.escape(species)} • ${this.escape(session)} • ${best.icon} ${this.fmt(best.high,0)}°/${this.fmt(best.low,0)}° • ${this.fmt(best.wind,0)} mph avg wind • ${this.fmt(best.wave,1)} ft surf.${bestHour?`<br><strong>Best hour:</strong> ${this.escape(bestHour.time)} (${bestHour.score}/100).`:''}`;
    },

    matchesSession(time,session){const h=this.extractHour(time);if(session==='Morning')return h>=4&&h<11;if(session==='Afternoon')return h>=11&&h<17;if(session==='Evening')return h>=17&&h<=22;return true;},

    quickSaveSpot(){
      const l=this.state.location;const existing=this.state.waypoints.some(w=>this.haversine(l.lat,l.lon,w.lat,w.lon)<.05);
      if(existing){this.showToast('This fishing location is already saved.');return;}
      this.state.waypoints.unshift({id:Date.now(),name:l.name,notes:'Saved fishing destination',lat:l.lat,lon:l.lon,privacy:'private'});this.save();this.renderLocation();this.renderWaypoints();this.renderMapLayers();this.showToast('Fishing spot saved.');
    },

    saveWaypoint(){
      const name=this.$('waypointName').value.trim()||'Fishing waypoint',notes=this.$('waypointNotes').value.trim(),privacy=this.$('waypointPrivacy').value;
      const l=this.state.location;this.state.waypoints.unshift({id:Date.now(),name,notes,privacy,lat:l.lat,lon:l.lon});this.save();this.closeDialog('waypointDialog');this.renderLocation();this.renderWaypoints();this.renderMapLayers();this.showToast('Fishing waypoint saved.');
    },

    renderWaypoints(){
      const list=this.$('waypointList'),items=this.state.waypoints;this.$('waypointCount').textContent=`${items.length} saved`;
      if(!items.length){list.className='list-stack empty-state';list.textContent='No saved fishing spots yet.';return;}
      list.className='list-stack';list.innerHTML=items.map(w=>`<div class="list-item"><div class="list-leading">📌</div><div><div class="list-title">${this.escape(w.name)}</div><div class="list-sub">${this.escape(w.notes||'Saved spot')} • ${Number(w.lat).toFixed(4)}, ${Number(w.lon).toFixed(4)} • ${this.escape(w.privacy||'private')}</div></div><div class="list-actions"><button type="button" class="mini-button goto-waypoint" data-id="${w.id}">Map</button><button type="button" class="mini-button delete-waypoint" data-id="${w.id}">Delete</button></div></div>`).join('');
      this.$$('.delete-waypoint').forEach(b=>b.addEventListener('click',()=>{this.state.waypoints=this.state.waypoints.filter(w=>String(w.id)!==String(b.dataset.id));this.save();this.renderLocation();this.renderWaypoints();this.renderMapLayers();}));
      this.$$('.goto-waypoint').forEach(b=>b.addEventListener('click',()=>{const w=this.state.waypoints.find(x=>String(x.id)===String(b.dataset.id));if(w){this.navigate('map');setTimeout(()=>this.state.map?.setView([w.lat,w.lon],14),100);}}));
    },

    saveCatch(){
      const species=this.$('catchSpecies').value||this.state.targetSpecies;
      const item={id:Date.now(),species,date:this.$('catchDateTime').value||new Date().toISOString(),length:this.$('catchLength').value,weight:this.$('catchWeight').value,bait:this.$('catchBait').value.trim(),notes:this.$('catchNotes').value.trim(),privacy:this.$('catchPrivacy').value,location:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,conditions:this.snapshotConditions(),score:this.currentScore()};
      this.state.catches.unshift(item);this.save();this.closeDialog('catchDialog');this.$('catchForm').reset();this.ensureCatchDate();this.renderLogbook();this.renderCommunity();this.renderMapLayers();this.showToast('Catch saved with CoastCast conditions.');
    },

    renderLogbook(){
      const catches=this.state.catches;this.$('catchCount').textContent=catches.length;this.$('speciesCount').textContent=new Set(catches.map(c=>c.species)).size;this.$('tripCount').textContent=this.state.trips;
      const pb=new Map();catches.forEach(c=>{const len=Number(c.length)||0;if(len>(pb.get(c.species)||0))pb.set(c.species,len)});this.$('pbCount').textContent=[...pb.values()].filter(v=>v>0).length;
      this.$('targetSpecies').value=this.state.targetSpecies;this.$('logbookTargetTitle').textContent=this.state.targetSpecies;this.$('speciesTip').textContent=this.species[this.state.targetSpecies].note;
      this.renderPersonalInsights();this.renderCatchList();
    },

    renderPersonalInsights(){
      const c=this.state.catches,box=this.$('personalInsights');
      if(!c.length){box.innerHTML='<div class="personal-insight"><strong>Start building your fishing pattern</strong><span>Log catches with bait, size and conditions. CoastCast will summarize your strongest patterns here.</span></div>';return;}
      const topSpecies=this.mode(c.map(x=>x.species));const topBait=this.mode(c.map(x=>x.bait).filter(Boolean))||'Not enough bait data';const avgScore=Math.round(this.average(c.map(x=>Number(x.score)||0).filter(Boolean)))||0;
      box.innerHTML=`<div class="personal-insight"><strong>Most logged species: ${this.escape(topSpecies||'—')}</strong><span>${c.filter(x=>x.species===topSpecies).length} catch${c.filter(x=>x.species===topSpecies).length===1?'':'es'} in your logbook.</span></div><div class="personal-insight"><strong>Most-used successful bait: ${this.escape(topBait)}</strong><span>This is based only on catches you have personally logged.</span></div><div class="personal-insight"><strong>Average saved CoastCast score: ${avgScore||'—'}</strong><span>As your log grows, this can become a personalized condition profile.</span></div>`;
    },

    renderCatchList(){
      const filter=this.$('logPrivacyFilter').value||'all';const catches=this.state.catches.filter(c=>filter==='all'||c.privacy===filter);const box=this.$('catchList');
      if(!catches.length){box.className='list-stack empty-state';box.textContent='Your catches will appear here.';return;}
      box.className='list-stack';box.innerHTML=catches.map(c=>`<article class="catch-card"><div class="catch-head"><div><div class="catch-species">${this.escape(c.species)}</div><div class="list-sub">${this.prettyDate(c.date)} • ${this.escape(c.location)}</div></div><span class="privacy-pill">${c.privacy==='public'?'Public':c.privacy==='water'?'Water only':'Private'}</span></div><div class="catch-measurements">${c.length?`${this.escape(c.length)} in`:''}${c.length&&c.weight?' • ':''}${c.weight?`${this.escape(c.weight)} lb`:''}${c.bait?` • ${this.escape(c.bait)}`:''}</div>${c.notes?`<div class="catch-notes">${this.escape(c.notes)}</div>`:''}<div class="catch-conditions">${this.escape(c.conditions)} • Score ${this.escape(c.score||'—')}</div></article>`).join('');
    },

    renderCommunity(){
      const speciesFilter=this.$('communitySpeciesFilter').value||'all';
      const userPosts=this.state.catches.filter(c=>c.privacy!=='private').map(c=>({user:'You',species:c.species,size:c.length?`${c.length} in`:'',ago:this.prettyDate(c.date),bait:c.bait||'Not listed',water:c.privacy==='water'?this.generalizeWater(c.location):c.location,text:c.notes||'Logged a catch with CoastCast.'}));
      const posts=[...userPosts,...this.mock.community].filter(p=>speciesFilter==='all'||p.species===speciesFilter);
      this.$('communityFeed').innerHTML=posts.length?posts.map(p=>`<article class="feed-card"><div class="feed-head"><div class="avatar">${this.escape((p.user||'A')[0])}</div><div><div class="feed-user">${this.escape(p.user)}</div><div class="feed-meta">${this.escape(p.ago)} • ${this.escape(p.water)}</div></div></div><div class="feed-photo" aria-label="Catch photo placeholder">🐟</div><div class="feed-body"><div class="feed-species">${this.escape(p.species)}${p.size?' • '+this.escape(p.size):''}</div><div class="feed-detail">Bait: ${this.escape(p.bait||'Not listed')}</div><div class="feed-text">${this.escape(p.text||'')}</div></div></article>`).join(''):'<div class="empty-state">No catches match that species yet.</div>';
    },

    ensureMap(){
      if(this.state.map) return;
      if(!window.L){this.$('leafletMap').classList.add('hidden');this.$('mapFallback').classList.remove('hidden');return;}
      try{
        const l=this.state.location;
        const map=L.map('leafletMap',{zoomControl:true,attributionControl:true}).setView([l.lat,l.lon],12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
        this.state.map=map;this.renderMapLayers();setTimeout(()=>map.invalidateSize(),100);
      }catch(_){this.$('leafletMap').classList.add('hidden');this.$('mapFallback').classList.remove('hidden');}
    },

    renderMapLayers(){
      const map=this.state.map;if(!map) return;
      Object.values(this.state.mapLayers).flat().forEach(layer=>{try{map.removeLayer(layer);}catch(_){}});this.state.mapLayers={spots:[],catches:[],shops:[],current:[]};
      const l=this.state.location;
      const current=L.circleMarker([l.lat,l.lon],{radius:9,color:'#ffffff',weight:2,fillColor:'#36c6f4',fillOpacity:1}).addTo(map).bindPopup(`<strong>${this.escape(l.name)}</strong><br>Current fishing destination`);this.state.mapLayers.current.push(current);
      this.state.waypoints.forEach(w=>{const m=L.marker([w.lat,w.lon]).bindPopup(`<strong>${this.escape(w.name)}</strong><br>${this.escape(w.notes||'Saved spot')}`);m.addTo(map);this.state.mapLayers.spots.push(m);});
      this.state.catches.forEach(c=>{const lat=c.privacy==='private'?c.lat+.003:c.lat,lon=c.privacy==='private'?c.lon+.003:c.lon;const m=L.circleMarker([lat,lon],{radius:7,color:'#ffffff',weight:2,fillColor:'#6fdb83',fillOpacity:.95}).bindPopup(`<strong>${this.escape(c.species)}</strong><br>${this.escape(c.privacy==='private'?'Private catch — offset on map':c.location)}`);m.addTo(map);this.state.mapLayers.catches.push(m);});
      (this.state.data?.shops||[]).forEach(s=>{if(!Number.isFinite(Number(s.lat))||!Number.isFinite(Number(s.lon)))return;const m=L.circleMarker([s.lat,s.lon],{radius:7,color:'#ffffff',weight:2,fillColor:'#ff9e57',fillOpacity:.95}).bindPopup(`<strong>${this.escape(s.name)}</strong><br>${this.fmt(s.distance,1)} mi from fishing spot<br><a href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">Directions</a>`);m.addTo(map);this.state.mapLayers.shops.push(m);});
      this.applyMapFilter();
      this.$('mapSelection').innerHTML=`Fishing spot is centered on <strong>${this.escape(l.name)}</strong>.`;
    },

    setMapFilter(filter,button){this.state.mapFilter=filter;this.$$('.filter-chip').forEach(b=>b.classList.toggle('active',b===button));this.applyMapFilter();},
    applyMapFilter(){const map=this.state.map;if(!map)return;for(const [type,layers] of Object.entries(this.state.mapLayers)){const show=this.state.mapFilter==='all'||type===this.state.mapFilter||type==='current';layers.forEach(layer=>{const on=map.hasLayer(layer);if(show&&!on)layer.addTo(map);if(!show&&on)map.removeLayer(layer);});}},
    recenterMap(){if(!this.state.map)return;const l=this.state.location;this.state.map.setView([l.lat,l.lon],12);setTimeout(()=>this.renderMapLayers(),50);},

    resetApp(){
      if(!confirm('Reset saved CoastCast spots, catches, settings and preferences?')) return;
      try{localStorage.removeItem('coastcast-v3-state');}catch(_){ }
      this.state.live=false;this.state.location={key:'wrightsville',name:'Wrightsville Beach, NC',lat:34.2085,lon:-77.7964,source:'Saved coast'};this.state.radius=10;this.state.fishingStyle='Surf fishing';this.state.targetSpecies='Red Drum';this.state.waypoints=[];this.state.catches=[];this.state.trips=0;this.state.data=this.buildDemoData();this.closeDialog('settingsDialog');this.renderAll();this.showToast('CoastCast reset.');
    },

    snapshotConditions(){
      const c=this.state.data.current;return `${this.fmt(c.temp,0)}°F ${c.weather||this.weatherText(c.weatherCode)}, ${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)} mph wind, ${this.fmt(c.waveHeight,1)} ft surf, ${this.fmt(c.waterTemp,0)}°F water, ${this.currentTideLabel().toLowerCase()}`;
    },

    currentScore(){const hs=this.state.data.hours.filter(h=>h.dateIndex===0);return hs.length?Math.max(...hs.slice(0,12).map(h=>h.score)):this.state.data.days[0]?.score||70;},

    currentTideLabel(){
      const tides=this.state.data.tides||[];if(tides.length<2)return'Moving tide';
      const now=new Date();const parsed=tides.map(t=>({type:t.type,date:this.parseTideDate(t.rawTime)})).filter(x=>!isNaN(x.date));
      if(parsed.length>=2){const next=parsed.find(x=>x.date>now);if(next)return next.type==='High'?'Rising tide':'Falling tide';}
      return 'Moving tide';
    },

    estimateTideState(rawTime,index,tides){
      if(rawTime&&tides?.length>=2){
        const t=new Date(rawTime);const events=tides.map(x=>({type:x.type,date:this.parseTideDate(x.rawTime)})).filter(x=>!isNaN(x.date)).sort((a,b)=>a.date-b.date);
        const next=events.find(e=>e.date>=t);if(next)return next.type==='High'?'Rising':next.type==='Low'?'Falling':'Moving';
      }
      const cycle=['Rising','Rising','Rising','High','Falling','Falling','Falling','Low'];return cycle[index%cycle.length];
    },

    findBestWindow(hours){
      if(!hours.length)return{label:'Check hourly forecast',reason:'More hourly data is needed'};
      let bestStart=0,bestAvg=-1;const size=Math.min(3,hours.length);
      for(let i=0;i<=hours.length-size;i++){const avg=this.average(hours.slice(i,i+size).map(h=>h.score));if(avg>bestAvg){bestAvg=avg;bestStart=i;}}
      const block=hours.slice(bestStart,bestStart+size);const first=block[0],last=block[block.length-1];
      const reason=[first.tide&&`${first.tide} tide`,first.wind<=10?'light wind':`${this.fmt(first.wind,0)} mph wind`,first.wave<=3?`${this.fmt(first.wave,1)} ft surf`:'active surf'].filter(Boolean).join(' • ');
      return{label:`${first.time} – ${last.time}`,reason};
    },

    grade(score){if(score>=88)return{label:'EXCELLENT',short:'PRIME',className:'excellent'};if(score>=75)return{label:'VERY GOOD',short:'GOOD',className:'good'};if(score>=60)return{label:'FAIR',short:'FAIR',className:'fair'};return{label:'POOR',short:'LOW',className:'poor'};},
    weatherText(code){const c=Number(code);if(c===0)return'Clear';if([1,2].includes(c))return'Partly cloudy';if(c===3)return'Overcast';if([45,48].includes(c))return'Fog';if([51,53,55,56,57].includes(c))return'Drizzle';if([61,63,65,66,67,80,81,82].includes(c))return'Rain / showers';if([71,73,75,77,85,86].includes(c))return'Snow';if([95,96,99].includes(c))return'Thunderstorms';return'Variable clouds';},
    weatherIcon(code){const c=Number(code);if(c===0)return'☀️';if([1,2].includes(c))return'🌤️';if(c===3)return'☁️';if([45,48].includes(c))return'🌫️';if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return'🌧️';if([71,73,75,77,85,86].includes(c))return'🌨️';if([95,96,99].includes(c))return'⛈️';return'🌥️';},
    compass(deg){const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];const n=((Number(deg)%360)+360)%360;return dirs[Math.round(n/22.5)%16];},
    hpaToInHg(hpa){return Number(hpa)*0.0295299830714;},
    num(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;},
    round(v,fallback=0){const n=Number(v);return Number.isFinite(n)?Math.round(n):fallback;},
    fmt(v,digits=0){const n=Number(v);return Number.isFinite(n)?n.toFixed(digits):'—';},
    average(arr){const nums=arr.map(Number).filter(Number.isFinite);return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;},
    mode(arr){const counts=new Map();let best=null,bestN=0;for(const x of arr){if(!x)continue;const n=(counts.get(x)||0)+1;counts.set(x,n);if(n>bestN){best=x;bestN=n;}}return best;},
    extractHour(value){if(value instanceof Date)return value.getHours();const s=String(value||'');if(/T\d{2}:/.test(s))return Number(s.match(/T(\d{2}):/)[1]);const m=s.match(/(\d{1,2})\s*(AM|PM)/i);if(m){let h=Number(m[1])%12;if(m[2].toUpperCase()==='PM')h+=12;return h;}return 12;},
    hourFromIso(s){const d=new Date(s);return isNaN(d)?String(s):d.toLocaleTimeString([],{hour:'numeric'});},
    timeFromIso(s){if(!s)return'';const d=new Date(s);return isNaN(d)?'':d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});},
    dateIndexForIso(s){const d=new Date(s),today=new Date();d.setHours(0,0,0,0);today.setHours(0,0,0,0);return Math.round((d-today)/86400000);},
    dayName(s){const d=new Date(String(s)+'T12:00:00');return isNaN(d)?'DAY':d.toLocaleDateString([],{weekday:'short'}).toUpperCase();},
    shortDate(s){const d=new Date(String(s)+'T12:00:00');return isNaN(d)?String(s):d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});},
    noaaTime(s){const str=String(s||'').replace(' ','T');const d=new Date(str);return isNaN(d)?String(s):d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});},
    parseTideDate(s){if(!s)return new Date(NaN);return new Date(String(s).replace(' ','T'));},
    formatDateYYYYMMDD(d){return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;},
    prettyDate(s){const d=new Date(s);return isNaN(d)?String(s):d.toLocaleDateString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});},
    moonPhase(){const d=new Date();const lp=2551443;const newMoon=new Date(Date.UTC(2001,0,24,13,35,0));const phase=((d-newMoon)/1000)%lp/lp;const p=(phase+1)%1;if(p<.03||p>.97)return'New moon';if(p<.22)return'Waxing crescent';if(p<.28)return'First quarter';if(p<.47)return'Waxing gibbous';if(p<.53)return'Full moon';if(p<.72)return'Waning gibbous';if(p<.78)return'Last quarter';return'Waning crescent';},
    generalizeWater(name){return String(name||'').split(',')[0]||'Local water';},
    haversine(lat1,lon1,lat2,lon2){const R=3958.8,toRad=x=>x*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));},
    mapsUrl(lat,lon,name){return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lon}`)}&destination_place_id=&travelmode=driving&query=${encodeURIComponent(name||'')}`;},
    escape(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},

    async fetchJSON(url,timeout=12000){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeout);try{const r=await fetch(url,{signal:ctrl.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(timer);}},

    showToast(msg){const t=this.$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(this._toastTimer);this._toastTimer=setTimeout(()=>t.classList.remove('show'),3000);},
    registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  };

  window.CoastCast=APP;
  APP.init();
})();
