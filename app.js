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
      savedTripPlans: [],
      data: null,
      map: null,
      mapLayers: { spots: [], catches: [], shops: [], current: [], recommended: [], access: [] },
      mapFilter: 'all',
      mapPOIs: [],
      mapPlacesStatus: 'idle',
      selectedIntelSpot: null,
      selectedTideStation: null,
      sourceHealth: {weather:'demo',marine:'demo',tides:'demo',shops:'demo'}
    },

    presets: {
      ogunquit: { name:'Ogunquit, ME', lat:43.2489, lon:-70.5992, source:'Popular U.S. coast', tideStation:'8419399' },
      capeCod: { name:'Cape Cod, MA', lat:41.6688, lon:-70.2962, source:'Popular U.S. coast' },
      montauk: { name:'Montauk, NY', lat:41.0359, lon:-71.9545, source:'Popular U.S. coast' },
      oceanCityMD: { name:'Ocean City, MD', lat:38.3365, lon:-75.0849, source:'Popular U.S. coast' },
      virginiaBeach: { name:'Virginia Beach, VA', lat:36.8529, lon:-75.9780, source:'Popular U.S. coast' },
      wrightsville: { name:'Wrightsville Beach, NC', lat:34.2085, lon:-77.7964, source:'Popular U.S. coast', tideStation:'8658163' },
      carolina: { name:'Carolina Beach, NC', lat:34.0352, lon:-77.8936, source:'Popular U.S. coast' },
      myrtle: { name:'Myrtle Beach, SC', lat:33.6891, lon:-78.8867, source:'Popular U.S. coast' },
      jacksonvilleFL: { name:'Jacksonville Beach, FL', lat:30.2947, lon:-81.3931, source:'Popular U.S. coast' },
      keyWest: { name:'Key West, FL', lat:24.5551, lon:-81.7800, source:'Popular U.S. coast', tideStation:'8724580' },
      gulfShores: { name:'Gulf Shores, AL', lat:30.2460, lon:-87.7008, source:'Popular U.S. coast' },
      biloxi: { name:'Biloxi, MS', lat:30.3960, lon:-88.8853, source:'Popular U.S. coast' },
      grandIsle: { name:'Grand Isle, LA', lat:29.2366, lon:-89.9873, source:'Popular U.S. coast' },
      galveston: { name:'Galveston, TX', lat:29.3013, lon:-94.7977, source:'Popular U.S. coast', tideStation:'8771450' },
      southPadre: { name:'South Padre Island, TX', lat:26.1118, lon:-97.1681, source:'Popular U.S. coast' },
      sanDiego: { name:'San Diego, CA', lat:32.7157, lon:-117.1611, source:'Popular U.S. coast', tideStation:'9410170' },
      huntington: { name:'Huntington Beach, CA', lat:33.6595, lon:-117.9988, source:'Popular U.S. coast' },
      santaCruz: { name:'Santa Cruz, CA', lat:36.9741, lon:-122.0308, source:'Popular U.S. coast' },
      sanFrancisco: { name:'San Francisco, CA', lat:37.7749, lon:-122.4194, source:'Popular U.S. coast', tideStation:'9414290' },
      newportOR: { name:'Newport, OR', lat:44.6368, lon:-124.0535, source:'Popular U.S. coast' },
      westportWA: { name:'Westport, WA', lat:46.8901, lon:-124.1041, source:'Popular U.S. coast' },
      seattle: { name:'Seattle, WA', lat:47.6062, lon:-122.3321, source:'Popular U.S. coast', tideStation:'9447130' },
      homer: { name:'Homer, AK', lat:59.6425, lon:-151.5483, source:'Popular U.S. coast' },
      honolulu: { name:'Honolulu, HI', lat:21.3099, lon:-157.8581, source:'Popular U.S. coast', tideStation:'1612340' }
    },

    seedTideStations: [
      {id:'8418150',name:'Portland, ME',lat:43.6581,lon:-70.2442},
      {id:'8443970',name:'Boston, MA',lat:42.3539,lon:-71.0503},
      {id:'8510560',name:'Montauk, NY',lat:41.0483,lon:-71.9594},
      {id:'8658163',name:'Wrightsville Beach, NC',lat:34.2085,lon:-77.7964},
      {id:'8659414',name:'Varnamtown, Lockwoods Folly River, NC',lat:33.93333,lon:-78.21833},
      {id:'8659665',name:'Bowen Point, Shallotte Inlet, NC',lat:33.91430,lon:-78.37324},
      {id:'8724580',name:'Key West, FL',lat:24.5508,lon:-81.8081},
      {id:'8771450',name:'Galveston Pier 21, TX',lat:29.3100,lon:-94.7933},
      {id:'9410170',name:'San Diego, CA',lat:32.7142,lon:-117.1736},
      {id:'9414290',name:'San Francisco, CA',lat:37.8063,lon:-122.4659},
      {id:'9447130',name:'Seattle, WA',lat:47.6026,lon:-122.3393},
      {id:'1612340',name:'Honolulu, HI',lat:21.3067,lon:-157.8670}
    ],

    species: {
      'Red Drum': { icon:'🔴', abbr:'RD', water:[64,82], tideBias:8, waveIdeal:[1,4], note:'Moving water, beach cuts and inlet edges get extra weight. Water in the mid-60s through low-80s scores best.' },
      'Speckled Trout': { icon:'✨', abbr:'ST', water:[58,76], tideBias:6, waveIdeal:[0.5,2.8], note:'Cleaner water, moderate current and lower surf are favored. Dawn and dusk receive a stronger bump.' },
      'Flounder': { icon:'⬟', abbr:'FL', water:[62,78], tideBias:7, waveIdeal:[0.5,3], note:'Bottom structure and moving water matter. Moderate conditions score higher than rough surf.' },
      'Bluefish': { icon:'⚡', abbr:'BF', water:[60,78], tideBias:5, waveIdeal:[1,4.5], note:'Bait movement, moderate surf and stronger water movement can improve the score.' },
      'Spanish Mackerel': { icon:'➤', abbr:'SM', water:[68,82], tideBias:4, waveIdeal:[0.5,3], note:'Warmer, clearer water and lower-to-moderate seas score best for nearshore Spanish mackerel.' },
      'Black Drum': { icon:'●', abbr:'BD', water:[55,76], tideBias:7, waveIdeal:[0.5,3.5], note:'Structure and current get extra weight, with a broad cool-to-warm water preference.' },
      'Sheepshead': { icon:'▦', abbr:'SH', water:[58,78], tideBias:6, waveIdeal:[0.5,2.5], note:'Moderate current around structure is favored. Excessive surf and wind reduce the score more quickly.' },
      'Striped Bass': { icon:'↯', abbr:'SB', water:[48,68], tideBias:7, waveIdeal:[1,4], note:'Cooler water, moving tide and low-light windows receive extra weight.' },
      'Pompano': { icon:'◇', abbr:'PO', water:[68,82], tideBias:5, waveIdeal:[1,3.5], note:'Warm water, clean moving surf and moderate wave action score best for pompano.' },
      'Snook': { icon:'S', abbr:'SN', water:[70,86], tideBias:7, waveIdeal:[0.5,3], note:'Warm water and moving tide near inlets, passes and structure receive extra weight.' },
      'Tarpon': { icon:'T', abbr:'TP', water:[74,88], tideBias:6, waveIdeal:[0.5,4], note:'Warm water, bait movement and low-light tidal windows receive stronger weight.' },
      'Surfperch': { icon:'P', abbr:'SP', water:[48,64], tideBias:6, waveIdeal:[1.5,5], note:'Pacific surfperch mode favors cool water, working surf and moving tide along sandy beaches.' },
      'California Halibut': { icon:'H', abbr:'CH', water:[55,70], tideBias:6, waveIdeal:[0.5,3], note:'Moderate Pacific conditions, current edges and lower surf score higher.' },
      'Lingcod': { icon:'L', abbr:'LC', water:[44,60], tideBias:4, waveIdeal:[1,5], note:'Cool Pacific water and manageable swell near rocky structure receive extra weight.' },
      'Rockfish': { icon:'R', abbr:'RF', water:[44,62], tideBias:4, waveIdeal:[1,5], note:'Cool water and manageable sea state near rocky structure score best.' },
      'Pacific Halibut': { icon:'H', abbr:'PH', water:[40,56], tideBias:4, waveIdeal:[1,5], note:'Alaska and North Pacific mode favors cool water and manageable swell.' },
      'Salmon': { icon:'S', abbr:'SA', water:[42,60], tideBias:5, waveIdeal:[0.5,4], note:'Cool water, moving tide and low-light periods receive extra weight in Pacific and Alaska waters.' },
      'Bonefish': { icon:'B', abbr:'BO', water:[74,86], tideBias:6, waveIdeal:[0.2,2.5], note:'Warm shallow water and moving flats tides score higher in Hawaiʻi.' },
      'Trevally': { icon:'G', abbr:'GT', water:[74,86], tideBias:6, waveIdeal:[0.5,4], note:'Warm water, current and bait movement receive stronger weight in Hawaiʻi.' }
    },


    speciesExtras: {
      'Red Drum': {bait:['cut mullet','shrimp','paddletail'],habitat:'surf troughs, cuts, inlets and current edges'},
      'Speckled Trout': {bait:['paddletail','topwater','live shrimp'],habitat:'clean moving water, grass edges and current seams'},
      'Flounder': {bait:['mud minnow','finger mullet','bucktail'],habitat:'bottom structure, inlet edges and sandy drop-offs'},
      'Bluefish': {bait:['metal spoon','cut bait','topwater'],habitat:'bait schools, working surf and current rips'},
      'Spanish Mackerel': {bait:['metal spoon','Got-Cha plug','small live bait'],habitat:'clean nearshore water, piers and bait schools'},
      'Black Drum': {bait:['shrimp','crab','clam'],habitat:'structure, channels, bridges and shell bottom'},
      'Sheepshead': {bait:['fiddler crab','shrimp','barnacle'],habitat:'pilings, rocks, jetties and bridge structure'},
      'Striped Bass': {bait:['bunker','bucktail','swimbait'],habitat:'rips, inlets, rocky shoreline and bait concentrations'},
      'Pompano': {bait:['sand flea','shrimp','Fishbites'],habitat:'clean sandy surf, troughs and bars'},
      'Snook': {bait:['live pilchard','shrimp','paddletail'],habitat:'inlets, passes, bridges and beach structure'},
      'Tarpon': {bait:['live crab','mullet','swimbait'],habitat:'passes, beaches, channels and bait concentrations'},
      'Surfperch': {bait:['sand crab','Gulp worm','shrimp'],habitat:'sandy troughs, cuts and working Pacific surf'},
      'California Halibut': {bait:['live bait','swimbait','drop-shot'],habitat:'sandy flats, channels and current edges'},
      'Lingcod': {bait:['swimbait','jig','live bait'],habitat:'rocky reefs, kelp edges and structure'},
      'Rockfish': {bait:['jig','shrimp fly','swimbait'],habitat:'rock piles, reefs, kelp and deeper structure'},
      'Pacific Halibut': {bait:['herring','salmon belly','jig'],habitat:'deeper flats, ledges and current breaks'},
      'Salmon': {bait:['herring','spoon','spinner'],habitat:'coastal current seams, bait lanes and migration routes'},
      'Bonefish': {bait:['shrimp','crab','small fly'],habitat:'shallow flats, channels and moving water'},
      'Trevally': {bait:['topwater','live bait','stickbait'],habitat:'reefs, points, channels and current-washed structure'}
    },

    regulationSources: {
      ME:{name:'Maine DMR',url:'https://www.maine.gov/dmr/fisheries/recreational/fishing-regulations-tips'},
      NH:{name:'New Hampshire Fish & Game',url:'https://www.wildlife.nh.gov/fishing-new-hampshire'},
      MA:{name:'Massachusetts DMF',url:'https://www.mass.gov/info-details/recreational-saltwater-fishing-regulations'},
      RI:{name:'Rhode Island DEM',url:'https://dem.ri.gov/natural-resources-bureau/marine-fisheries/recreational-saltwater-fishing'},
      CT:{name:'Connecticut DEEP',url:'https://portal.ct.gov/deep/fishing/saltwater-fishing-guide/species-regulations'},
      NY:{name:'New York DEC',url:'https://dec.ny.gov/things-to-do/saltwater-fishing/recreational-fishing-regulations'},
      NJ:{name:'New Jersey Fish & Wildlife',url:'https://dep.nj.gov/njfw/fishing/marine/seasons-and-regulations/'},
      DE:{name:'Delaware DNREC',url:'https://dnrec.delaware.gov/fish-wildlife/fishing/regulations/'},
      MD:{name:'Maryland DNR',url:'https://dnr.maryland.gov/fisheries/Pages/regulations/index.aspx'},
      VA:{name:'Virginia Marine Resources Commission',url:'https://mrc.virginia.gov/regulations/'},
      NC:{name:'North Carolina Marine Fisheries',url:'https://www.deq.nc.gov/about/divisions/marine-fisheries/rules-proclamations-and-size-and-bag-limits'},
      SC:{name:'South Carolina DNR',url:'https://www.dnr.sc.gov/regs/fishing.html'},
      GA:{name:'Georgia Coastal Resources',url:'https://coastalgadnr.org/Limits'},
      FL:{name:'Florida FWC',url:'https://myfwc.com/fishing/saltwater/recreational/'},
      AL:{name:'Alabama Marine Resources',url:'https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits'},
      MS:{name:'Mississippi DMR',url:'https://dmr.ms.gov/recreational-fishing/'},
      LA:{name:'Louisiana Wildlife & Fisheries',url:'https://www.wlf.louisiana.gov/page/recreational-saltwater-finfish'},
      TX:{name:'Texas Parks & Wildlife',url:'https://tpwd.texas.gov/regulations/outdoor-annual/fishing/'},
      CA:{name:'California Fish & Wildlife',url:'https://wildlife.ca.gov/Fishing/Ocean'},
      OR:{name:'Oregon Fish & Wildlife',url:'https://myodfw.com/fishing/marine-zone'},
      WA:{name:'Washington Fish & Wildlife',url:'https://wdfw.wa.gov/fishing/regulations'},
      AK:{name:'Alaska Fish & Game',url:'https://www.adfg.alaska.gov/index.cfm?adfg=fishregulations.sport'},
      HI:{name:'Hawaiʻi Division of Aquatic Resources',url:'https://dlnr.hawaii.gov/dar/fishing/fishing-regulations/'}
    },

    stateNames: {ME:'Maine',NH:'New Hampshire',MA:'Massachusetts',RI:'Rhode Island',CT:'Connecticut',NY:'New York',NJ:'New Jersey',DE:'Delaware',MD:'Maryland',VA:'Virginia',NC:'North Carolina',SC:'South Carolina',GA:'Georgia',FL:'Florida',AL:'Alabama',MS:'Mississippi',LA:'Louisiana',TX:'Texas',CA:'California',OR:'Oregon',WA:'Washington',AK:'Alaska',HI:'Hawaiʻi'},

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
      const startView=(location.hash||'').replace('#','');
      if(['forecast','map','logbook','community'].includes(startView)) this.navigate(startView);
      this.registerServiceWorker();
      if(this.state.live) this.loadLiveData({quiet:true});
    },

    buildDemoData(){
      return JSON.parse(JSON.stringify(this.mock));
    },

    restore(){
      try{
        const raw=localStorage.getItem('coastcast-v9-state')||localStorage.getItem('coastcast-v8-state')||localStorage.getItem('coastcast-v7-state')||localStorage.getItem('coastcast-v6-state')||localStorage.getItem('coastcast-v5-state')||localStorage.getItem('coastcast-v4-state')||localStorage.getItem('coastcast-v3-state')||localStorage.getItem('coastcast-state-v1');
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
        if(Array.isArray(saved.savedTripPlans)) this.state.savedTripPlans=saved.savedTripPlans;
      }catch(_){ }
    },

    save(){
      const payload={
        live:this.state.live,location:this.state.location,radius:this.state.radius,
        fishingStyle:this.state.fishingStyle,targetSpecies:this.state.targetSpecies,
        waypoints:this.state.waypoints,catches:this.state.catches,trips:this.state.trips,savedTripPlans:this.state.savedTripPlans
      };
      try{ localStorage.setItem('coastcast-v9-state',JSON.stringify(payload)); }catch(_){ }
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
      if(view==='map') setTimeout(()=>{this.ensureMap();this.renderMapLayers();this.renderSpotIntelligence();if(!this.state.mapPOIs.length&&this.state.mapPlacesStatus==='idle')this.loadMapPlaces(false);},50);
      if(view==='logbook') this.renderLogbook();
      if(view==='community') this.renderCommunity();
    },

    bindControls(){
      this.$('locationTitleBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('mapSearchBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('settingsBtn').addEventListener('click',()=>this.openSettings());
      this.$('syncBtn').addEventListener('click',()=>this.state.live?this.loadLiveData():this.showToast('Turn on Live Data to refresh internet forecasts.'));
      this.$('liveModeBtn').addEventListener('click',()=>{const s=this.overallDataStatus();if(this.state.live&&s!=='live')this.loadLiveData();else this.setLiveMode(!this.state.live);});
      this.$('liveModeToggle').addEventListener('change',e=>this.setLiveMode(e.target.checked));
      this.$('favoriteSpotBtn').addEventListener('click',()=>this.quickSaveSpot());
      this.$('speciesInfoBtn').addEventListener('click',()=>this.openDialog('infoDialog'));
      this.$('scoreBreakdownBtn')?.addEventListener('click',()=>this.$('scoreFactors')?.scrollIntoView({behavior:'smooth',block:'center'}));
      this.$('quickPlanBtn').addEventListener('click',()=>this.openPlanner());
      this.$('plannerBtn').addEventListener('click',()=>this.openPlanner());
      this.$('findBestTripBtn').addEventListener('click',()=>this.findBestTrip());
      this.$('openRegsBtn')?.addEventListener('click',()=>this.openOfficialRegulations());
      this.$('openLicenseBtn')?.addEventListener('click',()=>window.open('https://www.fws.gov/initiative/fishing/buy-fishing-license','_blank','noopener'));
      this.$('speciesRankList')?.addEventListener('click',e=>{const b=e.target.closest('[data-target-ranked-species]');if(b)this.setSpecies(b.dataset.targetRankedSpecies);});
      this.$('useMyLocationSheetBtn').addEventListener('click',()=>this.useMyLocation());
      this.$('locationSearchGoBtn').addEventListener('click',()=>this.searchLocations());
      this.$('locationSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.searchLocations();}});
      this.$('mapRecenterBtn').addEventListener('click',()=>this.recenterMap());
      this.$('scanAreaBtn')?.addEventListener('click',()=>this.loadMapPlaces(true));
      this.$('topSpotAnalyzeBtn')?.addEventListener('click',()=>{if(this.state.selectedIntelSpot)this.analyzeMapPlace(this.state.selectedIntelSpot.id);});
      this.$('topSpotSaveBtn')?.addEventListener('click',()=>{if(this.state.selectedIntelSpot)this.saveMapPlace(this.state.selectedIntelSpot.id);});
      this.$('spotIntelList')?.addEventListener('click',e=>{const analyze=e.target.closest('[data-analyze-poi]'),save=e.target.closest('[data-save-poi]');if(analyze)this.analyzeMapPlace(analyze.dataset.analyzePoi);if(save)this.saveMapPlace(save.dataset.savePoi);});
      this.$('leafletMap')?.addEventListener('click',e=>{const analyze=e.target.closest?.('[data-map-analyze]'),save=e.target.closest?.('[data-map-save]');if(analyze)this.analyzeMapPlace(analyze.dataset.mapAnalyze);if(save)this.saveMapPlace(save.dataset.mapSave);});
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
      this.$('plannerResult').textContent='Choose your preferences and CoastCast will rank the week for that species.';
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
      this.$('speciesChips').innerHTML=names.map(name=>`<button type="button" class="species-chip ${name===this.state.targetSpecies?'active':''}" data-species="${this.escape(name)}"><span class="species-chip-mark">${this.escape(this.species[name].abbr||name.slice(0,2).toUpperCase())}</span><span>${this.escape(name)}</span></button>`).join('');
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
      const box=this.$('locationSearchResults'); box.innerHTML='<div class="empty-state">Searching U.S. coast locations…</div>';
      let results=[];
      try{
        const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=us&q='+encodeURIComponent(q);
        const rows=await this.fetchJSON(url,9000); if(Array.isArray(rows)) results=rows;
      }catch(_){ }
      if(!results.length){
        try{
          const data=await this.fetchJSON('https://photon.komoot.io/api/?limit=8&q='+encodeURIComponent(q+', USA'),9000);
          results=(data?.features||[]).map(f=>{const c=f?.geometry?.coordinates||[],p=f?.properties||{};return{lat:c[1],lon:c[0],display_name:[p.name,p.city||p.county,p.state,'USA'].filter(Boolean).join(', ')}}).filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon)));
        }catch(_){ }
      }
      if(!results.length){box.innerHTML='<div class="empty-state">No location service responded. Try a popular U.S. coast or your phone location.</div>';return;}
      box.innerHTML=results.map((r,i)=>`<button type="button" class="search-result-button" data-search-index="${i}"><strong>${this.escape((r.display_name||q).split(',').slice(0,4).join(','))}</strong><span>${Number(r.lat).toFixed(4)}, ${Number(r.lon).toFixed(4)}</span></button>`).join('');
      this.$$('.search-result-button').forEach(btn=>btn.addEventListener('click',()=>{
        const r=results[Number(btn.dataset.searchIndex)];
        this.state.location={key:'custom',name:(r.display_name||q).split(',').slice(0,4).join(','),lat:Number(r.lat),lon:Number(r.lon),source:'U.S. coast location search'};
        this.onLocationChanged();
      }));
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
      this.state.mapPOIs=[];this.state.mapPlacesStatus='idle';this.state.selectedIntelSpot=null;
      this.state.data=this.buildDemoData();
      this.renderAll();
      this.recenterMap();
      if(this.state.live) this.loadLiveData(); else {this.state.sourceHealth={weather:'demo',marine:'demo',tides:'demo',shops:'demo'};this.renderMode();this.renderSourceHealth();this.showToast('Fishing location updated. Turn on Live Data for real forecasts.');}
    },

    setLiveMode(enabled){
      this.state.live=!!enabled; this.save();
      this.$('liveModeToggle').checked=this.state.live;
      this.renderMode();
      if(this.state.live) this.loadLiveData();
      else{this.state.data=this.buildDemoData();this.state.selectedTideStation=null;this.state.sourceHealth={weather:'demo',marine:'demo',tides:'demo',shops:'demo'};this.recalculateScores();this.renderAll();this.showToast('Demo Data is on.');}
    },

    async loadLiveData({quiet=false}={}){
      if(this.state.loading) return;
      this.state.loading=true;
      this.state.sourceHealth={weather:'loading',marine:'loading',tides:'loading',shops:'loading'};
      this.renderMode();this.renderSourceHealth();
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
      this.state.sourceHealth={weather:weather?'live':'fallback',marine:marine?'live':'fallback',tides:tideData?'live':'fallback',shops:shops?'live':'fallback'};
      this.state.data=this.mergeLiveData(base,weather,marine,tideData,shops);
      this.recalculateScores();
      this.renderAll();
      this.renderMapLayers();
      this.state.loading=false;
      this.renderMode();this.renderSourceHealth();
      this.$('syncBtn').classList.remove('spinning');
      const liveCount=[weather,marine,tideData,shops].filter(Boolean).length;
      this.$('lastUpdated').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      if(!quiet) this.showToast(liveCount>=3?'Live coastal data updated.':`Live data partially updated (${liveCount}/4 sources). Demo fallbacks filled the gaps.`);
    },

    async loadWeather(lat,lon){
      const params=new URLSearchParams({
        latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'7',
        temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',
        current:'temperature_2m,apparent_temperature,relative_humidity_2m,cloud_cover,weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl',
        hourly:'temperature_2m,apparent_temperature,relative_humidity_2m,cloud_cover,visibility,uv_index,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl',
        daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset'
      });
      return this.fetchJSON('https://api.open-meteo.com/v1/forecast?'+params.toString(),14000);
    },

    async loadMarine(lat,lon){
      const params=new URLSearchParams({
        latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'7',
        length_unit:'imperial',cell_selection:'sea',
        current:'wave_height,wave_direction,wave_period,wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction',
        hourly:'wave_height,wave_direction,wave_period,wave_peak_period,swell_wave_height,swell_wave_direction,swell_wave_period,swell_wave_peak_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction'
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
      const seeded=this.seedTideStations.map(s=>({...s,distance:this.haversine(lat,lon,s.lat,s.lon)})).sort((a,b)=>a.distance-b.distance)[0];
      if(seeded&&seeded.distance<=35) return seeded;
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

    shopCacheKey(){const l=this.state.location;return `coastcast-shops:${Number(l.lat).toFixed(2)}:${Number(l.lon).toFixed(2)}:${this.state.radius}`;},
    readPlaceCache(key,maxAge=6*3600000){try{const raw=localStorage.getItem(key);if(!raw)return null;const v=JSON.parse(raw);if(Date.now()-v.savedAt>maxAge)return null;return Array.isArray(v.items)?v.items:null;}catch(_){return null;}},
    writePlaceCache(key,items){try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),items}));}catch(_){ }},

    async loadNearbyShops(forceToast=false){
      const {lat,lon}=this.state.location;
      const cacheKey=this.shopCacheKey();
      if(!forceToast){const cached=this.readPlaceCache(cacheKey);if(cached?.length){return cached.map(x=>({...x,cached:true}));}}
      const radiusMeters=Math.min(40000,Math.max(5000,Math.round(this.state.radius*1609.344)));
      const query=`[out:json][timeout:12];(nwr(around:${radiusMeters},${lat},${lon})[shop="fishing"];nwr(around:${radiusMeters},${lat},${lon})[name~"bait|tackle|angler|outfitter",i];nwr(around:${radiusMeters},${lat},${lon})[shop~"outdoor|sports"][name~"fish|bait|tackle|angler",i];);out center tags;`;
      const normalized=[];
      const seen=new Set();
      const add=(name,slat,slon,tags=[],source='OpenStreetMap')=>{
        slat=Number(slat);slon=Number(slon);if(!name||!Number.isFinite(slat)||!Number.isFinite(slon))return;
        const key=(name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,24))+':'+slat.toFixed(3)+':'+slon.toFixed(3);if(seen.has(key))return;seen.add(key);
        normalized.push({name,lat:slat,lon:slon,distance:this.haversine(lat,lon,slat,slon),rating:null,tags,source,demo:false});
      };
      const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
      for(const endpoint of endpoints){
        try{const data=await this.fetchOverpass(endpoint,query,7000);(data?.elements||[]).forEach(el=>{const t=el.tags||{};const slat=el.lat??el.center?.lat,slon=el.lon??el.center?.lon;add(t.name||'',slat,slon,[t.shop==='fishing'?'Fishing shop':'Bait / tackle',t.opening_hours||'Hours not listed'].filter(Boolean),'OpenStreetMap');});if(normalized.length)break;}catch(_){ }
      }
      if(!normalized.length){
        try{
          const textShops=await this.genericTextTackleShops();
          textShops.forEach(s=>add(s.name,s.lat,s.lon,s.tags,s.source));
        }catch(_){ }
      }
      if(!normalized.length&&this.isHoldenArea()){
        const verified=await this.verifiedHoldenShops();
        verified.forEach(s=>add(s.name,s.lat,s.lon,s.tags,s.source));
      }
      normalized.sort((a,b)=>a.distance-b.distance);
      const shops=normalized.slice(0,10);if(shops.length)this.writePlaceCache(cacheKey,shops);
      if(shops.length){if(this.state.data)this.state.data.shops=shops;if(forceToast){this.state.sourceHealth.shops=shops.some(x=>/Verified/.test(x.source))?'verified':'live';this.renderSourceHealth();this.renderShops();this.renderMapLayers();this.showToast(`Found ${shops.length} nearby tackle shop${shops.length===1?'':'s'}.`);}return shops;}
      if(forceToast)this.showToast('No tackle shops were returned. Forecast and map tools still work.');
      return [];
    },

    mergeLiveData(base,weather,marine,tideData,shops){
      const out=base;
      if(weather){
        const c=weather.current||{};
        out.current.temp=this.num(c.temperature_2m,out.current.temp);
        out.current.feels=this.num(c.apparent_temperature,out.current.feels);
        out.current.weatherCode=this.num(c.weather_code,out.current.weatherCode);
        out.current.weather=this.weatherText(out.current.weatherCode);
        out.current.humidity=this.num(c.relative_humidity_2m,out.current.humidity??65);
        out.current.cloudCover=this.num(c.cloud_cover,out.current.cloudCover??30);
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
            pressure:this.num(h.pressure_msl?.[i],1015),humidity:this.num(h.relative_humidity_2m?.[i],65),cloudCover:this.num(h.cloud_cover?.[i],30),visibility:this.num(h.visibility?.[i],16000),uv:this.num(h.uv_index?.[i],0),wave:2,period:8,tide:'Moving',score:70
          }));
          const nowHour=new Date(); nowHour.setMinutes(0,0,0);
          const firstFuture=out.hours.findIndex(x=>new Date(x.rawTime)>=nowHour);
          if(firstFuture>0) out.hours=out.hours.slice(firstFuture);
          out.current.rain=out.hours[0]?.rain??0;
          out.current.visibility=out.hours[0]?.visibility??16000;out.current.uv=out.hours[0]?.uv??0;
        }
        const d=weather.daily||{};
        if(Array.isArray(d.time)){
          out.days=d.time.slice(0,7).map((time,i)=>({
            rawDate:time,date:i===0?'Today':this.shortDate(time),day:this.dayName(time),icon:this.weatherIcon(d.weather_code?.[i]),
            high:this.round(d.temperature_2m_max?.[i],78),low:this.round(d.temperature_2m_min?.[i],65),
            rain:this.round(d.precipitation_probability_max?.[i],0),wind:out.hours.find(hh=>hh.dateIndex===i)?.wind??8,
            windDir:out.hours.find(hh=>hh.dateIndex===i)?.windDir??0,wave:2,water:out.current.waterTemp,
            sunrise:this.timeFromIso(d.sunrise?.[i])||'—',sunset:this.timeFromIso(d.sunset?.[i])||'—',uv:this.round(d.uv_index_max?.[i],0),score:70
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
        out.current.waterTemp=Number.isFinite(Number(c.sea_surface_temperature))?this.cToF(Number(c.sea_surface_temperature)):out.current.waterTemp;
        out.current.oceanCurrent=Number.isFinite(Number(c.ocean_current_velocity))?Number(c.ocean_current_velocity)*0.621371:(out.current.oceanCurrent??0);
        out.current.oceanCurrentUnit='mph';
        out.current.oceanCurrentDir=this.num(c.ocean_current_direction,out.current.oceanCurrentDir??0);
        out.current.wavePeakPeriod=this.num(c.wave_peak_period,out.current.wavePeakPeriod??out.current.wavePeriod);
        out.current.swellPeakPeriod=this.num(c.swell_wave_peak_period,out.current.swellPeakPeriod??out.current.swellPeriod);
        const mh=marine.hourly||{};
        if(Array.isArray(mh.time)){
          const marineMap=new Map(mh.time.map((t,i)=>[t,{wave:this.num(mh.wave_height?.[i],2),waveDir:this.num(mh.wave_direction?.[i],0),period:this.num(mh.wave_period?.[i],8),wavePeak:this.num(mh.wave_peak_period?.[i],8),swell:this.num(mh.swell_wave_height?.[i],1.5),swellDir:this.num(mh.swell_wave_direction?.[i],0),swellPeriod:this.num(mh.swell_wave_period?.[i],9),swellPeak:this.num(mh.swell_wave_peak_period?.[i],9),water:Number.isFinite(Number(mh.sea_surface_temperature?.[i]))?this.cToF(Number(mh.sea_surface_temperature[i])):out.current.waterTemp,currentVelocity:Number.isFinite(Number(mh.ocean_current_velocity?.[i]))?Number(mh.ocean_current_velocity[i])*0.621371:0,currentDir:this.num(mh.ocean_current_direction?.[i],0)}]));
          out.hours.forEach(h=>{
            const m=marineMap.get(h.rawTime); if(!m) return;
            h.wave=m.wave;h.waveDir=m.waveDir;h.period=m.period;h.wavePeak=m.wavePeak;h.swell=m.swell;h.swellDir=m.swellDir;h.swellPeriod=m.swellPeriod;h.swellPeak=m.swellPeak;h.water=m.water;h.currentVelocity=m.currentVelocity;h.currentDir=m.currentDir;
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

    calculateScore(c,speciesName=this.state.targetSpecies,includeHistory=true){
      const config=this.species[speciesName]||this.species['Red Drum'];
      let score=32;
      const wind=this.num(c.wind,8),rain=this.num(c.rain,0),wave=this.num(c.wave,2),water=this.num(c.water,72);

      // Shared trip-quality factors. The lower base avoids every species saturating near 100.
      if(wind<=6)score+=16;else if(wind<=10)score+=12;else if(wind<=14)score+=6;else if(wind<=18)score-=4;else score-=16;
      if(rain<=15)score+=7;else if(rain<=35)score+=3;else if(rain>=65)score-=10;else score-=3;

      // Species-specific marine fit: score closeness to each species' preferred surf and water range.
      const waveMin=config.waveIdeal[0],waveMax=config.waveIdeal[1],waveMid=(waveMin+waveMax)/2,waveHalf=Math.max(.25,(waveMax-waveMin)/2);
      if(wave>=waveMin&&wave<=waveMax){
        const closeness=Math.max(0,1-Math.abs(wave-waveMid)/waveHalf);score+=5+Math.round(closeness*5);
      }else if(wave>waveMax){score-=Math.min(16,Math.round(3+(wave-waveMax)*4));}
      else score+=1;

      const waterMin=config.water[0],waterMax=config.water[1],waterMid=(waterMin+waterMax)/2,waterHalf=Math.max(2,(waterMax-waterMin)/2);
      if(water>=waterMin&&water<=waterMax){
        const closeness=Math.max(0,1-Math.abs(water-waterMid)/waterHalf);score+=5+Math.round(closeness*9);
      }else{
        const delta=water<waterMin?waterMin-water:water-waterMax;score-=Math.min(12,Math.round(2+delta*.8));
      }

      const tide=String(c.tide||'').toLowerCase(); if(/rising|falling|moving/.test(tide))score+=config.tideBias; if(/slack/.test(tide))score-=4;
      const hour=this.extractHour(c.time); if(hour>=5&&hour<=9)score+=8;else if(hour>=17&&hour<=20)score+=6;else if(hour>=11&&hour<=15)score-=3;
      const pressure=this.num(c.pressure,1015); if(pressure>=1008&&pressure<=1024)score+=4;
      if(this.state.fishingStyle==='Surf fishing'&&wind<=10)score+=3;
      if(this.state.fishingStyle==='Pier fishing'&&wave<=4.5)score+=2;
      if(includeHistory) score+=this.historyAdjustment(speciesName,{wind,wave,water});
      return Math.round(Math.max(25,Math.min(98,score)));
    },


    parseCatchConditions(text){
      const s=String(text||'');
      const wind=Number((s.match(/([0-9.]+)\\s*mph wind/i)||[])[1]);
      const wave=Number((s.match(/([0-9.]+)\\s*ft surf/i)||[])[1]);
      const water=Number((s.match(/([0-9.]+)°F water/i)||[])[1]);
      return {wind:Number.isFinite(wind)?wind:null,wave:Number.isFinite(wave)?wave:null,water:Number.isFinite(water)?water:null};
    },

    historyAdjustment(speciesName,condition){
      const catches=this.state.catches.filter(c=>c.species===speciesName).slice(0,12);
      if(!catches.length) return 0;
      let best=0;
      catches.forEach(c=>{
        const p=this.parseCatchConditions(c.conditions);let sim=0,parts=0;
        if(Number.isFinite(p.wind)){parts++;sim+=Math.max(0,1-Math.abs(p.wind-condition.wind)/10);}
        if(Number.isFinite(p.wave)){parts++;sim+=Math.max(0,1-Math.abs(p.wave-condition.wave)/3);}
        if(Number.isFinite(p.water)){parts++;sim+=Math.max(0,1-Math.abs(p.water-condition.water)/14);}
        if(parts) best=Math.max(best,sim/parts);
      });
      const catchConfidence=Math.min(1,catches.length/5);
      return Math.round(best*catchConfidence*5);
    },

    speciesTodayScore(name){
      const d=this.state.data;if(!d)return 50;
      const hours=d.hours.filter(h=>h.dateIndex===0).slice(0,18);
      if(!hours.length){const c=d.current;return this.calculateScore({wind:c.windSpeed,rain:c.rain,wave:c.waveHeight,water:c.waterTemp,tide:this.currentTideLabel(),time:new Date(),pressure:c.pressure},name);}
      const scores=hours.map(h=>this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??d.current.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current.pressure},name));
      scores.sort((a,b)=>b-a);return Math.round(this.average(scores.slice(0,Math.min(4,scores.length))));
    },

    rankSpecies(){
      const regional=this.coastRegionSpecies();
      return regional.map(name=>{
        const cfg=this.species[name],extra=this.speciesExtras[name]||{bait:[],habitat:'coastal structure'};
        const score=this.speciesTodayScore(name);
        const h=this.historyAdjustment(name,{wind:this.state.data.current.windSpeed,wave:this.state.data.current.waveHeight,water:this.state.data.current.waterTemp});
        const water=this.state.data.current.waterTemp;
        const waterFit=water>=cfg.water[0]&&water<=cfg.water[1];
        return {name,score,history:h,waterFit,bait:extra.bait,habitat:extra.habitat};
      }).sort((a,b)=>b.score-a.score);
    },

    renderSpeciesRankings(){
      const box=this.$('speciesRankList');if(!box)return;
      const ranked=this.rankSpecies();
      this.$('regionSpeciesLabel').textContent=this.coastRegion();
      box.innerHTML=ranked.slice(0,5).map((r,i)=>{const g=this.grade(r.score);const reason=[r.waterFit?'water temp in range':'water temp outside peak',r.history?`your catch history +${r.history}`:'live-condition match',r.bait?.length?`try ${r.bait.slice(0,2).join(' / ')}`:''].filter(Boolean).join(' • ');return `<article class="species-rank-card ${i===0?'top':''}"><div class="species-rank-number">${i+1}</div><div class="species-rank-copy"><div class="species-rank-name">${this.escape(r.name)}</div><div class="species-rank-reason">${this.escape(reason)}</div><div class="species-rank-habitat">${this.escape(r.habitat)}</div></div><div class="species-rank-score ${g.className}"><strong>${r.score}</strong><span>${g.short}</span></div><button type="button" class="mini-button species-target-button" data-target-ranked-species="${this.escape(r.name)}">Target</button></article>`;}).join('');
    },

    detectStateCode(){
      const name=String(this.state.location?.name||'');
      const aliases={ME:['Maine',' ME'],NH:['New Hampshire',' NH'],MA:['Massachusetts',' MA'],RI:['Rhode Island',' RI'],CT:['Connecticut',' CT'],NY:['New York',' NY'],NJ:['New Jersey',' NJ'],DE:['Delaware',' DE'],MD:['Maryland',' MD'],VA:['Virginia',' VA'],NC:['North Carolina',' NC'],SC:['South Carolina',' SC'],GA:['Georgia',' GA'],FL:['Florida',' FL'],AL:['Alabama',' AL'],MS:['Mississippi',' MS'],LA:['Louisiana',' LA'],TX:['Texas',' TX'],CA:['California',' CA'],OR:['Oregon',' OR'],WA:['Washington',' WA'],AK:['Alaska',' AK'],HI:['Hawaii','Hawaiʻi',' HI']};
      for(const [code,vals] of Object.entries(aliases)) if(vals.some(v=>new RegExp(v.length<=3?`(?:,|\\s)${v.trim()}(?:,|\\s|$)`:`${v}`,'i').test(name))) return code;
      const lat=Number(this.state.location?.lat),lon=Number(this.state.location?.lon);
      if(lat>=18&&lat<=23&&lon>=-161.5&&lon<=-154.5)return'HI';if(lat>=51&&lon<=-130)return'AK';
      if(lon<=-124&&lat>=32&&lat<=42)return'CA';if(lon<=-116&&lat>42&&lat<=46.4)return'OR';if(lon<=-116&&lat>46.4&&lat<=49.2)return'WA';
      if(lon>=-97.8&&lon<=-93.4&&lat>=25.7&&lat<=30.1)return'TX';if(lon>-93.4&&lon<=-88.7&&lat<=31.2)return'LA';if(lon>-88.7&&lon<=-88.0&&lat<=31.2)return'MS';if(lon>-88.0&&lon<=-86.3&&lat<=31.5)return'AL';if(lat<=31.2&&lon>-86.3&&lon<=-80.0)return'FL';
      if(lat>=30.3&&lat<=32.3&&lon>=-81.7&&lon<=-80.7)return'GA';if(lat>=32.0&&lat<=35.2&&lon>=-81.5&&lon<=-78.3)return'SC';if(lat>=33.7&&lat<=36.7&&lon>=-78.8&&lon<=-75.2)return'NC';if(lat>=36.5&&lat<=38.0&&lon>=-76.6&&lon<=-75.1)return'VA';
      return null;
    },

    renderRegulations(){
      const code=this.detectStateCode(),src=code?this.regulationSources[code]:null;
      this.state.currentRegSource=src||null;
      if(this.$('regSpeciesName'))this.$('regSpeciesName').textContent=this.state.targetSpecies;
      if(this.$('regStateCode'))this.$('regStateCode').textContent=code?`${this.stateNames[code]} (${code})`:'State not detected';
      if(this.$('regStateTitle'))this.$('regStateTitle').textContent=src?`${this.stateNames[code]} official fishing rules`:'Official fishing rules';
      if(this.$('regSourceBadge'))this.$('regSourceBadge').textContent=src?src.name:'Choose a U.S. coastal state';
      const msg=this.$('regulationMessage');if(msg)msg.innerHTML=src?`CoastCast detected <strong>${this.escape(this.stateNames[code])}</strong>. Check the official source for current <strong>${this.escape(this.state.targetSpecies)}</strong> size, bag, season, gear and closure rules before keeping fish.`:'CoastCast could not confidently detect the state from this location name. Open/change the destination to include the state before checking regulations.';
      const b=this.$('openRegsBtn');if(b){b.disabled=!src;b.textContent=src?'Open official regulations':'State not detected';}
    },

    openOfficialRegulations(){
      const src=this.state.currentRegSource;if(!src){this.showToast('Choose a U.S. coastal location with a state first.');return;}
      window.open(src.url,'_blank','noopener');
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
      this.renderMode();this.renderSourceHealth();this.renderLocation();this.renderScore();this.renderSpecies();this.renderSpeciesRankings();this.renderRegulations();this.renderConditions();this.renderFactors();
      this.renderTides();this.renderHourly();this.renderDays();this.renderShops();this.renderForecast();this.renderChecklist();this.renderWaypoints();this.renderLogbook();this.renderCommunity();this.renderSpotIntelligence();
      if(this.state.view==='map') this.renderMapLayers();
    },

    overallDataStatus(){
      if(this.state.loading) return 'loading';
      if(!this.state.live) return 'demo';
      const h=this.state.sourceHealth||{};
      const core=[h.weather,h.marine,h.tides];
      const liveCount=core.filter(x=>x==='live').length;
      if(liveCount===3) return 'live';
      if(liveCount>0) return 'partial';
      return 'fallback';
    },

    dataStatusCopy(){
      const s=this.overallDataStatus();
      if(s==='loading') return {label:'Updating live data',note:'Checking weather, marine and NOAA tide feeds now.'};
      if(s==='live') return {label:'Live forecast',note:'Weather, marine and NOAA tide sources are confirmed live.'};
      if(s==='partial') return {label:'Partial live',note:'Some live sources responded; demo fallbacks fill only the missing pieces.'};
      if(s==='fallback') return {label:'Demo fallback',note:'Live mode is on, but the core feeds did not confirm. Displayed values are fallback data.'};
      return {label:'Demo data',note:'Prototype values are shown. Turn on live data when you want internet forecasts.'};
    },

    renderMode(){
      const badge=this.$('modeBadge'); const status=this.overallDataStatus(); const copy=this.dataStatusCopy();
      badge.className='status-pill '+status;
      this.$('modeText').textContent=copy.label;
      this.$('liveModeBtn').textContent=!this.state.live?'Use live data':status==='live'?'Use demo':'Retry live';
      this.$('liveModeBtn').disabled=this.state.loading;
      this.$('liveModeToggle').checked=this.state.live;
      const message=this.$('dataQualityMessage'); if(message) message.textContent=copy.note;
      const conditionsBadge=this.$('conditionsSourceBadge'); if(conditionsBadge) conditionsBadge.textContent=status==='live'?'Live readings':status==='partial'?'Mixed live / fallback':status==='loading'?'Updating…':status==='demo'?'Demo readings':'Fallback readings';
      const forecastBar=this.$('forecastStatusBar');
      if(forecastBar){forecastBar.className='forecast-status-bar '+status;forecastBar.innerHTML=`<span class="status-dot"></span><strong>${this.escape(copy.label)}</strong><span>${this.escape(copy.note)}</span>`;}
    },

    renderSourceHealth(){
      const box=this.$('sourceHealth'); if(!box) return;
      const h=this.state.sourceHealth||{};
      const items=[['Weather',h.weather],['Marine',h.marine],['NOAA tides',h.tides],['Tackle shops',h.shops]];
      const label=s=>s==='live'?'LIVE':s==='verified'?'VERIFIED':s==='loading'?'CHECKING':s==='fallback'||s==='partial'?'FALLBACK':'DEMO';
      box.innerHTML=items.map(([name,status])=>`<span class="source-chip ${status||'demo'}"><span class="source-chip-name">${this.escape(name)}</span><strong>${label(status)}</strong></span>`).join('');
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
      {const s=this.overallDataStatus();this.$('intelConfidence').textContent=s==='live'?'High · live sources':s==='partial'?'Medium · partial live':s==='loading'?'Checking sources…':'Prototype confidence';}
    },

    renderSpecies(){
      this.$$('.species-chip').forEach(b=>b.classList.toggle('active',b.dataset.species===this.state.targetSpecies));
      const cfg=this.species[this.state.targetSpecies];
      this.$('speciesInsight').innerHTML=`<strong><span class="insight-species-mark">${this.escape(cfg.abbr||this.state.targetSpecies.slice(0,2).toUpperCase())}</span> ${this.escape(this.state.targetSpecies)}:</strong> ${this.escape(cfg.note)}`;
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
      const tags=(s.tags||[]).slice(0,2).join(' • '); const dist=this.fmt(s.distance,1);const fallback=s.demo?' • fallback listing':s.cached?' • cached real result':'';
      return `<div class="list-item shop-list-item"><div class="shop-rank">${i+1}</div><div><div class="list-title">${this.escape(s.name)}</div><div class="list-sub">${dist} mi from fishing spot${tags?' • '+this.escape(tags):''}${fallback}</div></div><div class="list-actions"><a class="mini-button" href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">To shop</a><a class="mini-button route-button" href="${this.mapsRouteUrl(s.lat,s.lon,this.state.location.lat,this.state.location.lon)}" target="_blank" rel="noopener">Shop → spot</a></div></div>`;
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
      this.drawBiteTrend(this.$('biteTrendCanvas'),hours);
      this.$('detailWave').textContent=`${this.fmt(c.waveHeight,1)} ft`;
      this.$('detailPeriod').textContent=`${this.fmt(c.wavePeriod,0)} sec`;
      this.$('detailWaveDir').textContent=this.compass(c.waveDir);
      this.$('detailSwell').textContent=`${this.fmt(c.swellHeight,1)} ft @ ${this.fmt(c.swellPeriod,0)} sec`;
      this.$('detailSwellDir').textContent=this.compass(c.swellDir);
      this.$('detailCurrent').textContent=Number.isFinite(c.oceanCurrent)&&c.oceanCurrent>0?`${this.fmt(c.oceanCurrent,1)} ${c.oceanCurrentUnit||'mph'} → ${this.compass(c.oceanCurrentDir)}`:'Not available';
      this.$('detailWater').textContent=`${this.fmt(c.waterTemp,0)}°F`;
      this.$('detailSunrise').textContent=selected?.sunrise||d.sun?.sunrise||'—';
      this.$('detailSunset').textContent=selected?.sunset||d.sun?.sunset||'—';
      this.$('detailRain').textContent=`${this.fmt(selected?.rain??c.rain,0)}%`;
      this.$('detailHumidity').textContent=Number.isFinite(c.humidity)?`${this.fmt(c.humidity,0)}%`:'—';
      this.$('detailVisibility').textContent=Number.isFinite(c.visibility)?`${this.fmt(c.visibility/1609.344,1)} mi`:'—';
      this.$('detailUV').textContent=Number.isFinite(selected?.uv)?this.fmt(selected.uv,0):Number.isFinite(c.uv)?this.fmt(c.uv,0):'—';
      this.$('detailPressure').textContent=`${this.fmt(this.hpaToInHg(c.pressure),2)} in`;
      this.$('detailMoon').textContent=this.moonPhase();
    },

    drawBiteTrend(canvas,hours){
      if(!canvas||!hours?.length) return;
      const ctx=canvas.getContext('2d'),rect=canvas.getBoundingClientRect(),scale=Math.max(1,window.devicePixelRatio||1);
      const w=Math.max(300,Math.round(rect.width*scale)),h=Math.max(150,Math.round(rect.height*scale));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(scale,scale);const cw=w/scale,ch=h/scale,padL=28,padR=14,padT=18,padB=25;
      const values=hours.slice(0,18),min=40,max=100;
      ctx.strokeStyle='rgba(159,185,201,.11)';ctx.lineWidth=1;
      [50,70,90].forEach(v=>{const y=padT+(ch-padT-padB)*(1-(v-min)/(max-min));ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(cw-padR,y);ctx.stroke();ctx.fillStyle='#6E8B9D';ctx.font='9px Inter,system-ui';ctx.fillText(String(v),3,y+3);});
      const pts=values.map((x,i)=>({x:padL+(cw-padL-padR)*(i/Math.max(1,values.length-1)),y:padT+(ch-padT-padB)*(1-(Math.max(min,Math.min(max,x.score))-min)/(max-min)),score:x.score,time:x.time}));
      const grad=ctx.createLinearGradient(0,padT,0,ch-padB);grad.addColorStop(0,'rgba(79,223,181,.24)');grad.addColorStop(1,'rgba(79,223,181,0)');
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineTo(pts[pts.length-1].x,ch-padB);ctx.lineTo(pts[0].x,ch-padB);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#4FDFB5';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
      const best=pts.reduce((a,b)=>b.score>a.score?b:a,pts[0]);ctx.beginPath();ctx.arc(best.x,best.y,4.5,0,Math.PI*2);ctx.fillStyle='#EAF8FF';ctx.fill();ctx.strokeStyle='#4FDFB5';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#8FAFC0';ctx.font='9px Inter,system-ui';const step=Math.max(1,Math.ceil(values.length/5));values.forEach((v,i)=>{if(i%step===0||i===values.length-1){ctx.fillText(v.time,Math.min(cw-38,pts[i].x-9),ch-7);}});
      ctx.fillStyle='#DDF8EE';ctx.font='700 10px Inter,system-ui';ctx.fillText(`Best ${best.score}`,Math.min(cw-55,best.x+7),Math.max(12,best.y-8));ctx.restore();
    },

    renderChecklist(){
      const c=this.state.data.current; const items=[
        ['Fishing license / required permits',true],['Rods, reels and terminal tackle',true],[`Bait / lures for ${this.state.targetSpecies}`,false],['Pliers, dehooker and measuring tool',false],['Water, snacks and charged phone',false],['Sunscreen, hat and eye protection',false]
      ];
      if(c.rain>=25)items.push(['Rain shell / dry storage',false]);
      if(c.windSpeed>=12)items.push(['Heavier sinkers / wind-ready rigging',false]);
      if(c.waveHeight>=3.5)items.push(['Review surf safety before entering the water',false]);
      if(c.temp<60)items.push(['Warm layers',false]); else items.push(['Breathable clothing',false]);
      if((c.uv??0)>=6)items.push(['High-SPF sunscreen / UV protection',false]);
      if((c.visibility??16000)<5000)items.push(['Low-visibility safety plan / lights',false]);
      items.push(['First-aid kit and trip safety plan',false]);
      this.$('tripChecklist').innerHTML=items.map(x=>`<label class="check-row"><input type="checkbox" ${x[1]?'checked':''}/><span>${this.escape(x[0])}</span></label>`).join('');
    },

    findBestTrip(){
      const species=this.$('tripSpecies').value||this.state.targetSpecies,session=this.$('tripSession').value,maxWind=Number(this.$('tripMaxWind').value)||15,priority=this.$('tripPriority')?.value||'bite';
      const d=this.state.data;
      const days=d.days.map((day,i)=>{
        let hours=d.hours.filter(h=>h.dateIndex===i).slice(0,24);
        if(session!=='Any time') hours=hours.filter(h=>this.matchesSession(h.time,session));
        if(!hours.length) hours=d.hours.filter(h=>h.dateIndex===i).slice(0,24);
        const scored=hours.map(h=>({...h,speciesScore:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??d.current.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current.pressure},species)}));
        const eligible=scored.filter(h=>h.wind<=maxWind);const pool=eligible.length?eligible:scored;
        const bestHour=pool.reduce((a,b)=>!a||b.speciesScore>a.speciesScore?b:a,null);
        const top=[...pool].sort((a,b)=>b.speciesScore-a.speciesScore).slice(0,Math.min(4,pool.length));
        let adjusted=Math.round(this.average(top.map(x=>x.speciesScore)));
        if(day.wind>maxWind) adjusted-=Math.min(25,(day.wind-maxWind)*3);
        if(priority==='calm') adjusted+=Math.max(-12,10-(Number(day.wave)||2)*3);
        if(priority==='dry') adjusted+=Math.max(-10,8-(Number(day.rain)||0)/5);
        if(priority==='dawn'&&bestHour&&this.extractHour(bestHour.time)>=4&&this.extractHour(bestHour.time)<=9) adjusted+=6;
        adjusted=Math.max(25,Math.min(98,Math.round(adjusted)));
        return {...day,index:i,adjusted,bestHour};
      });
      const best=days.reduce((a,b)=>b.adjusted>a.adjusted?b:a,days[0]);const bestHour=best.bestHour;
      const extras=this.speciesExtras[species]||{bait:[],habitat:''};const stateCode=this.detectStateCode(),stateName=stateCode?this.stateNames[stateCode]:'local';
      const windowHours=d.hours.filter(h=>h.dateIndex===best.index).map(h=>({...h,speciesScore:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??best.water??d.current.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current.pressure},species)}));
      const window=this.findBestWindow(windowHours.map(h=>({...h,score:h.speciesScore})));
      this.state.trips+=1;
      const plan={id:Date.now(),location:this.state.location.name,species,day:best.day,score:best.adjusted,window:window.label,priority,created:new Date().toISOString()};this.state.savedTripPlans.unshift(plan);this.state.savedTripPlans=this.state.savedTripPlans.slice(0,20);this.save();this.$('tripCount').textContent=this.state.trips;
      const shop=(d.shops||[])[0];
      this.$('plannerResult').innerHTML=`<div class="trip-plan-score"><span>BEST MATCH</span><strong>${best.adjusted}/100</strong></div><strong>${this.escape(best.day)} • ${this.escape(species)}</strong><br><span>${best.icon||''} ${this.fmt(best.high,0)}°/${this.fmt(best.low,0)}° • ${this.fmt(best.wind,0)} mph avg wind • ${this.fmt(best.wave,1)} ft surf • ${this.fmt(best.rain,0)}% rain</span><div class="trip-itinerary"><div><b>1</b><span><strong>Prep</strong>${extras.bait?.length?`Bring ${this.escape(extras.bait.slice(0,2).join(' or '))}.`:''}</span></div>${shop?`<div><b>2</b><span><strong>Bait stop</strong>${this.escape(shop.name)} • ${this.fmt(shop.distance,1)} mi from the fishing spot</span></div>`:''}<div><b>${shop?'3':'2'}</b><span><strong>Fish</strong>${this.escape(window.label)} • ${this.escape(window.reason)}</span></div><div><b>${shop?'4':'3'}</b><span><strong>Rules</strong>Verify ${this.escape(stateName)} regulations before keeping fish.</span></div></div>${bestHour?`<div class="planner-best-hour"><strong>Peak hour:</strong> ${this.escape(bestHour.time)} • ${bestHour.speciesScore}/100 species score</div>`:''}`;
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

    mapPlacesCacheKey(){const l=this.state.location;return `coastcast-map-places:${Number(l.lat).toFixed(2)}:${Number(l.lon).toFixed(2)}:${this.state.radius}`;},

    async loadMapPlaces(forceToast=false){
      if(this.state.mapPlacesStatus==='loading')return;
      const {lat,lon}=this.state.location;const cacheKey=this.mapPlacesCacheKey();
      if(!forceToast){const cached=this.readPlaceCache(cacheKey);if(cached?.length&&!cached.some(x=>x.id==='selected-coast-anchor')){this.state.mapPOIs=cached;this.state.mapPlacesStatus='cached';this.renderSpotIntelligence();this.renderMapLayers();return cached;}}
      this.state.mapPlacesStatus='loading';this.renderSpotIntelligence();
      const radiusMiles=Math.min(20,Math.max(3,Number(this.state.radius)||10));
      const radiusMeters=Math.min(32000,Math.max(5000,Math.round(radiusMiles*1609.344)));
      const query=`[out:json][timeout:12];(nwr(around:${radiusMeters},${lat},${lon})["leisure"="fishing"];nwr(around:${radiusMeters},${lat},${lon})["sport"="fishing"];nwr(around:${radiusMeters},${lat},${lon})["man_made"="pier"]["name"];nwr(around:${radiusMeters},${lat},${lon})["leisure"="marina"]["name"];nwr(around:${radiusMeters},${lat},${lon})["leisure"="slipway"]["name"];nwr(around:${radiusMeters},${lat},${lon})["natural"="beach"]["name"];nwr(around:${radiusMeters},${lat},${lon})["waterway"="dock"]["name"];);out center tags;`;
      const seen=new Set(),items=[];
      const addItem=(item)=>{
        const plat=Number(item.lat),plon=Number(item.lon);if(!Number.isFinite(plat)||!Number.isFinite(plon))return;
        const distance=this.haversine(lat,lon,plat,plon);if(distance>Math.max(radiusMiles*1.6,12))return;
        const display=(item.name||'Public access').trim();const key=display.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,32)+':'+plat.toFixed(4)+':'+plon.toFixed(4);if(seen.has(key))return;seen.add(key);
        const p={id:item.id||`place-${seen.size}`,name:display,type:item.type||'Public access',lat:plat,lon:plon,distance,tags:item.tags||{},source:item.source||'Public map data'};
        p.match=this.mapPlaceMatchScore(p);p.reason=item.reason||this.mapPlaceReason(p);items.push(p);
      };

      let provider='';

      // Use an official state access layer when CoastCast has one registered for the selected coast.
      try{
        const official=await this.loadOfficialAccessPlaces(radiusMiles);
        official.forEach(addItem);
        if(items.length)provider='official';
      }catch(_){ }

      // OpenStreetMap remains useful for named fishing-specific places and businesses.
      if(!items.length){
        for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter']){
          try{
            const data=await this.fetchOverpass(endpoint,query,7000);
            (data?.elements||[]).forEach(el=>{const tags=el.tags||{};const plat=Number(el.lat??el.center?.lat),plon=Number(el.lon??el.center?.lon);if(!Number.isFinite(plat)||!Number.isFinite(plon))return;const type=this.classifyMapPlace(tags);const name=(tags.name||'').trim();if(!name&&type!=='Fishing access')return;addItem({id:`osm-${el.type||'x'}-${el.id}`,name:name||'Fishing access',type,lat:plat,lon:plon,tags:{access:tags.access||'',surface:tags.surface||'',operator:tags.operator||''},source:'OpenStreetMap'});});
            if(items.length){provider='live';break;}
          }catch(_){ }
        }
      }

      // Sparse OSM tagging should not force a zero. Search named public-access terms
      // around the selected town as a generalized no-key fallback.
      if(!items.length){
        try{
          const textPlaces=await this.genericTextMapPlaces(radiusMiles);
          textPlaces.forEach(addItem);
          if(items.length)provider='search';
        }catch(_){ }
      }

      // Keep the verified Holden catalog as a final safety net for that town.
      if(!items.length&&this.isHoldenArea()){
        const verified=await this.verifiedHoldenMapPlaces();verified.forEach(addItem);if(items.length)provider='verified';
      }

      // Nationwide safety net: CoastCast can always analyze the selected coastal coordinate.
      // This is deliberately NOT labeled public access. It keeps forecasting usable while
      // clearly telling the angler to verify legal/public access locally.
      if(!items.length){
        addItem({id:'selected-coast-anchor',name:this.state.location.name,type:'Coastal destination',lat,lon,source:'Selected fishing destination',reason:`Forecast-ready ${this.coastRegion()} coordinate • public access not verified by the current map providers`});
        if(items.length)provider='anchor';
      }

      items.sort((a,b)=>b.match-a.match||a.distance-b.distance);
      this.state.mapPOIs=items.slice(0,40);
      if(this.state.mapPOIs.length){
        this.state.mapPlacesStatus=provider||'live';if(provider!=='anchor')this.writePlaceCache(cacheKey,this.state.mapPOIs);this.renderSpotIntelligence();this.renderMapLayers();
        if(forceToast){
          const copy=provider==='official'?`Loaded ${this.state.mapPOIs.length} official state coastal access site${this.state.mapPOIs.length===1?'':'s'}.`:provider==='verified'?`Loaded ${this.state.mapPOIs.length} verified local access point${this.state.mapPOIs.length===1?'':'s'}.`:provider==='search'?`Found ${this.state.mapPOIs.length} indexed coastal place${this.state.mapPOIs.length===1?'':'s'} using location search.`:provider==='anchor'?`No verified public access was indexed here, so CoastCast loaded your selected ${this.coastRegion()} coordinate for live analysis.`:`Scanned ${this.state.mapPOIs.length} public fishing/access place${this.state.mapPOIs.length===1?'':'s'}.`;
          this.showToast(copy);
        }
        return this.state.mapPOIs;
      }
      this.state.mapPlacesStatus='fallback';this.state.mapPOIs=[];this.renderSpotIntelligence();if(forceToast)this.showToast('No indexed public access was returned, but nationwide live forecasting still works at the selected coast point.');return [];
    },

    coastRegion(){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon),name=String(l.name||'');
      if(/hawai|honolulu|maui|oahu|kauai/i.test(name)||(lat>=18&&lat<=23&&lon>=-161.5&&lon<=-154.5))return'Hawaiʻi';
      if(/alaska|,\s*ak\b/i.test(name)||(lat>=51&&lon<=-130))return'Alaska';
      if(lon<=-115)return'Pacific Coast';
      if(lat<=31.6&&lon>=-98.5&&lon<=-80.0)return'Gulf Coast';
      return'Atlantic Coast';
    },

    coastRegionSpecies(){
      const r=this.coastRegion();
      if(r==='Pacific Coast')return['Surfperch','California Halibut','Lingcod','Rockfish','Striped Bass','Salmon'];
      if(r==='Alaska')return['Pacific Halibut','Salmon','Rockfish','Lingcod'];
      if(r==='Hawaiʻi')return['Bonefish','Trevally'];
      if(r==='Gulf Coast')return['Red Drum','Speckled Trout','Flounder','Pompano','Snook','Tarpon','Spanish Mackerel','Sheepshead'];
      return['Striped Bass','Bluefish','Red Drum','Flounder','Black Drum','Spanish Mackerel','Speckled Trout'];
    },

    isNorthCarolinaCoast(){
      const l=this.state.location||{};const name=String(l.name||'');const lat=Number(l.lat),lon=Number(l.lon);
      if(/north carolina|,\s*nc\b/i.test(name))return true;
      return Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=33.75&&lat<=36.65&&lon>=-78.65&&lon<=-75.20;
    },

    async loadOfficialAccessPlaces(radiusMiles=10){
      // Provider registry: official state sources can be added without changing the nationwide core.
      if(this.isNorthCarolinaCoast()) return this.loadNcDcmAccessPlaces(radiusMiles);
      return [];
    },

    async loadNcDcmAccessPlaces(radiusMiles=10){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return[];
      const base='https://services2.arcgis.com/kCu40SDxsCGcuUWO/ArcGIS/rest/services/DCM_Beach_and_Waterfront_Access/FeatureServer/0/query';
      const params=new URLSearchParams({
        f:'json',where:'1=1',geometry:`${lon},${lat}`,geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',
        distance:String(Math.min(20,Math.max(3,radiusMiles))),units:'esriSRUnit_StatuteMile',
        outFields:'OBJECTID,ACCESS_ID,PLACE,ACCESS_LOC,PARKING,RESTRM,SHOWER,HAND_BEACH,VEH_ACCESS,ACESS_TYPE,PARKING_OPTIONS,KayakCanoeLaunch,PRK_FEE',
        returnGeometry:'true',outSR:'4326',resultRecordCount:'120'
      });
      const data=await this.fetchJSON(`${base}?${params.toString()}`,9000);if(data?.error)throw new Error(data.error.message||'NC DCM query failed');
      const features=Array.isArray(data?.features)?data.features:[];
      return features.map((f,i)=>{
        const a=f.attributes||{},g=f.geometry||{};const plat=Number(g.y),plon=Number(g.x);if(!Number.isFinite(plat)||!Number.isFinite(plon))return null;
        const accessType=String(a.ACESS_TYPE||'').toLowerCase();const loc=String(a.ACCESS_LOC||'').trim();const site=String(a.ACCESS_ID||'').trim();const town=String(a.PLACE||'').trim();
        const type=accessType.includes('beach')?'Beach':'Public access';const name=site||loc||`${town||'NC'} public coastal access`;
        const amenities=[];if(Number(a.PARKING)>0)amenities.push(`${Math.round(Number(a.PARKING))} parking`);if(a.RESTRM==='Y')amenities.push('restroom');if(a.SHOWER==='Y')amenities.push('shower');if(a.HAND_BEACH==='Y')amenities.push('accessible beach access');if(a.KayakCanoeLaunch==='Y')amenities.push('kayak/canoe launch');if(a.PRK_FEE==='Y')amenities.push('paid parking');
        const detail=[loc,town,amenities.join(' • ')].filter(Boolean).join(' • ');
        return{id:`ncdcm-${a.OBJECTID||a.NCDCM_ID||i}-${plat.toFixed(5)}`,name,type,lat:plat,lon:plon,source:'Official • NC DEQ Coastal Management',reason:`Official NC public ${type.toLowerCase()}${detail?` • ${detail}`:''}`,tags:{official:'NC DEQ',parking:a.PARKING||0,restroom:a.RESTRM||'',shower:a.SHOWER||'',vehicle:a.VEH_ACCESS||''}};
      }).filter(Boolean);
    },

    async genericTextMapPlaces(radiusMiles=10){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return[];
      const town=String(l.name||'').split(',').slice(0,2).join(',').trim();const maxDistance=Math.max(12,radiusMiles*1.6);const out=[],seen=new Set();
      const terms=[['public beach access','Beach'],['fishing pier','Pier'],['public fishing access','Fishing access'],['boat ramp','Boat ramp'],['public waterfront access','Public access']];
      const add=(r,type,source)=>{const plat=Number(r.lat),plon=Number(r.lon);if(!Number.isFinite(plat)||!Number.isFinite(plon))return;const d=this.haversine(lat,lon,plat,plon);if(d>maxDistance)return;const display=String(r.display_name||r.name||'').split(',').slice(0,2).join(',').trim();if(!display)return;const key=`${display.toLowerCase()}:${plat.toFixed(4)}:${plon.toFixed(4)}`;if(seen.has(key))return;seen.add(key);out.push({id:`text-${out.length}-${plat.toFixed(4)}`,name:display,type,lat:plat,lon:plon,source,reason:`${type} found near ${town||'selected fishing area'} • ${d.toFixed(1)} mi away`});};
      for(const [term,type] of terms){
        const q=[term,town].filter(Boolean).join(' ');
        try{
          const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=us&q=${encodeURIComponent(q)}`;const rows=await this.fetchJSON(url,6500);if(Array.isArray(rows))rows.forEach(r=>add(r,type,'Location search • OpenStreetMap'));
        }catch(_){ }
        if(out.length>=8)break;
        await this.sleep(900);
      }
      if(out.length)return out;
      for(const [term,type] of terms.slice(0,3)){
        try{
          const q=[term,town].filter(Boolean).join(' ');const data=await this.fetchJSON(`https://photon.komoot.io/api/?limit=5&q=${encodeURIComponent(q)}`,6500);(data?.features||[]).forEach((f,i)=>{const c=f?.geometry?.coordinates||[],p=f?.properties||{};add({lat:c[1],lon:c[0],display_name:[p.name,p.city||p.county,p.state].filter(Boolean).join(', ')},type,'Location search • Photon');});
        }catch(_){ }
        if(out.length>=5)break;
        await this.sleep(200);
      }
      return out;
    },

    isHoldenArea(){const l=this.state.location||{};return /holden beach/i.test(String(l.name||''))||this.haversine(Number(l.lat)||0,Number(l.lon)||0,33.9135061,-78.3038892)<=18;},

    async geocodePlace(query){
      const q=encodeURIComponent(query);
      try{const a=await this.fetchJSON(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${q}`,7000);const x=Array.isArray(a)?a[0]:null;if(x&&Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon)))return{lat:Number(x.lat),lon:Number(x.lon)};}catch(_){ }
      try{const p=await this.fetchJSON(`https://photon.komoot.io/api/?limit=1&q=${q}`,7000);const c=p?.features?.[0]?.geometry?.coordinates;if(Array.isArray(c)&&c.length>=2&&Number.isFinite(Number(c[1]))&&Number.isFinite(Number(c[0])))return{lat:Number(c[1]),lon:Number(c[0])};}catch(_){ }
      return null;
    },

    async verifiedHoldenMapPlaces(){
      const catalog=[
        {id:'ncwrc-holden-ramp',name:'Holden Beach Boating Access Area',type:'Boat ramp',lat:33.91625683,lon:-78.26749257,source:'Verified • NCWRC',reason:'NCWRC public boating access • 99 S Shore Dr • Red Drum, Speckled Trout and Flounder access'},
        {id:'hb-quinton',name:'Quinton Street Beach Access',type:'Beach',query:'Quinton Street and Ocean Boulevard East, Holden Beach, NC 28462',source:'Verified • Town / Brunswick Islands',reason:'Public CAMA beach access • accessible ramp and parking'},
        {id:'hb-pw200',name:'PW200 / Jordan Boulevard Beach Access',type:'Beach',query:'102 Ocean Boulevard West, Holden Beach, NC 28462',source:'Verified • Brunswick Islands',reason:'Public beach access near Jordan Boulevard • accessible access'},
        {id:'hb-east-end',name:'East End / McCray Street Beach Access',type:'Beach',query:'McCray Street, Holden Beach, NC 28462',source:'Verified • Town / Brunswick Islands',reason:'Public east-end beach access • popular surf-fishing area'},
        {id:'hb-pw140',name:'PW140 / Ferry Road Beach Access',type:'Beach',query:'173 Ocean Boulevard East, Holden Beach, NC 28462',source:'Verified • Brunswick Islands',reason:'Public beach access near Ferry Road'},
        {id:'hb-pw100',name:'PW100 / 220 Ocean Boulevard East',type:'Beach',query:'220 Ocean Boulevard East, Holden Beach, NC 28462',source:'Verified • Local access guide',reason:'Public beach access with nearby public parking'}
      ];
      const out=[];
      for(const item of catalog){
        if(Number.isFinite(Number(item.lat))&&Number.isFinite(Number(item.lon))){out.push(item);continue;}
        const g=await this.geocodePlace(item.query);if(g)out.push({...item,...g});await this.sleep(350);
      }
      return out;
    },

    async genericTextTackleShops(){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return[];
      const town=String(l.name||'').split(',').slice(0,3).join(',').trim();const maxDistance=Math.max(18,(Number(this.state.radius)||10)*2);const out=[],seen=new Set();
      const add=(name,plat,plon,source)=>{plat=Number(plat);plon=Number(plon);if(!name||!Number.isFinite(plat)||!Number.isFinite(plon))return;const d=this.haversine(lat,lon,plat,plon);if(d>maxDistance)return;const key=name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,28)+':'+plat.toFixed(3)+':'+plon.toFixed(3);if(seen.has(key))return;seen.add(key);out.push({name,lat:plat,lon:plon,source,tags:['Bait / tackle','Location search']});};
      for(const term of ['bait and tackle','fishing tackle','bait shop']){
        const q=`${term} ${town}`;
        try{const rows=await this.fetchJSON(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=us&q=${encodeURIComponent(q)}`,6000);(rows||[]).forEach(r=>add(String(r.display_name||'').split(',')[0],r.lat,r.lon,'Location search • OpenStreetMap'));}catch(_){ }
        if(out.length>=5)break;await this.sleep(350);
      }
      if(out.length)return out;
      try{const data=await this.fetchJSON(`https://photon.komoot.io/api/?limit=8&q=${encodeURIComponent('bait tackle '+town)}`,6500);(data?.features||[]).forEach(f=>{const c=f?.geometry?.coordinates||[],p=f?.properties||{};add(p.name||'Bait & tackle',c[1],c[0],'Location search • Photon');});}catch(_){ }
      return out;
    },

    async verifiedHoldenShops(){
      const catalog=[
        {name:'Rigged & Ready Bait & Tackle',query:'1096-7 Sabbath Home Road SW, Supply, NC 28462',source:'Verified local shop',tags:['Bait & tackle','Official shop website']},
        {name:'The Rod & Reel Shop',query:'3401 Holden Beach Road SW, Holden Beach, NC 28462',source:'Verified local shop',tags:['Bait & tackle','Fishing supplies']}
      ];
      const out=[];for(const item of catalog){const g=await this.geocodePlace(item.query);if(g)out.push({...item,...g});await this.sleep(350);}return out;
    },

    sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));},

    classifyMapPlace(tags){if(tags.leisure==='fishing'||tags.sport==='fishing')return'Fishing access';if(tags.man_made==='pier')return'Pier';if(tags.leisure==='slipway')return'Boat ramp';if(tags.leisure==='marina')return'Marina';if(tags.natural==='beach')return'Beach';if(tags.waterway==='dock')return'Dock';return'Public access';},
    mapPlaceMatchScore(p){let score=this.currentScore();const style=this.state.fishingStyle;const type=p.type;let bonus=0;if(type==='Fishing access')bonus+=3;if(type==='Beach'&&style==='Surf fishing')bonus+=4;if(type==='Pier'&&style==='Pier fishing')bonus+=5;if(type==='Pier')bonus+=2;if(type==='Boat ramp')bonus-=2;if(type==='Marina')bonus-=3;const distPenalty=Math.min(9,Math.max(0,p.distance-1)*.65);return Math.round(Math.max(35,Math.min(98,score+bonus-distPenalty)));},
    mapPlaceReason(p){if(p.type==='Coastal destination')return`${this.coastRegion()} forecast coordinate • public access must be verified locally`;const parts=[p.type,`${this.fmt(p.distance,1)} mi away`];if(p.type==='Beach'&&this.state.fishingStyle==='Surf fishing')parts.push('matches surf mode');else if(p.type==='Pier'&&this.state.fishingStyle==='Pier fishing')parts.push('matches pier mode');else if(p.type==='Fishing access')parts.push('mapped fishing access');parts.push('area conditions preview');return parts.join(' • ');},

    renderSpotIntelligence(){
      const score=this.currentScore();const days=this.state.data?.days||[];const bestDay=days.length?days.reduce((a,b)=>b.score>a.score?b:a,days[0]):null;
      if(this.$('mapCurrentScore'))this.$('mapCurrentScore').textContent=score;if(this.$('mapScoreSpecies'))this.$('mapScoreSpecies').textContent=this.state.targetSpecies;
      if(this.$('mapBestDay'))this.$('mapBestDay').textContent=bestDay?.day||'--';if(this.$('mapBestDayScore'))this.$('mapBestDayScore').textContent=bestDay?`${bestDay.score}/100 • ${this.fmt(bestDay.wind,0)} mph wind`:'7-day outlook';
      if(this.$('mapPlacesCount'))this.$('mapPlacesCount').textContent=this.state.mapPOIs.length;
      const statusCopy={idle:'Not scanned',loading:'Scanning…',official:'Official state access',live:'National public map',search:'Location search',verified:'Verified local catalog',anchor:'Forecast point only',cached:'Cached map data',fallback:'No indexed access found'};if(this.$('spotIntelStatus'))this.$('spotIntelStatus').textContent=statusCopy[this.state.mapPlacesStatus]||'Not scanned';if(this.$('coastCoverageBadge'))this.$('coastCoverageBadge').textContent=`USA COAST • ${this.coastRegion()} • ${this.coastRegionSpecies().slice(0,3).join(' • ')}`;if(this.$('spotProviderPill'))this.$('spotProviderPill').textContent=this.state.mapPlacesStatus==='official'?'Official state access':this.state.mapPlacesStatus==='anchor'?'Forecast coordinate':'Nationwide coast scan';
      if(this.$('mapCenterLabel'))this.$('mapCenterLabel').textContent=this.state.location.name;
      const places=[...this.state.mapPOIs].sort((a,b)=>b.match-a.match||a.distance-b.distance);const top=places[0]||null;this.state.selectedIntelSpot=top;
      const analyze=this.$('topSpotAnalyzeBtn'),save=this.$('topSpotSaveBtn');if(analyze)analyze.disabled=!top;if(save)save.disabled=!top;
      if(this.$('topSpotName'))this.$('topSpotName').textContent=top?top.name:'Scan the area to find public fishing access';
      if(this.$('topSpotScore'))this.$('topSpotScore').textContent=top?top.match:'--';
      if(this.$('topSpotReason'))this.$('topSpotReason').textContent=top?top.reason:'CoastCast will rank named beaches, piers, fishing access, marinas and boat ramps around your selected destination.';
      if(this.$('weekendIntel'))this.$('weekendIntel').innerHTML=bestDay?`<strong>Best trip day:</strong> ${this.escape(bestDay.day)} • ${bestDay.score}/100 • ${this.fmt(bestDay.wave,1)} ft surf • ${this.fmt(bestDay.rain,0)}% rain. ${top?`Start by analyzing <strong>${this.escape(top.name)}</strong> at exact coordinates.`:''}`:'Your best forecast day will appear here.';
      const list=this.$('spotIntelList');if(!list)return;
      if(this.state.mapPlacesStatus==='loading'){list.innerHTML='<div class="spot-scan-state"><span class="scan-spinner"></span><strong>Scanning public map data…</strong><small>Looking for named fishing access, beaches, piers, marinas and ramps.</small></div>';return;}
      if(!places.length){list.innerHTML='<div class="empty-state">No public places are loaded yet. Tap <strong>Scan fishing area</strong>. Your saved private spots remain separate.</div>';return;}
      list.innerHTML=places.slice(0,10).map((p,i)=>`<article class="spot-intel-card ${i===0?'top':''}"><div class="spot-match-score"><strong>${p.match}</strong><span>MATCH</span></div><div class="spot-intel-copy"><div class="spot-intel-type">${this.escape(p.type)}${i===0?' • TOP NEARBY':''}</div><h3>${this.escape(p.name)}</h3><p>${this.escape(p.reason)}</p></div><div class="spot-intel-actions"><button type="button" class="mini-button primary-mini" data-analyze-poi="${this.escape(p.id)}">Analyze</button><button type="button" class="mini-button" data-save-poi="${this.escape(p.id)}">Save</button></div></article>`).join('');
    },

    findMapPOI(id){return this.state.mapPOIs.find(p=>String(p.id)===String(id));},
    analyzeMapPlace(id){const p=this.findMapPOI(id);if(!p)return;this.state.location={key:'custom',name:p.name,lat:p.lat,lon:p.lon,source:`Map • ${p.type}`};this.onLocationChanged();this.navigate('home');this.showToast(`Analyzing ${p.name} with exact coordinates…`);},
    saveMapPlace(id){const p=this.findMapPOI(id);if(!p)return;const exists=this.state.waypoints.some(w=>this.haversine(p.lat,p.lon,w.lat,w.lon)<.03);if(exists){this.showToast('That place is already in your saved spots.');return;}this.state.waypoints.unshift({id:Date.now(),name:p.name,notes:`${p.type} • saved from Spot Intelligence`,lat:p.lat,lon:p.lon,privacy:'private'});this.save();this.renderWaypoints();this.renderMapLayers();this.showToast(`${p.name} saved privately.`);},

    ensureMap(){
      if(this.state.map)return;if(!window.L){this.$('leafletMap').classList.add('hidden');this.$('mapFallback').classList.remove('hidden');return;}
      try{const l=this.state.location;const map=L.map('leafletMap',{zoomControl:true,attributionControl:true}).setView([l.lat,l.lon],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);this.state.map=map;this.renderMapLayers();setTimeout(()=>map.invalidateSize(),100);}catch(_){this.$('leafletMap').classList.add('hidden');this.$('mapFallback').classList.remove('hidden');}
    },

    markerIcon(kind,label=''){const cls=`cc-map-marker ${kind}`;return L.divIcon({className:'cc-map-divicon',html:`<div class="${cls}">${this.escape(String(label))}</div>`,iconSize:[38,38],iconAnchor:[19,34],popupAnchor:[0,-31]});},
    renderMapLayers(){
      const map=this.state.map;if(!map)return;Object.values(this.state.mapLayers).flat().forEach(layer=>{try{map.removeLayer(layer);}catch(_){}});this.state.mapLayers={spots:[],catches:[],shops:[],current:[],recommended:[],access:[]};const l=this.state.location;
      const current=L.marker([l.lat,l.lon],{icon:this.markerIcon('current','CC')}).addTo(map).bindPopup(`<strong>${this.escape(l.name)}</strong><br>Current fishing destination<br><strong>${this.currentScore()}/100</strong> area score`);this.state.mapLayers.current.push(current);
      const ranked=[...this.state.mapPOIs].sort((a,b)=>b.match-a.match||a.distance-b.distance);const topIds=new Set(ranked.slice(0,5).map(p=>p.id));
      ranked.forEach(p=>{const top=topIds.has(p.id);const popup=`<div class="cc-popup"><strong>${this.escape(p.name)}</strong><br><span>${this.escape(p.type)} • ${this.fmt(p.distance,1)} mi</span><br><b>${p.match}/100 area match</b><div class="popup-actions"><button type="button" data-map-analyze="${this.escape(p.id)}">Analyze</button><button type="button" data-map-save="${this.escape(p.id)}">Save</button></div></div>`;const m=L.marker([p.lat,p.lon],{icon:this.markerIcon(top?'recommended':'access',top?p.match:this.typeAbbr(p.type))}).bindPopup(popup);m.addTo(map);this.state.mapLayers[top?'recommended':'access'].push(m);});
      this.state.waypoints.forEach(w=>{const m=L.marker([w.lat,w.lon],{icon:this.markerIcon('saved','★')}).bindPopup(`<strong>${this.escape(w.name)}</strong><br>${this.escape(w.notes||'Private saved spot')}`);m.addTo(map);this.state.mapLayers.spots.push(m);});
      this.state.catches.forEach(c=>{const lat=c.privacy==='private'?c.lat+.003:c.lat,lon=c.privacy==='private'?c.lon+.003:c.lon;const m=L.circleMarker([lat,lon],{radius:6,color:'#dff9ee',weight:2,fillColor:'#4FDFB5',fillOpacity:.95}).bindPopup(`<strong>${this.escape(c.species)}</strong><br>${this.escape(c.privacy==='private'?'Private catch — offset on map':c.location)}`);m.addTo(map);this.state.mapLayers.catches.push(m);});
      (this.state.data?.shops||[]).forEach((s,i)=>{if(!Number.isFinite(Number(s.lat))||!Number.isFinite(Number(s.lon)))return;const m=L.marker([s.lat,s.lon],{icon:this.markerIcon('bait',String(i+1))}).bindPopup(`<strong>${this.escape(s.name)}</strong><br>${this.fmt(s.distance,1)} mi from fishing spot<div class="popup-actions"><a href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">To shop</a><a href="${this.mapsRouteUrl(s.lat,s.lon,l.lat,l.lon)}" target="_blank" rel="noopener">Shop → spot</a></div>`);m.addTo(map);this.state.mapLayers.shops.push(m);});
      this.applyMapFilter();this.$('mapSelection').innerHTML=`Centered on <strong>${this.escape(l.name)}</strong> • ${this.coastRegion()} • ${this.currentScore()}/100 current area score • ${this.state.mapPOIs.length} indexed spot${this.state.mapPOIs.length===1?'':'s'}.`;
    },
    typeAbbr(type){return({'Fishing access':'F','Pier':'P','Beach':'B','Boat ramp':'R','Marina':'M','Dock':'D'})[type]||'•';},
    setMapFilter(filter,button){this.state.mapFilter=filter;this.$$('.filter-chip').forEach(b=>b.classList.toggle('active',b===button));this.applyMapFilter();},
    applyMapFilter(){const map=this.state.map;if(!map)return;for(const [type,layers] of Object.entries(this.state.mapLayers)){const show=this.state.mapFilter==='all'||type===this.state.mapFilter||type==='current';layers.forEach(layer=>{const on=map.hasLayer(layer);if(show&&!on)layer.addTo(map);if(!show&&on)map.removeLayer(layer);});}},
    recenterMap(){if(!this.state.map)return;const l=this.state.location;this.state.map.setView([l.lat,l.lon],12);setTimeout(()=>this.renderMapLayers(),50);},

    resetApp(){
      if(!confirm('Reset saved CoastCast spots, catches, settings and preferences?')) return;
      try{localStorage.removeItem('coastcast-v9-state');localStorage.removeItem('coastcast-v8-state');localStorage.removeItem('coastcast-v7-state');localStorage.removeItem('coastcast-v6-state');localStorage.removeItem('coastcast-v5-state');localStorage.removeItem('coastcast-v4-state');localStorage.removeItem('coastcast-v3-state');}catch(_){ }
      this.state.live=false;try{localStorage.removeItem('coastcast-v8-state');}catch(_){}this.state.location={key:'wrightsville',name:'Wrightsville Beach, NC',lat:34.2085,lon:-77.7964,source:'Saved coast'};this.state.radius=10;this.state.fishingStyle='Surf fishing';this.state.targetSpecies='Red Drum';this.state.waypoints=[];this.state.catches=[];this.state.trips=0;this.state.savedTripPlans=[];this.state.mapPOIs=[];this.state.mapPlacesStatus='idle';this.state.selectedIntelSpot=null;this.state.data=this.buildDemoData();this.closeDialog('settingsDialog');this.renderAll();this.showToast('CoastCast reset.');
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
    cToF(c){return c*9/5+32;},
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
    mapsUrl(lat,lon,name){return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lon}`)}&travelmode=driving`;},
    mapsRouteUrl(fromLat,fromLon,toLat,toLon){return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${fromLat},${fromLon}`)}&destination=${encodeURIComponent(`${toLat},${toLon}`)}&travelmode=driving`;},
    escape(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},

    async fetchOverpass(endpoint,query,timeout=18000){
      const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeout);
      try{
        const body=new URLSearchParams({data:query});
        const r=await fetch(endpoint,{method:'POST',signal:ctrl.signal,cache:'no-store',headers:{'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body});
        if(!r.ok)throw new Error(`Overpass HTTP ${r.status}`);
        return await r.json();
      }finally{clearTimeout(timer);}
    },
    async fetchJSON(url,timeout=12000){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeout);try{const r=await fetch(url,{signal:ctrl.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(timer);}},

    showToast(msg){const t=this.$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(this._toastTimer);this._toastTimer=setTimeout(()=>t.classList.remove('show'),3000);},
    registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  };

  window.CoastCast=APP;
  APP.init();
})();
