(() => {
  'use strict';

  const APP = {
    state: {
      view: 'home',
      live: false,
      loading: false,
      location: { key: 'wrightsville', name: 'Wrightsville Beach, NC', lat: 34.2085, lon: -77.7964, source: 'Saved coast' },
      radius: 10,
      tackleRadius: 20,
      geoapifyKey: '',
      fishingStyle: 'Surf fishing',
      targetSpecies: 'Red Drum',
      forecastDay: 0,
      waypoints: [],
      catches: [],
      trips: 0,
      savedTripPlans: [],
      alertRules: [],
      alertMatches: [],
      profile: {name:'AnglerSignal Angler',homeCoast:'',favoriteSpecies:'Red Drum'},
      cloud: {url:'',anonKey:'',email:'',autoSync:false,session:null,lastSync:null},
      scout: {running:false,radius:25,period:'today',species:'Red Drum',results:[],compareIds:[],lastRun:null},
      goMode: {active:false,startedAt:null,sessionId:null,location:null,species:null,baitPlan:null,checks:{bait:false,ice:false,license:false,gear:false},history:[]},
      gearPlan: {checked:{},lastBuilt:null},
      departure: {driveMinutes:45,setupMinutes:20,baitMinutes:20,selectedWindow:null},
      regChecks: {},
      tackleBox: [],
      shoppingList: [],
      offlinePacks: [],
      community: {tab:'feed',reactions:{},publishedLocalIds:[],challengeClaims:{},lastCloudRefresh:null},
      command: {mode:'bite',lastPlan:null},
      watchCenter: {running:false,results:[],lastRun:null,species:'Red Drum'},
      oceanNetwork: {status:'idle',station:null,observation:null,history:[],lastChecked:null,error:null},
      experience: {mode:'simple'},
      membership: {tier:'premium',source:'beta',status:'active',preview:'premium',expiresAt:null,betaFullAccess:true,server:null},
      backend: {installed:false,lastAccessCheck:null,isAdmin:false,familyMembers:[]},
      seasonal: {selectedSpecies:null,lastViewedMonth:null},
      familyCrew: {members:[],shareTrips:true,shareFavorites:false},
      liveUpdatedAt: null,
      data: null,
      map: null,
      mapLayers: { spots: [], catches: [], shops: [], current: [], recommended: [], access: [] },
      mapFilter: 'all',
      mapPOIs: [],
      mapPlacesStatus: 'idle',
      selectedIntelSpot: null,
      selectedTideStation: null,
      sourceHealth: {weather:'demo',marine:'demo',tides:'demo',shops:'demo',alerts:'demo',buoy:'demo'},
      safetyAlerts: [],
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

    baitPlaybook: {
      'Red Drum': {rigs:{'Surf fishing':'Fish-finder / Carolina rig','Pier fishing':'Carolina rig or jighead','Inlet / jetty':'Jighead or Carolina rig'},presentation:'Keep natural bait close to the bottom in moving water; work paddletails across cuts and current seams.',terminal:'30–40 lb leader • 3/0–6/0 circle hook for bait'},
      'Speckled Trout': {rigs:{'Surf fishing':'1/8–1/4 oz jighead','Pier fishing':'Popping cork or jighead','Inlet / jetty':'Jighead / suspending plug'},presentation:'Work clean current seams slowly; low light favors topwater and suspending presentations.',terminal:'15–25 lb fluorocarbon leader'},
      'Flounder': {rigs:{'Surf fishing':'Carolina rig','Pier fishing':'Carolina rig / dropper','Inlet / jetty':'Bucktail + trailer'},presentation:'Stay near bottom and work drop-offs, channel edges and structure with slow controlled movement.',terminal:'20–30 lb leader • 2/0–4/0 hook'},
      'Bluefish': {rigs:{'Surf fishing':'Metal / bait rig','Pier fishing':'Metal spoon / float rig','Inlet / jetty':'Metal jig / plug'},presentation:'Cover water quickly around bait; use a faster retrieve when fish are actively chasing.',terminal:'30–50 lb abrasion-resistant leader; wire only when needed'},
      'Spanish Mackerel': {rigs:{'Surf fishing':'Casting spoon / Got-Cha','Pier fishing':'Got-Cha / spoon','Inlet / jetty':'Fast metal jig'},presentation:'Fast, steady retrieves through clean water and bait schools.',terminal:'20–30 lb fluorocarbon or light wire when cut-offs are frequent'},
      'Black Drum': {rigs:{'Surf fishing':'Fish-finder rig','Pier fishing':'Carolina / bottom rig','Inlet / jetty':'Bottom rig near structure'},presentation:'Keep crab, shrimp or clam on bottom and let scent work in current.',terminal:'30–50 lb leader • strong circle hook'},
      'Sheepshead': {rigs:{'Surf fishing':'Compact bottom rig','Pier fishing':'Short leader / jig','Inlet / jetty':'Jig or short Carolina rig'},presentation:'Present bait tight to pilings, rocks or jetty structure with minimal slack.',terminal:'20–40 lb fluorocarbon • small strong hook'},
      'Striped Bass': {rigs:{'Surf fishing':'Fish-finder / bucktail','Pier fishing':'Live-bait rig / plug','Inlet / jetty':'Bucktail / swimbait'},presentation:'Work rips and current edges; low-light periods favor plugs and moving baits.',terminal:'30–50 lb leader'},
      'Pompano': {rigs:{'Surf fishing':'Double-drop pompano rig','Pier fishing':'Double-drop bottom rig','Inlet / jetty':'Light bottom rig'},presentation:'Fish clean sandy troughs and bars; keep baits compact and near bottom.',terminal:'15–25 lb leader • small circle hooks'},
      'Snook': {rigs:{'Surf fishing':'Free-line / jighead','Pier fishing':'Live-bait rig','Inlet / jetty':'Jighead / live bait'},presentation:'Present naturally with the current near passes, troughs and structure.',terminal:'30–50 lb fluorocarbon leader'},
      'Tarpon': {rigs:{'Surf fishing':'Free-line live bait','Pier fishing':'Live-bait rig','Inlet / jetty':'Free-line crab / swimbait'},presentation:'Match bait movement and current; avoid overworking the presentation.',terminal:'50–80 lb leader sized to fish and structure'},
      'Surfperch': {rigs:{'Surf fishing':'Carolina / high-low rig','Pier fishing':'High-low rig','Inlet / jetty':'Light Carolina rig'},presentation:'Work sandy troughs and cuts; keep the bait moving slowly with the wash.',terminal:'10–20 lb leader'},
      'California Halibut': {rigs:{'Surf fishing':'Drop-shot / Carolina rig','Pier fishing':'Live-bait rig','Inlet / jetty':'Swimbait / drop-shot'},presentation:'Work sandy edges and channels close to bottom with a slow retrieve.',terminal:'20–30 lb fluorocarbon leader'},
      'Lingcod': {rigs:{'Surf fishing':'Heavy jig','Pier fishing':'Heavy swimbait / jig','Inlet / jetty':'Heavy jig / swimbait'},presentation:'Keep the lure near rocky structure and work deliberately without excessive speed.',terminal:'40–60 lb abrasion-resistant leader'},
      'Rockfish': {rigs:{'Surf fishing':'Jig / high-low rig','Pier fishing':'High-low / jig','Inlet / jetty':'Jig / shrimp fly'},presentation:'Stay close to rocky structure and vary depth until fish are located.',terminal:'25–50 lb leader depending on structure'},
      'Pacific Halibut': {rigs:{'Surf fishing':'Heavy bottom rig','Pier fishing':'Heavy bottom rig','Inlet / jetty':'Heavy bottom rig'},presentation:'Keep bait near bottom and maintain contact in current.',terminal:'Heavy leader and terminal tackle matched to depth/current'},
      'Salmon': {rigs:{'Surf fishing':'Casting spoon / spinner','Pier fishing':'Herring / spinner','Inlet / jetty':'Spinner / spoon'},presentation:'Cover travel lanes and current seams; vary speed and depth.',terminal:'15–30 lb leader'},
      'Bonefish': {rigs:{'Surf fishing':'Light shrimp/crab presentation','Pier fishing':'Light bait rig','Inlet / jetty':'Light jig / shrimp'},presentation:'Lead moving fish and keep presentations subtle in shallow clear water.',terminal:'8–16 lb fluorocarbon leader'},
      'Trevally': {rigs:{'Surf fishing':'Stickbait / topwater','Pier fishing':'Live-bait / plug','Inlet / jetty':'Stickbait / jig'},presentation:'Work current-washed points and structure with assertive retrieves when fish are active.',terminal:'40–80 lb leader matched to structure'}
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
      this.applyPublicConfig();
      this.populateSpeciesControls();
      this.populateProfileControls();
      this.populateScoutControls();
      this.populatePresets();
      this.bindNavigation();
      this.bindControls();
      this.ensureCatchDate();
      this.state.data = this.buildDemoData();
      this.renderAll();
      const startView=(location.hash||'').replace('#','');
      if(['forecast','map','trips','logbook','profile','community'].includes(startView)) this.navigate(startView);
      this.registerServiceWorker();
      this._sessionTimer=setInterval(()=>{if(this.state.goMode?.active&&this.state.view==='trips')this.renderGoMode();},30000);
      if(this.state.live) this.loadLiveData({quiet:true});
      if(this.cloudSignedIn()) setTimeout(()=>this.refreshServerAccess({quiet:true}),250);
    },

    buildDemoData(){
      return JSON.parse(JSON.stringify(this.mock));
    },

    applyPublicConfig(){
      const cfg=window.COASTCAST_CONFIG||{};
      if(!this.state.cloud.url&&cfg.supabaseUrl)this.state.cloud.url=String(cfg.supabaseUrl).replace(/\/+$/,'');
      if(!this.state.cloud.anonKey&&cfg.supabasePublishableKey)this.state.cloud.anonKey=String(cfg.supabasePublishableKey);
    },

    restore(){
      try{
        const raw=localStorage.getItem('coastcast-v50-state')||localStorage.getItem('coastcast-v40-state')||localStorage.getItem('coastcast-v31-state')||localStorage.getItem('coastcast-v30-state')||localStorage.getItem('coastcast-v23-state')||localStorage.getItem('coastcast-v22-state')||localStorage.getItem('coastcast-v21-state')||localStorage.getItem('coastcast-v20-state')||localStorage.getItem('coastcast-v18-state')||localStorage.getItem('coastcast-v17-state')||localStorage.getItem('coastcast-v16-state')||localStorage.getItem('coastcast-v15-state')||localStorage.getItem('coastcast-v14-state')||localStorage.getItem('coastcast-v13-state')||localStorage.getItem('coastcast-v12-state')||localStorage.getItem('coastcast-v11-state')||localStorage.getItem('coastcast-v10-state')||localStorage.getItem('coastcast-v9-state')||localStorage.getItem('coastcast-v8-state')||localStorage.getItem('coastcast-v7-state')||localStorage.getItem('coastcast-v6-state')||localStorage.getItem('coastcast-v5-state')||localStorage.getItem('coastcast-v4-state')||localStorage.getItem('coastcast-v3-state')||localStorage.getItem('coastcast-state-v1');
        if(!raw) return;
        const saved=JSON.parse(raw);
        if(saved.location) this.state.location=saved.location;
        if(typeof saved.live==='boolean') this.state.live=saved.live;
        if(saved.radius) this.state.radius=Number(saved.radius);
        if(saved.tackleRadius) this.state.tackleRadius=Number(saved.tackleRadius);
        try{this.state.geoapifyKey=localStorage.getItem('coastcast-geoapify-key')||'';}catch(_){this.state.geoapifyKey='';}
        if(saved.fishingStyle) this.state.fishingStyle=saved.fishingStyle;
        if(saved.targetSpecies && this.species[saved.targetSpecies]) this.state.targetSpecies=saved.targetSpecies;
        if(Array.isArray(saved.waypoints)) this.state.waypoints=saved.waypoints;
        if(Array.isArray(saved.catches)) this.state.catches=saved.catches;
        if(Number.isFinite(saved.trips)) this.state.trips=saved.trips;
        if(Array.isArray(saved.savedTripPlans)) this.state.savedTripPlans=saved.savedTripPlans;
        if(Array.isArray(saved.alertRules)) this.state.alertRules=saved.alertRules;
        if(saved.profile&&typeof saved.profile==='object') this.state.profile={...this.state.profile,...saved.profile};
        if(saved.cloud&&typeof saved.cloud==='object') this.state.cloud={...this.state.cloud,...saved.cloud,password:undefined};
        if(saved.scout&&typeof saved.scout==='object') this.state.scout={...this.state.scout,...saved.scout,running:false};
        if(saved.goMode&&typeof saved.goMode==='object') this.state.goMode={...this.state.goMode,...saved.goMode,checks:{...this.state.goMode.checks,...(saved.goMode.checks||{})},history:Array.isArray(saved.goMode.history)?saved.goMode.history:[]};
        if(saved.gearPlan&&typeof saved.gearPlan==='object') this.state.gearPlan={checked:{},lastBuilt:null,...saved.gearPlan,checked:{...(saved.gearPlan.checked||{})}};
        if(saved.departure&&typeof saved.departure==='object') this.state.departure={...this.state.departure,...saved.departure};
        if(saved.regChecks&&typeof saved.regChecks==='object') this.state.regChecks={...saved.regChecks};
        if(Array.isArray(saved.tackleBox)) this.state.tackleBox=saved.tackleBox;
        if(Array.isArray(saved.shoppingList)) this.state.shoppingList=saved.shoppingList;
        if(Array.isArray(saved.offlinePacks)) this.state.offlinePacks=saved.offlinePacks;
        if(saved.community&&typeof saved.community==='object') this.state.community={...this.state.community,...saved.community,reactions:{...(saved.community.reactions||{})},publishedLocalIds:Array.isArray(saved.community.publishedLocalIds)?saved.community.publishedLocalIds:[],challengeClaims:{...(saved.community.challengeClaims||{})}};
        if(saved.command&&typeof saved.command==='object') this.state.command={...this.state.command,...saved.command};
        if(saved.watchCenter&&typeof saved.watchCenter==='object') this.state.watchCenter={...this.state.watchCenter,...saved.watchCenter,running:false,results:Array.isArray(saved.watchCenter.results)?saved.watchCenter.results:[]};
        if(saved.oceanNetwork&&typeof saved.oceanNetwork==='object') this.state.oceanNetwork={...this.state.oceanNetwork,...saved.oceanNetwork,status:saved.oceanNetwork.status==='loading'?'idle':saved.oceanNetwork.status,history:Array.isArray(saved.oceanNetwork.history)?saved.oceanNetwork.history:[]};
        if(saved.experience&&typeof saved.experience==='object') this.state.experience={...this.state.experience,...saved.experience};
        if(saved.membership&&typeof saved.membership==='object') this.state.membership={...this.state.membership,...saved.membership,betaFullAccess:true};
        if(saved.backend&&typeof saved.backend==='object') this.state.backend={...this.state.backend,...saved.backend,familyMembers:Array.isArray(saved.backend.familyMembers)?saved.backend.familyMembers:[]};
        if(saved.seasonal&&typeof saved.seasonal==='object') this.state.seasonal={...this.state.seasonal,...saved.seasonal};
        if(saved.familyCrew&&typeof saved.familyCrew==='object') this.state.familyCrew={...this.state.familyCrew,...saved.familyCrew,members:Array.isArray(saved.familyCrew.members)?saved.familyCrew.members:[]};
        if(saved.liveUpdatedAt) this.state.liveUpdatedAt=saved.liveUpdatedAt;
        if(this.state.cloud.session&&this.state.cloud.session.expires_at&&Number(this.state.cloud.session.expires_at)*1000<Date.now()&&!this.state.cloud.session.refresh_token) this.state.cloud.session=null;
      }catch(_){ }
    },

    save(){
      const payload={
        live:this.state.live,location:this.state.location,radius:this.state.radius,tackleRadius:this.state.tackleRadius,
        fishingStyle:this.state.fishingStyle,targetSpecies:this.state.targetSpecies,
        waypoints:this.state.waypoints,catches:this.state.catches,trips:this.state.trips,savedTripPlans:this.state.savedTripPlans,alertRules:this.state.alertRules,
        profile:this.state.profile,
        cloud:{url:this.state.cloud.url,anonKey:this.state.cloud.anonKey,email:this.state.cloud.email,autoSync:this.state.cloud.autoSync,session:this.state.cloud.session,lastSync:this.state.cloud.lastSync},
        scout:{radius:this.state.scout.radius,period:this.state.scout.period,species:this.state.scout.species,results:this.state.scout.results,compareIds:this.state.scout.compareIds,lastRun:this.state.scout.lastRun},
        goMode:this.state.goMode,
        gearPlan:this.state.gearPlan,
        departure:this.state.departure,
        regChecks:this.state.regChecks,
        tackleBox:this.state.tackleBox,
        shoppingList:this.state.shoppingList,
        offlinePacks:this.state.offlinePacks,
        community:this.state.community,
        command:this.state.command,watchCenter:this.state.watchCenter,oceanNetwork:this.state.oceanNetwork,experience:this.state.experience,membership:this.state.membership,backend:this.state.backend,seasonal:this.state.seasonal,familyCrew:this.state.familyCrew,liveUpdatedAt:this.state.liveUpdatedAt
      };
      try{ localStorage.setItem('coastcast-v50-state',JSON.stringify(payload)); }catch(_){ }
      if(this.state.cloud?.autoSync&&this.cloudSignedIn()) this.queueCloudSync();
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
      if(view==='forecast'){this.renderForecast();this.renderCatchTimeline();this.renderTideWeek();this.renderOpportunityMatrix();this.renderSeasonCalendar();setTimeout(()=>this.renderTides(),20);}
      if(view==='map') setTimeout(()=>{this.ensureMap();this.renderMapLayers();this.renderSpotIntelligence();this.renderScout();if(!this.state.mapPOIs.length&&this.state.mapPlacesStatus==='idle')this.loadMapPlaces(false);},50);
      if(view==='trips'){this.renderTrips();this.renderCoastWatch();this.renderTripCalendar();this.renderSeasonTripPlanner();this.renderSmartDeparture();this.renderGoMode();this.renderGearPlanner();this.renderTripSafety();this.renderTackleBox();this.renderOfflinePacks();this.renderMissionControl();}
      if(view==='logbook'){this.renderLogbook();this.renderPhotoMemories();this.renderAnglerAnalytics();}
      if(view==='community'){this.renderCommunity();this.loadCloudCommunity({quiet:true});}
      if(view==='profile'){this.renderProfile();this.renderMembership();this.renderFamilyCrew();this.renderPremiumValue();}
    },

    bindControls(){
      document.addEventListener('click',e=>{const gated=e.target.closest?.('[data-premium]');if(!gated||this.hasPremium())return;e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();this.showToast(`${gated.dataset.premium||'This tool'} is part of AnglerSignal Premium.`);this.openMembershipDialog();},true);
      this.$('quickBuildPlanBtn')?.addEventListener('click',()=>this.buildCommandPlan({navigateToTrips:true}));
      this.$('quickDetailsBtn')?.addEventListener('click',()=>this.setExperienceMode('full',true));
      this.$('quickSimpleBtn')?.addEventListener('click',()=>this.setExperienceMode(this.state.experience?.mode==='simple'?'full':'simple',true));
      this.$('manageMembershipBtn')?.addEventListener('click',()=>this.openMembershipDialog());
      this.$('applyMembershipPreviewBtn')?.addEventListener('click',()=>this.applyMembershipPreview());
      this.$('seasonCalendarShortcutBtn')?.addEventListener('click',()=>{this.navigate('forecast');setTimeout(()=>this.$('seasonCalendarPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),120);});
      this.$('seasonCalendarGrid')?.addEventListener('click',e=>this.handleSeasonCalendarClick(e));
      this.$('seasonTripUseBtn')?.addEventListener('click',()=>this.useStrongestSeasonTarget());
            this.$('addFamilyMemberBtn')?.addEventListener('click',()=>this.addFamilyMemberPreview());
      this.$('familyDialogList')?.addEventListener('click',e=>this.handleFamilyCrewClick(e));
      this.$('familyShareTrips')?.addEventListener('change',e=>{this.state.familyCrew.shareTrips=!!e.target.checked;this.save();this.renderFamilyCrew();});
      this.$('familyShareFavorites')?.addEventListener('change',e=>{this.state.familyCrew.shareFavorites=!!e.target.checked;this.save();this.renderFamilyCrew();});

      this.$('experienceModeSetting')?.addEventListener('change',e=>this.setExperienceMode(e.target.value,false));
      this.$('locationTitleBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('mapSearchBtn').addEventListener('click',()=>this.openDialog('locationDialog'));
      this.$('settingsBtn').addEventListener('click',()=>this.openSettings());
      this.$('profileBtn')?.addEventListener('click',()=>this.navigate('profile'));
      this.$('destinationScanBtn')?.addEventListener('click',()=>{this.navigate('map');setTimeout(()=>this.loadMapPlaces(true),180);});
      this.$('destinationTackleBtn')?.addEventListener('click',()=>{this.navigate('map');setTimeout(()=>this.loadNearbyShops(true),180);});
      this.$('dailyBriefForecastBtn')?.addEventListener('click',()=>this.navigate('forecast'));
      this.$('dailyBriefTripBtn')?.addEventListener('click',()=>this.buildCommandPlan({navigateToTrips:true}));
      this.$('syncBtn').addEventListener('click',()=>this.state.live?this.loadLiveData():this.showToast('Turn on Live Data to refresh internet forecasts.'));
      this.$('liveModeBtn').addEventListener('click',()=>{const s=this.overallDataStatus();if(this.state.live&&s!=='live')this.loadLiveData();else this.setLiveMode(!this.state.live);});
      this.$('liveModeToggle').addEventListener('change',e=>this.setLiveMode(e.target.checked));
      this.$('favoriteSpotBtn').addEventListener('click',()=>this.quickSaveSpot());
      this.$('speciesInfoBtn').addEventListener('click',()=>this.openDialog('infoDialog'));
      this.$('scoreBreakdownBtn')?.addEventListener('click',()=>this.$('scoreFactors')?.scrollIntoView({behavior:'smooth',block:'center'}));
      this.$('quickPlanBtn').addEventListener('click',()=>this.openPlanner());
      this.$('plannerBtn').addEventListener('click',()=>this.openPlanner());
      this.$('findBestTripBtn').addEventListener('click',()=>this.findBestTrip());
      this.$('readinessTripBtn')?.addEventListener('click',()=>{this.navigate('trips');setTimeout(()=>this.$('departureDrive')?.focus(),80);});
      this.$('calculateDepartureBtn')?.addEventListener('click',()=>this.updateDeparturePreferences(true));
      this.$('shareDepartureBtn')?.addEventListener('click',()=>this.shareDepartureBrief());
      ['departureDrive','departureSetup','departureBaitStop'].forEach(id=>this.$(id)?.addEventListener('change',()=>this.updateDeparturePreferences(false)));
      this.$('topWindowCards')?.addEventListener('click',e=>{const b=e.target.closest('[data-catch-window]');if(b)this.chooseCatchWindow(Number(b.dataset.catchWindow));});
      this.$('homePlanBtn')?.addEventListener('click',()=>this.openPlanner());
      this.$('homeSaveBtn')?.addEventListener('click',()=>this.quickSaveSpot());
      this.$('homeAlertBtn')?.addEventListener('click',()=>this.openAlertDialog());
      this.$('homeMapBtn')?.addEventListener('click',()=>this.navigate('map'));
      this.$('homeCreateAlertBtn')?.addEventListener('click',()=>this.openAlertDialog());
      this.$('tripsPlanBtn')?.addEventListener('click',()=>this.openPlanner());
      this.$('tripHubPlanBtn')?.addEventListener('click',()=>this.openPlanner());
      this.$('tripHubAlertBtn')?.addEventListener('click',()=>this.openAlertDialog());
      this.$('scanFavoritesBtn')?.addEventListener('click',()=>this.runCoastWatch());
      this.$('calendarRefreshBtn')?.addEventListener('click',()=>this.runCoastWatch());
      this.$('refreshOceanNetworkBtn')?.addEventListener('click',()=>this.refreshOceanNetwork());
      this.$('openOceanStationBtn')?.addEventListener('click',()=>this.openOceanStation());
      this.$('tripOceanRefreshBtn')?.addEventListener('click',()=>this.refreshOceanNetwork());
      this.$('coastWatchResults')?.addEventListener('click',e=>this.handleCoastWatchClick(e));
      this.$('tripCalendarGrid')?.addEventListener('click',e=>this.handleTripCalendarClick(e));
      this.$('createAlertBtn')?.addEventListener('click',()=>this.openAlertDialog());
      this.$('tripsMapBtn')?.addEventListener('click',()=>this.navigate('map'));
      this.$('openCommunityBtn')?.addEventListener('click',()=>this.navigate('community'));
      this.$('saveAlertBtn')?.addEventListener('click',()=>this.saveAlertRule());
      this.$('enableNotificationsBtn')?.addEventListener('click',()=>this.requestNotificationPermission());
      this.$('savedTripList')?.addEventListener('click',e=>this.handleTripHubClick(e));
      this.$('favoriteSpotList')?.addEventListener('click',e=>this.handleTripHubClick(e));
      this.$('alertRuleList')?.addEventListener('click',e=>this.handleTripHubClick(e));
      this.$('openRegsBtn')?.addEventListener('click',()=>this.openOfficialRegulations());
      this.$('openLicenseBtn')?.addEventListener('click',()=>window.open('https://www.fws.gov/initiative/fishing/buy-fishing-license','_blank','noopener'));
      this.$('markRegsCheckedBtn')?.addEventListener('click',()=>this.markRegulationsChecked());
      this.$('baitUseTripBtn')?.addEventListener('click',()=>this.useBaitPlanForTrip());
      this.$('baitShopShortcutBtn')?.addEventListener('click',()=>this.openBaitShopShortcut());
      this.$('gearUseBaitBtn')?.addEventListener('click',()=>this.useBaitPlanForTrip());
      this.$('gearResetBtn')?.addEventListener('click',()=>this.resetGearChecks());
      this.$('gearPlanList')?.addEventListener('change',e=>this.handleGearCheck(e));
      this.$('refreshSafetyBtn')?.addEventListener('click',()=>this.refreshSafety());
      this.$('tripSafetyRefreshBtn')?.addEventListener('click',()=>this.refreshSafety());
      this.$('openNwsBtn')?.addEventListener('click',()=>window.open('https://www.weather.gov/','_blank','noopener'));
      this.$('speciesRankList')?.addEventListener('click',e=>{const b=e.target.closest('[data-target-ranked-species]');if(b)this.setSpecies(b.dataset.targetRankedSpecies);});
      this.$('useMyLocationSheetBtn').addEventListener('click',()=>this.useMyLocation());
      this.$('locationSearchGoBtn').addEventListener('click',()=>this.searchLocations());
      this.$('locationSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.searchLocations();}});
      this.$('mapRecenterBtn').addEventListener('click',()=>this.recenterMap());
      this.$('scanAreaBtn')?.addEventListener('click',()=>this.loadMapPlaces(true));
      this.$('runScoutBtn')?.addEventListener('click',()=>this.runScout());
      this.$('scoutSpecies')?.addEventListener('change',e=>{this.state.scout.species=e.target.value;this.save();});
      this.$('scoutRadius')?.addEventListener('change',e=>{this.state.scout.radius=Number(e.target.value);this.save();});
      this.$('scoutPeriod')?.addEventListener('change',e=>{this.state.scout.period=e.target.value;this.save();});
      this.$('scoutResults')?.addEventListener('click',e=>this.handleScoutClick(e));
      this.$('clearCompareBtn')?.addEventListener('click',()=>this.clearScoutCompare());
      this.$('compareSpotsBtn')?.addEventListener('click',()=>this.openScoutCompare());
      this.$('compareAnalyzeWinnerBtn')?.addEventListener('click',()=>this.useScoutWinner(false));
      this.$('comparePlanWinnerBtn')?.addEventListener('click',()=>this.useScoutWinner(true));
      this.$('startGoModeBtn')?.addEventListener('click',()=>this.startGoMode());
      this.$('quickSessionCatchBtn')?.addEventListener('click',()=>this.openSessionCatch());
      this.$('goModeShopBtn')?.addEventListener('click',()=>this.openGoShopRoute());
      this.$('goModeSpotBtn')?.addEventListener('click',()=>this.openGoSpotRoute());
      this.$('endGoModeBtn')?.addEventListener('click',()=>this.endGoMode());
      this.$('goModeChecklist')?.addEventListener('change',e=>this.handleGoChecklist(e));
      this.$('topSpotAnalyzeBtn')?.addEventListener('click',()=>{if(this.state.selectedIntelSpot)this.analyzeMapPlace(this.state.selectedIntelSpot.id);});
      this.$('topSpotSaveBtn')?.addEventListener('click',()=>{if(this.state.selectedIntelSpot)this.saveMapPlace(this.state.selectedIntelSpot.id);});
      this.$('spotIntelList')?.addEventListener('click',e=>{const analyze=e.target.closest('[data-analyze-poi]'),save=e.target.closest('[data-save-poi]');if(analyze)this.analyzeMapPlace(analyze.dataset.analyzePoi);if(save)this.saveMapPlace(save.dataset.savePoi);});
      this.$('leafletMap')?.addEventListener('click',e=>{const analyze=e.target.closest?.('[data-map-analyze]'),save=e.target.closest?.('[data-map-save]');if(analyze)this.analyzeMapPlace(analyze.dataset.mapAnalyze);if(save)this.saveMapPlace(save.dataset.mapSave);});
      this.$('addWaypointBtn').addEventListener('click',()=>this.openWaypointDialog());
      this.$('saveWaypointBtn').addEventListener('click',()=>this.saveWaypoint());
      this.$('refreshShopsBtn').addEventListener('click',()=>this.loadNearbyShops(true));
      this.$('logCatchBtn').addEventListener('click',()=>this.openCatchDialog());
      this.$('shareCatchBtn').addEventListener('click',()=>this.openShareCatchDialog());
      this.$('saveCatchBtn').addEventListener('click',()=>this.saveCatch());
      this.$('catchPhotoInput')?.addEventListener('change',e=>this.handleCatchPhotoInput(e));
      this.$('removeCatchPhotoBtn')?.addEventListener('click',()=>this.clearCatchPhoto());
      this.$('addTackleBtn')?.addEventListener('click',()=>this.openTackleDialog());
      this.$('saveTackleBtn')?.addEventListener('click',()=>this.saveTackleItem());
      this.$('tackleInventory')?.addEventListener('click',e=>this.handleTackleClick(e));
      this.$('generateShoppingBtn')?.addEventListener('click',()=>this.generateShoppingList());
      this.$('shoppingList')?.addEventListener('change',e=>this.handleShoppingCheck(e));
      this.$('shoppingList')?.addEventListener('click',e=>this.handleShoppingClick(e));
      this.$('saveOfflinePackBtn')?.addEventListener('click',()=>this.saveOfflinePack());
      this.$('offlinePackList')?.addEventListener('click',e=>this.handleOfflinePackClick(e));
      this.$('targetSpecies').addEventListener('change',e=>this.setSpecies(e.target.value));
      this.$('logPrivacyFilter').addEventListener('change',()=>this.renderCatchList());
      this.$('catchList')?.addEventListener('click',e=>{const b=e.target.closest('[data-share-catch]');if(b)this.openShareCatchDialog(b.dataset.shareCatch);});
      this.$('communitySpeciesFilter').addEventListener('change',()=>this.renderCommunity());
      this.$('communityRadiusFilter').addEventListener('change',()=>this.renderCommunity());
      this.$$('.community-tab').forEach(b=>b.addEventListener('click',()=>this.setCommunityTab(b.dataset.communityTab)));
      this.$('communityRefreshBtn')?.addEventListener('click',()=>this.loadCloudCommunity({quiet:false}));
      this.$('communityFeed')?.addEventListener('click',e=>this.handleCommunityFeedClick(e));
      this.$('shareCatchSelect')?.addEventListener('change',()=>this.renderShareCatchPreview());
      this.$('shareLocationPrecision')?.addEventListener('change',()=>this.renderShareCatchPreview());
      this.$('shareCatchCaption')?.addEventListener('input',()=>this.renderShareCatchPreview());
      this.$('generateCatchCardBtn')?.addEventListener('click',()=>this.generateCatchCard());
      this.$('shareCatchImageBtn')?.addEventListener('click',()=>this.shareCatchImage());
      this.$('publishCommunityBtn')?.addEventListener('click',()=>this.publishCatchToCommunity());
      this.$('refreshChecklistBtn').addEventListener('click',()=>{this.renderChecklist();this.showToast('Trip checklist refreshed.');});
      this.$('radiusSetting').addEventListener('change',e=>{this.state.radius=Number(e.target.value);this.save();});
      this.$('tackleRadiusSetting')?.addEventListener('change',e=>{this.state.tackleRadius=Math.max(5,Math.min(50,Number(e.target.value)||20));this.clearShopCache();this.save();});
      this.$('geoapifyKeySetting')?.addEventListener('change',e=>{this.state.geoapifyKey=String(e.target.value||'').trim();try{if(this.state.geoapifyKey)localStorage.setItem('coastcast-geoapify-key',this.state.geoapifyKey);else localStorage.removeItem('coastcast-geoapify-key');}catch(_){}this.clearShopCache();this.renderPlacesProviderStatus();});
      this.$('testPlacesProviderBtn')?.addEventListener('click',()=>this.loadNearbyShops(true));
      this.$('fishingStyleSetting').addEventListener('change',e=>{this.state.fishingStyle=e.target.value;this.save();this.recalculateScores();this.renderAll();});
      this.$('resetAppBtn').addEventListener('click',()=>this.resetApp());
      this.$('editProfileBtn')?.addEventListener('click',()=>this.openProfileEditor());
      this.$('saveProfileBtn')?.addEventListener('click',()=>this.saveProfile());
      this.$('profileSettingsBtn')?.addEventListener('click',()=>this.openSettings());
      this.$('exportBackupBtn')?.addEventListener('click',()=>this.exportBackup());
      this.$('importBackupBtn')?.addEventListener('click',()=>this.$('importBackupInput')?.click());
      this.$('importBackupInput')?.addEventListener('change',e=>this.importBackupFile(e));
      this.$('cloudSetupBtn')?.addEventListener('click',()=>this.openCloudSetup());
      this.$('cloudSetupSecondaryBtn')?.addEventListener('click',()=>this.openCloudSetup());
      this.$('cloudSignInBtn')?.addEventListener('click',()=>this.cloudSignIn());
      this.$('cloudSignUpBtn')?.addEventListener('click',()=>this.cloudSignUp());
      this.$('cloudSignOutBtn')?.addEventListener('click',()=>this.cloudSignOut());
      this.$('cloudSyncNowBtn')?.addEventListener('click',()=>this.cloudPush({manual:true}));
      this.$('cloudPullBtn')?.addEventListener('click',()=>this.cloudPull());
      this.$('cloudAutoSyncToggle')?.addEventListener('change',e=>{this.state.cloud.autoSync=!!e.target.checked;this.save();this.renderProfile();});
      this.$('refreshServerAccessBtn')?.addEventListener('click',()=>this.refreshServerAccess({quiet:false}));
      this.$('deleteAccountBtn')?.addEventListener('click',()=>this.openDeleteAccountDialog());
      this.$('confirmDeleteAccountBtn')?.addEventListener('click',()=>this.deleteAnglerSignalAccount());
      this.$('acceptFamilyInviteBtn')?.addEventListener('click',()=>this.acceptFamilyInvite());
      this.$('manageFamilyCrewBtn')?.addEventListener('click',()=>this.openFamilyCrewServer());
      this.$('familyServerInviteBtn')?.addEventListener('click',()=>this.serverFamilyInvite());
      this.$('familyServerList')?.addEventListener('click',e=>{const b=e.target.closest('[data-remove-family]');if(b)this.serverFamilyRemove(Number(b.dataset.removeFamily));});
      this.$('openAdminConsoleBtn')?.addEventListener('click',()=>this.openAdminConsole());
      this.$('adminGrantBtn')?.addEventListener('click',()=>this.adminGrantAccess());
      this.$('adminRevokeBtn')?.addEventListener('click',()=>this.adminRevokeAccess());
      this.$('adminRefreshBtn')?.addEventListener('click',()=>this.adminLoadAccessList());
      this.$$('.command-mode').forEach(btn=>btn.addEventListener('click',()=>this.setCommandMode(btn.dataset.commandMode)));
      this.$('commandBuildBtn')?.addEventListener('click',()=>this.buildCommandPlan({navigateToTrips:true}));
      this.$('commandScoutBtn')?.addEventListener('click',()=>{this.navigate('map');setTimeout(()=>{if(!(this.state.scout?.results||[]).length)this.runScout();},120);});
      this.$('opportunityMatrix')?.addEventListener('click',e=>this.handleMatrixClick(e));
      this.$('missionBuildBtn')?.addEventListener('click',()=>this.buildCommandPlan({navigateToTrips:false,toast:true}));
      this.$('missionLaunchBtn')?.addEventListener('click',()=>this.launchCommandTrip());
      this.$('missionShareBtn')?.addEventListener('click',()=>this.shareCommandBrief());
      this.$$('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>this.setMapFilter(btn.dataset.mapFilter,btn)));
    },

    openDialog(id){
      const d=this.$(id); if(d && typeof d.showModal==='function') d.showModal();
    },
    closeDialog(id){ const d=this.$(id); if(d?.open) d.close(); },

    openSettings(){
      this.$('liveModeToggle').checked=this.state.live;
      this.$('radiusSetting').value=String(this.state.radius);
      if(this.$('tackleRadiusSetting'))this.$('tackleRadiusSetting').value=String(this.state.tackleRadius||20);
      if(this.$('geoapifyKeySetting'))this.$('geoapifyKeySetting').value=this.state.geoapifyKey||'';
      this.$('fishingStyleSetting').value=this.state.fishingStyle;
      if(this.$('experienceModeSetting'))this.$('experienceModeSetting').value=this.state.experience?.mode||'simple';
      this.renderPlacesProviderStatus();
      this.openDialog('settingsDialog');
    },

    openPlanner(){
      this.$('tripSpecies').value=this.state.targetSpecies;
      this.$('plannerResult').textContent='Choose your preferences and AnglerSignal will rank the week for that species.';
      this.openDialog('plannerDialog');
    },

    openAlertDialog(){
      if(this.$('alertLocationName')) this.$('alertLocationName').textContent=this.state.location.name;
      if(this.$('alertSpecies')) this.$('alertSpecies').value=this.state.targetSpecies;
      if(this.$('alertScoreThreshold')) this.$('alertScoreThreshold').value='85';
      if(this.$('alertMaxWind')) this.$('alertMaxWind').value='15';
      if(this.$('alertDays')) this.$('alertDays').value='7';
      const b=this.$('enableNotificationsBtn');if(b)b.textContent=(typeof Notification!=='undefined'&&Notification.permission==='granted')?'Device notifications enabled':'Enable device notifications';
      this.openDialog('alertDialog');
    },

    async requestNotificationPermission(){
      if(typeof Notification==='undefined'){this.showToast('Device notifications are not available in this browser.');return;}
      try{const result=await Notification.requestPermission();if(result==='granted'){this.showToast('Device notifications enabled for AnglerSignal checks.');const b=this.$('enableNotificationsBtn');if(b)b.textContent='Device notifications enabled';this.evaluateAlerts({notify:true});}else this.showToast('Notification permission was not enabled.');}catch(_){this.showToast('Could not request notification permission.');}
    },

    openWaypointDialog(){
      this.$('waypointName').value=this.state.location.name.replace(/,.*$/,'')+' spot';
      this.$('waypointNotes').value='';
      this.$('waypointPrivacy').value='private';
      this.openDialog('waypointDialog');
    },

    openCatchDialog(){
      this.clearCatchPhoto(false);
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
      ['targetSpecies','catchSpecies','tripSpecies','alertSpecies'].forEach(id=>{
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
      this.state.oceanNetwork={status:'idle',station:null,observation:null,history:[],lastChecked:null,error:null};
      this.state.mapPOIs=[];this.state.mapPlacesStatus='idle';this.state.selectedIntelSpot=null;this.state.scout.results=[];this.state.scout.compareIds=[];
      this.state.data=this.buildDemoData();
      this.renderAll();
      this.recenterMap();
      if(this.state.live) this.loadLiveData(); else {this.state.sourceHealth={weather:'demo',marine:'demo',tides:'demo',shops:'demo',alerts:'demo',buoy:'demo'};this.state.safetyAlerts=[];this.renderMode();this.renderSourceHealth();this.showToast('Fishing location updated. Turn on Live Data for real forecasts.');}
    },

    setLiveMode(enabled){
      this.state.live=!!enabled; this.save();
      this.$('liveModeToggle').checked=this.state.live;
      this.renderMode();
      if(this.state.live) this.loadLiveData();
      else{this.state.data=this.buildDemoData();this.state.selectedTideStation=null;this.state.sourceHealth={weather:'demo',marine:'demo',tides:'demo',shops:'demo',alerts:'demo',buoy:'demo'};this.state.safetyAlerts=[];this.recalculateScores();this.renderAll();this.showToast('Demo Data is on.');}
    },

    async loadLiveData({quiet=false}={}){
      if(this.state.loading) return;
      this.state.loading=true;
      this.state.sourceHealth={weather:'loading',marine:'loading',tides:'loading',shops:'loading',alerts:'loading',buoy:'loading'};
      this.renderMode();this.renderSourceHealth();
      this.$('syncBtn').classList.add('spinning');
      if(!quiet) this.showToast('Loading live coastal conditions…');
      const {lat,lon}=this.state.location;
      const base=this.buildDemoData();
      base.shops=[]; // Never show demo businesses while Live Data is enabled.
      const results=await Promise.allSettled([
        this.loadWeather(lat,lon),
        this.loadMarine(lat,lon),
        this.loadTides(lat,lon),
        this.loadNearbyShops(false),
        this.loadNWSAlerts(lat,lon),
        this.loadOceanNetwork(lat,lon)
      ]);
      const weather=results[0].status==='fulfilled'?results[0].value:null;
      const marine=results[1].status==='fulfilled'?results[1].value:null;
      const tideData=results[2].status==='fulfilled'?results[2].value:null;
      const shops=results[3].status==='fulfilled'&&Array.isArray(results[3].value)&&results[3].value.length?results[3].value:null;
      const alertData=results[4].status==='fulfilled'?results[4].value:null;
      const oceanData=results[5].status==='fulfilled'?results[5].value:null;
      if(oceanData)this.state.oceanNetwork=oceanData;else this.state.oceanNetwork={status:'fallback',station:null,observation:null,history:[],lastChecked:new Date().toISOString(),error:'NDBC observation feed unavailable'};
      this.state.safetyAlerts=alertData?.alerts||[];
      this.state.sourceHealth={weather:weather?'live':'fallback',marine:marine?'live':'fallback',tides:tideData?'live':'fallback',shops:shops?(shops.some(x=>x.verified)?'verified':'live'):'fallback',alerts:alertData?'live':'fallback',buoy:oceanData?.observation?'live':'fallback'};
      this.state.data=this.mergeLiveData(base,weather,marine,tideData,shops);
      this.recalculateScores();
      this.renderAll();
      this.renderMapLayers();
      this.state.loading=false;
      this.renderMode();this.renderSourceHealth();
      this.$('syncBtn').classList.remove('spinning');
      const liveCount=[weather,marine,tideData,shops,alertData,oceanData?.observation].filter(Boolean).length;
      this.state.liveUpdatedAt=new Date().toISOString();this.save();
      this.$('lastUpdated').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      if(!quiet) this.showToast(liveCount>=3?'Live coastal data updated.':`Live data partially updated (${liveCount}/6 sources). Fallbacks filled the gaps.`);
    },


    async fetchText(url,timeout=12000){
      const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
      try{const r=await fetch(url,{signal:ctrl.signal,headers:{'Accept':'text/plain,text/xml,application/rss+xml,*/*'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text();}finally{clearTimeout(timer);}
    },

    ndbcNumber(v){const s=String(v??'').trim();if(!s||/^(MM|N\/A|-99|999|9999|99\.0)$/i.test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null;},

    parseNdbcLatest(text,lat,lon){
      const lines=String(text||'').split(/\r?\n/).filter(Boolean);let header=null;
      for(const line of lines){if(/^#?STN\b/.test(line.trim())&&/\bLAT\b/.test(line)&&/\bLON\b/.test(line)){header=line.replace(/^#/,'').trim().split(/\s+/);break;}}
      if(!header)return null;const idx={};header.forEach((x,i)=>idx[x.replace(/^#/,'').toUpperCase()]=i);const rows=[];
      for(const line of lines){if(/^#/.test(line.trim()))continue;const p=line.trim().split(/\s+/);if(p.length<header.length-2)continue;const get=k=>p[idx[k]];const slat=this.ndbcNumber(get('LAT')),slon=this.ndbcNumber(get('LON'));if(slat==null||slon==null)continue;const id=get('STN');const dist=this.haversine(lat,lon,slat,slon);if(dist>300)continue;let yr=this.ndbcNumber(get('YY')??get('YYYY')),mo=this.ndbcNumber(get('MM')),dy=this.ndbcNumber(get('DD')),hh=this.ndbcNumber(get('HH')??get('hh')),mn=this.ndbcNumber(get('MN')??get('mm'));if(yr!=null&&yr<100)yr+=2000;let time=null;if([yr,mo,dy,hh].every(Number.isFinite)){time=new Date(Date.UTC(yr,mo-1,dy,hh,Number.isFinite(mn)?mn:0)).toISOString();}
        const obs={id,lat:slat,lon:slon,distance:dist,time,windDir:this.ndbcNumber(get('WDIR')),windMps:this.ndbcNumber(get('WSPD')),gustMps:this.ndbcNumber(get('GST')),waveM:this.ndbcNumber(get('WVHT')),period:this.ndbcNumber(get('DPD')),avgPeriod:this.ndbcNumber(get('APD')),waveDir:this.ndbcNumber(get('MWD')),pressureHpa:this.ndbcNumber(get('PRES')),airC:this.ndbcNumber(get('ATMP')),waterC:this.ndbcNumber(get('WTMP')),visibility:this.ndbcNumber(get('VIS')),tide:this.ndbcNumber(get('TIDE'))};
        const hasMarine=[obs.waveM,obs.waterC,obs.windMps].filter(x=>x!=null).length;rows.push({...obs,hasMarine});
      }
      rows.sort((a,b)=>{const pa=(a.hasMarine>=2?0:40)+(a.distance||999),pb=(b.hasMarine>=2?0:40)+(b.distance||999);return pa-pb;});return rows[0]||null;
    },

    parseNdbcStationHistory(text,id){
      const lines=String(text||'').split(/\r?\n/).filter(Boolean),head=lines.find(x=>/^#YY\b|^#YYYY\b/.test(x.trim()));if(!head)return[];const header=head.replace(/^#/,'').trim().split(/\s+/),idx={};header.forEach((x,i)=>idx[x.replace(/^#/,'').toUpperCase()]=i);const out=[];
      for(const line of lines){if(/^#/.test(line.trim()))continue;const p=line.trim().split(/\s+/);const get=k=>p[idx[k]];let yr=this.ndbcNumber(get('YY')??get('YYYY')),mo=this.ndbcNumber(get('MM')),dy=this.ndbcNumber(get('DD')),hh=this.ndbcNumber(get('HH')??get('hh')),mn=this.ndbcNumber(get('MN')??get('mm'));if(yr!=null&&yr<100)yr+=2000;if(![yr,mo,dy,hh].every(Number.isFinite))continue;const wave=this.ndbcNumber(get('WVHT')),wind=this.ndbcNumber(get('WSPD')),water=this.ndbcNumber(get('WTMP'));if(wave==null&&wind==null&&water==null)continue;out.push({id,time:new Date(Date.UTC(yr,mo-1,dy,hh,Number.isFinite(mn)?mn:0)).toISOString(),waveM:wave,windMps:wind,waterC:water,period:this.ndbcNumber(get('DPD')),pressureHpa:this.ndbcNumber(get('PRES'))});if(out.length>=36)break;
      }return out;
    },

    async loadCoopsOceanNetwork(lat,lon){
      const checked=new Date().toISOString();
      try{
        const urls=[
          'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=met',
          'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=watertemp'
        ];
        const settled=await Promise.allSettled(urls.map(u=>this.fetchJSON(u,14000)));
        const byId=new Map();
        for(const r of settled){
          if(r.status!=='fulfilled')continue;
          const rows=r.value?.stations||r.value?.stationList||[];
          for(const st of rows){
            const slat=Number(st.lat),slon=Number(st.lng??st.lon);
            if(!st?.id||!Number.isFinite(slat)||!Number.isFinite(slon))continue;
            const distance=this.haversine(lat,lon,slat,slon);
            if(distance>250)continue;
            const prev=byId.get(String(st.id))||{};
            byId.set(String(st.id),{...prev,...st,id:String(st.id),lat:slat,lon:slon,distance});
          }
        }
        const stations=[...byId.values()].sort((a,b)=>a.distance-b.distance).slice(0,10);
        if(!stations.length)throw new Error('No nearby NOAA CO-OPS observation station found');
        const getLatest=async(id,product)=>{
          const q=new URLSearchParams({date:'latest',station:id,product,units:'metric',time_zone:'gmt',application:'AnglerSignal',format:'json'});
          try{
            const d=await this.fetchJSON('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?'+q.toString(),8000);
            if(d?.error)return null;
            const row=Array.isArray(d?.data)?d.data[0]:null;
            return row||null;
          }catch(_){return null;}
        };
        for(const st of stations){
          const [wind,temp,press]=await Promise.all([getLatest(st.id,'wind'),getLatest(st.id,'water_temperature'),getLatest(st.id,'air_pressure')]);
          const windMps=this.ndbcNumber(wind?.s),windDir=this.ndbcNumber(wind?.d),gustMps=this.ndbcNumber(wind?.g),waterC=this.ndbcNumber(temp?.v),pressureHpa=this.ndbcNumber(press?.v);
          const available=[windMps,waterC,pressureHpa].filter(v=>v!=null).length;
          if(!available)continue;
          const times=[wind?.t,temp?.t,press?.t].filter(Boolean).map(t=>String(t).replace(' ','T')+'Z');
          let time=null;for(const t of times){const ms=Date.parse(t);if(Number.isFinite(ms)&&(!time||ms>Date.parse(time)))time=new Date(ms).toISOString();}
          const obs={id:st.id,lat:st.lat,lon:st.lon,distance:st.distance,time,windDir,windMps,gustMps,waveM:null,period:null,avgPeriod:null,waveDir:null,pressureHpa,airC:null,waterC,visibility:null,tide:null,provider:'CO-OPS'};
          return{status:'live',station:{id:st.id,name:st.name||`NOAA CO-OPS ${st.id}`,lat:st.lat,lon:st.lon,distance:st.distance,provider:'CO-OPS',url:`https://tidesandcurrents.noaa.gov/stationhome.html?id=${encodeURIComponent(st.id)}`},observation:obs,history:[],lastChecked:checked,error:null};
        }
        throw new Error('Nearby NOAA CO-OPS stations had no current meteorological/ocean observations');
      }catch(e){return{status:'fallback',station:null,observation:null,history:[],lastChecked:checked,error:String(e?.message||'CO-OPS observations unavailable')};}
    },

    async loadOceanNetwork(lat,lon){
      const checked=new Date().toISOString();
      let ndbcError=null;
      try{
        const text=await this.fetchText('https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt',10000);const obs=this.parseNdbcLatest(text,lat,lon);if(!obs)throw new Error('No nearby reporting NDBC station found');
        let history=[];try{history=this.parseNdbcStationHistory(await this.fetchText(`https://www.ndbc.noaa.gov/data/realtime2/${encodeURIComponent(obs.id)}.txt`,7000),obs.id);}catch(_){ }
        return{status:'live',station:{id:obs.id,name:`NDBC Station ${obs.id}`,lat:obs.lat,lon:obs.lon,distance:obs.distance,provider:'NDBC',url:`https://www.ndbc.noaa.gov/station_page.php?station=${encodeURIComponent(obs.id)}`},observation:{...obs,provider:'NDBC'},history,lastChecked:checked,error:null};
      }catch(e){ndbcError=String(e?.message||'NDBC browser fetch unavailable');}
      const coops=await this.loadCoopsOceanNetwork(lat,lon);
      if(coops?.observation){coops.error=ndbcError?`NDBC browser feed unavailable; using NOAA CO-OPS observed station instead.`:null;return coops;}
      return{status:'fallback',station:null,observation:null,history:[],lastChecked:checked,error:`Observed-ocean sources unavailable in this browser. NDBC: ${ndbcError||'unavailable'}; CO-OPS: ${coops?.error||'unavailable'}`};
    },

    async refreshOceanNetwork(){
      if(!this.state.live){this.showToast('Turn on Live Data first.');return;}const {lat,lon}=this.state.location;this.state.oceanNetwork={...this.state.oceanNetwork,status:'loading'};this.state.sourceHealth.buoy='loading';this.renderSourceHealth();this.renderOceanNetwork();
      const d=await this.loadOceanNetwork(lat,lon);this.state.oceanNetwork=d;this.state.sourceHealth.buoy=d.observation?'live':'fallback';this.save();this.renderSourceHealth();this.renderOceanNetwork();this.renderTripOceanCheck();this.renderCommandCenter();this.showToast(d.observation?`Ocean Network connected to ${d.station.provider||'NOAA'} ${d.station.id}.`:'No nearby NOAA observation could be loaded from this browser.');
    },

    oceanReality(){
      const net=this.state.oceanNetwork||{},o=net.observation,c=this.state.data?.current||{};if(!o)return{available:false,agreement:null,ageHours:null,distance:null};const waveObs=o.waveM==null?null:o.waveM*3.28084,windObs=o.windMps==null?null:o.windMps*2.23694,waterObs=o.waterC==null?null:o.waterC*9/5+32,pressureObs=o.pressureHpa;const waveFc=this.ndbcNumber(c.waveHeight),windFc=this.ndbcNumber(c.windSpeed),waterFc=this.ndbcNumber(c.waterTemp),pressureFc=this.ndbcNumber(c.pressure);const deltas={wave:waveObs!=null&&waveFc!=null?waveObs-waveFc:null,wind:windObs!=null&&windFc!=null?windObs-windFc:null,water:waterObs!=null&&waterFc!=null?waterObs-waterFc:null,pressure:pressureObs!=null&&pressureFc!=null?pressureObs-pressureFc:null};let penalty=0,count=0;if(deltas.wave!=null){penalty+=Math.min(45,Math.abs(deltas.wave)*13);count++;}if(deltas.wind!=null){penalty+=Math.min(35,Math.abs(deltas.wind)*2.5);count++;}if(deltas.water!=null){penalty+=Math.min(25,Math.abs(deltas.water)*2);count++;}if(deltas.pressure!=null){penalty+=Math.min(18,Math.abs(deltas.pressure)*1.8);count++;}const agreement=count?Math.max(20,Math.min(100,Math.round(100-penalty/count))):null;let ageHours=null;if(o.time){const t=new Date(o.time).getTime();if(Number.isFinite(t))ageHours=Math.max(0,(Date.now()-t)/3600000);}return{available:true,agreement,ageHours,distance:net.station?.distance??o.distance,waveObs,windObs,waterObs,pressureObs,waveFc,windFc,waterFc,pressureFc,deltas,station:net.station,history:net.history||[]};
    },

    oceanDeltaText(delta,unit){if(delta==null)return'Forecast comparison unavailable';const a=Math.abs(delta),dir=delta>0?'higher':'lower';return a<0.15&&unit==='ft'?'Matches forecast closely':a<0.5&&unit==='mph'?'Matches forecast closely':`${this.fmt(a,unit==='°F'?0:1)} ${unit} ${dir} than forecast`;},

    openOceanStation(){const s=this.state.oceanNetwork?.station;const url=s?.url||`https://www.ndbc.noaa.gov/?lat=${encodeURIComponent(this.state.location.lat)}&lon=${encodeURIComponent(this.state.location.lon)}&zoom=6`;window.open(url,'_blank','noopener');},

    renderOceanNetwork(){
      if(!this.$('oceanNetworkPanel'))return;const r=this.oceanReality(),net=this.state.oceanNetwork||{},badge=this.$('oceanNetworkBadge');const status=net.status||'idle';badge.textContent=status==='live'?'OBSERVED LIVE':status==='loading'?'CHECKING':status==='fallback'?'FORECAST ONLY':'NOT CHECKED';badge.className=`tiny-pill ${status==='live'?'ready-pill':status==='loading'?'caution-pill':''}`;
      if(!r.available){this.$('oceanStationName').textContent=status==='loading'?'Searching NOAA observation networks…':'No observation station loaded';this.$('oceanStationMeta').textContent=net.error||'Live forecasts still work even when an observation station is unavailable.';['oceanAgreementScore','oceanObsWind','oceanObsWave','oceanObsWater','oceanObsPressure'].forEach(id=>this.$(id).textContent='—');this.$('oceanWindDelta').textContent='Forecast only';this.$('oceanWaveDelta').textContent='Forecast only';this.$('oceanWaterDelta').textContent='Forecast only';this.$('oceanObsAge').textContent='Observation —';this.$('oceanNetworkCall').textContent='Forecast model is not currently verified by a nearby NOAA observation in this browser.';this.renderForecastTruth();this.drawOceanObservationChart();return;}
      this.$('oceanStationName').textContent=r.station?.name||`NDBC Station ${net.observation.id}`;this.$('oceanStationMeta').textContent=`${r.station?.provider||'NOAA'} station ${net.observation.id} • ${this.fmt(r.distance,0)} mi from fishing spot • measured coastal/ocean conditions`;this.$('oceanAgreementScore').textContent=r.agreement??'—';this.$('oceanObsWind').textContent=r.windObs==null?'—':`${this.fmt(r.windObs,0)} mph`;this.$('oceanObsWave').textContent=r.waveObs==null?'—':`${this.fmt(r.waveObs,1)} ft`;this.$('oceanObsWater').textContent=r.waterObs==null?'—':`${this.fmt(r.waterObs,0)}°F`;this.$('oceanObsPressure').textContent=r.pressureObs==null?'—':`${this.fmt(this.hpaToInHg(r.pressureObs),2)} in`;this.$('oceanWindDelta').textContent=this.oceanDeltaText(r.deltas.wind,'mph');this.$('oceanWaveDelta').textContent=this.oceanDeltaText(r.deltas.wave,'ft');this.$('oceanWaterDelta').textContent=this.oceanDeltaText(r.deltas.water,'°F');this.$('oceanObsAge').textContent=r.ageHours==null?'Observation time unavailable':`${this.fmt(r.ageHours,1)} hr old`;
      let call='Observed conditions broadly support the loaded marine forecast.';if(r.agreement!=null&&r.agreement<60)call='The observed station and model are diverging. Recheck surf and wind before committing to the trip.';else if(r.ageHours!=null&&r.ageHours>4)call='The station observation is getting stale. Treat the forecast as primary until a fresher report arrives.';else if(r.distance!=null&&r.distance>100)call='The nearest reporting station is distant. Use the observation as regional context, not a beach measurement.';this.$('oceanNetworkCall').textContent=call;this.renderForecastTruth();this.drawOceanObservationChart();
    },

    renderForecastTruth(){
      if(!this.$('forecastTruthPanel'))return;const r=this.oceanReality(),badge=this.$('forecastTruthBadge');if(!r.available){badge.textContent=this.state.oceanNetwork?.status==='loading'?'CHECKING':'NO STATION';this.$('forecastTruthSummary').textContent='The marine forecast is loaded without a nearby observed-ocean comparison.';[['truthWind','truthWindNote'],['truthWave','truthWaveNote'],['truthWater','truthWaterNote'],['truthPressure','truthPressureNote']].forEach(([a,b])=>{this.$(a).textContent='—';this.$(b).textContent='Forecast only';});return;}badge.textContent=`${r.agreement??'—'}% AGREEMENT`;badge.className=`tiny-pill ${r.agreement>=75?'ready-pill':r.agreement>=55?'caution-pill':'danger-pill'}`;this.$('forecastTruthSummary').textContent=`Station ${r.station?.id||''} is ${this.fmt(r.distance,0)} miles from the selected fishing location. AnglerSignal is comparing its most recent observation with the current forecast model.`;const pair=(id,note,obs,fc,unit,dec=0)=>{this.$(id).textContent=obs==null?'—':`${this.fmt(obs,dec)}${unit}`;this.$(note).textContent=fc==null?'Forecast —':`Forecast ${this.fmt(fc,dec)}${unit}`;};pair('truthWind','truthWindNote',r.windObs,r.windFc,' mph',0);pair('truthWave','truthWaveNote',r.waveObs,r.waveFc,' ft',1);pair('truthWater','truthWaterNote',r.waterObs,r.waterFc,'°F',0);pair('truthPressure','truthPressureNote',r.pressureObs==null?null:this.hpaToInHg(r.pressureObs),r.pressureFc==null?null:this.hpaToInHg(r.pressureFc),' in',2);
    },

    drawOceanObservationChart(){
      const cv=this.$('oceanObservationCanvas');if(!cv)return;const ctx=cv.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||900,h=250;cv.width=w*dpr;cv.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);const hist=(this.state.oceanNetwork?.history||[]).filter(x=>x.waveM!=null).slice(0,18).reverse();if(hist.length<2){ctx.fillStyle='rgba(220,242,250,.55)';ctx.font='14px sans-serif';ctx.fillText('Recent NDBC wave history is unavailable in this browser.',18,34);if(this.$('oceanHistoryNote'))this.$('oceanHistoryNote').textContent='Observation trend unavailable.';return;}const vals=hist.map(x=>x.waveM*3.28084),max=Math.max(2,...vals)*1.15,min=0,pad=28;ctx.strokeStyle='rgba(117,220,235,.16)';ctx.lineWidth=1;for(let i=0;i<4;i++){const y=pad+(h-pad*2)*i/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke();}ctx.strokeStyle='#44d7e8';ctx.lineWidth=3;ctx.beginPath();vals.forEach((v,i)=>{const x=pad+(w-pad*2)*(i/(vals.length-1)),y=h-pad-(v-min)/(max-min)*(h-pad*2);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.fillStyle='rgba(79,223,181,.18)';ctx.lineTo(w-pad,h-pad);ctx.lineTo(pad,h-pad);ctx.closePath();ctx.fill();if(this.$('oceanHistoryNote'))this.$('oceanHistoryNote').textContent=`${hist.length} recent observations • newest ${this.formatDestinationDate(hist[hist.length-1].time,{hour:'numeric',minute:'2-digit'})}`;
    },

    renderTripOceanCheck(){
      if(!this.$('tripOceanSummary'))return;const r=this.oceanReality(),badge=this.$('tripOceanBadge');if(!r.available){badge.textContent='FORECAST ONLY';this.$('tripOceanSummary').textContent='No nearby NOAA observed station is loaded. Your live model forecast remains available.';this.$('tripOceanAgreement').textContent='—';this.$('tripOceanDistance').textContent='—';this.$('tripOceanAge').textContent='—';return;}badge.textContent=r.agreement>=75?'MATCHING':r.agreement>=55?'RECHECK':'DIVERGING';badge.className=`tiny-pill ${r.agreement>=75?'ready-pill':r.agreement>=55?'caution-pill':'danger-pill'}`;this.$('tripOceanAgreement').textContent=`${r.agreement}%`;this.$('tripOceanDistance').textContent=`${this.fmt(r.distance,0)} mi`;this.$('tripOceanAge').textContent=r.ageHours==null?'—':`${this.fmt(r.ageHours,1)} hr`;this.$('tripOceanSummary').textContent=r.agreement>=75?'Available observed conditions broadly support the loaded forecast. Still check the beach itself before fishing.':r.agreement>=55?'Observed ocean conditions differ enough to justify another look before departure.':'The observed station and model are meaningfully different. Recheck the latest surf, wind and official warnings before driving.';
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

    async loadNWSAlerts(lat,lon){
      const url=`https://api.weather.gov/alerts/active?point=${encodeURIComponent(Number(lat).toFixed(4)+','+Number(lon).toFixed(4))}`;
      const data=await this.fetchJSON(url,12000);
      const alerts=(data?.features||[]).map(f=>{const p=f?.properties||{};return{id:f.id||p.id||'',event:p.event||'Weather alert',severity:p.severity||'Unknown',certainty:p.certainty||'',urgency:p.urgency||'',headline:p.headline||p.event||'Active NWS alert',description:p.description||'',instruction:p.instruction||'',areaDesc:p.areaDesc||'',expires:p.expires||'',senderName:p.senderName||'National Weather Service'};});
      return {alerts,checkedAt:new Date().toISOString()};
    },

    async refreshSafety(){
      if(!this.state.live){this.showToast('Turn on Live Data to check NWS point alerts.');return;}
      const {lat,lon}=this.state.location;this.state.sourceHealth.alerts='loading';this.renderSourceHealth();this.renderSafetyGuard();
      try{const data=await this.loadNWSAlerts(lat,lon);this.state.safetyAlerts=data.alerts||[];this.state.sourceHealth.alerts='live';this.renderSourceHealth();this.renderSafetyGuard();this.renderTripSafety();this.showToast(this.state.safetyAlerts.length?`${this.state.safetyAlerts.length} active NWS alert${this.state.safetyAlerts.length===1?'':'s'} found.`:'No active NWS point alerts returned.');}
      catch(_){this.state.sourceHealth.alerts='fallback';this.renderSourceHealth();this.renderSafetyGuard();this.renderTripSafety();this.showToast('NWS alerts could not refresh. Use official sources before travel.');}
    },

    async loadTides(lat,lon){
      const station=await this.findNearestTideStation(lat,lon);
      if(!station) throw new Error('No NOAA tide station');
      this.state.selectedTideStation=station;
      const start=new Date(),end=new Date(); end.setDate(end.getDate()+7);
      const params=new URLSearchParams({
        product:'predictions',application:'AnglerSignal',begin_date:this.formatDateYYYYMMDD(start),end_date:this.formatDateYYYYMMDD(end),
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

    shopCacheKey(){const l=this.state.location;return `coastcast-shops-v3:${Number(l.lat).toFixed(2)}:${Number(l.lon).toFixed(2)}:${this.state.tackleRadius||20}:${this.state.geoapifyKey?'ga':'open'}`;},
    clearShopCache(){try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&/^coastcast-shops-v[123]:/.test(k))localStorage.removeItem(k);}}catch(_){}},
    renderPlacesProviderStatus(){const el=this.$('placesProviderStatus');if(!el)return;el.innerHTML=this.state.geoapifyKey?'<strong>Enhanced nationwide POI enabled.</strong> Geoapify fishing-store data will be merged with OpenStreetMap and AnglerSignal verified catalogs.':'<strong>Open-data mode.</strong> AnglerSignal is using OpenStreetMap plus verified local catalogs. Add the free Geoapify key below for a broader nationwide fishing-store dataset.';},
    readPlaceCache(key,maxAge=6*3600000){try{const raw=localStorage.getItem(key);if(!raw)return null;const v=JSON.parse(raw);if(Date.now()-v.savedAt>maxAge)return null;return Array.isArray(v.items)?v.items:null;}catch(_){return null;}},
    writePlaceCache(key,items){try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),items}));}catch(_){ }},

    isLikelyTackleShop(name,meta={}){
      const n=String(name||'').trim();if(!n)return false;
      if(meta.verifiedFishing===true)return true;
      const text=(n+' '+String(meta.display_name||'')).toLowerCase();
      const reject=/\b(sheriff|police|library|school|academy|church|courthouse|court house|city hall|town hall|county office|government|department of|fire station|hospital|medical|museum|bank|pharmacy|restaurant|hotel|motel|university|college|post office|dentist|law office|realty|real estate)\b/i;
      if(reject.test(text))return false;
      const tags=meta.tags||meta.extratags||{};
      const cats=[...(Array.isArray(meta.categories)?meta.categories:[]),...(Array.isArray(tags.categories)?tags.categories:[])].map(x=>String(x).toLowerCase());
      if(cats.some(x=>x==='commercial.outdoor_and_sport.fishing'||x.endsWith('.fishing')))return true;
      const shop=String(tags.shop||meta.shop||meta.type||'').toLowerCase();
      const sport=String(tags.sport||meta.sport||'').toLowerCase();
      const products=String(tags.products||tags.product||tags.description||tags.note||'').toLowerCase();
      if(shop==='fishing')return true;
      if((shop==='sports'||shop==='outdoor'||shop==='sporting_goods')&&(sport.includes('fishing')||/bait|tackle|fishing|rod|reel/.test(products)))return true;
      if(['hardware','convenience','general','supermarket','seafood'].includes(shop)&&/bait|tackle|fishing/.test(products))return true;
      const strong=/\b(bait|tackle|angler|anglers|fishing|fishin['’]?|fly shop|rod\s*(?:&|and)?\s*reel|sportfishing)\b/i;
      return strong.test(n);
    },

    async loadNearbyShops(forceToast=false){
      const {lat,lon}=this.state.location;
      const cacheKey=this.shopCacheKey();
      if(!forceToast){
        const cached=this.readPlaceCache(cacheKey,12*3600000);
        if(cached?.length){
          const valid=cached.filter(x=>this.isLikelyTackleShop(x.name,{tags:x.osmTags||{},display_name:x.displayName||'',categories:x.categories||[],verifiedFishing:x.verified===true}));
          if(valid.length)return valid.map(x=>({...x,cached:true}));
        }
      }
      const radiusMiles=Math.max(5,Math.min(50,Number(this.state.tackleRadius)||20));
      const radiusMeters=Math.min(80000,Math.max(5000,Math.round(radiusMiles*1609.344)));
      const normalized=[];
      const seen=[];
      const add=(name,slat,slon,tags=[],source='OpenStreetMap',meta={})=>{
        slat=Number(slat);slon=Number(slon);if(!name||!Number.isFinite(slat)||!Number.isFinite(slon))return;
        if(!this.isLikelyTackleShop(name,meta))return;
        const distance=this.haversine(lat,lon,slat,slon);if(distance>radiusMiles*1.35)return;
        const clean=String(name).toLowerCase().replace(/[^a-z0-9]/g,'');
        const dup=seen.find(x=>(clean&&x.clean===clean)||this.haversine(slat,slon,x.lat,x.lon)<0.08);
        if(dup)return;
        seen.push({clean,lat:slat,lon:slon});
        normalized.push({name,lat:slat,lon:slon,distance,rating:meta.rating??null,tags,source,demo:false,verified:meta.verifiedFishing===true,categories:meta.categories||[],osmTags:meta.tags||null,displayName:meta.display_name||'',address:meta.address||''});
      };

      // Dedicated nationwide fishing-store POI provider (optional free key).
      if(this.state.geoapifyKey){
        try{
          const geo=await this.loadGeoapifyFishingShops(lat,lon,radiusMeters);
          geo.forEach(s=>add(s.name,s.lat,s.lon,s.tags,s.source,{categories:s.categories,address:s.address,verifiedFishing:false}));
        }catch(_){ }
      }

      // Merge OpenStreetMap results instead of stopping after the first provider response.
      const query=`[out:json][timeout:14];(nwr(around:${radiusMeters},${lat},${lon})[shop="fishing"];nwr(around:${radiusMeters},${lat},${lon})[shop="sports"][sport="fishing"];nwr(around:${radiusMeters},${lat},${lon})[shop="outdoor"][sport="fishing"];nwr(around:${radiusMeters},${lat},${lon})[name~"bait|tackle|angler|fishing|fishin|rod.{0,5}reel",i];nwr(around:${radiusMeters},${lat},${lon})[description~"bait|tackle|fishing supplies",i];nwr(around:${radiusMeters},${lat},${lon})[products~"bait|tackle|fishing",i];);out center tags;`;
      const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
      for(const endpoint of endpoints){
        try{
          const data=await this.fetchOverpass(endpoint,query,8000);
          (data?.elements||[]).forEach(el=>{const t=el.tags||{};const slat=el.lat??el.center?.lat,slon=el.lon??el.center?.lon;add(t.name||'',slat,slon,[t.shop==='fishing'?'Fishing tackle shop':'Fishing-related business',t.opening_hours||'Hours not listed'].filter(Boolean),'OpenStreetMap',{tags:t,address:[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' ')});});
        }catch(_){ }
      }

      // Add text/geocoder matches as a secondary discovery source.
      try{
        const textShops=await this.genericTextTackleShops(radiusMiles);
        textShops.forEach(s=>add(s.name,s.lat,s.lon,s.tags,s.source,s.meta||{}));
      }catch(_){ }

      // Curated high-confidence catalogs are merged, not used only after total failure.
      try{
        const verified=await this.verifiedRegionalShops();
        verified.forEach(s=>add(s.name,s.lat,s.lon,s.tags,s.source,{tags:{shop:'fishing'},verifiedFishing:true,address:s.address||s.query||''}));
      }catch(_){ }

      normalized.sort((a,b)=>a.distance-b.distance || Number(b.verified)-Number(a.verified));
      const shops=normalized.slice(0,18);if(shops.length)this.writePlaceCache(cacheKey,shops);
      if(this.state.data)this.state.data.shops=shops;
      if(shops.length){
        if(forceToast){
          this.state.sourceHealth.shops=shops.some(x=>x.verified)?'verified':'live';this.renderSourceHealth();this.renderShops();this.renderMapLayers();this.renderDestinationHub();
          const enhanced=this.state.geoapifyKey?' • enhanced POI enabled':'';
          this.showToast(`Found ${shops.length} fishing/tackle result${shops.length===1?'':'s'} within about ${radiusMiles} miles${enhanced}.`);
        }
        return shops;
      }
      if(forceToast){this.state.sourceHealth.shops='fallback';this.renderSourceHealth();this.renderShops();this.renderMapLayers();this.renderDestinationHub();this.showToast('No verified bait/tackle shop was found nearby. AnglerSignal will not place unrelated businesses on the map.');}
      return [];
    },

    async loadGeoapifyFishingShops(lat,lon,radiusMeters){
      const key=String(this.state.geoapifyKey||'').trim();if(!key)return[];
      const url=`https://api.geoapify.com/v2/places?categories=commercial.outdoor_and_sport.fishing&filter=circle:${encodeURIComponent(lon)},${encodeURIComponent(lat)},${Math.round(radiusMeters)}&bias=proximity:${encodeURIComponent(lon)},${encodeURIComponent(lat)}&limit=40&lang=en&apiKey=${encodeURIComponent(key)}`;
      const data=await this.fetchJSON(url,8500);const out=[];
      (data?.features||[]).forEach(f=>{const p=f?.properties||{},c=f?.geometry?.coordinates||[];if(!p.name||!Number.isFinite(Number(c[0]))||!Number.isFinite(Number(c[1])))return;out.push({name:p.name,lat:Number(c[1]),lon:Number(c[0]),address:p.formatted||p.address_line2||'',categories:Array.isArray(p.categories)?p.categories:[],tags:['Fishing store','Geoapify Places'],source:'Geoapify Places'});});
      return out;
    },

    mergeLiveData(base,weather,marine,tideData,shops){
      const out=base;
      if(weather){
        out.timezone=weather.timezone||out.timezone||null;
        out.utcOffsetSeconds=Number.isFinite(Number(weather.utc_offset_seconds))?Number(weather.utc_offset_seconds):out.utcOffsetSeconds;
        const c=weather.current||{};
        out.localDate=String(c.time||weather.hourly?.time?.[0]||'').slice(0,10)||out.localDate;
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
            rawTime:time,time:this.hourFromIso(time),dateIndex:this.localDateDiff(time,out.localDate),icon:this.weatherIcon(h.weather_code?.[i]),
            temp:this.num(h.temperature_2m?.[i],72),feels:this.num(h.apparent_temperature?.[i],72),
            weatherCode:this.num(h.weather_code?.[i],2),rain:this.num(h.precipitation_probability?.[i],0),
            wind:this.num(h.wind_speed_10m?.[i],0),windDir:this.num(h.wind_direction_10m?.[i],0),gust:this.num(h.wind_gusts_10m?.[i],0),
            pressure:this.num(h.pressure_msl?.[i],1015),humidity:this.num(h.relative_humidity_2m?.[i],65),cloudCover:this.num(h.cloud_cover?.[i],30),visibility:this.num(h.visibility?.[i],16000),uv:this.num(h.uv_index?.[i],0),wave:2,period:8,tide:'Moving',score:70
          }));
          const localNow=String(c.time||'');
          const firstFuture=localNow?out.hours.findIndex(x=>String(x.rawTime)>=localNow):-1;
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
        out.tides=tideData.predictions.slice(0,32).map(p=>({
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
      const wind=Number((s.match(/([0-9.]+)\s*mph wind/i)||[])[1]);
      const wave=Number((s.match(/([0-9.]+)\s*ft surf/i)||[])[1]);
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
      const msg=this.$('regulationMessage');if(msg)msg.innerHTML=src?`AnglerSignal detected <strong>${this.escape(this.stateNames[code])}</strong>. Check the official source for current <strong>${this.escape(this.state.targetSpecies)}</strong> size, bag, season, gear and closure rules before keeping fish.`:'AnglerSignal could not confidently detect the state from this location name. Open/change the destination to include the state before checking regulations.';
      const b=this.$('openRegsBtn');if(b){b.disabled=!src;b.textContent=src?'Open official regulations':'State not detected';}
      const key=this.regulationCheckKey(),check=key?this.state.regChecks?.[key]:null,today=this.localDateKey(new Date());
      const fresh=!!(check&&check.date===today);
      if(this.$('regGuardBadge')){this.$('regGuardBadge').textContent=fresh?'CHECKED TODAY':'NEEDS CHECK';this.$('regGuardBadge').classList.toggle('checked',fresh);}
      if(this.$('regGuardTitle'))this.$('regGuardTitle').textContent=fresh?`You reviewed ${this.state.targetSpecies} rules today`:'Verify before you keep fish';
      if(this.$('regGuardTime'))this.$('regGuardTime').textContent=fresh?`Recorded ${new Date(check.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} • ${src?.name||'official source'}`:'Open the official source, review current rules, then mark checked.';
      const mark=this.$('markRegsCheckedBtn');if(mark){mark.disabled=!src;mark.textContent=fresh?'Checked today ✓':'Mark checked today';}
    },

    regulationCheckKey(){const code=this.detectStateCode();return code?`${code}|${this.state.targetSpecies}`:null;},
    localDateKey(d){const x=d instanceof Date?d:new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;},
    markRegulationsChecked(){
      const key=this.regulationCheckKey(),src=this.state.currentRegSource;if(!key||!src){this.showToast('Choose a coastal state before recording a regulation check.');return;}
      this.state.regChecks[key]={date:this.localDateKey(new Date()),at:new Date().toISOString(),state:this.detectStateCode(),species:this.state.targetSpecies,source:src.name,location:this.state.location.name};this.save();this.renderRegulations();this.renderGearPlanner();this.showToast('Regulation review recorded for today.');
    },

    openOfficialRegulations(){
      const src=this.state.currentRegSource;if(!src){this.showToast('Choose a U.S. coastal location with a state first.');return;}
      window.open(src.url,'_blank','noopener');
      this.showToast('Review the current rules, then return and tap “Mark checked today.”');
    },

    baitHistoryForSpecies(species){
      const list=this.state.catches.filter(c=>c.species===species&&String(c.bait||'').trim());const counts={};
      list.forEach(c=>{const k=String(c.bait).trim().toLowerCase();counts[k]=(counts[k]||0)+1;});
      return {count:list.length,counts,top:Object.entries(counts).sort((x,y)=>y[1]-x[1])[0]||null};
    },

    baitIntelligence(species=this.state.targetSpecies){
      const c=this.state.data?.current||{},extra=this.speciesExtras[species]||{bait:['natural bait','soft plastic'],habitat:'coastal structure'},play=this.baitPlaybook[species]||{};
      const base=[...(extra.bait||[])];while(base.length<3)base.push(['natural bait','soft plastic','metal lure'][base.length]||'natural bait');
      const history=this.baitHistoryForSpecies(species),scores=new Map(base.map((b,i)=>[b,30-i*3]));
      const tide=this.currentTideLabel(),hour=new Date().getHours(),lowLight=hour<9||hour>=17,wave=Number(c.waveHeight)||0,wind=Number(c.windSpeed)||0;
      for(const [raw,n] of Object.entries(history.counts)){const match=base.find(b=>raw.includes(b.toLowerCase())||b.toLowerCase().includes(raw));if(match)scores.set(match,(scores.get(match)||30)+Math.min(24,n*6));}
      base.forEach(b=>{const k=b.toLowerCase();if(wave>=3&&(k.includes('cut')||k.includes('fishbites')||k.includes('clam')||k.includes('crab')))scores.set(b,scores.get(b)+8);if(wave<2.2&&(k.includes('live')||k.includes('shrimp')||k.includes('paddletail')||k.includes('swimbait')))scores.set(b,scores.get(b)+5);if(lowLight&&(k.includes('topwater')||k.includes('plug')||k.includes('paddletail')||k.includes('swimbait')))scores.set(b,scores.get(b)+6);if(/Rising|Falling|Moving/.test(tide)&&(k.includes('live')||k.includes('paddletail')||k.includes('spoon')||k.includes('jig')))scores.set(b,scores.get(b)+4);});
      const ranked=[...scores].sort((x,y)=>y[1]-x[1]).map(x=>x[0]),primary=ranked[0],backup=ranked[1]||base[1];
      const rig=play.rigs?.[this.state.fishingStyle]||play.rigs?.['Surf fishing']||'Simple bottom or casting rig';
      let terminal=play.terminal||'Leader and terminal tackle matched to species and structure';
      if(this.state.fishingStyle==='Surf fishing'){
        const sinker=wind<=8&&wave<=2.2?'2–3 oz sinker':wind<=15&&wave<=3.5?'3–5 oz sinker':'heavier surf weight only if conditions remain safe';
        terminal=`${terminal} • ${sinker}`;
      }
      const sourceLive=['weather','marine','tides'].filter(k=>this.state.sourceHealth?.[k]==='live').length,confidence=Math.min(99,55+sourceLive*10+Math.min(14,history.count*3));
      const primaryWhy=history.top&&primary.toLowerCase().includes(history.top[0])?`Your logbook favors ${history.top[0]} for ${species}; current ${tide.toLowerCase()} conditions keep it on top.`:`Best starting match for ${species} with ${this.fmt(c.waveHeight,1)} ft surf, ${this.fmt(c.windSpeed,0)} mph wind and ${tide.toLowerCase()}.`;
      const backupWhy=`A useful change-up if water clarity, current or bait activity shifts while you fish.`;
      return {species,primary,backup,rig,presentation:play.presentation||`Present naturally around ${extra.habitat}.`,terminal,confidence,history,primaryWhy,backupWhy};
    },

    renderBaitIntelligence(){
      if(!this.$('baitPrimaryName'))return;const p=this.baitIntelligence();
      this.$('baitConfidence').textContent=`${p.confidence}% MATCH`;this.$('baitPrimaryName').textContent=this.titleCase(p.primary);this.$('baitPrimaryWhy').textContent=p.primaryWhy;this.$('baitBackupName').textContent=this.titleCase(p.backup);this.$('baitBackupWhy').textContent=p.backupWhy;
      this.$('baitRigName').textContent=p.rig;this.$('baitRigDetail').textContent=`For ${this.state.fishingStyle.toLowerCase()} • ${this.currentTideLabel().toLowerCase()}`;this.$('baitPresentationName').textContent='Approach';this.$('baitPresentationDetail').textContent=p.presentation;this.$('baitTerminalName').textContent='Leader / weight';this.$('baitTerminalDetail').textContent=p.terminal;
      const note=this.$('personalBaitNote');if(note)note.textContent=p.history.top?`Personal signal: ${this.titleCase(p.history.top[0])} appears in ${p.history.top[1]} of your logged ${p.species} catch${p.history.top[1]===1?'':'es'} with bait details.`:`Personal signal: no ${p.species} bait history yet. Log bait/lure on catches and this plan will become more personal.`;
    },

    titleCase(v){return String(v||'').replace(/\b\w/g,m=>m.toUpperCase());},
    useBaitPlanForTrip(){const p=this.baitIntelligence();this.state.goMode.baitPlan={species:p.species,primary:p.primary,backup:p.backup,rig:p.rig,presentation:p.presentation,terminal:p.terminal,created:new Date().toISOString()};this.save();this.renderGoMode();this.renderGearPlanner();this.navigate('trips');this.showToast(`${this.titleCase(p.primary)} plan loaded into your trip.`);},
    openBaitShopShortcut(){const shops=this.state.data?.shops||[];if(shops.length){const s=shops[0];window.open(this.mapsUrl(s.lat,s.lon,s.name),'_blank','noopener');return;}this.navigate('map');setTimeout(()=>this.loadNearbyShops(true),120);this.showToast('Searching for bait & tackle near the fishing destination.');},

    gearItems(){
      const c=this.state.data?.current||{},p=this.baitIntelligence(),best=this.state.data?this.findBestWindow(this.state.data.hours.filter(h=>h.dateIndex===0).slice(0,24)):null,items=[];
      const add=(key,label,group,detail='')=>items.push({key,label,group,detail});
      add('license','Fishing license / required permits','Rules','Carry the licenses or permits required for this water.');
      add('regs','Review current regulations','Rules',this.regulationCheckKey()&&this.state.regChecks?.[this.regulationCheckKey()]?.date===this.localDateKey(new Date())?'Marked checked today.':'Open the official source before keeping fish.');
      add('rod','Rod, reel and spare line','Fishing',this.state.fishingStyle==='Surf fishing'?'Surf setup matched to casting distance and sinker weight.':'Setup matched to your fishing style.');
      add('bait',`${this.titleCase(p.primary)} + backup ${this.titleCase(p.backup)}`,'Fishing',p.rig);
      add('terminal','Terminal tackle / spare leaders','Fishing',p.terminal);
      add('tools','Pliers, dehooker and measuring tool','Fishing','Add a fish-grip or net when appropriate.');
      if(this.state.fishingStyle==='Surf fishing')add('sand','Sand spike / rod holder','Fishing','Keep rods secure above wash and traffic.');
      if((c.windSpeed||0)>=12|| (c.waveHeight||0)>=2.8)add('heavy','Wind / surf-ready terminal tackle','Conditions','Bring heavier weights only within safe conditions and your gear limits.');
      if((c.rain||0)>=25)add('rain','Rain shell + dry storage','Conditions',`${this.fmt(c.rain,0)}% precipitation chance loaded.`);
      if((c.uv||0)>=5)add('uv','Sun protection','Conditions','Sunscreen, hat, sunglasses and sun shirt.');
      if((c.temp||70)<60)add('layers','Warm layers','Conditions',`${this.fmt(c.temp,0)}°F current air temperature.`);else add('water','Water / hydration','Conditions','Bring more than you expect to need in heat and sun.');
      const windowText=String(best?.label||'');if(/AM|PM/.test(windowText)&&(/5:|6:|7:|PM/.test(windowText)))add('light','Headlamp / backup light','Safety','Useful for low-light setup, pack-out and beach access.');
      if(this.state.fishingStyle==='Inlet / jetty'||(c.waveHeight||0)>=3)add('pfd','PFD / enhanced water safety','Safety','Strongly consider flotation around rocks, jetties, currents or rough water.');
      add('firstaid','First-aid kit + charged phone','Safety','Share your plan when fishing remote or hazardous access.');
      add('ice','Cooler / ice as needed','Trip','For drinks, bait and legal kept fish.');
      return items;
    },

    renderGearPlanner(){
      const box=this.$('gearPlanList');if(!box)return;const items=this.gearItems(),checked=this.state.gearPlan?.checked||{};const done=items.filter(i=>checked[i.key]).length,pct=items.length?Math.round(done/items.length*100):0,p=this.baitIntelligence();
      this.$('gearPlanBadge').textContent=`${items.length} ITEMS`;this.$('gearPlanSummary').innerHTML=`Packing for <strong>${this.escape(this.state.targetSpecies)}</strong> at <strong>${this.escape(this.state.location.name)}</strong> • ${this.escape(this.state.fishingStyle)} • top bait ${this.escape(this.titleCase(p.primary))}.`;
      this.$('gearPlanProgressBar').style.width=`${pct}%`;this.$('gearPlanProgressText').textContent=`${pct}% packed`;
      const groups=['Rules','Fishing','Conditions','Safety','Trip'];box.innerHTML=groups.map(g=>{const rows=items.filter(i=>i.group===g);if(!rows.length)return'';return `<div class="gear-group"><div class="gear-group-title">${this.escape(g)}</div>${rows.map(i=>`<label class="gear-row ${checked[i.key]?'done':''}"><input type="checkbox" data-gear-key="${this.escape(i.key)}" ${checked[i.key]?'checked':''}/><span class="gear-checkmark">${checked[i.key]?'✓':'○'}</span><span><strong>${this.escape(i.label)}</strong><small>${this.escape(i.detail)}</small></span></label>`).join('')}</div>`;}).join('');
      this.state.gearPlan.lastBuilt=new Date().toISOString();
    },
    handleGearCheck(e){const el=e.target.closest('[data-gear-key]');if(!el)return;this.state.gearPlan.checked[el.dataset.gearKey]=!!el.checked;this.save();this.renderGearPlanner();},
    resetGearChecks(){this.state.gearPlan.checked={};this.save();this.renderGearPlanner();this.showToast('Gear checklist reset.');},

    localDateDiff(value,baseDate){
      const d=String(value||'').slice(0,10),b=String(baseDate||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^\d{4}-\d{2}-\d{2}$/.test(b))return this.dateIndexForIso(value);
      const [y,m,day]=d.split('-').map(Number),[by,bm,bd]=b.split('-').map(Number);return Math.round((Date.UTC(y,m-1,day)-Date.UTC(by,bm-1,bd))/86400000);
    },
    literalClock(value){
      const s=String(value||'');const m=s.match(/(?:T|\s)(\d{1,2}):(\d{2})/);if(!m)return'';let h=Number(m[1]),min=m[2],ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${min} ${ap}`;
    },
    parseLocationDate(value){
      const s=String(value||'');const m=s.match(/(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})(?::(\d{2}))?/);if(!m)return new Date(NaN);
      const offset=Number(this.state.data?.utcOffsetSeconds);if(Number.isFinite(offset))return new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]),Number(m[5]),Number(m[6]||0))-offset*1000);
      return new Date(s.replace(' ','T'));
    },
    destinationNow(){return new Date();},
    destinationClockText(){
      const tz=this.state.data?.timezone;try{return new Intl.DateTimeFormat([],{timeZone:tz||undefined,hour:'numeric',minute:'2-digit'}).format(new Date());}catch(_){return new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});}
    },
    formatDestinationDate(date,opts={}){const tz=this.state.data?.timezone;try{return new Intl.DateTimeFormat([],{timeZone:tz||undefined,...opts}).format(date);}catch(_){return date.toLocaleString([],opts);}},
    lunarInfo(date=new Date()){
      const synodic=29.530588853,newMoon=Date.UTC(2000,0,6,18,14,0),days=(date.getTime()-newMoon)/86400000;let age=((days%synodic)+synodic)%synodic;const phase=age/synodic,illum=Math.round((1-Math.cos(phase*2*Math.PI))/2*100);
      let name='New moon';if(phase>=.03&&phase<.22)name='Waxing crescent';else if(phase<.28)name='First quarter';else if(phase<.47)name='Waxing gibbous';else if(phase<.53)name='Full moon';else if(phase<.72)name='Waning gibbous';else if(phase<.78)name='Last quarter';else if(phase<.97)name='Waning crescent';
      return{name,illumination:illum,age,phase};
    },
    tideIntel(){
      const tides=(this.state.data?.tides||[]).map(t=>({...t,date:this.parseLocationDate(t.rawTime)})).filter(t=>!isNaN(t.date)).sort((x,y)=>x.date-y.date),now=new Date();
      if(tides.length<2)return{stage:this.currentTideLabel(),next:null,strength:'Unknown',windows:[]};
      let nextIndex=tides.findIndex(t=>t.date>now);if(nextIndex<0)nextIndex=tides.length-1;const next=tides[nextIndex],prev=nextIndex>0?tides[nextIndex-1]:null;
      let strength='Moderate';if(prev&&next){const total=next.date-prev.date,progress=Math.max(0,Math.min(1,(now-prev.date)/total)),velocity=Math.sin(progress*Math.PI);strength=velocity<.28?'Slack / turning':velocity<.72?'Moderate':'Strong';}
      const stage=next?.type==='High'?'Rising tide':next?.type==='Low'?'Falling tide':this.currentTideLabel();
      const windows=[];for(let i=Math.max(0,nextIndex-1);i<Math.min(tides.length-1,nextIndex+4);i++){const x=tides[i],y=tides[i+1],mid=new Date((x.date.getTime()+y.date.getTime())/2);if(mid<new Date(now.getTime()-30*60000))continue;const start=new Date(mid.getTime()-60*60000),end=new Date(mid.getTime()+60*60000);windows.push({label:`${this.formatDestinationDate(start,{hour:'numeric',minute:'2-digit'})} – ${this.formatDestinationDate(end,{hour:'numeric',minute:'2-digit'})}`,direction:y.type==='High'?'Strong incoming movement':'Strong outgoing movement',date:mid});if(windows.length>=3)break;}
      return{stage,next,prev,strength,windows};
    },
    safetyAssessment(){
      const c=this.state.data?.current||{},alerts=this.state.safetyAlerts||[];let level=0,reasons=[];
      const severeWords=/Hurricane|Tropical Storm|Storm Surge|Tornado|Severe Thunderstorm|High Surf Warning|Extreme Wind|Tsunami/i;
      const cautionWords=/Rip Current|Beach Hazards|High Surf|Coastal Flood|Small Craft|Gale|Dense Fog|Heat Advisory|Flood/i;
      for(const al of alerts){if(severeWords.test(al.event||'')){level=Math.max(level,2);reasons.push(al.event);}else if(cautionWords.test(al.event||'')){level=Math.max(level,1);reasons.push(al.event);}else if(/Extreme|Severe/.test(al.severity||'')){level=Math.max(level,2);reasons.push(al.event);}else{level=Math.max(level,1);reasons.push(al.event);}}
      if(Number(c.waveHeight)>=6){level=Math.max(level,2);reasons.push(`${this.fmt(c.waveHeight,1)} ft surf`);}else if(Number(c.waveHeight)>=4){level=Math.max(level,1);reasons.push(`${this.fmt(c.waveHeight,1)} ft surf`);}
      if(Number(c.windGust)>=35){level=Math.max(level,2);reasons.push(`${this.fmt(c.windGust,0)} mph gusts`);}else if(Number(c.windGust)>=22){level=Math.max(level,1);reasons.push(`${this.fmt(c.windGust,0)} mph gusts`);}
      if([95,96,99].includes(Number(c.weatherCode))){level=Math.max(level,2);reasons.push('Thunderstorms');}
      const live=this.state.sourceHealth?.alerts==='live';
      if(level>=2)return{level,status:'HIGH RISK',title:'Hazardous conditions flagged',detail:reasons.slice(0,3).join(' • ')||'Serious coastal hazards are present.',className:'high'};
      if(level===1)return{level,status:'CAUTION',title:'Extra caution before you go',detail:reasons.slice(0,3).join(' • ')||'Review conditions before leaving.',className:'caution'};
      return{level,status:live?'LOWER RISK':'VERIFY',title:live?'No major point alert found':'Official alert check not confirmed',detail:live?'NWS returned no active point alerts, and loaded surf/wind are below AnglerSignal caution thresholds. Local hazards can still exist.':'Refresh Live Data and check posted local warnings before departure.',className:live?'lower':'verify'};
    },
    renderOceanIntelligence(){
      if(!this.$('tideStageNow'))return;const ti=this.tideIntel(),moon=this.lunarInfo(),sun=this.state.data?.sun||{};
      this.$('tideStageNow').textContent=ti.stage;this.$('tideMovementStrength').textContent=ti.strength;
      if(ti.next){const diff=ti.next.date-new Date(),mins=Math.max(0,Math.round(diff/60000)),dur=mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins}m`;this.$('tideTurnDetail').textContent=`Next ${ti.next.type.toLowerCase()} ${ti.next.time} • ${dur}`;}else this.$('tideTurnDetail').textContent='No upcoming NOAA turn loaded';
      this.$('tideStrongWindow').textContent=ti.windows[0]?.label||'—';
      this.$('moonPhaseIq').textContent=moon.name;this.$('moonIllumination').textContent=`${moon.illumination}% illuminated`;this.$('moonSunrise').textContent=sun.sunrise||'—';this.$('moonSunset').textContent=sun.sunset||'—';
      this.$('tideWindowList').innerHTML=ti.windows.length?ti.windows.map((w,i)=>`<div class="tide-window-row"><span>${i===0?'NEXT':'LATER'}</span><strong>${this.escape(w.label)}</strong><small>${this.escape(w.direction)}</small></div>`).join(''):'<div class="empty-state compact-empty">Load live NOAA tides to calculate movement windows.</div>';
      this.$('oceanIqBadge').textContent=this.state.sourceHealth?.tides==='live'?'NOAA + LOCAL TIME':'TIDE FALLBACK';
      this.renderSafetyGuard();
    },
    renderSafetyGuard(){
      if(!this.$('safetyStatusBadge'))return;const s=this.safetyAssessment(),alerts=this.state.safetyAlerts||[];this.$('safetyStatusBadge').className=`safety-status-badge ${s.className}`;this.$('safetyStatusBadge').textContent=s.status;this.$('safetyStatusTitle').textContent=s.title;this.$('safetyStatusDetail').textContent=s.detail;
      this.$('safetyAlertList').innerHTML=alerts.length?alerts.slice(0,4).map(a=>`<div class="safety-alert-row"><strong>${this.escape(a.event)}</strong><span>${this.escape(a.severity||'NWS alert')}</span><small>${this.escape(a.headline||'')}</small></div>`).join(''):`<div class="safety-clear-row"><strong>${this.state.sourceHealth?.alerts==='live'?'No active NWS point alerts returned':'NWS alert feed not confirmed'}</strong><small>Always check local beach flags, lifeguards and posted warnings.</small></div>`;
    },
    renderTideWeek(){
      const box=this.$('tideWeekGrid');if(!box)return;const tides=(this.state.data?.tides||[]).map(t=>({...t,date:this.parseLocationDate(t.rawTime)})).filter(t=>!isNaN(t.date)).sort((a,b)=>a.date-b.date);if(!tides.length){box.innerHTML='<div class="empty-state">No NOAA tide predictions loaded.</div>';return;}
      const groups=[];for(const t of tides){const key=this.formatDestinationDate(t.date,{year:'numeric',month:'2-digit',day:'2-digit'});let g=groups.find(x=>x.key===key);if(!g){g={key,date:t.date,items:[]};groups.push(g);}g.items.push(t);}this.$('tideWeekSource').textContent=this.state.sourceHealth?.tides==='live'?'NOAA LIVE':'TIDE FALLBACK';
      box.innerHTML=groups.slice(0,7).map(g=>`<article class="tide-day-card"><span>${this.formatDestinationDate(g.date,{weekday:'short'}).toUpperCase()}</span><strong>${this.formatDestinationDate(g.date,{month:'short',day:'numeric'})}</strong>${g.items.slice(0,4).map(t=>`<div><b>${this.escape(t.type)}</b><em>${this.escape(t.time)}</em><small>${this.fmt(t.height,1)} ft</small></div>`).join('')}</article>`).join('');
    },
    renderTripSafety(){
      if(!this.$('tripSafetyBadge'))return;const s=this.safetyAssessment(),regKey=this.regulationCheckKey?.(),regOk=!!(regKey&&this.state.regChecks?.[regKey]?.date===this.localDateKey(new Date())),items=this.gearItems?.()||[],checked=this.state.gearPlan?.checked||{},gearPct=items.length?Math.round(items.filter(i=>checked[i.key]).length/items.length*100):0;
      const rows=[{ok:s.level===0,label:'Beach/weather hazards',detail:s.status==='LOWER RISK'?'No major NWS point alert found; still verify local flags.':s.detail,warn:s.level>0},{ok:regOk,label:'Regulations review',detail:regOk?'Marked checked today.':'Official regulations have not been marked checked today.',warn:!regOk},{ok:gearPct>=75,label:'Gear readiness',detail:`${gearPct}% of Smart Gear Planner checked.`,warn:gearPct<75},{ok:this.state.sourceHealth?.weather==='live'&&this.state.sourceHealth?.marine==='live'&&this.state.sourceHealth?.tides==='live',label:'Forecast sources',detail:'Weather, marine and tide feeds '+((this.state.sourceHealth?.weather==='live'&&this.state.sourceHealth?.marine==='live'&&this.state.sourceHealth?.tides==='live')?'are live.':'need a refresh or are using fallback.'),warn:false}];
      const caution=rows.some(r=>r.warn);this.$('tripSafetyBadge').textContent=s.level>=2?'HOLD / REVIEW':caution?'CAUTION':'READY CHECK';this.$('tripSafetyBadge').className=`tiny-pill ${s.level>=2?'danger-pill':caution?'caution-pill':'ready-pill'}`;this.$('tripSafetySummary').textContent=s.level>=2?'Do not rely on the fishing score until the flagged hazards are resolved and official warnings are reviewed.':caution?'The trip may be fishable, but one or more planning checks still need attention.':'Core AnglerSignal departure checks look favorable. Verify the beach in person before entering the water.';
      this.$('tripSafetyChecklist').innerHTML=rows.map(r=>`<div class="trip-safety-row ${r.ok?'ok':r.warn?'warn':'info'}"><span>${r.ok?'✓':r.warn?'!':'i'}</span><div><strong>${this.escape(r.label)}</strong><small>${this.escape(r.detail)}</small></div></div>`).join('');
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
      this.renderExperience();this.renderMembership();this.renderQuickAnswer();this.renderSeasonalIntelligence();this.renderSeasonCalendar();this.renderSeasonTripPlanner();this.renderFamilyCrew();this.renderPremiumValue();
      this.renderMode();this.renderSourceHealth();this.renderLocation();this.renderDestinationHub();this.renderDailyBrief();this.renderOceanNetwork();this.renderScore();this.renderSpecies();this.renderSpeciesRankings();this.renderBaitIntelligence();this.renderRegulations();this.renderConditions();this.renderFactors();this.renderOceanIntelligence();this.renderBeachReadiness();
      this.renderTides();this.renderHourly();this.renderDays();this.renderShops();this.renderForecast();this.renderCatchTimeline();this.renderTideWeek();this.renderChecklist();this.renderWaypoints();this.renderLogbook();this.renderCommunity();this.renderSpotIntelligence();
      this.evaluateAlerts({notify:true});this.renderTrips();this.renderCoastWatch();this.renderTripCalendar();this.renderSmartDeparture();this.renderHomeAlerts();this.renderProfile();this.renderScout();this.renderGoMode();this.renderGearPlanner();this.renderTripSafety();this.renderPatternMatch();this.renderCatchIntelligence();this.renderTackleBox();this.renderOfflinePacks();this.renderPhotoMemories();this.renderCommandCenter();this.renderOpportunityMatrix();this.renderMissionControl();this.renderAnglerAnalytics();this.renderForecastTruth();this.renderTripOceanCheck();
      if(this.state.view==='map') this.renderMapLayers();
    },

    membershipSnapshot(){
      const server=this.state.membership?.server;
      if(server&&this.state.backend?.installed){
        const source=server.source||'free',premium=!!server.premium;
        const labels={play:'Paid Premium',family:'Family Premium',complimentary:'Complimentary Premium',lifetime:'Lifetime Premium',promo:'Promotional Premium',beta:'Beta Premium',free:'Free access'};
        let expiry='';
        if(server.expires_at){try{expiry=`Access through ${new Date(server.expires_at).toLocaleDateString()}`;}catch(_){expiry='Expiring access';}}
        else expiry=premium?(source==='family'?'No separate subscription required':'Active server-verified access'):'Upgrade to unlock advanced tools';
        return {premium,badge:source==='family'?'FAMILY PREMIUM':source==='complimentary'?'COMPLIMENTARY':source==='lifetime'?'LIFETIME':source==='promo'?'PROMO':premium?'PREMIUM':'FREE',title:premium?'AnglerSignal Premium':'AnglerSignal Free',source:labels[source]||source,expiry,server:true};
      }
      const m=this.state.membership||{},preview=m.preview||'premium';
      const map={
        free:{premium:false,badge:'FREE',title:'AnglerSignal Free',source:'Free access preview',expiry:'Upgrade to unlock advanced tools'},
        premium:{premium:true,badge:'PREMIUM',title:'AnglerSignal Premium',source:'Paid Premium preview',expiry:'$4.99/month at launch'},
        family:{premium:true,badge:'FAMILY PREMIUM',title:'AnglerSignal Premium',source:'Family Premium preview',expiry:'No separate subscription for this family member'},
        complimentary:{premium:true,badge:'COMPLIMENTARY',title:'AnglerSignal Premium',source:'Owner-granted complimentary preview',expiry:'Expiration or lifetime can be set by admin'},
        lifetime:{premium:true,badge:'LIFETIME',title:'AnglerSignal Premium',source:'Owner-granted lifetime preview',expiry:'No expiration'}
      };
      return map[preview]||map.premium;
    },

    hasPremium(){return !!this.membershipSnapshot().premium;},

    openMembershipDialog(){
      const snap=this.membershipSnapshot();
      if(this.$('membershipPreviewSetting'))this.$('membershipPreviewSetting').value=this.state.membership?.preview||'premium';
      if(this.$('membershipDialogTitle'))this.$('membershipDialogTitle').textContent=snap.title;
      if(this.$('membershipDialogSource'))this.$('membershipDialogSource').textContent=snap.source;
      const preview=this.$('membershipPreviewBlock');if(preview)preview.hidden=!!(this.state.backend?.installed&&this.cloudSignedIn());
      this.openDialog('membershipDialog');
    },

    applyMembershipPreview(){
      if(this.state.backend?.installed&&this.cloudSignedIn()){this.showToast('Server access is active; local Premium preview is disabled.');return;}
      const v=this.$('membershipPreviewSetting')?.value||'premium';
      if(!['free','premium','family','complimentary','lifetime'].includes(v))return;
      this.state.membership={...this.state.membership,preview:v,betaFullAccess:true,status:v==='free'?'inactive':'active'};
      this.save();this.renderMembership();this.renderExperience();this.closeDialog('membershipDialog');this.showToast(`Access preview: ${this.membershipSnapshot().badge}.`);
    },

    renderMembership(){
      const snap=this.membershipSnapshot(),app=this.$('app');
      app?.classList.toggle('free-preview',!snap.premium);
      if(this.$('membershipBadge')){this.$('membershipBadge').textContent=snap.server?snap.badge:(this.state.membership?.source==='beta'&&snap.premium?`BETA ${snap.badge}`:snap.badge);this.$('membershipBadge').className=`membership-badge ${snap.premium?'':'free'}`;}
      if(this.$('membershipTitle'))this.$('membershipTitle').textContent=snap.server?snap.title:(this.state.membership?.source==='beta'&&snap.premium?'AnglerSignal Premium Beta':snap.title);
      if(this.$('membershipSummary'))this.$('membershipSummary').textContent=snap.server?(snap.premium?'Premium is verified by the AnglerSignal server for this signed-in account.':'This signed-in account currently has Free access.'):(snap.premium?'Full AnglerSignal tools are available in this access tier.':'Free mode keeps the core fishing answer useful while advanced intelligence is reserved for Premium.');
      if(this.$('membershipSource'))this.$('membershipSource').textContent=snap.source;
      if(this.$('membershipExpiry'))this.$('membershipExpiry').textContent=snap.expiry;
      if(this.$('membershipDialogTitle'))this.$('membershipDialogTitle').textContent=snap.title;
      if(this.$('membershipDialogSource'))this.$('membershipDialogSource').textContent=snap.source;
      if(this.$('serverAccessBadge'))this.$('serverAccessBadge').textContent=this.state.backend?.installed?'SERVER VERIFIED':(this.cloudSignedIn()?'BACKEND NOT INSTALLED':'SIGN IN REQUIRED');
      if(this.$('serverAccessSummary')){
        const email=this.state.cloud?.email||this.state.cloud?.session?.user?.email||'';
        this.$('serverAccessSummary').innerHTML=this.cloudSignedIn()?`<strong>${this.escape(email||'Signed in')}</strong><span>${this.state.backend?.installed?`${this.escape(snap.source)} • ${snap.premium?'Premium active':'Free access'}`:'Account connected. Install the v5 launch backend to turn on server-verified access.'}</span>`:`<strong>No AnglerSignal account connected</strong><span>Sign in to activate server-verified Premium, family and complimentary access.</span>`;
      }
      if(this.$('openAdminConsoleBtn'))this.$('openAdminConsoleBtn').hidden=!this.state.backend?.isAdmin;
    },

    async refreshSessionIfNeeded(){
      const c=this.state.cloud;if(!c?.session?.refresh_token)return this.cloudSignedIn();
      const exp=Number(c.session.expires_at||0)*1000;if(exp&&exp>Date.now()+120000)return true;
      try{const r=await fetch(`${c.url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':c.anonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:c.session.refresh_token})});const b=await r.json();if(!r.ok)throw new Error(b?.message||'Session refresh failed');this.state.cloud.session=b;this.saveCloudMetaOnly();return true;}catch(_){this.state.cloud.session=null;this.save();return false;}
    },

    async rpc(name,payload={}){
      if(!await this.refreshSessionIfNeeded())throw new Error('Sign in to your AnglerSignal account first.');
      const c=this.state.cloud;const r=await fetch(`${c.url}/rest/v1/rpc/${name}`,{method:'POST',headers:this.cloudHeaders(c.session.access_token),body:JSON.stringify(payload)});let b=null;try{b=await r.json();}catch(_){b=null;}if(!r.ok)throw new Error(b?.message||b?.hint||`Backend request failed (${r.status})`);return b;
    },

    async refreshServerAccess({quiet=false}={}){
      if(!this.cloudSignedIn()){if(!quiet)this.showToast('Sign in to AnglerSignal Account first.');return;}
      try{const access=await this.rpc('coastcast_my_access',{});this.state.backend={...this.state.backend,installed:true,lastAccessCheck:new Date().toISOString(),isAdmin:!!access?.is_admin};this.state.membership={...this.state.membership,server:access,source:'server',status:access?.status||'active'};this.save();this.renderMembership();this.renderProfile();await this.refreshFamilyServer({quiet:true});if(!quiet)this.showToast(`${this.membershipSnapshot().badge} access verified by server.`);}catch(err){const notInstalled=/function|schema cache|could not find/i.test(String(err.message||''));this.state.backend={...this.state.backend,installed:!notInstalled,lastAccessCheck:new Date().toISOString()};if(notInstalled)this.state.membership.server=null;this.save();this.renderMembership();if(!quiet)this.showToast(notInstalled?'Install COASTCAST_LAUNCH_BACKEND.sql to activate real entitlements.':(err.message||'Could not verify server access.'));}
    },

    async refreshFamilyServer({quiet=false}={}){
      if(!this.cloudSignedIn()||!this.state.backend?.installed)return;
      try{const rows=await this.rpc('coastcast_family_list',{});this.state.backend.familyMembers=Array.isArray(rows)?rows:[];this.save();this.renderFamilyCrew();this.renderServerFamilyList();}catch(err){if(!quiet)this.showToast(err.message||'Could not load Family Crew.');}
    },

    openFamilyCrewServer(){
      if(this.cloudSignedIn()&&this.state.backend?.installed){this.renderServerFamilyList();this.openDialog('familyServerDialog');return;}
      this.openDialog('familyCrewDialog');
    },

    renderServerFamilyList(){
      const el=this.$('familyServerList');if(!el)return;const rows=this.state.backend?.familyMembers||[];
      el.innerHTML=rows.length?rows.map(r=>`<div class="server-family-row"><div><strong>${this.escape(r.email||'Family member')}</strong><small>${this.escape(String(r.status||'invited').toUpperCase())}</small></div><button type="button" class="danger-button small" data-remove-family="${Number(r.id)}">Remove</button></div>`).join(''):'<div class="empty-state">No server Family Crew members yet.</div>';
    },

    async serverFamilyInvite(){
      const email=(this.$('familyServerEmail')?.value||'').trim();if(!email)return this.showToast('Enter a family member email.');
      try{const r=await this.rpc('coastcast_family_invite',{p_email:email});this.$('familyServerEmail').value='';await this.refreshFamilyServer({quiet:true});this.showToast(r?.status==='active'?'Family Premium linked.':'Family invite saved. They can accept after signing in.');}catch(err){this.showToast(err.message||'Could not add family member.');}
    },

    async acceptFamilyInvite(){
      try{const r=await this.rpc('coastcast_family_accept',{});await this.refreshServerAccess({quiet:true});this.showToast(Number(r?.accepted||0)>0?'Family Premium invitation accepted.':'No pending family invitation matched this account.');}catch(err){this.showToast(err.message||'Could not accept family invitation.');}
    },

    async serverFamilyRemove(id){
      if(!id||!confirm('Remove this Family Crew member?'))return;try{await this.rpc('coastcast_family_remove',{p_id:id});await this.refreshFamilyServer({quiet:true});this.showToast('Family member removed.');}catch(err){this.showToast(err.message||'Could not remove family member.');}
    },

    openAdminConsole(){if(!this.state.backend?.isAdmin){this.showToast('Owner/Admin access required.');return;}this.openDialog('adminConsoleDialog');this.adminLoadAccessList();},
    async adminGrantAccess(){
      const email=(this.$('adminEmail')?.value||'').trim(),source=this.$('adminSource')?.value||'complimentary',days=Number(this.$('adminDays')?.value||0),note=(this.$('adminNote')?.value||'').trim();
      if(!email)return this.showToast('Enter an existing AnglerSignal account email.');let expires=null;if(source!=='lifetime'&&days>0)expires=new Date(Date.now()+days*86400000).toISOString();
      try{await this.rpc('coastcast_admin_grant_access',{p_email:email,p_source:source,p_expires_at:expires,p_note:note||null});this.showToast(`${source} Premium granted.`);await this.adminLoadAccessList();}catch(err){this.showToast(err.message||'Could not grant access.');}
    },
    async adminRevokeAccess(){const email=(this.$('adminEmail')?.value||'').trim(),note=(this.$('adminNote')?.value||'').trim();if(!email)return this.showToast('Enter an account email.');if(!confirm(`Revoke direct Premium for ${email}?`))return;try{await this.rpc('coastcast_admin_revoke_access',{p_email:email,p_note:note||null});this.showToast('Direct Premium revoked.');await this.adminLoadAccessList();}catch(err){this.showToast(err.message||'Could not revoke access.');}},
    async adminLoadAccessList(){
      const el=this.$('adminAccessList');if(!el)return;el.innerHTML='<div class="empty-state">Loading accounts…</div>';
      try{const rows=await this.rpc('coastcast_admin_list_access',{p_limit:50});el.innerHTML=(rows||[]).map(r=>`<div class="admin-access-row"><div><strong>${this.escape(r.email||'Account')}</strong><small>${this.escape((r.source||'free').toUpperCase())} • ${this.escape((r.status||'active').toUpperCase())}${r.expires_at?` • until ${new Date(r.expires_at).toLocaleDateString()}`:''}</small></div><span class="tiny-pill">${this.escape((r.access_level||'free').toUpperCase())}</span></div>`).join('')||'<div class="empty-state">No accounts yet.</div>';}catch(err){el.innerHTML=`<div class="empty-state">${this.escape(err.message||'Could not load accounts.')}</div>`;}
    },

    setExperienceMode(mode,announce=false){
      if(!['simple','full'].includes(mode))return;
      this.state.experience={...this.state.experience,mode};this.save();this.renderExperience();
      if(announce)this.showToast(mode==='simple'?'Simple Home view on. Advanced tools are still one tap away.':'Full Home view on.');
    },

    renderExperience(){
      const mode=this.state.experience?.mode||'simple',app=this.$('app');
      app?.classList.toggle('simple-mode',mode==='simple');
      if(this.$('experienceModeSetting'))this.$('experienceModeSetting').value=mode;
      if(this.$('quickDetailsBtn'))this.$('quickDetailsBtn').textContent=mode==='simple'?'Show all tools':'Advanced tools shown';
      if(this.$('quickSimpleBtn'))this.$('quickSimpleBtn').textContent=mode==='simple'?'Simple view ✓':'Keep it simple';
    },

    quickAnswerData(){
      const rec=this.commandRecommendation?.()||{},best=rec.best||{},safety=this.safetyAssessment?.()||{level:0,label:'LOWER RISK'},readiness=this.planningReadiness?.()||{score:0,label:'RECHECK'},species=rec.species||this.state.targetSpecies,bait=this.baitIntelligence?.(species)||{},c=this.state.data?.current||{};
      const window=best.window?.label||this.catchForecastWindows?.(best.index||0)?.top?.[0]?.label||this.bestWindowToday?.()?.label||'Check forecast';
      let decision='RECHECK',cls='watch',headline='A workable trip may be developing.';
      if(safety.level>=2){decision='HOLD',cls='hold',headline='Review official hazards before making the trip.';}
      else if((best.score||0)>=86&&readiness.score>=72){decision='GO WINDOW',cls='go',headline=`${species} conditions line up well.`;}
      else if((best.score||0)>=72){decision='PROMISING',cls='watch',headline=`${species} has a fishable window with tradeoffs.`;}
      const why=`${this.currentTideLabel?.()||'Moving tide'} • ${this.fmt(c.windSpeed,0)} mph ${this.compass(c.windDir)} wind • ${this.fmt(c.waveHeight,1)} ft surf • ${this.dataConfidence?.().score||0}% data confidence.`;
      return{decision,cls,headline,window,species,bait:bait.primary||bait.primaryName||'See bait plan',conditions:`${this.fmt(c.windSpeed,0)} mph • ${this.fmt(c.waveHeight,1)} ft`,why,bestScore:Math.round(best.score||this.currentScore?.()||0),readiness};
    },

    renderQuickAnswer(){
      if(!this.$('quickAnswerPanel')||!this.state.data)return;const q=this.quickAnswerData();
      this.$('quickAnswerHeadline').textContent=q.headline;this.$('quickDecisionBadge').textContent=q.decision;this.$('quickDecisionBadge').className=`quick-decision-badge ${q.cls}`;
      this.$('quickAnswerSummary').textContent=q.cls==='go'?`AnglerSignal sees a strong ${q.species} opportunity. The key window is ${q.window}.`:`Best current ${q.species} opportunity: ${q.window}. Use the details if you want to see the full reasoning.`;
      this.$('quickWhen').textContent=q.window;this.$('quickWhenNote').textContent=`${q.bestScore}/100 opportunity`;
      this.$('quickTarget').textContent=q.species;this.$('quickTargetNote').textContent='Species Intelligence';
      this.$('quickBait').textContent=String(q.bait).replace(/^./,m=>m.toUpperCase());this.$('quickBaitNote').textContent='Bait Intelligence';
      this.$('quickConditions').textContent=q.conditions;this.$('quickConditionsNote').textContent='Wind • surf';this.$('quickWhy').textContent=q.why;
    },

    dailyBriefData(){
      const d=this.state.data||{},c=d.current||{},today=(d.hours||[]).filter(h=>Number(h.dateIndex||0)===0);
      let localHour=new Date().getHours();try{const tz=d.timezone;if(tz){const x=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',hour12:false}).format(new Date());localHour=Number(x)%24;}}catch(_){ }
      const hourOf=h=>{const m=String(h.rawTime||'').match(/T(\d{2}):/);if(m)return Number(m[1]);const m2=String(h.time||'').match(/^(\d{1,2})(?::\d{2})?\s*(AM|PM)?/i);if(!m2)return-1;let n=Number(m2[1]);if(m2[2]){const ap=m2[2].toUpperCase();if(ap==='PM'&&n<12)n+=12;if(ap==='AM'&&n===12)n=0;}return n;};
      let upcoming=today.filter(h=>hourOf(h)>=localHour).slice(0,6);if(upcoming.length<3)upcoming=today.slice(0,6);if(!upcoming.length)upcoming=(d.hours||[]).slice(0,6);
      const scored=upcoming.map(h=>({...h,briefScore:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??c.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??c.pressure},this.state.targetSpecies)}));
      const best=scored.reduce((a,b)=>!a||b.briefScore>a.briefScore?b:a,null),tide=this.tideIntel(),conf=this.dataConfidence(),sun=d.sun||d.days?.[0]||{};
      let headline='A workable fishing window is developing.';if(best?.briefScore>=90)headline=`Prime ${this.state.targetSpecies} conditions build around ${best.time}.`;else if(best?.briefScore>=82)headline=`Strong ${this.state.targetSpecies} window near ${best.time}.`;else if(best?.briefScore>=70)headline=`Best available ${this.state.targetSpecies} opportunity is near ${best.time}.`;else headline='Conditions are mixed — use the timeline to pick the least-compromised window.';
      const tideCall=tide.next?`${tide.stage} toward ${tide.next.type.toLowerCase()} water`:(tide.stage||'Tide trend loading');
      const summary=`${tideCall}. Wind ${this.fmt(c.windSpeed,0)} mph ${this.compass(c.windDir)}, surf ${this.fmt(c.waveHeight,1)} ft @ ${this.fmt(c.wavePeriod,0)} sec, ${this.fmt(c.rain,0)}% rain. ${conf.score}% data confidence.`;
      return{scored,best,tide,conf,sun,c,headline,summary};
    },

    renderDailyBrief(){
      if(!this.$('dailyBriefPanel')||!this.state.data)return;const b=this.dailyBriefData(),best=b.best||{},live=this.overallDataStatus?.()||'demo';
      this.$('dailyBriefHeadline').textContent=b.headline;this.$('dailyBriefSummary').textContent=b.summary;
      const badge=this.$('dailyBriefBadge');badge.textContent=live==='live'?'LIVE BRIEF':live==='partial'?'PARTIAL LIVE':this.state.live?'FALLBACK':'DEMO';badge.className=`daily-brief-badge ${live==='live'?'live':live==='partial'?'partial':'demo'}`;
      this.$('dailyBriefTimeline').innerHTML=b.scored.length?b.scored.map(h=>{const score=Math.round(h.briefScore||0),cls=score>=88?'prime':score>=76?'good':score>=62?'fair':'low';return `<article class="brief-hour ${cls}"><span>${this.escape(h.time||'—')}</span><strong>${score}</strong><small>${this.escape(h.icon||'')} ${this.fmt(h.temp,0)}° • ${this.fmt(h.wind,0)} mph</small><em>${this.fmt(h.wave,1)} ft surf</em></article>`;}).join(''):'<div class="brief-empty">Hourly forecast is not loaded yet.</div>';
      const next=b.tide?.next;this.$('dailyBriefTide').textContent=next?`${next.type} ${next.time||this.formatDestinationDate(next.date,{hour:'numeric',minute:'2-digit'})}`:(b.tide?.stage||'—');this.$('dailyBriefTideNote').textContent=b.tide?.strength||'Movement';
      this.$('dailyBriefWater').textContent=Number.isFinite(Number(b.c.waterTemp))?`${this.fmt(b.c.waterTemp,0)}°F`:'—';this.$('dailyBriefSunrise').textContent=b.sun.sunrise||'—';this.$('dailyBriefSunset').textContent=`Sunset ${b.sun.sunset||'—'}`;this.$('dailyBriefConfidence').textContent=`${b.conf.score}%`;
    },

    dataConfidence(){
      const h=this.state.sourceHealth||{},weights={weather:28,marine:26,tides:24,alerts:12,shops:10},values={live:1,verified:.94,cached:.80,fallback:.38,demo:.20,loading:.48,idle:.25};
      let score=0,detail=[];for(const [key,w] of Object.entries(weights)){const status=h[key]||(!this.state.live?'demo':'fallback'),mult=values[status]??.35;score+=w*mult;detail.push({key,status,value:Math.round(mult*100)});}
      if(!this.state.live)score=Math.min(score,28);
      let ageMin=null;if(this.state.liveUpdatedAt){const t=new Date(this.state.liveUpdatedAt).getTime();if(Number.isFinite(t)){ageMin=Math.max(0,(Date.now()-t)/60000);if(ageMin>180)score*=.78;else if(ageMin>90)score*=.90;}}
      const reality=this.oceanReality?.();if(this.state.live&&reality?.available&&reality.agreement!=null&&reality.ageHours!=null&&reality.ageHours<=4&&reality.distance<=150){score=score*.91+reality.agreement*.09;detail.push({key:'buoy',status:'live',value:reality.agreement});}
      return{score:Math.max(0,Math.min(100,Math.round(score))),detail,ageMin};
    },

    commandDayRows(species=this.state.targetSpecies,mode=this.state.command?.mode||'bite'){
      const d=this.state.data||{},days=d.days||[];return days.slice(0,7).map((day,i)=>{let hours=(d.hours||[]).filter(h=>h.dateIndex===i).slice(0,24);if(!hours.length&&i===0)hours=(d.hours||[]).slice(0,24);const scored=hours.map(h=>({...h,speciesScore:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??d.current?.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current?.pressure},species)}));const top=[...scored].sort((a,b)=>b.speciesScore-a.speciesScore).slice(0,Math.min(4,scored.length));let bite=top.length?this.average(top.map(x=>x.speciesScore)):this.num(day.score,60);const wind=this.num(day.wind,d.current?.windSpeed??12),wave=this.num(day.wave,d.current?.waveHeight??2.5),rain=this.num(day.rain,20),calm=Math.max(20,100-Math.max(0,wind-7)*4-Math.max(0,wave-2)*14),weather=Math.max(20,100-rain*.8-Math.max(0,wind-12)*2);let score=bite;if(mode==='calm')score=bite*.70+calm*.30;if(mode==='weather')score=bite*.70+weather*.30;if(mode==='confidence'){const conf=this.dataConfidence().score;score=bite*.82+conf*.18;}score=Math.max(20,Math.min(99,Math.round(score)));const window=this.findBestWindow(scored.map(h=>({...h,score:h.speciesScore})));return{day,index:i,score,bite:Math.round(bite),calm:Math.round(calm),weather:Math.round(weather),window,bestHour:top[0]||null};});
    },

    commandRecommendation(){
      const mode=this.state.command?.mode||'bite',ranked=this.rankSpecies?.()||[],species=(ranked[0]?.name||this.state.targetSpecies),rows=this.commandDayRows(species,mode),best=rows.reduce((a,b)=>!a||b.score>a.score?b:a,null),conf=this.dataConfidence(),ready=this.planningReadiness(),safety=this.safetyAssessment(),speciesScore=ranked.find(r=>r.name===species)?.score??this.speciesTodayScore(species);let call='WAIT / RECHECK',badge='WATCH',cls='watch',headline='A better window may be worth waiting for.';if(safety.level>=2){call='HOLD & REVIEW';badge='HOLD';cls='hold';headline='Official hazards need your attention before this trip.';}else if(best&&best.score>=86&&conf.score>=70){call='GO WINDOW';badge='STRONG';cls='go';headline=`${species} conditions line up well for ${best.day.day||best.day.date||'this trip'}.`;}else if(best&&best.score>=72){call='PROMISING WINDOW';badge='REVIEW';cls='watch';headline='There is a fishable opportunity with a few tradeoffs.';}
      const modeLabel={bite:'Max Bite',calm:'Calm Water',weather:'Best Weather',confidence:'Most Certain'}[mode]||'Max Bite';return{mode,modeLabel,species,speciesScore,best,confidence:conf,readiness:ready,safety,call,badge,cls,headline};
    },

    setCommandMode(mode){if(!['bite','calm','weather','confidence'].includes(mode))return;this.state.command.mode=mode;this.save();this.renderCommandCenter();this.renderOpportunityMatrix();this.renderMissionControl();},

    renderCommandCenter(){
      if(!this.$('commandCall')||!this.state.data)return;const r=this.commandRecommendation(),b=r.best||{},win=b.window||{label:'—',score:0};this.$$('.command-mode').forEach(x=>x.classList.toggle('active',x.dataset.commandMode===r.mode));this.$('commandBadge').textContent=r.badge;this.$('commandBadge').className=`command-badge ${r.cls}`;this.$('commandCall').textContent=r.call;this.$('commandHeadline').textContent=r.headline;this.$('commandSummary').textContent=`Priority: ${r.modeLabel}. AnglerSignal ranked ${r.species}, the 7-day forecast, beach readiness and live-source confidence together.`;this.$('commandConfidence').textContent=r.confidence.score;this.$('commandSpecies').textContent=r.species;this.$('commandSpeciesScore').textContent=`${r.speciesScore}/100 today`;this.$('commandDay').textContent=b.day?.day||b.day?.date||'—';this.$('commandDayScore').textContent=b.score?`${b.score}/100 command score`:'—';this.$('commandWindow').textContent=win.label||'—';this.$('commandWindowScore').textContent=win.score?`${win.score}/100 window`:'Best hourly block';this.$('commandReadiness').textContent=`${r.readiness.score}/100`;this.$('commandReadinessCall').textContent=r.readiness.badge||'Check';const c=this.state.data.current||{},f=[['Species',r.speciesScore,r.speciesScore>=82?'good':r.speciesScore>=68?'watch':'low'],['Wind',this.num(c.windSpeed,0)<=10?'GOOD':this.num(c.windSpeed,0)<=16?'WATCH':'ROUGH',this.num(c.windSpeed,0)<=10?'good':this.num(c.windSpeed,0)<=16?'watch':'low'],['Surf',this.num(c.waveHeight,0)<=3?'GOOD':this.num(c.waveHeight,0)<=5?'WATCH':'ROUGH',this.num(c.waveHeight,0)<=3?'good':this.num(c.waveHeight,0)<=5?'watch':'low'],['Data',`${r.confidence.score}%`,r.confidence.score>=75?'good':r.confidence.score>=55?'watch':'low']];this.$('commandFactors').innerHTML=f.map(x=>`<div class="command-factor ${x[2]}"><span>${this.escape(x[0])}</span><strong>${this.escape(String(x[1]))}</strong></div>`).join('');const lp=this.state.command?.lastPlan;this.$('commandPlanStatus').textContent=lp?`Last Command Plan: ${lp.species} • ${lp.day} • ${lp.window} • ${this.prettyDate(lp.created)}`:'No Command Plan saved yet.';
    },

    buildCommandPlan({navigateToTrips=true,toast=true}={}){
      if(!this.state.data)return;const r=this.commandRecommendation();if(!r.best)return this.showToast('A forecast is needed before building a Command Plan.');this.state.targetSpecies=r.species;this.state.scout.species=r.species;this.state.forecastDay=r.best.index;this.recalculateScores();const timeline=this.catchForecastWindows(r.best.index),w=timeline.top[0]||timeline.blocks[0];if(w)this.state.departure.selectedWindow={dayIndex:r.best.index,startIndex:w.index,label:w.label,score:w.score,species:r.species,bestTime:w.best?.time||'',selectedAt:new Date().toISOString()};const bait=this.baitIntelligence(r.species);this.state.goMode.baitPlan={species:r.species,primary:bait.primary,backup:bait.backup,rig:bait.rig,presentation:bait.presentation,terminal:bait.terminal,created:new Date().toISOString()};const plan={id:Date.now(),location:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,species:r.species,day:r.best.day?.day||r.best.day?.date||'Best day',score:r.best.score,window:w?.label||r.best.window?.label||'Best window',priority:`command:${r.mode}`,created:new Date().toISOString(),confidence:r.confidence.score,readiness:r.readiness.score};this.state.savedTripPlans.unshift(plan);this.state.savedTripPlans=this.state.savedTripPlans.slice(0,24);this.state.command.lastPlan={...plan};this.save();this.populateSpeciesControls();this.renderAll();if(navigateToTrips)this.navigate('trips');if(toast)this.showToast('Complete AnglerSignal Command Plan built.');return plan;
    },

    renderOpportunityMatrix(){
      const box=this.$('opportunityMatrix');if(!box||!this.state.data)return;const species=(this.coastRegionSpecies?.()||[]).slice(0,4),days=(this.state.data.days||[]).slice(0,7);let best=null,html='<div class="matrix-grid"><div class="matrix-cell header">TARGET</div>'+days.map(d=>`<div class="matrix-cell header">${this.escape(d.day||d.date||'DAY')}</div>`).join('');for(const sp of species){html+=`<div class="matrix-cell species">${this.escape(sp)}</div>`;const rows=this.commandDayRows(sp,'bite');for(let i=0;i<days.length;i++){const score=rows[i]?.score??this.speciesTodayScore(sp),cls=score>=85?'prime':score>=72?'good':score>=58?'fair':'low';if(!best||score>best.score)best={species:sp,index:i,score,day:days[i]};html+=`<button type="button" class="matrix-cell matrix-score ${cls}" data-matrix-species="${this.escape(sp)}" data-matrix-day="${i}">${score}</button>`;} }html+='</div>';box.innerHTML=html;const conf=this.dataConfidence();if(this.$('matrixConfidenceBadge'))this.$('matrixConfidenceBadge').textContent=`${conf.score}% DATA CONF.`;if(this.$('matrixBestCall'))this.$('matrixBestCall').innerHTML=best?`Best loaded combination: <strong>${this.escape(best.species)} • ${this.escape(best.day?.day||best.day?.date||'Day')} • ${best.score}/100</strong>. Tap the score to open that forecast day.`:'Load a forecast to rank the week.';
    },

    handleMatrixClick(e){const b=e.target.closest('[data-matrix-species][data-matrix-day]');if(!b)return;const species=b.dataset.matrixSpecies,day=Math.max(0,Math.min(6,Number(b.dataset.matrixDay)||0));if(this.species[species])this.state.targetSpecies=species;this.state.forecastDay=day;this.save();this.populateSpeciesControls();this.recalculateScores();this.renderAll();this.navigate('forecast');this.showToast(`${species} • day ${day+1} loaded into Forecast.`);},

    missionReadiness(){
      const safety=this.safetyAssessment(),conf=this.dataConfidence(),regKey=this.regulationCheckKey?.(),regOk=!!(regKey&&this.state.regChecks?.[regKey]?.date===this.localDateKey(new Date())),gear=this.gearItems?.()||[],checked=this.state.gearPlan?.checked||{},gearPct=gear.length?Math.round(gear.filter(i=>checked[i.key]).length/gear.length*100):0,hasBait=!!this.state.goMode?.baitPlan,hasPlan=!!this.state.command?.lastPlan,hasOffline=(this.state.offlinePacks||[]).some(p=>this.haversine(Number(p.location?.lat)||0,Number(p.location?.lon)||0,Number(this.state.location.lat)||0,Number(this.state.location.lon)||0)<.3);const rows=[{ok:hasPlan,label:'Command Plan',detail:hasPlan?'Complete plan saved for this AnglerSignal session.':'Build the one-tap Command Plan.'},{ok:conf.score>=70,label:'Forecast confidence',detail:`${conf.score}% source confidence.`},{ok:safety.level<2,label:'Safety Guard',detail:safety.level<2?safety.status:'High-level condition needs official review.',block:safety.level>=2},{ok:regOk,label:'Regulations',detail:regOk?'Marked reviewed today.':'Official rules not marked checked today.'},{ok:hasBait,label:'Bait & rig plan',detail:hasBait?`${this.titleCase(this.state.goMode.baitPlan.primary)} • ${this.state.goMode.baitPlan.rig}`:'Load a target-specific bait plan.'},{ok:gearPct>=70,label:'Gear planner',detail:`${gearPct}% packed.`},{ok:hasOffline,label:'Offline pack',detail:hasOffline?'Current coast snapshot is saved.':'Optional: save an offline trip pack.'}];const required=rows.filter(x=>x.label!=='Offline pack'),done=required.filter(x=>x.ok).length,pct=Math.round(done/required.length*100);return{rows,pct,blocked:safety.level>=2,ready:pct>=82&&!rows.some(x=>x.block),gearPct,conf};
    },

    renderMissionControl(){
      if(!this.$('missionPercent'))return;const m=this.missionReadiness();this.$('missionPercent').textContent=`${m.pct}%`;this.$('missionProgressBar').style.width=`${m.pct}%`;this.$('missionBadge').textContent=m.blocked?'HOLD':m.ready?'READY':'BUILDING';this.$('missionBadge').className=`tiny-pill ${m.blocked?'danger-pill':m.ready?'ready-pill':'caution-pill'}`;this.$('missionHeadline').textContent=m.blocked?'Safety Guard requires official review before one-tap launch.':m.ready?'Your trip is connected and launch-ready for a final beach check.':'Finish the missing trip checks below.';this.$('missionChecklist').innerHTML=m.rows.map(r=>`<div class="mission-row ${r.ok?'ok':'warn'}"><span>${r.ok?'✓':'!'}</span><div><strong>${this.escape(r.label)}</strong><small>${this.escape(r.detail)}</small></div></div>`).join('');const launch=this.$('missionLaunchBtn');if(launch){launch.disabled=m.blocked;launch.textContent=m.blocked?'Launch blocked — review safety':'Start Go Fishing Mode';}
    },

    launchCommandTrip(){const m=this.missionReadiness();if(m.blocked){this.showToast('Safety Guard is blocking one-tap launch. Review official warnings first.');return;}if(!this.state.command?.lastPlan)this.buildCommandPlan({navigateToTrips:false,toast:false});this.startGoMode();},

    commandShareText(){const r=this.commandRecommendation(),p=this.departurePlan(),bait=this.baitIntelligence(r.species),c=this.state.data?.current||{};return `AnglerSignal 4.0 Command Brief\n${this.state.location.name}\nCall: ${r.call}\nTarget: ${r.species} • ${r.speciesScore}/100 today\nBest day: ${r.best?.day?.day||r.best?.day?.date||'—'} • ${r.best?.score||'—'}/100\nBest window: ${r.best?.window?.label||'—'}\nData confidence: ${r.confidence.score}%\nReadiness: ${r.readiness.score}/100\nBait: ${this.titleCase(bait.primary)} • ${bait.rig}\nWind: ${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)} mph\nSurf: ${this.fmt(c.waveHeight,1)} ft @ ${this.fmt(c.wavePeriod,0)} sec${p?.leaveText?`\nLeave by: ${p.leaveText}`:''}\nSafety Guard: ${r.safety.status}\nVerify access, official warnings and current regulations before fishing.`;},

    async shareCommandBrief(){const text=this.commandShareText();try{if(navigator.share){await navigator.share({title:'AnglerSignal 4.0 Command Brief',text});}else{const b=new Blob([text],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='coastcast-command-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),300);}this.showToast('Command brief ready to share.');}catch(e){if(e?.name!=='AbortError')this.showToast('Could not share the Command Brief.');}},

    personalAnalytics(){
      const catches=this.state.catches||[],complete=catches.filter(c=>c.bait||c.conditionData||c.conditions),speciesCounts={},baitCounts={},waterCounts={},tideCounts={},timeCounts={};let wind=[],wave=[],water=[];for(const c of catches){speciesCounts[c.species]=(speciesCounts[c.species]||0)+1;if(c.bait)baitCounts[c.bait]=(baitCounts[c.bait]||0)+1;const w=this.generalizeWater(c.location||c.water||'');if(w)waterCounts[w]=(waterCounts[w]||0)+1;const tide=this.catchTide(c)||'Unknown tide';tideCounts[tide]=(tideCounts[tide]||0)+1;const tb=this.catchTimeBucket(c.date);timeCounts[tb]=(timeCounts[tb]||0)+1;const d=c.conditionData||{};if(Number.isFinite(Number(d.wind)))wind.push(Number(d.wind));if(Number.isFinite(Number(d.wave)))wave.push(Number(d.wave));if(Number.isFinite(Number(d.water)))water.push(Number(d.water));}const top=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1])[0]||['—',0],topSpecies=top(speciesCounts),topBait=top(baitCounts),topWater=top(waterCounts),topTide=top(tideCounts),topTime=top(timeCounts),depth=Math.min(100,Math.round(catches.length*6+complete.length*4));return{count:catches.length,depth,topSpecies,topBait,topWater,topTide,topTime,avgWind:wind.length?this.average(wind):null,avgWave:wave.length?this.average(wave):null,avgWater:water.length?this.average(water):null};
    },

    renderAnglerAnalytics(){
      if(!this.$('analyticsMetrics'))return;const a=this.personalAnalytics(),stage=a.depth>=80?'STRONG PROFILE':a.depth>=45?'LEARNING FAST':a.depth>0?'LEARNING':'NEEDS CATCHES';this.$('analyticsConfidence').textContent=stage;this.$('analyticsHeadline').textContent=a.count?`AnglerSignal is learning from ${a.count} logged catch${a.count===1?'':'es'}. Your strongest repeated patterns are shown below.`:'Log catches with bait, time and conditions to unlock your personal fishing profile.';this.$('analyticsLearningText').textContent=`${a.depth}%`;this.$('analyticsLearningBar').style.width=`${a.depth}%`;const metrics=[['TOP SPECIES',a.topSpecies[0],`${a.topSpecies[1]} catches`],['TOP BAIT',a.topBait[0],`${a.topBait[1]} logged`],['BEST WATER',a.topWater[0],`${a.topWater[1]} catches`],['BEST TIME',a.topTime[0],`${a.topTime[1]} catches`]];this.$('analyticsMetrics').innerHTML=metrics.map(x=>`<article class="analytics-metric"><span>${this.escape(x[0])}</span><strong>${this.escape(x[1])}</strong><small>${this.escape(x[2])}</small></article>`).join('');const patterns=[['Tide pattern',a.topTide[0],`${a.topTide[1]} catches`],['Average wind',a.avgWind==null?'Need condition data':`${this.fmt(a.avgWind,0)} mph`,'From catches with saved conditions'],['Average surf',a.avgWave==null?'Need condition data':`${this.fmt(a.avgWave,1)} ft`,'From catches with saved conditions'],['Average water temp',a.avgWater==null?'Need condition data':`${this.fmt(a.avgWater,0)}°F`,'From catches with saved conditions']];this.$('analyticsPatterns').innerHTML=patterns.map(x=>`<div class="analytics-pattern"><div><strong>${this.escape(x[0])}</strong><small>${this.escape(x[2])}</small></div><b>${this.escape(x[1])}</b></div>`).join('');
    },

    planningReadiness(){
      const c=this.state.data?.current||{},s=this.safetyAssessment(),status=this.overallDataStatus(),score=this.currentScore();
      let total=0;const factors=[];
      const add=(name,value,detail,state='good')=>{value=Math.max(0,Math.min(100,Math.round(value)));total+=value;factors.push({name,value,detail,state});};
      add('Bite',score,`${this.state.targetSpecies} peak is ${score}/100.`,score>=82?'good':score>=68?'watch':'low');
      const wind=this.num(c.windSpeed,99),gust=this.num(c.windGust,wind),windScore=Math.max(20,100-Math.max(0,wind-8)*4-Math.max(0,gust-16)*2.3);
      add('Wind',windScore,`${this.compass(c.windDir)} ${this.fmt(wind,0)} mph • gusts ${this.fmt(gust,0)}.`,windScore>=75?'good':windScore>=55?'watch':'low');
      const wave=this.num(c.waveHeight,9),waveScore=Math.max(15,100-Math.max(0,wave-2.5)*18);
      add('Surf',waveScore,`${this.fmt(wave,1)} ft @ ${this.fmt(c.wavePeriod,0)} sec.`,waveScore>=78?'good':waveScore>=55?'watch':'low');
      const rain=this.num(c.rain,50),wxScore=Math.max(15,100-rain*.75-([95,96,99].includes(Number(c.weatherCode))?55:0));
      add('Weather',wxScore,`${this.fmt(rain,0)}% rain • ${c.weather||this.weatherText(c.weatherCode)}.`,wxScore>=78?'good':wxScore>=55?'watch':'low');
      const trust=status==='live'?100:status==='partial'?72:status==='loading'?45:35;
      add('Data',trust,status==='live'?'Weather, marine and NOAA tide feeds confirmed live.':status==='partial'?'Some core feeds are live; fallbacks fill gaps.':'Refresh live data before travel.',trust>=90?'good':trust>=60?'watch':'low');
      let readiness=Math.round(total/factors.length);
      if(s.level>=2)readiness=Math.min(readiness,32);else if(s.level===1)readiness=Math.min(readiness,62);
      let call='WAIT FOR BETTER WINDOW',headline='Conditions are mixed',badge='CAUTION',cls='watch';
      if(s.level>=2){call='HOLD & REVIEW OFFICIAL WARNINGS';headline='A significant hazard is flagged';badge='HOLD';cls='low';}
      else if(readiness>=82&&status==='live'){call='STRONG TRIP WINDOW';headline='The fishing plan lines up well';badge='FAVORABLE';cls='good';}
      else if(readiness>=68){call='GO WITH A CONDITIONS CHECK';headline='Fishable planning window with tradeoffs';badge='REVIEW';cls='watch';}
      else if(readiness<50){call='WAIT / RECHECK';headline='Better conditions may be worth waiting for';badge='WAIT';cls='low';}
      const best=this.findBestWindow((this.state.data?.hours||[]).filter(h=>h.dateIndex===0).slice(0,24));
      return{score:readiness,call,headline,badge,cls,factors,best,safety:s};
    },

    renderBeachReadiness(){
      if(!this.$('readinessScore'))return;const r=this.planningReadiness();
      this.$('readinessScore').textContent=r.score;this.$('readinessBadge').textContent=r.badge;this.$('readinessBadge').className=`tiny-pill readiness-${r.cls}`;
      this.$('readinessHeadline').textContent=r.headline;this.$('readinessDetail').textContent=`Best ${this.state.targetSpecies} window: ${r.best.label}. ${r.safety.detail}`;
      this.$('readinessCall').textContent=r.call;this.$('readinessCallDetail').textContent=r.safety.level?`Review official warnings before travel. ${r.safety.detail}`:`Use ${r.best.label} as your target window, then recheck conditions before entering the beach.`;
      this.$('readinessFactors').innerHTML=r.factors.map(f=>`<div class="readiness-factor ${f.state}"><div><span>${this.escape(f.name)}</span><small>${this.escape(f.detail)}</small></div><strong>${f.value}</strong></div>`).join('');
    },

    catchForecastWindows(dayIndex=this.state.forecastDay){
      const d=this.state.data||{},day=d.days?.[dayIndex]||d.days?.[0]||{},species=this.state.targetSpecies;let hours=(d.hours||[]).filter(h=>h.dateIndex===dayIndex).slice(0,24);
      if(!hours.length)hours=(d.hours||[]).slice(0,24).map(h=>({...h,dateIndex:dayIndex}));
      const scored=hours.map((h,i)=>({...h,_idx:i,speciesScore:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??d.current?.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current?.pressure},species)}));
      const blocks=[];for(let i=0;i<scored.length;i+=3){const rows=scored.slice(i,i+3);if(!rows.length)continue;blocks.push({index:i,label:`${rows[0].time} – ${rows[rows.length-1].time}`,score:Math.round(this.average(rows.map(x=>x.speciesScore))),rows,best:rows.reduce((x,y)=>!x||y.speciesScore>x.speciesScore?y:x,null)});}
      return{species,scored,blocks,top:[...blocks].sort((x,y)=>y.score-x.score).slice(0,3)};
    },

    renderCatchTimeline(){
      if(!this.$('catchTimeline'))return;const t=this.catchForecastWindows();
      this.$('catchTimelineTitle').textContent=`${t.species} hourly outlook`;this.$('catchTimelineBadge').textContent=this.overallDataStatus()==='live'?'LIVE + SPECIES':'SPECIES MODE';
      const max=Math.max(100,...t.scored.map(h=>h.speciesScore));
      this.$('catchTimeline').innerHTML=t.scored.map(h=>`<div class="catch-timeline-hour" title="${this.escape(h.time)} • ${h.speciesScore}/100"><span style="height:${Math.max(8,Math.round(h.speciesScore/max*100))}%" class="${h.speciesScore>=85?'prime':h.speciesScore>=72?'good':h.speciesScore>=58?'fair':'low'}"></span><small>${this.escape(h.time.replace(':00',''))}</small><b>${h.speciesScore}</b></div>`).join('');
      this.$('topWindowCards').innerHTML=t.top.map((w,i)=>`<button type="button" class="top-window-card ${i===0?'winner':''}" data-catch-window="${w.index}"><span>${i===0?'BEST':'#'+(i+1)}</span><strong>${this.escape(w.label)}</strong><em>${w.score}/100</em><small>${this.escape(w.best?.tide||'Moving tide')} • ${this.fmt(w.best?.wind,0)} mph wind • ${this.fmt(w.best?.wave,1)} ft surf</small></button>`).join('');
    },

    chooseCatchWindow(startIndex){
      const t=this.catchForecastWindows(),w=t.blocks.find(x=>x.index===startIndex);if(!w)return;
      this.state.departure.selectedWindow={dayIndex:this.state.forecastDay,startIndex:w.index,label:w.label,score:w.score,species:t.species,bestTime:w.best?.time||w.rows?.[0]?.time||'',selectedAt:new Date().toISOString()};
      this.save();this.navigate('trips');this.renderSmartDeparture();this.showToast(`${w.label} loaded into Smart Departure.`);
    },

    departureWindow(){
      const saved=this.state.departure?.selectedWindow;if(saved&&saved.species===this.state.targetSpecies){const t=this.catchForecastWindows(Number(saved.dayIndex)||0),w=t.blocks.find(x=>x.index===Number(saved.startIndex));if(w)return{...w,dayIndex:Number(saved.dayIndex)||0,species:t.species};}
      const t=this.catchForecastWindows(0),w=t.top[0]||t.blocks[0];return w?{...w,dayIndex:0,species:t.species}:null;
    },

    clockToMinutes(value){const m=String(value||'').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);if(!m)return null;let h=Number(m[1])%12;if(m[3].toUpperCase()==='PM')h+=12;return h*60+Number(m[2]||0);},
    minutesToClock(mins){mins=((Math.round(mins)%1440)+1440)%1440;let h=Math.floor(mins/60),m=mins%60,ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`;},

    updateDeparturePreferences(toast=false){
      const d=this.state.departure;d.driveMinutes=Math.max(0,Math.min(720,Number(this.$('departureDrive')?.value)||0));d.setupMinutes=Math.max(0,Math.min(180,Number(this.$('departureSetup')?.value)||0));d.baitMinutes=Math.max(0,Math.min(120,Number(this.$('departureBaitStop')?.value)||0));this.save();this.renderSmartDeparture();if(toast)this.showToast('Departure plan recalculated.');
    },

    departurePlan(){
      const w=this.departureWindow();if(!w)return null;const d=this.state.departure,startText=w.rows?.[0]?.time||w.best?.time||'',start=this.clockToMinutes(startText);if(start==null)return{window:w};
      const setup=Math.max(0,Number(d.setupMinutes)||0),drive=Math.max(0,Number(d.driveMinutes)||0),bait=Math.max(0,Number(d.baitMinutes)||0),arrive=start-setup,leave=arrive-drive-bait;
      return{window:w,start,arrive,leave,drive,setup,bait,leaveText:this.minutesToClock(leave),arriveText:this.minutesToClock(arrive),fishText:w.label};
    },

    renderSmartDeparture(){
      if(!this.$('departureLeave'))return;const d=this.state.departure||{};this.$('departureDrive').value=String(d.driveMinutes??45);this.$('departureSetup').value=String(d.setupMinutes??20);this.$('departureBaitStop').value=String(d.baitMinutes??20);
      const p=this.departurePlan();if(!p||p.start==null){this.$('departureLeave').textContent='—';this.$('departureArrive').textContent='—';this.$('departureFish').textContent=p?.window?.label||'—';return;}
      const day=this.state.data?.days?.[p.window.dayIndex]||this.state.data?.days?.[0]||{};this.$('departureLeave').textContent=p.leaveText;this.$('departureArrive').textContent=p.arriveText;this.$('departureFish').textContent=p.fishText;this.$('departureLeaveDay').textContent=`${day.date||day.day||'Today'} • destination local time`;this.$('departureFishScore').textContent=`${p.window.species} • ${p.window.score}/100`;
      const bait=this.baitIntelligence(p.window.species),shop=(this.state.data?.shops||[])[0],readiness=this.planningReadiness();this.$('departureBadge').textContent=readiness.badge;
      this.$('departureBrief').innerHTML=`Leave by <strong>${this.escape(p.leaveText)}</strong> to allow ${p.drive} min drive${p.bait?`, ${p.bait} min bait stop`:''} and ${p.setup} min setup. Target <strong>${this.escape(p.fishText)}</strong> for ${this.escape(p.window.species)}. Start with ${this.escape(this.titleCase(bait.primary))}${shop?` • nearest loaded shop: ${this.escape(shop.name)}`:''}.`;
    },

    departureShareText(){const p=this.departurePlan();if(!p||p.start==null)return'';const bait=this.baitIntelligence(p.window.species),c=this.state.data?.current||{},s=this.safetyAssessment();return `AnglerSignal Trip Brief\n${this.state.location.name}\nTarget: ${p.window.species} (${p.window.score}/100)\nLeave by: ${p.leaveText}\nArrive/setup: ${p.arriveText}\nFish: ${p.fishText}\nBait: ${this.titleCase(bait.primary)} • ${bait.rig}\nWind: ${this.compass(c.windDir)} ${this.fmt(c.windSpeed,0)} mph\nSurf: ${this.fmt(c.waveHeight,1)} ft @ ${this.fmt(c.wavePeriod,0)} sec\nSafety Guard: ${s.status}\nVerify local access, beach flags and current regulations before fishing.`;},

    async shareDepartureBrief(){const text=this.departureShareText();if(!text){this.showToast('Build a departure plan first.');return;}try{if(navigator.share){await navigator.share({title:'AnglerSignal Trip Brief',text});this.showToast('Trip brief shared.');}else{const blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),el=document.createElement('a');el.href=url;el.download='coastcast-trip-brief.txt';el.click();setTimeout(()=>URL.revokeObjectURL(url),300);this.showToast('Trip brief downloaded.');}}catch(e){if(e?.name!=='AbortError')this.showToast('Could not share the trip brief.');}},

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
      const items=[['Weather',h.weather],['Marine',h.marine],['NOAA tides',h.tides],['NWS alerts',h.alerts],['Ocean obs',h.buoy],['Tackle shops',h.shops]];
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

    renderDestinationHub(){
      const box=this.$('destinationHubPanel');if(!box||!this.state.data)return;
      const current=this.state.data.current||{},ranked=this.rankSpecies?.()||[],top=ranked[0]||{name:this.state.targetSpecies,score:this.speciesTodayScore(this.state.targetSpecies)};
      const region=this.coastRegion(),confidence=this.dataConfidence(),places=Array.isArray(this.state.mapPOIs)?this.state.mapPOIs:[],shops=(this.state.data.shops||[]).filter(s=>this.isLikelyTackleShop(s.name,{tags:s.osmTags||{},display_name:s.displayName||'',categories:s.categories||[],verifiedFishing:s.verified===true}));
      const placeStatus={idle:'Not scanned',loading:'Scanning…',official:'Official access',live:'Public map',search:'Search indexed',verified:'Verified catalog',anchor:'Forecast point',cached:'Cached places',fallback:'Coverage limited'}[this.state.mapPlacesStatus]||'Not scanned';
      const shopHealth=this.state.sourceHealth?.shops||'demo';const shopLabel=shopHealth==='live'?'Live places':shopHealth==='verified'?'Verified + live':shopHealth==='loading'?'Searching…':shopHealth==='fallback'?'Coverage limited':this.state.live?'Not loaded':'Demo';
      const score=Number(top.score)||0;let call='PROMISING COAST';if(score>=88&&confidence.score>=72)call='STRONG DESTINATION';else if(score>=76)call='GOOD TRIP OPTION';else if(score<62)call='SCOUT BEFORE DRIVING';
      this.$('destinationHubTitle').textContent=this.state.location.name;
      this.$('destinationRegionBadge').textContent=region.toUpperCase();
      this.$('destinationPrimaryCall').textContent=call;
      this.$('destinationBrief').textContent=`${top.name} currently ranks ${Math.round(score)}/100 here. ${places.length?`${places.length} mapped fishing/access place${places.length===1?'':'s'} loaded.`:'Public-access coverage has not been scanned yet.'} ${shops.length?`${shops.length} verified fishing/tackle option${shops.length===1?'':'s'} loaded within your tackle radius.`:'Tackle coverage can be searched separately.'}`;
      this.$('destinationConfidence').textContent=confidence.score;
      this.$('destinationTopSpecies').textContent=top.name;
      this.$('destinationTopSpeciesScore').textContent=`${Math.round(score)}/100 today`;
      this.$('destinationAccessCount').textContent=String(places.length);
      this.$('destinationAccessStatus').textContent=placeStatus;
      this.$('destinationShopCount').textContent=String(shops.length);
      this.$('destinationShopStatus').textContent=shopLabel;
      this.$('destinationWaterTemp').textContent=Number.isFinite(Number(current.waterTemp))?`${this.fmt(current.waterTemp,0)}°F`:'—';
      this.$('destinationWaterNote').textContent=`${this.state.targetSpecies} mode`;
      const liveCore=['weather','marine','tides'].filter(k=>this.state.sourceHealth?.[k]==='live').length;
      this.$('destinationSourceLine').textContent=`${liveCore}/3 core forecast feeds live • ${region} • ${this.state.tackleRadius||20} mi tackle radius • ${confidence.score}% data confidence`;
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
      const shops=(this.state.data.shops||[]).filter(s=>s.demo||s.verified||this.isLikelyTackleShop(s.name,{tags:s.osmTags||{},display_name:s.displayName||'',categories:s.categories||[]})).slice(0,8);
      const html=shops.length?shops.map((s,i)=>this.shopHTML(s,i)).join(''):'<div class="empty-state">No bait/tackle shops loaded yet.</div>';
      this.$('baitShopList').innerHTML=html;this.$('mapShopList').innerHTML=html;
      this.bindShopLinks();
    },

    shopHTML(s,i){
      const tags=(s.tags||[]).slice(0,2).join(' • '); const dist=this.fmt(s.distance,1);const fallback=s.demo?' • fallback listing':s.cached?' • cached result':'';const source=s.verified?'VERIFIED':/Geoapify/i.test(s.source||'')?'PLACES':/OpenStreetMap/i.test(s.source||'')?'OSM':'SEARCH';
      return `<div class="list-item shop-list-item"><div class="shop-rank">${i+1}</div><div><div class="list-title">${this.escape(s.name)} <span class="shop-source-badge">${source}</span></div><div class="list-sub">${dist} mi from fishing spot${tags?' • '+this.escape(tags):''}${fallback}</div></div><div class="list-actions"><a class="mini-button" href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">To shop</a><a class="mini-button route-button" href="${this.mapsRouteUrl(s.lat,s.lon,this.state.location.lat,this.state.location.lon)}" target="_blank" rel="noopener">Shop → spot</a></div></div>`;
    },
    bindShopLinks(){},

    renderForecast(){
      if(this.$('destinationClock'))this.$('destinationClock').textContent=this.destinationClockText();
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
      this.renderCatchTimeline();
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
      const plan={id:Date.now(),location:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,species,day:best.day,score:best.adjusted,window:window.label,priority,created:new Date().toISOString()};this.state.savedTripPlans.unshift(plan);this.state.savedTripPlans=this.state.savedTripPlans.slice(0,20);this.save();this.$('tripCount').textContent=this.state.trips;this.renderTrips();
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
      const catchDate=this.$('catchDateTime').value||new Date().toISOString();const item={id:Date.now(),species,date:catchDate,length:this.$('catchLength').value,weight:this.$('catchWeight').value,bait:this.$('catchBait').value.trim(),notes:this.$('catchNotes').value.trim(),privacy:this.$('catchPrivacy').value,location:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,conditions:this.snapshotConditions(),conditionData:this.conditionSnapshotData(catchDate),score:this.currentScore(),sessionId:this.state.goMode?.active?this.state.goMode.sessionId:null,photo:this._catchPhotoDraft||''};
      this.state.catches.unshift(item);this.save();this.closeDialog('catchDialog');this.$('catchForm').reset();this.clearCatchPhoto(false);this.ensureCatchDate();this.renderLogbook();this.renderCommunity();this.renderMapLayers();this.renderPatternMatch();this.renderGoMode();this.showToast(this.state.goMode?.active?'Catch added to your live fishing session.':'Catch saved with AnglerSignal conditions.');
    },

    renderLogbook(){
      const catches=this.state.catches;this.$('catchCount').textContent=catches.length;this.$('speciesCount').textContent=new Set(catches.map(c=>c.species)).size;this.$('tripCount').textContent=this.state.trips;
      const pb=new Map();catches.forEach(c=>{const len=Number(c.length)||0;if(len>(pb.get(c.species)||0))pb.set(c.species,len)});this.$('pbCount').textContent=[...pb.values()].filter(v=>v>0).length;
      this.$('targetSpecies').value=this.state.targetSpecies;this.$('logbookTargetTitle').textContent=this.state.targetSpecies;this.$('speciesTip').textContent=this.species[this.state.targetSpecies].note;
      this.renderPersonalInsights();this.renderCatchIntelligence();this.renderCatchList();
    },

    renderPersonalInsights(){
      const c=this.state.catches,box=this.$('personalInsights');
      if(!c.length){box.innerHTML='<div class="personal-insight"><strong>Start building your fishing pattern</strong><span>Log catches with bait, size and conditions. AnglerSignal will summarize your strongest patterns here.</span></div>';return;}
      const topSpecies=this.mode(c.map(x=>x.species));const topBait=this.mode(c.map(x=>x.bait).filter(Boolean))||'Not enough bait data';const avgScore=Math.round(this.average(c.map(x=>Number(x.score)||0).filter(Boolean)))||0;
      box.innerHTML=`<div class="personal-insight"><strong>Most logged species: ${this.escape(topSpecies||'—')}</strong><span>${c.filter(x=>x.species===topSpecies).length} catch${c.filter(x=>x.species===topSpecies).length===1?'':'es'} in your logbook.</span></div><div class="personal-insight"><strong>Most-used successful bait: ${this.escape(topBait)}</strong><span>This is based only on catches you have personally logged.</span></div><div class="personal-insight"><strong>Average saved AnglerSignal score: ${avgScore||'—'}</strong><span>As your log grows, this can become a personalized condition profile.</span></div>`;
    },

    renderCatchList(){
      const filter=this.$('logPrivacyFilter').value||'all';const catches=this.state.catches.filter(c=>filter==='all'||c.privacy===filter);const box=this.$('catchList');
      if(!catches.length){box.className='list-stack empty-state';box.textContent='Your catches will appear here.';return;}
      box.className='list-stack';box.innerHTML=catches.map(c=>`<article class="catch-card">${c.photo?`<img class="catch-photo-thumb" src="${c.photo}" alt="${this.escape(c.species)} catch photo"/>`:''}<div class="catch-head"><div><div class="catch-species">${this.escape(c.species)}</div><div class="list-sub">${this.prettyDate(c.date)} • ${this.escape(c.location)}</div></div><span class="privacy-pill">${c.privacy==='public'?'Public':c.privacy==='water'?'Water only':'Private'}</span></div><div class="catch-measurements">${c.length?`${this.escape(c.length)} in`:''}${c.length&&c.weight?' • ':''}${c.weight?`${this.escape(c.weight)} lb`:''}${c.bait?` • ${this.escape(c.bait)}`:''}</div>${c.notes?`<div class="catch-notes">${this.escape(c.notes)}</div>`:''}<div class="catch-conditions">${this.escape(c.conditions)} • Score ${this.escape(c.score||'—')}</div><div class="catch-card-actions"><button class="mini-button" type="button" data-share-catch="${c.id}">Create card</button></div></article>`).join('');
    },

    conditionSnapshotData(dateValue){
      const c=this.state.data?.current||{};const d=dateValue?new Date(dateValue):new Date();return{temp:Number(c.temp),wind:Number(c.windSpeed),windDir:Number(c.windDir),wave:Number(c.waveHeight),period:Number(c.wavePeriod),water:Number(c.waterTemp),pressure:Number(c.pressure),rain:Number(c.rain),tide:this.currentTideLabel(),hour:Number.isFinite(d.getTime())?d.getHours():new Date().getHours()};
    },

    catchTimeBucket(value){const d=new Date(value);const h=Number.isFinite(d.getTime())?d.getHours():12;if(h>=4&&h<10)return'Dawn / Morning';if(h>=10&&h<16)return'Midday';if(h>=16&&h<21)return'Evening';return'Night';},
    catchTide(c){if(c?.conditionData?.tide)return c.conditionData.tide;const t=String(c?.conditions||'').toLowerCase();if(t.includes('rising'))return'Rising tide';if(t.includes('falling'))return'Falling tide';if(t.includes('high tide'))return'High tide';if(t.includes('low tide'))return'Low tide';return'';},
    targetCatchHistory(){return this.state.catches.filter(c=>c.species===this.state.targetSpecies);},
    personalPattern(){
      const catches=this.targetCatchHistory();if(!catches.length)return{score:null,count:0,confidence:0,topBait:'Not enough data',bestTime:'Not enough data',bestTide:'Not enough data'};
      const cur=this.conditionSnapshotData(new Date().toISOString());const nowBucket=this.catchTimeBucket(new Date().toISOString());const similarities=[];
      catches.slice(0,30).forEach(c=>{const p=c.conditionData||this.parseCatchConditions(c.conditions);let total=0,weight=0;const add=(v,w)=>{if(Number.isFinite(v)){total+=Math.max(0,Math.min(1,v))*w;weight+=w;}};add(Number.isFinite(p.water)?1-Math.abs(p.water-cur.water)/14:null,26);add(Number.isFinite(p.wind)?1-Math.abs(p.wind-cur.wind)/12:null,20);add(Number.isFinite(p.wave)?1-Math.abs(p.wave-cur.wave)/3.5:null,20);add(Number.isFinite(Number(c.score))?1-Math.abs(Number(c.score)-this.currentScore())/35:null,12);const tide=this.catchTide(c);if(tide){add(tide.toLowerCase()===String(cur.tide).toLowerCase()?1:.35,12);}add(this.catchTimeBucket(c.date)===nowBucket?1:.35,10);if(weight)similarities.push(Math.round(total/weight*100));});
      similarities.sort((a,b)=>b-a);const score=similarities.length?Math.round(this.average(similarities.slice(0,Math.min(3,similarities.length)))):null;const topBait=this.mode(catches.map(c=>String(c.bait||'').trim()).filter(Boolean))||'Not enough data';const bestTime=this.mode(catches.map(c=>this.catchTimeBucket(c.date)))||'Not enough data';const bestTide=this.mode(catches.map(c=>this.catchTide(c)).filter(Boolean))||'Not enough data';const confidence=Math.min(96,20+catches.length*11+Math.min(20,similarities.length*2));return{score,count:catches.length,confidence,topBait,bestTime,bestTide};
    },

    renderPatternMatch(){
      if(!this.$('patternMatchScore'))return;const p=this.personalPattern();this.$('patternMatchScore').textContent=p.score==null?'--':String(p.score);this.$('patternCatchCount').textContent=`${p.count} catch${p.count===1?'':'es'}`;this.$('patternTopBait').textContent=p.topBait;this.$('patternBestTime').textContent=p.bestTime;this.$('patternConfidence').textContent=p.count?`${p.confidence}% confidence`:'Learning';
      if(!p.count){this.$('patternMatchLabel').textContent='Build your fishing pattern';this.$('patternMatchDetail').textContent=`Log ${this.state.targetSpecies} catches and AnglerSignal will compare today with the conditions that have worked for you.`;return;}
      const label=p.score>=85?'Very similar to your successful days':p.score>=70?'Good personal match':p.score>=55?'Some familiar signals':'Different from your usual success pattern';this.$('patternMatchLabel').textContent=label;this.$('patternMatchDetail').textContent=`Based on ${p.count} ${this.state.targetSpecies} catch${p.count===1?'':'es'}. Your strongest history signal is ${p.topBait}, with ${p.bestTime.toLowerCase()} producing the most logged catches.`;
    },

    renderCatchIntelligence(){
      if(!this.$('catchIntelHero'))return;const all=this.state.catches,target=this.targetCatchHistory(),p=this.personalPattern();this.$('catchIntelConfidence').textContent=target.length?`${target.length} ${this.state.targetSpecies}`:`${all.length} catches`;
      if(!all.length){this.$('catchIntelHero').innerHTML='<strong>Your personal fishing model starts here</strong>Log catches with bait, time and AnglerSignal conditions. After a few trips, this screen will show your strongest patterns.';this.$('catchIntelMetrics').innerHTML='<div><span>TOP BAIT</span><strong>—</strong></div><div><span>BEST TIME</span><strong>—</strong></div><div><span>BEST TIDE</span><strong>—</strong></div><div><span>MATCH NOW</span><strong>—</strong></div>';this.$('catchIntelBars').innerHTML='';return;}
      const base=target.length?target:all;const avgScore=Math.round(this.average(base.map(c=>Number(c.score)).filter(Number.isFinite)))||0;const topSpecies=this.mode(all.map(c=>c.species))||'—';this.$('catchIntelHero').innerHTML=`<strong>${this.escape(this.state.targetSpecies)} personal model</strong>${target.length?`AnglerSignal has ${target.length} successful ${this.escape(this.state.targetSpecies)} record${target.length===1?'':'s'} to compare against today's conditions.`:`You have ${all.length} catches logged. Target ${this.escape(this.state.targetSpecies)} catches will make this model species-specific.`}`;
      this.$('catchIntelMetrics').innerHTML=`<div><span>TOP BAIT</span><strong>${this.escape(p.topBait)}</strong></div><div><span>BEST TIME</span><strong>${this.escape(p.bestTime)}</strong></div><div><span>BEST TIDE</span><strong>${this.escape(p.bestTide)}</strong></div><div><span>MATCH NOW</span><strong>${p.score==null?'—':p.score+'%'}</strong></div>`;
      const baitCounts={};base.forEach(c=>{const b=String(c.bait||'').trim();if(b)baitCounts[b]=(baitCounts[b]||0)+1;});const topBaits=Object.entries(baitCounts).sort((a,b)=>b[1]-a[1]).slice(0,4);const max=Math.max(1,...topBaits.map(x=>x[1]));const rows=topBaits.length?topBaits.map(([name,count])=>`<div class="intel-bar-row"><span>${this.escape(name)}</span><div class="intel-bar-track"><div class="intel-bar-fill" style="width:${Math.round(count/max*100)}%"></div></div><strong>${count}</strong></div>`).join(''):`<div class="personal-insight"><strong>Most logged species: ${this.escape(topSpecies)}</strong><span>Add bait/lure names to your catches to build the bait success chart. Average saved score: ${avgScore||'—'}.</span></div>`;this.$('catchIntelBars').innerHTML=rows;
    },

    setCommunityTab(tab){
      if(!['feed','mine','challenges'].includes(tab))tab='feed';
      this.state.community.tab=tab;this.save();this.renderCommunity();
    },

    communityChallengeData(){
      const now=Date.now(),week=7*86400000,month=30*86400000;
      const recentWeek=this.state.catches.filter(c=>{const t=new Date(c.date).getTime();return Number.isFinite(t)&&now-t<=week;});
      const recentMonth=this.state.catches.filter(c=>{const t=new Date(c.date).getTime();return Number.isFinite(t)&&now-t<=month;});
      const sessions=(this.state.goMode?.history||[]).filter(s=>{const t=new Date(s.endedAt||s.startedAt||0).getTime();return Number.isFinite(t)&&now-t<=month;});
      const challenges=[
        {id:'three-board',title:'Three on the board',detail:'Log 3 catches in 7 days.',value:recentWeek.length,target:3,xp:120,icon:'3×'},
        {id:'species-explorer',title:'Species explorer',detail:'Log 3 different species in 30 days.',value:new Set(recentMonth.map(c=>c.species)).size,target:3,xp:180,icon:'SP'},
        {id:'coast-hopper',title:'Coast hopper',detail:'Log catches at 2 different waters in 30 days.',value:new Set(recentMonth.map(c=>this.generalizeWater(c.location))).size,target:2,xp:160,icon:'↗'},
        {id:'photo-journal',title:'Photo journal',detail:'Save 3 catches with photos.',value:this.state.catches.filter(c=>c.photo).length,target:3,xp:140,icon:'▣'},
        {id:'session-ready',title:'Full session',detail:'Complete one Go Fishing session this month.',value:sessions.length,target:1,xp:100,icon:'GO'}
      ];
      const badges=[
        {id:'first-catch',title:'First Catch',detail:'Log your first catch.',unlocked:this.state.catches.length>=1,icon:'01'},
        {id:'ten-catches',title:'Ten on the Log',detail:'Reach 10 logged catches.',unlocked:this.state.catches.length>=10,icon:'10'},
        {id:'three-species',title:'Species Scout',detail:'Log 3 unique species.',unlocked:new Set(this.state.catches.map(c=>c.species)).size>=3,icon:'3S'},
        {id:'photo-angler',title:'Photo Angler',detail:'Save 5 catch photos.',unlocked:this.state.catches.filter(c=>c.photo).length>=5,icon:'PH'},
        {id:'road-warrior',title:'Coast Hopper',detail:'Fish 3 different waters.',unlocked:new Set(this.state.catches.map(c=>this.generalizeWater(c.location))).size>=3,icon:'CH'},
        {id:'trip-builder',title:'Trip Builder',detail:'Complete 3 fishing sessions.',unlocked:(this.state.goMode?.history||[]).length>=3,icon:'TR'}
      ];
      const xp=challenges.reduce((sum,c)=>sum+(c.value>=c.target?c.xp:Math.round(c.xp*Math.min(1,c.value/c.target)*.35)),0)+badges.filter(b=>b.unlocked).length*75;
      return{challenges,badges,xp};
    },

    renderCommunityChallenges(){
      const d=this.communityChallengeData();
      if(this.$('communityChallengeScore'))this.$('communityChallengeScore').innerHTML=`<strong>${d.xp}</strong><span>XP</span>`;
      if(this.$('communityChallenges'))this.$('communityChallenges').innerHTML=d.challenges.map(c=>{
        const pct=Math.min(100,Math.round(c.value/c.target*100)),done=c.value>=c.target;
        return `<article class="challenge-card ${done?'complete':''}"><div class="challenge-icon">${this.escape(c.icon)}</div><div class="challenge-copy"><div class="challenge-title-row"><strong>${this.escape(c.title)}</strong><span>${Math.min(c.value,c.target)}/${c.target}</span></div><p>${this.escape(c.detail)}</p><div class="challenge-progress"><span style="width:${pct}%"></span></div><small>${done?`Complete • +${c.xp} XP`:`${pct}% complete`}</small></div></article>`;
      }).join('');
      const unlocked=d.badges.filter(b=>b.unlocked).length;
      if(this.$('communityBadgeCount'))this.$('communityBadgeCount').textContent=`${unlocked} unlocked`;
      if(this.$('communityBadges'))this.$('communityBadges').innerHTML=d.badges.map(b=>`<article class="achievement-badge ${b.unlocked?'unlocked':'locked'}"><div class="achievement-mark">${this.escape(b.icon)}</div><strong>${this.escape(b.title)}</strong><span>${this.escape(b.detail)}</span></article>`).join('');
    },

    normalizeLocalCommunityPosts(){
      const published=new Set((this.state.community.publishedLocalIds||[]).map(String));
      return this.state.catches.filter(c=>published.has(String(c.id))).map(c=>({
        id:`local-${c.id}`,sourceCatchId:String(c.id),own:true,local:true,user:this.state.profile?.name||'You',
        species:c.species,size:c.length?`${c.length} in`:'',length:c.length||'',weight:c.weight||'',
        ago:this.prettyDate(c.date),date:c.date,bait:c.bait||'Not listed',
        water:c._communityPrecision==='hidden'?'Location hidden':c._communityPrecision==='exact'?c.location:this.generalizeWater(c.location),
        text:c._communityCaption||c.notes||'Shared a catch with AnglerSignal.',photo:c.photo||'',
        score:c.score||'',conditions:c.conditions||'',lat:c._communityPrecision==='exact'?Number(c.lat):Math.round(Number(c.lat)*10)/10,
        lon:c._communityPrecision==='exact'?Number(c.lon):Math.round(Number(c.lon)*10)/10,likes:0
      }));
    },

    normalizeMockCommunityPosts(){
      const baseLat=Number(this.state.location.lat),baseLon=Number(this.state.location.lon);
      return (this.mock.community||[]).map((p,i)=>({
        id:`demo-${i+1}`,demo:true,user:p.user,species:p.species,size:p.size||'',ago:p.ago,bait:p.bait||'Not listed',
        water:p.water||'Nearby water',text:p.text||'',photo:'',score:'',conditions:'',lat:baseLat+(i-.8)*.035,lon:baseLon+(i-.8)*.03,
        likes:[7,12,5][i]||3
      }));
    },

    async loadCloudCommunity({quiet=false}={}){
      if(!this.$('communityFeed'))return;
      if(!this.cloudSignedIn()){
        this._cloudCommunityPosts=[];this._cloudCommunityReactions={};
        this.renderCommunityMode();this.renderCommunity();if(!quiet)this.showToast('Community is in Local Preview until Cloud Sync is connected.');return;
      }
      const c=this.state.cloud;
      try{
        if(!quiet&&this.$('communityModeText'))this.$('communityModeText').textContent='Refreshing AnglerSignal Community…';
        const r=await this.cloudRequest(`${c.url}/rest/v1/community_catches?select=id,user_id,display_name,species,catch_date,length_in,weight_lb,bait,caption,location_label,location_precision,public_lat,public_lon,coastcast_score,conditions,photo_data,created_at&order=created_at.desc&limit=75`,{method:'GET'});
        const rows=await r.json();if(!r.ok)throw new Error(rows?.message||'Community tables are not available.');
        let reactions=[];try{const rr=await this.cloudRequest(`${c.url}/rest/v1/community_reactions?select=post_id,user_id,reaction&limit=500`,{method:'GET'});const rb=await rr.json();if(rr.ok&&Array.isArray(rb))reactions=rb;}catch(_){}
        const counts={},mine={};reactions.forEach(x=>{counts[x.post_id]=(counts[x.post_id]||0)+1;if(String(x.user_id)===String(c.session.user.id))mine[x.post_id]=true;});
        this._cloudCommunityPosts=(Array.isArray(rows)?rows:[]).map(row=>({
          id:row.id,cloud:true,own:String(row.user_id)===String(c.session.user.id),user:row.display_name||'AnglerSignal Angler',
          species:row.species||'Catch',size:row.length_in?`${row.length_in} in`:'',length:row.length_in||'',weight:row.weight_lb||'',
          ago:this.prettyDate(row.catch_date||row.created_at),date:row.catch_date||row.created_at,bait:row.bait||'Not listed',
          water:row.location_label||'Location hidden',text:row.caption||'Shared a catch with AnglerSignal.',photo:/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(row.photo_data||''))?row.photo_data:'',
          score:row.coastcast_score||'',conditions:row.conditions||'',lat:Number(row.public_lat),lon:Number(row.public_lon),
          likes:counts[row.id]||0,userLiked:!!mine[row.id],locationPrecision:row.location_precision||'hidden'
        }));
        this.state.community.lastCloudRefresh=new Date().toISOString();this.renderCommunityMode();this.renderCommunity();
        if(!quiet)this.showToast(`Community refreshed • ${this._cloudCommunityPosts.length} cloud post${this._cloudCommunityPosts.length===1?'':'s'}.`);
      }catch(err){
        this._cloudCommunityPosts=[];this._communityCloudError=err.message||'Community cloud unavailable.';
        this.renderCommunityMode();this.renderCommunity();
        if(!quiet)this.showToast('Community cloud is not ready. Local Preview still works.');
      }
    },

    renderCommunityMode(){
      const signed=this.cloudSignedIn(),badge=this.$('communityModeBadge'),title=this.$('communityModeTitle'),text=this.$('communityModeText');
      if(!badge||!title||!text)return;
      badge.textContent=signed?'CLOUD BETA':'LOCAL PREVIEW';
      badge.classList.toggle('live',signed);badge.classList.toggle('fallback',!signed);
      title.textContent=signed?'Connected AnglerSignal Community':'Community preview on this device';
      if(signed){
        text.textContent=this._communityCloudError?`Cloud connected, but Community tables are not ready: ${this._communityCloudError}`:`Signed in as ${this.state.cloud.email||'your account'}. Public Community posts can sync between devices.`;
      }else text.textContent='Your feed is local until you connect Supabase Community Beta. Catch cards can be shared from Android right now.';
    },

    renderCommunity(){
      const tab=this.state.community.tab||'feed',feedPanel=this.$('communityFeedPanel'),challengePanel=this.$('communityChallengesPanel');
      this.$$('.community-tab').forEach(b=>b.classList.toggle('active',b.dataset.communityTab===tab));
      if(feedPanel)feedPanel.hidden=tab==='challenges';if(challengePanel)challengePanel.hidden=tab!=='challenges';
      this.renderCommunityMode();
      if(tab==='challenges'){this.renderCommunityChallenges();return;}
      const speciesFilter=this.$('communitySpeciesFilter')?.value||'all',radius=Number(this.$('communityRadiusFilter')?.value)||25;
      const local=this.normalizeLocalCommunityPosts(),cloud=Array.isArray(this._cloudCommunityPosts)?this._cloudCommunityPosts:[],mock=this.normalizeMockCommunityPosts();
      let posts=[...local,...cloud,...mock];
      if(tab==='mine')posts=posts.filter(p=>p.own);
      posts=posts.filter(p=>speciesFilter==='all'||p.species===speciesFilter);
      posts=posts.filter(p=>!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||this.haversine(this.state.location.lat,this.state.location.lon,p.lat,p.lon)<=radius);
      const box=this.$('communityFeed');if(!box)return;
      if(!posts.length){box.innerHTML=`<div class="empty-state">${tab==='mine'?'No catches published yet. Create a catch card and choose Publish to Community.':'No community catches match these filters yet.'}</div>`;return;}
      box.innerHTML=posts.map(p=>{
        const localLike=!!this.state.community.reactions?.[p.id],liked=p.userLiked||localLike,likes=Number(p.likes||0)+(localLike&&!p.cloud?1:0);
        const meta=[p.ago,p.water].filter(Boolean).join(' • ');
        const metrics=[p.bait&&`Bait: ${p.bait}`,p.score&&`Score ${p.score}`].filter(Boolean).join(' • ');
        return `<article class="feed-card" data-community-post="${this.escape(p.id)}"><div class="feed-head"><div class="avatar">${this.escape((p.user||'A')[0])}</div><div><div class="feed-user">${this.escape(p.user||'Angler')}${p.own?' <span class="you-pill">YOU</span>':''}</div><div class="feed-meta">${this.escape(meta)}</div></div></div>${p.photo?`<img class="feed-photo-real" src="${p.photo}" alt="${this.escape(p.species)} catch photo"/>`:`<div class="feed-photo feed-photo-brand" aria-label="Catch photo not shared"><span>${this.escape(this.species[p.species]?.abbr||'AS')}</span><small>ANGLERSIGNAL</small></div>`}<div class="feed-body"><div class="feed-species">${this.escape(p.species)}${p.size?' • '+this.escape(p.size):''}</div><div class="feed-detail">${this.escape(metrics||'Catch details shared by angler')}</div><div class="feed-text">${this.escape(p.text||'')}</div><div class="feed-actions"><button class="feed-action ${liked?'liked':''}" type="button" data-community-like="${this.escape(p.id)}">${liked?'♥':'♡'} ${likes||'Like'}</button>${p.sourceCatchId?`<button class="feed-action" type="button" data-community-card="${this.escape(p.sourceCatchId)}">Catch card</button>`:''}</div></div></article>`;
      }).join('');
    },

    handleCommunityFeedClick(e){
      const like=e.target.closest('[data-community-like]'),card=e.target.closest('[data-community-card]');
      if(card){this.openShareCatchDialog(card.dataset.communityCard);return;}
      if(like)this.toggleCommunityLike(like.dataset.communityLike);
    },

    async toggleCommunityLike(postId){
      const cloudPost=(this._cloudCommunityPosts||[]).find(p=>String(p.id)===String(postId));
      if(cloudPost&&this.cloudSignedIn()){
        const c=this.state.cloud,uid=c.session.user.id;
        try{
          if(cloudPost.userLiked){
            const r=await this.cloudRequest(`${c.url}/rest/v1/community_reactions?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(uid)}`,{method:'DELETE',headers:{'Prefer':'return=minimal'}});
            if(!r.ok)throw new Error('Could not remove reaction.');
          }else{
            const r=await this.cloudRequest(`${c.url}/rest/v1/community_reactions?on_conflict=post_id,user_id`,{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({post_id:postId,user_id:uid,reaction:'like'})});
            if(!r.ok)throw new Error('Could not save reaction.');
          }
          await this.loadCloudCommunity({quiet:true});
        }catch(_){this.showToast('Cloud reaction could not be saved.');}
        return;
      }
      this.state.community.reactions[postId]=!this.state.community.reactions[postId];this.save();this.renderCommunity();
    },

    openShareCatchDialog(catchId){
      if(!this.state.catches.length){this.showToast('Log a catch first, then AnglerSignal can build a share card.');this.navigate('logbook');return;}
      const sel=this.$('shareCatchSelect');if(!sel)return;
      sel.innerHTML=this.state.catches.map(c=>`<option value="${c.id}">${this.escape(c.species)} • ${this.escape(this.prettyDate(c.date))}${c.length?` • ${this.escape(c.length)} in`:''}</option>`).join('');
      const chosen=this.state.catches.find(c=>String(c.id)===String(catchId))||this.state.catches[0];sel.value=String(chosen.id);
      this.$('shareCatchCaption').value=chosen._communityCaption||chosen.notes||'';
      this.$('shareLocationPrecision').value=chosen._communityPrecision||'general';
      this._shareCardBlob=null;this._shareCardFile=null;if(this.$('shareCatchImageBtn'))this.$('shareCatchImageBtn').disabled=true;
      this.renderShareCatchPreview();this.openDialog('shareCatchDialog');
    },

    selectedShareCatch(){
      const id=this.$('shareCatchSelect')?.value;return this.state.catches.find(c=>String(c.id)===String(id))||null;
    },

    shareLocationForCatch(c,precision){
      if(precision==='hidden')return'Location hidden';
      if(precision==='exact'&&c.privacy==='public')return c.location||'Shared fishing spot';
      return this.generalizeWater(c.location||this.state.location.name);
    },

    renderShareCatchPreview(){
      const c=this.selectedShareCatch(),box=this.$('shareCatchPreview');if(!box)return;
      if(!c){box.innerHTML='<div class="share-preview-empty">Choose a catch to preview.</div>';return;}
      let precision=this.$('shareLocationPrecision')?.value||'general';
      if(precision==='exact'&&c.privacy!=='public'){precision='general';this.$('shareLocationPrecision').value='general';if(this.$('shareCatchStatus'))this.$('shareCatchStatus').textContent='Exact Spot is available only when the saved catch privacy is Public. AnglerSignal switched this card to General Water Area.';}
      else if(this.$('shareCatchStatus'))this.$('shareCatchStatus').textContent='The generated image never includes hidden coordinates. Community posts use only the location precision you choose here.';
      const loc=this.shareLocationForCatch(c,precision),caption=(this.$('shareCatchCaption')?.value||'').trim();
      box.innerHTML=`<article class="share-preview-card">${c.photo?`<img src="${c.photo}" alt="${this.escape(c.species)} catch"/>`:`<div class="share-preview-photo-fallback">${this.escape(this.species[c.species]?.abbr||'AS')}</div>`}<div class="share-preview-overlay"><div class="share-preview-brand">ANGLERSIGNAL <span>FISHING FORECAST</span></div><h3>${this.escape(c.species)}</h3><p>${this.escape([c.length&&`${c.length} in`,c.weight&&`${c.weight} lb`,c.bait].filter(Boolean).join(' • ')||'Logged catch')}</p><div class="share-preview-metrics"><span>${this.escape(loc)}</span><span>Score ${this.escape(c.score||'—')}</span></div>${caption?`<small>${this.escape(caption)}</small>`:''}</div></article>`;
    },

    async imageFromDataUrl(src){
      return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
    },

    async generateCatchCard(){
      const c=this.selectedShareCatch();if(!c)return;
      let precision=this.$('shareLocationPrecision')?.value||'general';
      if(precision==='exact'&&c.privacy!=='public'){precision='general';this.$('shareLocationPrecision').value='general';}
      const caption=(this.$('shareCatchCaption')?.value||'').trim(),location=this.shareLocationForCatch(c,precision);
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
      const g=ctx.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#071823');g.addColorStop(.55,'#0B2A3B');g.addColorStop(1,'#07131D');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);
      let photoBottom=610;
      if(c.photo){
        try{
          const img=await this.imageFromDataUrl(c.photo),scale=Math.max(1080/img.width,610/img.height),w=img.width*scale,h=img.height*scale,x=(1080-w)/2,y=(610-h)/2;
          ctx.drawImage(img,x,y,w,h);
          const shade=ctx.createLinearGradient(0,280,0,650);shade.addColorStop(0,'rgba(4,15,24,0)');shade.addColorStop(1,'rgba(4,15,24,.94)');ctx.fillStyle=shade;ctx.fillRect(0,260,1080,420);
        }catch(_){}
      }else{
        const pg=ctx.createLinearGradient(0,0,1080,610);pg.addColorStop(0,'#0F4055');pg.addColorStop(1,'#0A2434');ctx.fillStyle=pg;ctx.fillRect(0,0,1080,610);
        ctx.fillStyle='#6DE1C5';ctx.font='700 150px system-ui';ctx.textAlign='center';ctx.fillText(this.species[c.species]?.abbr||'AS',540,350);
        ctx.font='700 34px system-ui';ctx.fillStyle='#DFF8FF';ctx.fillText('ANGLERSIGNAL CATCH',540,420);
      }
      ctx.textAlign='left';ctx.fillStyle='#79E3C6';ctx.font='800 38px system-ui';ctx.fillText('ANGLERSIGNAL',70,690);
      ctx.fillStyle='#9EC9D8';ctx.font='700 22px system-ui';ctx.fillText('PLAN SMARTER. FISH BETTER.',70,726);
      const speciesText=String(c.species||'Catch').slice(0,26),speciesFont=speciesText.length>18?54:speciesText.length>13?64:76;
      ctx.fillStyle='#F4FBFF';ctx.font=`900 ${speciesFont}px system-ui`;ctx.fillText(speciesText,70,825);
      const detail=[c.length&&`${c.length} in`,c.weight&&`${c.weight} lb`,c.bait&&String(c.bait)].filter(Boolean).join('  •  ')||'Logged catch';
      ctx.font='700 34px system-ui';ctx.fillStyle='#CFEAF3';ctx.fillText(detail.slice(0,54),70,880);
      ctx.fillStyle='#0F3346';ctx.fillRect(70,930,940,160);
      ctx.fillStyle='#86D6EC';ctx.font='700 24px system-ui';ctx.fillText('LOCATION',105,980);ctx.fillText('ANGLERSIGNAL SCORE',650,980);
      ctx.fillStyle='#F4FBFF';ctx.font='800 32px system-ui';ctx.fillText(location.slice(0,30),105,1030);ctx.font='900 48px system-ui';ctx.fillText(String(c.score||'—'),650,1035);
      const cond=String(c.conditions||'Conditions saved with AnglerSignal').replace(/\s+/g,' ').slice(0,78);
      ctx.fillStyle='#9FC5D2';ctx.font='600 24px system-ui';ctx.fillText(cond,70,1145);
      if(caption){
        ctx.fillStyle='#F4FBFF';ctx.font='600 27px system-ui';
        const words=caption.split(/\s+/),lines=[];let line='';
        words.forEach(w=>{const test=(line+' '+w).trim();if(ctx.measureText(test).width>930&&line){lines.push(line);line=w;}else line=test;});if(line)lines.push(line);
        lines.slice(0,2).forEach((line,i)=>ctx.fillText(line,70,1200+i*38));
      }
      ctx.fillStyle='#6B97A7';ctx.font='600 20px system-ui';ctx.fillText('Shared from AnglerSignal • Location precision controlled by the angler',70,1310);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob){this.showToast('Could not generate the catch card.');return;}
      this._shareCardBlob=blob;try{this._shareCardFile=new File([blob],`coastcast-${String(c.species||'catch').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.jpg`,{type:'image/jpeg'});}catch(_){this._shareCardFile=null;}
      const url=URL.createObjectURL(blob);if(this._shareCardObjectUrl)URL.revokeObjectURL(this._shareCardObjectUrl);this._shareCardObjectUrl=url;
      this.$('shareCatchPreview').innerHTML=`<img class="generated-share-card" src="${url}" alt="Generated AnglerSignal catch card"/>`;
      this.$('shareCatchImageBtn').disabled=false;this.$('shareCatchStatus').textContent='Catch card generated. Use Share image to open the Android share sheet, or download if file sharing is unavailable.';
      this.showToast('AnglerSignal catch card ready.');
    },

    async shareCatchImage(){
      if(!this._shareCardBlob){await this.generateCatchCard();if(!this._shareCardBlob)return;}
      const c=this.selectedShareCatch(),file=this._shareCardFile;
      try{
        if(file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
          await navigator.share({title:`${c?.species||'Catch'} • AnglerSignal`,text:'Plan Smarter. Fish Better.',files:[file]});return;
        }
      }catch(e){if(e?.name==='AbortError')return;}
      const a=document.createElement('a');a.href=this._shareCardObjectUrl||URL.createObjectURL(this._shareCardBlob);a.download=file?.name||'coastcast-catch-card.jpg';document.body.appendChild(a);a.click();a.remove();this.showToast('Catch card downloaded.');
    },

    async publishCatchToCommunity(){
      const catchItem=this.selectedShareCatch();if(!catchItem)return;
      let precision=this.$('shareLocationPrecision')?.value||'general';
      if(precision==='exact'&&catchItem.privacy!=='public'){precision='general';this.$('shareLocationPrecision').value='general';}
      const caption=(this.$('shareCatchCaption')?.value||'').trim().slice(0,220),loc=this.shareLocationForCatch(catchItem,precision);
      catchItem._communityPrecision=precision;catchItem._communityCaption=caption;
      if(!this.cloudSignedIn()){
        if(!this.state.community.publishedLocalIds.map(String).includes(String(catchItem.id)))this.state.community.publishedLocalIds.unshift(String(catchItem.id));
        this.save();this.renderCommunity();this.showToast('Published to Local Preview. Connect Cloud Sync to share between AnglerSignal users.');this.closeDialog('shareCatchDialog');this.navigate('community');return;
      }
      const c=this.state.cloud,uid=c.session.user.id;
      const lat=precision==='hidden'?null:precision==='exact'?Number(catchItem.lat):Math.round(Number(catchItem.lat)*10)/10;
      const lon=precision==='hidden'?null:precision==='exact'?Number(catchItem.lon):Math.round(Number(catchItem.lon)*10)/10;
      const row={user_id:uid,source_catch_id:String(catchItem.id),display_name:this.state.profile?.name||'AnglerSignal Angler',species:catchItem.species,catch_date:catchItem.date||new Date().toISOString(),length_in:catchItem.length?Number(catchItem.length):null,weight_lb:catchItem.weight?Number(catchItem.weight):null,bait:catchItem.bait||'',caption:caption||catchItem.notes||'',location_label:loc,location_precision:precision,public_lat:lat,public_lon:lon,coastcast_score:Number(catchItem.score)||null,conditions:catchItem.conditions||'',photo_data:catchItem.photo&&catchItem.photo.length<550000?catchItem.photo:null};
      try{
        const r=await this.cloudRequest(`${c.url}/rest/v1/community_catches?on_conflict=user_id,source_catch_id`,{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});
        if(!r.ok){let b={};try{b=await r.json();}catch(_){}throw new Error(b?.message||'Community tables are not ready.');}
        this.save();await this.loadCloudCommunity({quiet:true});this.closeDialog('shareCatchDialog');this.navigate('community');this.showToast('Catch published to AnglerSignal Community Beta.');
      }catch(err){
        if(this.$('shareCatchStatus'))this.$('shareCatchStatus').textContent='Cloud publish failed. Run the included SUPABASE_SETUP.sql update, or use Local Preview.';
        this.showToast(err.message||'Could not publish to Community.');
      }
    },

    saveAlertRule(){
      const l=this.state.location,species=this.$('alertSpecies')?.value||this.state.targetSpecies;
      const threshold=Math.max(50,Math.min(98,Number(this.$('alertScoreThreshold')?.value)||85));
      const maxWind=Math.max(1,Number(this.$('alertMaxWind')?.value)||999),days=Math.max(1,Math.min(7,Number(this.$('alertDays')?.value)||7));
      const duplicate=this.state.alertRules.find(r=>this.haversine(l.lat,l.lon,r.lat,r.lon)<.05&&r.species===species&&Number(r.threshold)===threshold&&Number(r.maxWind)===maxWind);
      if(duplicate){this.showToast('That forecast watch already exists.');return;}
      this.state.alertRules.unshift({id:Date.now(),name:l.name,lat:l.lat,lon:l.lon,species,threshold,maxWind,days,enabled:true,created:new Date().toISOString(),lastNotifiedKey:''});
      this.save();this.closeDialog('alertDialog');this.evaluateAlerts({notify:false});this.renderTrips();this.renderHomeAlerts();this.showToast(`Watching ${l.name} for ${species} ${threshold}+ conditions.`);
    },

    alertDayScore(dayIndex,species){
      const d=this.state.data;if(!d)return 0;const day=d.days[dayIndex]||d.days[0];let hours=d.hours.filter(h=>h.dateIndex===dayIndex).slice(0,24);
      if(hours.length){const vals=hours.map(h=>this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??d.current.waterTemp,tide:h.tide,time:h.rawTime||h.time,pressure:h.pressure??d.current.pressure},species));vals.sort((a,b)=>b-a);return Math.round(this.average(vals.slice(0,Math.min(4,vals.length))));}
      return this.calculateScore({wind:day.wind,rain:day.rain,wave:day.wave,water:day.water??d.current.waterTemp,tide:'Moving',time:'7 AM',pressure:d.current.pressure},species);
    },

    computeAlertMatches(){
      const current=this.state.location,d=this.state.data;if(!d)return[];
      return this.state.alertRules.map(rule=>{
        if(rule.enabled===false)return {...rule,match:null};
        const same=this.haversine(current.lat,current.lon,Number(rule.lat),Number(rule.lon))<2;
        let best=null;if(!same){const wr=(this.state.watchCenter?.results||[]).find(x=>this.haversine(Number(rule.lat),Number(rule.lon),Number(x.lat),Number(x.lon))<.3);if(!wr)return {...rule,match:null,needsLocation:true};const limit=Math.min(Number(rule.days)||7,wr.days?.length||0);for(let i=0;i<limit;i++){const day=wr.days[i]||{},score=this.calculateScore({wind:day.wind,rain:day.rain,wave:day.wave,water:day.water,tide:'Moving',time:day.bestTime||'7 AM',pressure:1015},rule.species),wind=Number(day.wind)||0;if(score>=Number(rule.threshold)&&wind<=Number(rule.maxWind||999)){const m={index:i,day:day.day||`Day ${i+1}`,date:day.date,score,wind,wave:Number(day.wave)||0,rain:Number(day.rain)||0,fromWatchCenter:true};if(!best||m.score>best.score)best=m;}}return {...rule,match:best,fromWatchCenter:true};}
        const limit=Math.min(Number(rule.days)||7,d.days.length);
        for(let i=0;i<limit;i++){const day=d.days[i],score=this.alertDayScore(i,rule.species),wind=Number(day.wind)||0;if(score>=Number(rule.threshold)&&wind<=Number(rule.maxWind||999)){const m={index:i,day:day.day||day.date||`Day ${i+1}`,date:day.date,score,wind,wave:Number(day.wave)||0,rain:Number(day.rain)||0};if(!best||m.score>best.score)best=m;}}
        return {...rule,match:best};
      });
    },

    evaluateAlerts({notify=false}={}){
      if(!this.state.data)return;this.state.alertMatches=this.computeAlertMatches();
      if(!notify||!this.state.live||!['live','partial'].includes(this.overallDataStatus()))return;
      this.state.alertMatches.forEach(result=>{if(!result.match)return;const key=`${result.id}:${result.match.day}:${result.match.score}:${this.state.location.name}`;const rule=this.state.alertRules.find(r=>String(r.id)===String(result.id));if(!rule||rule.lastNotifiedKey===key)return;if(typeof Notification!=='undefined'&&Notification.permission==='granted'){this.sendForecastNotification(result);rule.lastNotifiedKey=key;this.save();}});
    },

    async sendForecastNotification(result){
      const title=`${result.species} watch: ${result.match.score}/100`;
      const body=`${result.match.day} at ${result.name} • ${this.fmt(result.match.wind,0)} mph wind • ${this.fmt(result.match.wave,1)} ft surf`;
      try{if('serviceWorker'in navigator){const reg=await navigator.serviceWorker.ready;await reg.showNotification(title,{body,icon:'icon-192.png',badge:'favicon-32.png',tag:`coastcast-alert-${result.id}`});}else new Notification(title,{body,icon:'icon-192.png'});}catch(_){ }
    },

    renderHomeAlerts(){
      const box=this.$('homeAlertSummary');if(!box)return;const rules=this.state.alertRules.filter(r=>r.enabled!==false),matches=this.state.alertMatches.filter(r=>r.match);
      if(!rules.length){box.innerHTML='<div class="empty-state compact-empty">No alert rules yet. Watch a favorite coast for a strong fishing window.</div>';return;}
      if(matches.length){const m=[...matches].sort((a,b)=>b.match.score-a.match.score)[0];box.innerHTML=`<div class="home-alert-hit"><span class="alert-pulse"></span><div><strong>${this.escape(m.species)} watch is active</strong><small>${this.escape(m.match.day)} • ${m.match.score}/100 at ${this.escape(m.name)}</small></div><button type="button" class="mini-button" data-nav="trips">View</button></div>`;box.querySelector('[data-nav="trips"]')?.addEventListener('click',()=>this.navigate('trips'));}
      else box.innerHTML=`<div class="home-alert-wait"><strong>${rules.length} active forecast watch${rules.length===1?'':'es'}</strong><span>No rule is above its threshold in the currently loaded forecast.</span></div>`;
    },

    favoriteWatchCandidates(){
      const out=[],seen=[];const push=x=>{const lat=Number(x.lat),lon=Number(x.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;if(seen.some(p=>this.haversine(lat,lon,p[0],p[1])<.1))return;seen.push([lat,lon]);out.push({id:x.id||`spot-${out.length}`,name:x.name||'Saved coast',lat,lon,source:x.source||'Favorite'});};
      push({...this.state.location,id:'current',source:'Current fishing location'});(this.state.waypoints||[]).forEach(w=>push(w));return out.slice(0,8);
    },

    localSpotDayScore(dataset,dayIndex,species){
      const d=dataset,day=d.days?.[dayIndex]||d.days?.[0]||{},hours=(d.hours||[]).filter(h=>Number(h.dateIndex||0)===Number(dayIndex)).slice(0,24);
      if(hours.length){const vals=hours.map(h=>this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??d.current?.waterTemp,tide:'Moving',time:h.rawTime||h.time,pressure:h.pressure??d.current?.pressure},species));vals.sort((a,b)=>b-a);return Math.round(this.average(vals.slice(0,Math.min(4,vals.length))));}
      return this.calculateScore({wind:day.wind,rain:day.rain,wave:day.wave,water:day.water??d.current?.waterTemp,tide:'Moving',time:'7 AM',pressure:d.current?.pressure},species);
    },

    async scanFavoriteSpot(spot,species){
      const results=await Promise.allSettled([this.loadWeather(spot.lat,spot.lon),this.loadMarine(spot.lat,spot.lon)]),weather=results[0].status==='fulfilled'?results[0].value:null,marine=results[1].status==='fulfilled'?results[1].value:null;
      if(!weather)throw new Error('Weather unavailable');const data=this.mergeLiveData(this.buildDemoData(),weather,marine,null,null);const days=(data.days||[]).slice(0,7).map((day,i)=>{const hours=(data.hours||[]).filter(h=>Number(h.dateIndex||0)===i).slice(0,24);const scored=hours.map(h=>({...h,_score:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water??day.water??data.current.waterTemp,tide:'Moving',time:h.rawTime||h.time,pressure:h.pressure??data.current.pressure},species)}));const bestHour=scored.reduce((a,b)=>!a||b._score>a._score?b:a,null);const score=this.localSpotDayScore(data,i,species);return{index:i,day:day.day||day.date||`Day ${i+1}`,date:day.rawDate||day.date||'',score,wind:Number(day.wind)||Number(bestHour?.wind)||0,wave:Number(day.wave)||Number(bestHour?.wave)||0,rain:Number(day.rain)||0,water:Number(day.water)||Number(bestHour?.water)||Number(data.current.waterTemp)||0,temp:Number(day.high)||Number(bestHour?.temp)||0,bestTime:bestHour?.time||'—'};});const best=days.reduce((a,b)=>!a||b.score>a.score?b:a,null),confidence=marine?96:76;
      return{id:spot.id,name:spot.name,lat:spot.lat,lon:spot.lon,source:spot.source,species,confidence,marineLive:!!marine,days,bestDayIndex:best?.index??0,bestDay:best?.day||'—',bestDate:best?.date||'',score:best?.score||0,wind:best?.wind||0,wave:best?.wave||0,rain:best?.rain||0,water:best?.water||0,bestTime:best?.bestTime||'—',checkedAt:new Date().toISOString()};
    },

    async runCoastWatch({quiet=false}={}){
      if(this.state.watchCenter.running)return;const candidates=this.favoriteWatchCandidates();if(!candidates.length){this.showToast('Save a fishing spot first.');return;}this.state.watchCenter.running=true;this.state.watchCenter.species=this.state.targetSpecies;this.renderCoastWatch();this.renderTripCalendar();
      const collected=[];for(const spot of candidates){try{collected.push(await this.scanFavoriteSpot(spot,this.state.targetSpecies));this.state.watchCenter.results=[...collected].filter(x=>!x.error).sort((a,b)=>b.score-a.score);this.renderCoastWatch();this.renderTripCalendar();}catch(_){collected.push({id:spot.id,name:spot.name,lat:spot.lat,lon:spot.lon,source:spot.source,species:this.state.targetSpecies,error:true,score:0,days:[],confidence:0});}}
      this.state.watchCenter={running:false,results:collected.filter(x=>!x.error).sort((a,b)=>b.score-a.score),lastRun:new Date().toISOString(),species:this.state.targetSpecies};this.save();this.evaluateAlerts({notify:true});this.renderCoastWatch();this.renderTripCalendar();this.renderTrips();this.renderHomeAlerts();if(!quiet)this.showToast(this.state.watchCenter.results.length?`Coast Watch ranked ${this.state.watchCenter.results.length} fishing location${this.state.watchCenter.results.length===1?'':'s'}.`:'Saved coast forecasts could not be loaded.');
    },

    renderCoastWatch(){
      const box=this.$('coastWatchResults');if(!box)return;const wc=this.state.watchCenter||{},results=Array.isArray(wc.results)?wc.results:[];this.$('coastWatchSpecies').textContent=this.state.targetSpecies;const badge=this.$('coastWatchBadge');if(badge){badge.textContent=wc.running?'SCANNING':results.length?'LIVE RANK':'READY';badge.className=`tiny-pill ${wc.running?'caution-pill':results.length?'ready-pill':''}`;}
      if(this.$('scanFavoritesBtn')){this.$('scanFavoritesBtn').disabled=!!wc.running;this.$('scanFavoritesBtn').textContent=wc.running?'Scanning saved coasts…':'Scan saved coasts';}
      if(wc.running&&!results.length){box.innerHTML='<div class="coast-watch-loading">Checking saved locations with fresh weather and marine forecasts…</div>';this.$('coastWatchSummary').textContent='AnglerSignal is comparing your saved coasts. Public forecast services can take a few seconds per location.';return;}
      if(!results.length){box.innerHTML='<div class="coast-watch-empty">No multi-location scan yet. Your current fishing location is included automatically, and saved spots are added to the comparison.</div>';this.$('coastWatchSummary').textContent='Save favorite fishing spots, then run Coast Watch to see which destination deserves the drive.';return;}
      const winner=results[0];this.$('coastWatchSummary').innerHTML=`<strong>${this.escape(winner.name)}</strong> currently leads for ${this.escape(wc.species||this.state.targetSpecies)} at <strong>${winner.score}/100</strong> on ${this.escape(winner.bestDay)} around ${this.escape(winner.bestTime)}.`;
      box.innerHTML=results.map((r,i)=>`<article class="coast-watch-card ${i===0?'winner':''}"><div class="coast-watch-rank"><strong>${r.score}</strong><small>${i===0?'LEAD':'SCORE'}</small></div><div><h3>${this.escape(r.name)}</h3><p>${this.escape(r.bestDay)} • best near ${this.escape(r.bestTime)} • ${r.confidence}% forecast confidence</p><div class="coast-watch-metrics"><span>${this.fmt(r.wind,0)} mph wind</span><span>${this.fmt(r.wave,1)} ft surf</span><span>${this.fmt(r.water,0)}°F water</span><span>${this.fmt(r.rain,0)}% rain</span></div></div><div class="coast-watch-actions"><button class="mini-button watch-analyze" data-watch-id="${this.escape(String(r.id))}" type="button">Analyze</button><button class="mini-button watch-plan" data-watch-id="${this.escape(String(r.id))}" type="button">Plan</button><button class="mini-button watch-alert" data-watch-id="${this.escape(String(r.id))}" type="button">Watch</button></div></article>`).join('');
    },

    handleCoastWatchClick(e){
      const b=e.target.closest('[data-watch-id]');if(!b)return;const r=(this.state.watchCenter.results||[]).find(x=>String(x.id)===String(b.dataset.watchId));if(!r)return;const setLoc=()=>{this.state.location={key:'coast-watch',name:r.name,lat:Number(r.lat),lon:Number(r.lon),source:'Coast Watch'};this.onLocationChanged();};
      if(b.classList.contains('watch-analyze')){setLoc();this.navigate('home');return;}if(b.classList.contains('watch-plan')){setLoc();setTimeout(()=>this.openPlanner(),100);return;}if(b.classList.contains('watch-alert')){const threshold=Math.max(75,Math.min(95,Math.round(r.score-3)));const duplicate=this.state.alertRules.some(a=>this.haversine(r.lat,r.lon,Number(a.lat),Number(a.lon))<.05&&a.species===this.state.targetSpecies);if(!duplicate)this.state.alertRules.unshift({id:Date.now(),name:r.name,lat:r.lat,lon:r.lon,species:this.state.targetSpecies,threshold,maxWind:18,days:7,enabled:true,created:new Date().toISOString(),lastNotifiedKey:''});this.save();this.evaluateAlerts({notify:false});this.renderTrips();this.renderHomeAlerts();this.showToast(duplicate?'A watch already exists for this spot/species.':`Watching ${r.name} for ${this.state.targetSpecies} ${threshold}+ conditions.`);}
    },

    calendarModel(){
      const results=(this.state.watchCenter?.results||[]).filter(r=>Array.isArray(r.days)&&r.days.length),model=[];if(results.length){for(let i=0;i<7;i++){let best=null;for(const r of results){const d=r.days[i];if(!d)continue;const x={...d,spot:r};if(!best||x.score>best.score)best=x;}if(best)model.push(best);}}else if(this.state.data){for(let i=0;i<Math.min(7,this.state.data.days?.length||0);i++){const d=this.state.data.days[i],score=this.alertDayScore(i,this.state.targetSpecies);model.push({index:i,day:d.day||d.date,date:d.rawDate||d.date||'',score,wind:d.wind,wave:d.wave,rain:d.rain,water:d.water,spot:{id:'current',name:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon}});}}return model;
    },

    renderTripCalendar(){
      const box=this.$('tripCalendarGrid');if(!box)return;const model=this.calendarModel(),plans=this.state.savedTripPlans||[];if(!model.length){box.innerHTML='<div class="coast-watch-empty">Load a forecast or run Coast Watch to build the calendar.</div>';this.$('tripCalendarNote').textContent='No forecast calendar is available yet.';return;}
      box.innerHTML=model.map(d=>{const hasPlan=plans.some(p=>String(p.day||'').toLowerCase()===String(d.day||'').toLowerCase()||String(p.created||'').slice(0,10)===String(d.date||''));const quality=d.score>=88?'prime':d.score>=78?'good':'fair';return `<button type="button" class="trip-calendar-day ${quality} ${hasPlan?'has-plan':''}" data-calendar-day="${d.index}" data-calendar-spot="${this.escape(String(d.spot.id))}"><strong>${this.escape(d.day||`Day ${d.index+1}`)}</strong><b>${d.score}</b><span>${this.escape(d.spot.name)}</span><small>${this.fmt(d.wind,0)} mph • ${this.fmt(d.wave,1)} ft</small></button>`}).join('');
      const top=[...model].sort((a,b)=>b.score-a.score)[0];this.$('tripCalendarNote').innerHTML=`Best calendar match: <strong>${this.escape(top.day)}</strong> at <strong>${this.escape(top.spot.name)}</strong> for ${this.escape(this.state.targetSpecies)} • ${top.score}/100.`;
    },

    handleTripCalendarClick(e){
      const b=e.target.closest('[data-calendar-day]');if(!b)return;const day=Number(b.dataset.calendarDay)||0,spotId=b.dataset.calendarSpot,results=this.state.watchCenter?.results||[];let spot=results.find(r=>String(r.id)===String(spotId));if(!spot&&spotId==='current')spot={name:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon};if(spot){this.state.location={key:'calendar',name:spot.name,lat:Number(spot.lat),lon:Number(spot.lon),source:'Trip Calendar'};this.onLocationChanged();}this.state.forecastDay=day;this.save();this.navigate('forecast');this.showToast(`${this.state.targetSpecies} • ${b.querySelector('strong')?.textContent||'selected day'} loaded.`);
    },

    renderTrips(){
      if(!this.$('savedTripList'))return;const plans=this.state.savedTripPlans||[],spots=this.state.waypoints||[],rules=this.state.alertRules||[];
      this.$('savedTripCount').textContent=plans.length;this.$('favoriteSpotCount').textContent=spots.length;this.$('smartAlertCount').textContent=rules.filter(r=>r.enabled!==false).length;
      const ranked=this.rankSpecies?.()||[];const bestSpecies=ranked[0],bestDay=(this.state.data?.days||[]).reduce((a,b)=>!a||b.score>a.score?b:a,null);
      if(this.$('tripHubHeadline'))this.$('tripHubHeadline').textContent=bestSpecies?`${bestSpecies.name} is your strongest target`:'Ready when the coast lines up';
      if(this.$('tripHubRecommendation'))this.$('tripHubRecommendation').innerHTML=bestSpecies&&bestDay?`<strong>${this.escape(this.state.location.name)}</strong> • ${this.escape(bestSpecies.name)} ${bestSpecies.score}/100 today • strongest general day <strong>${this.escape(bestDay.day)}</strong> ${bestDay.score}/100. Build a trip to rank the week for your exact preferences.`:'Load a forecast and AnglerSignal will combine species conditions, favorites and alert rules here.';
      if(this.$('tripHubBadge'))this.$('tripHubBadge').textContent=this.overallDataStatus()==='live'?'LIVE BETA':this.overallDataStatus()==='partial'?'PARTIAL LIVE':'BETA';

      const tripBox=this.$('savedTripList');
      if(!plans.length)tripBox.innerHTML='<div class="empty-state">Build a Smart Trip and it will be saved here.</div>';
      else tripBox.innerHTML=plans.slice(0,12).map(p=>`<article class="saved-trip-card"><div class="saved-trip-score"><strong>${this.escape(p.score)}</strong><span>/100</span></div><div class="saved-trip-copy"><div class="saved-trip-kicker">${this.escape(p.day)} • ${this.escape(p.species)}</div><h3>${this.escape(p.location)}</h3><p>${this.escape(p.window||'Best forecast window')} • ${this.escape(p.priority||'bite')} priority</p><small>Created ${this.prettyDate(p.created)}</small></div><div class="saved-trip-actions">${Number.isFinite(Number(p.lat))?`<button class="mini-button trip-open-map" data-trip-id="${p.id}" type="button">Map</button>`:''}<button class="mini-button trip-delete" data-trip-id="${p.id}" type="button">Delete</button></div></article>`).join('');

      const favBox=this.$('favoriteSpotList');
      if(!spots.length)favBox.innerHTML='<div class="empty-state">Save a fishing location and it will appear here.</div>';
      else favBox.innerHTML=spots.slice(0,15).map(w=>`<article class="favorite-trip-card"><div class="favorite-mark">★</div><div><h3>${this.escape(w.name)}</h3><p>${this.escape(w.notes||'Private saved fishing spot')}</p><small>${Number(w.lat).toFixed(4)}, ${Number(w.lon).toFixed(4)} • ${this.escape(w.privacy||'private')}</small></div><div class="favorite-trip-actions"><button class="mini-button favorite-analyze" data-waypoint-id="${w.id}" type="button">Analyze</button><button class="mini-button favorite-plan" data-waypoint-id="${w.id}" type="button">Plan</button></div></article>`).join('');

      const alertBox=this.$('alertRuleList'),matches=new Map(this.state.alertMatches.map(x=>[String(x.id),x]));
      if(!rules.length)alertBox.innerHTML='<div class="empty-state">No forecast watches yet.</div>';
      else alertBox.innerHTML=rules.map(r=>{const m=matches.get(String(r.id));const active=m?.match;return `<article class="alert-rule-card ${active?'active':''}"><div class="alert-rule-status"><span class="alert-pulse"></span><strong>${active?'MATCH':'WATCHING'}</strong></div><div class="alert-rule-copy"><h3>${this.escape(r.species)} • ${this.escape(r.name)}</h3><p>${Number(r.threshold)}+ score • max wind ${Number(r.maxWind)>=999?'any':`${this.fmt(r.maxWind,0)} mph`} • ${Number(r.days)||7}-day lookahead</p>${active?`<small>${this.escape(active.day)} is ${active.score}/100 • ${this.fmt(active.wind,0)} mph wind • ${this.fmt(active.wave,1)} ft surf</small>`:'<small>No matching window in the loaded forecast.</small>'}</div><div class="alert-rule-actions"><button class="mini-button alert-toggle" data-alert-id="${r.id}" type="button">${r.enabled===false?'Enable':'Pause'}</button><button class="mini-button alert-delete" data-alert-id="${r.id}" type="button">Delete</button></div></article>`}).join('');
      if(this.$('alertCenterStatus')){const n=this.state.alertMatches.filter(x=>x.match).length;this.$('alertCenterStatus').textContent=n?`${n} watch${n===1?'':'es'} currently match the loaded forecast. Alerts are rechecked on app open and live refresh.`:'Alerts are checked whenever AnglerSignal opens or refreshes live data.';}
    },

    handleTripHubClick(e){
      const tripDel=e.target.closest('.trip-delete'),tripMap=e.target.closest('.trip-open-map'),favAnalyze=e.target.closest('.favorite-analyze'),favPlan=e.target.closest('.favorite-plan'),alertToggle=e.target.closest('.alert-toggle'),alertDelete=e.target.closest('.alert-delete');
      if(tripDel){this.state.savedTripPlans=this.state.savedTripPlans.filter(p=>String(p.id)!==String(tripDel.dataset.tripId));this.save();this.renderTrips();return;}
      if(tripMap){const p=this.state.savedTripPlans.find(x=>String(x.id)===String(tripMap.dataset.tripId));if(p&&Number.isFinite(Number(p.lat))){this.state.location={key:'saved-trip',name:p.location,lat:Number(p.lat),lon:Number(p.lon),source:'Saved trip'};this.onLocationChanged();this.navigate('map');}return;}
      const waypointId=favAnalyze?.dataset.waypointId||favPlan?.dataset.waypointId;if(waypointId){const w=this.state.waypoints.find(x=>String(x.id)===String(waypointId));if(w){this.state.location={key:'favorite',name:w.name,lat:Number(w.lat),lon:Number(w.lon),source:'Favorite fishing spot'};this.onLocationChanged();if(favPlan){setTimeout(()=>this.openPlanner(),100);}else this.navigate('home');}return;}
      const alertId=alertToggle?.dataset.alertId||alertDelete?.dataset.alertId;if(alertId){const idx=this.state.alertRules.findIndex(r=>String(r.id)===String(alertId));if(idx<0)return;if(alertDelete)this.state.alertRules.splice(idx,1);else this.state.alertRules[idx].enabled=this.state.alertRules[idx].enabled===false?true:false;this.save();this.evaluateAlerts({notify:false});this.renderTrips();this.renderHomeAlerts();}
    },


    populateScoutControls(){
      const el=this.$('scoutSpecies');if(!el)return;
      el.innerHTML=Object.keys(this.species).map(name=>`<option value="${this.escape(name)}">${this.escape(name)}</option>`).join('');
      el.value=this.state.scout.species||this.state.targetSpecies;
      if(this.$('scoutRadius'))this.$('scoutRadius').value=String(this.state.scout.radius||25);
      if(this.$('scoutPeriod'))this.$('scoutPeriod').value=this.state.scout.period||'today';
    },

    scoutPeriodLabel(period=this.state.scout.period){return period==='tomorrow'?'Tomorrow':period==='weekend'?'This weekend':'Today';},

    renderScout(){
      if(!this.$('scoutResults'))return;
      const st=this.state.scout;
      if(this.$('scoutSpecies'))this.$('scoutSpecies').value=st.species||this.state.targetSpecies;
      if(this.$('scoutRadius'))this.$('scoutRadius').value=String(st.radius||25);
      if(this.$('scoutPeriod'))this.$('scoutPeriod').value=st.period||'today';
      const results=Array.isArray(st.results)?st.results:[];
      if(this.$('scoutLiveBadge'))this.$('scoutLiveBadge').textContent=st.running?'SCANNING':results.length?(results.some(x=>x.confidence==='live')?'LIVE RANKING':'PREVIEW'):'READY';
      if(this.$('scoutCandidateCount'))this.$('scoutCandidateCount').textContent=String(results.length);
      if(this.$('scoutBestScore'))this.$('scoutBestScore').textContent=results[0]?String(results[0].score):'--';
      if(this.$('scoutTopName'))this.$('scoutTopName').textContent=results[0]?.name||'Not ranked';
      if(this.$('scoutStatus')){
        if(st.running)this.$('scoutStatus').innerHTML='<span class="scan-spinner"></span><strong>Scouting the coast…</strong> Checking spot-specific weather and marine conditions.';
        else if(st.lastRun)this.$('scoutStatus').textContent=`Last Scout: ${new Date(st.lastRun).toLocaleString()} • ${this.scoutPeriodLabel()} • ${st.species}`;
        else this.$('scoutStatus').textContent='Scout is ready. Run it from any U.S. coastal destination.';
      }
      const box=this.$('scoutResults');
      if(st.running){box.innerHTML='<div class="scout-loading-stack"><div class="scout-skeleton"></div><div class="scout-skeleton"></div><div class="scout-skeleton"></div></div>';}
      else if(!results.length){box.innerHTML='<div class="empty-state">Run Scout to rank nearby fishing options with live conditions.</div>';}
      else box.innerHTML=results.map((r,i)=>{
        const selected=(st.compareIds||[]).includes(r.id);const grade=r.score>=90?'PRIME':r.score>=80?'GREAT':r.score>=70?'GOOD':'FAIR';
        return `<article class="scout-result-card ${i===0?'winner':''}"><div class="scout-result-rank">${i===0?'★':i+1}</div><div class="scout-result-main"><div class="scout-result-kicker">${this.escape(r.type||'Coastal spot')} • ${this.fmt(r.distance,1)} mi • ${this.escape(r.confidence==='live'?'LIVE CONDITIONS':'PREVIEW')}</div><h3>${this.escape(r.name)}</h3><div class="scout-condition-line"><span>Wind <strong>${this.fmt(r.wind,0)} mph</strong></span><span>Surf <strong>${this.fmt(r.wave,1)} ft</strong></span><span>Water <strong>${this.fmt(r.water,0)}°</strong></span><span>Rain <strong>${this.fmt(r.rain,0)}%</strong></span></div><small>Best ${this.escape(r.bestTime||'window')} • ${this.escape(r.periodLabel||this.scoutPeriodLabel())}${r.note?` • ${this.escape(r.note)}`:''}</small></div><div class="scout-result-score"><strong>${r.score}</strong><span>${grade}</span></div><div class="scout-result-actions"><button class="mini-button primary-mini" type="button" data-scout-analyze="${this.escape(r.id)}">Analyze</button><button class="mini-button ${selected?'selected':''}" type="button" data-scout-compare="${this.escape(r.id)}">${selected?'Added':'Compare'}</button><button class="mini-button" type="button" data-scout-save="${this.escape(r.id)}">Save</button></div></article>`;
      }).join('');
      this.renderCompareTray();
    },

    renderCompareTray(){
      if(!this.$('compareTrayText'))return;const ids=this.state.scout.compareIds||[];const names=ids.map(id=>this.state.scout.results.find(r=>r.id===id)?.name).filter(Boolean);
      this.$('compareTrayText').textContent=names.length?`${names.length}/3 selected • ${names.join(' • ')}`:'Choose up to 3 Scout results';
      this.$('compareSpotsBtn').disabled=names.length<2;this.$('clearCompareBtn').disabled=!names.length;
    },

    scoutCandidatePool(){
      const center=this.state.location,radius=Math.max(5,Number(this.state.scout.radius)||25),seen=[];
      const add=(p)=>{if(!p||!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lon)))return;const distance=this.haversine(center.lat,center.lon,Number(p.lat),Number(p.lon));if(distance>radius*1.15&&p.id!=='current-scout')return;const dup=seen.some(x=>this.haversine(x.lat,x.lon,Number(p.lat),Number(p.lon))<0.15||x.name.toLowerCase()===String(p.name||'').toLowerCase());if(dup)return;seen.push({id:String(p.id||`scout-${seen.length}-${Math.round(Number(p.lat)*10000)}`),name:p.name||'Coastal spot',lat:Number(p.lat),lon:Number(p.lon),type:p.type||p.source||'Coastal spot',distance,match:Number(p.match)||70,source:p.source||'AnglerSignal'});};
      add({id:'current-scout',name:center.name,lat:center.lat,lon:center.lon,type:'Current destination',source:center.source,match:this.currentScore()});
      [...(this.state.mapPOIs||[])].sort((a,b)=>(b.match||0)-(a.match||0)).slice(0,20).forEach(add);
      (this.state.waypoints||[]).forEach(w=>add({id:`waypoint-${w.id}`,name:w.name,lat:w.lat,lon:w.lon,type:'Private favorite',source:'Your favorites',match:76}));
      Object.entries(this.presets).forEach(([key,p])=>add({id:`preset-${key}`,name:p.name,lat:p.lat,lon:p.lon,type:'Known coast',source:'AnglerSignal coast',match:73}));
      return seen.sort((a,b)=>(b.match-a.match)||(a.distance-b.distance)).slice(0,7);
    },

    async runScout(){
      if(this.state.scout.running)return;
      this.state.scout.running=true;this.state.scout.results=[];this.state.scout.compareIds=[];this.renderScout();
      try{
        if((!this.state.mapPOIs||!this.state.mapPOIs.length)&&this.state.mapPlacesStatus!=='loading')await this.loadMapPlaces(false);
        let candidates=this.scoutCandidatePool();
        if(!candidates.length)candidates=[{id:'current-scout',name:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,type:'Current destination',distance:0,match:this.currentScore(),source:this.state.location.source}];
        const tasks=candidates.slice(0,6).map(c=>this.scoutEvaluateSpot(c));
        const settled=await Promise.allSettled(tasks);const results=[];
        settled.forEach((x,i)=>{if(x.status==='fulfilled'&&x.value)results.push(x.value);else{const c=candidates[i];if(c)results.push(this.scoutPreviewResult(c));}});
        results.sort((a,b)=>b.score-a.score||a.distance-b.distance);this.state.scout.results=results;this.state.scout.lastRun=new Date().toISOString();
      }catch(_){
        this.state.scout.results=this.scoutCandidatePool().slice(0,6).map(c=>this.scoutPreviewResult(c)).sort((a,b)=>b.score-a.score);
        this.showToast('Scout used preview scoring for some spots because a live source did not respond.');
      }finally{this.state.scout.running=false;this.save();this.renderScout();}
      if(this.state.scout.results[0])this.showToast(`${this.state.scout.results[0].name} is Scout's top match at ${this.state.scout.results[0].score}/100.`);
    },

    scoutPreviewResult(c){
      const cur=this.state.data?.current||{};const score=Math.max(35,Math.min(99,Math.round((Number(c.match)||70)*.35+this.calculateScore({wind:cur.windSpeed,rain:cur.rain,wave:cur.waveHeight,water:cur.waterTemp,tide:this.currentTideLabel(),time:new Date(),pressure:cur.pressure},this.state.scout.species||this.state.targetSpecies,false)*.65)));
      return {...c,score,wind:this.num(cur.windSpeed,8),wave:this.num(cur.waveHeight,2),water:this.num(cur.waterTemp,72),rain:this.num(cur.rain,0),bestTime:this.state.data?this.findBestWindow(this.state.data.hours.filter(h=>h.dateIndex===0).slice(0,24)).label:'Best loaded window',periodLabel:this.scoutPeriodLabel(),confidence:'preview',note:'Uses loaded conditions'};
    },

    async scoutEvaluateSpot(c){
      const period=this.state.scout.period||'today',species=this.state.scout.species||this.state.targetSpecies;
      const weatherParams=new URLSearchParams({latitude:String(c.lat),longitude:String(c.lon),timezone:'auto',forecast_days:'7',temperature_unit:'fahrenheit',wind_speed_unit:'mph',hourly:'temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,pressure_msl',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'});
      const marineParams=new URLSearchParams({latitude:String(c.lat),longitude:String(c.lon),timezone:'auto',forecast_days:'7',length_unit:'imperial',cell_selection:'sea',hourly:'wave_height,wave_period,sea_surface_temperature'});
      const [w,m]=await Promise.all([this.fetchJSON('https://api.open-meteo.com/v1/forecast?'+weatherParams.toString(),11000),this.fetchJSON('https://marine-api.open-meteo.com/v1/marine?'+marineParams.toString(),11000).catch(()=>null)]);
      const wh=w.hourly||{},mh=m?.hourly||{};if(!Array.isArray(wh.time)||!wh.time.length)throw new Error('No scout weather');
      const marineMap=new Map(Array.isArray(mh.time)?mh.time.map((t,i)=>[t,{wave:this.num(mh.wave_height?.[i],2),period:this.num(mh.wave_period?.[i],8),water:Number.isFinite(Number(mh.sea_surface_temperature?.[i]))?this.cToF(Number(mh.sea_surface_temperature[i])):this.state.data?.current?.waterTemp||72}]):[]);
      const byDay=new Map();wh.time.forEach((t,i)=>{const date=String(t).slice(0,10);if(!byDay.has(date))byDay.set(date,[]);const mm=marineMap.get(t)||{};byDay.get(date).push({rawTime:t,wind:this.num(wh.wind_speed_10m?.[i],8),windDir:this.num(wh.wind_direction_10m?.[i],0),rain:this.num(wh.precipitation_probability?.[i],0),pressure:this.num(wh.pressure_msl?.[i],1015),wave:this.num(mm.wave,2),period:this.num(mm.period,8),water:this.num(mm.water,this.state.data?.current?.waterTemp||72)});});
      const dates=[...byDay.keys()].slice(0,7);let targetDates=[];
      if(period==='tomorrow')targetDates=dates.slice(1,2);else if(period==='weekend')targetDates=dates.filter(d=>{const day=new Date(d+'T12:00:00').getDay();return day===0||day===6;}).slice(0,2);else targetDates=dates.slice(0,1);
      if(!targetDates.length)targetDates=dates.slice(0,1);
      let bestDay=null;
      for(const date of targetDates){const hrs=byDay.get(date)||[];const scored=hrs.map(h=>({...h,score:this.calculateScore({wind:h.wind,rain:h.rain,wave:h.wave,water:h.water,tide:'Moving',time:h.rawTime,pressure:h.pressure},species,false)}));if(!scored.length)continue;scored.sort((a,b)=>b.score-a.score);const top=scored.slice(0,Math.min(4,scored.length));let score=Math.round(this.average(top.map(x=>x.score)));score=Math.round(Math.max(0,Math.min(100,score+(Number(c.match||70)-70)*.08)));const best=scored[0];const candidate={date,score,best,avgWind:this.average(top.map(x=>x.wind)),avgWave:this.average(top.map(x=>x.wave)),avgWater:this.average(top.map(x=>x.water)),avgRain:this.average(top.map(x=>x.rain))};if(!bestDay||candidate.score>bestDay.score)bestDay=candidate;}
      if(!bestDay)throw new Error('No scout day');
      const bt=new Date(bestDay.best.rawTime);const label=bt.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
      return {...c,score:bestDay.score,wind:bestDay.avgWind,wave:bestDay.avgWave,water:bestDay.avgWater,rain:bestDay.avgRain,bestTime:label,periodLabel:period==='weekend'?`${new Date(bestDay.date+'T12:00:00').toLocaleDateString([],{weekday:'short'})} best window`:this.scoutPeriodLabel(),confidence:'live',note:bestDay.best.period?`${this.fmt(bestDay.best.period,0)} sec period`:''};
    },

    handleScoutClick(e){
      const analyze=e.target.closest('[data-scout-analyze]'),compare=e.target.closest('[data-scout-compare]'),save=e.target.closest('[data-scout-save]');const id=analyze?.dataset.scoutAnalyze||compare?.dataset.scoutCompare||save?.dataset.scoutSave;if(!id)return;const r=this.state.scout.results.find(x=>String(x.id)===String(id));if(!r)return;
      if(analyze){this.useScoutSpot(r,false);return;}if(save){this.saveScoutSpot(r);return;}if(compare){this.toggleScoutCompare(r.id);return;}
    },

    saveScoutSpot(r){const exists=this.state.waypoints.some(w=>this.haversine(r.lat,r.lon,w.lat,w.lon)<.03);if(exists){this.showToast('That spot is already saved.');return;}this.state.waypoints.unshift({id:Date.now(),name:r.name,notes:`Scout ${r.score}/100 • ${r.type}`,lat:r.lat,lon:r.lon,privacy:'private'});this.save();this.renderWaypoints();this.renderTrips();this.showToast(`${r.name} saved privately.`);},
    toggleScoutCompare(id){let ids=[...(this.state.scout.compareIds||[])];if(ids.includes(id))ids=ids.filter(x=>x!==id);else if(ids.length<3)ids.push(id);else{this.showToast('Compare up to 3 spots at a time.');return;}this.state.scout.compareIds=ids;this.save();this.renderScout();},
    clearScoutCompare(){this.state.scout.compareIds=[];this.save();this.renderScout();},

    openScoutCompare(){const rows=(this.state.scout.compareIds||[]).map(id=>this.state.scout.results.find(r=>r.id===id)).filter(Boolean);if(rows.length<2)return;rows.sort((a,b)=>b.score-a.score);this.state.scout.compareWinnerId=rows[0].id;this.$('compareWinner').innerHTML=`<strong>Scout winner: ${this.escape(rows[0].name)}</strong><span>${rows[0].score}/100 for ${this.escape(this.state.scout.species)} • ${this.escape(this.scoutPeriodLabel())}</span>`;this.$('compareGrid').innerHTML=rows.map((r,i)=>`<article class="compare-card ${i===0?'winner':''}"><div class="compare-card-head"><span>${i===0?'TOP PICK':`OPTION ${i+1}`}</span><strong>${r.score}</strong></div><h3>${this.escape(r.name)}</h3><dl><div><dt>Distance</dt><dd>${this.fmt(r.distance,1)} mi</dd></div><div><dt>Best time</dt><dd>${this.escape(r.bestTime)}</dd></div><div><dt>Wind</dt><dd>${this.fmt(r.wind,0)} mph</dd></div><div><dt>Surf</dt><dd>${this.fmt(r.wave,1)} ft</dd></div><div><dt>Water</dt><dd>${this.fmt(r.water,0)}°F</dd></div><div><dt>Rain</dt><dd>${this.fmt(r.rain,0)}%</dd></div></dl><button class="mini-button compare-use-spot" data-compare-use="${this.escape(r.id)}" type="button">Use this spot</button></article>`).join('');this.$('compareGrid').onclick=(e)=>{const b=e.target.closest('[data-compare-use]');if(!b)return;const r=this.state.scout.results.find(x=>String(x.id)===String(b.dataset.compareUse));if(r){this.closeDialog('compareDialog');this.useScoutSpot(r,false);}};this.$('compareAnalyzeWinnerBtn').disabled=false;this.$('comparePlanWinnerBtn').disabled=false;this.openDialog('compareDialog');},
    useScoutWinner(plan=false){const r=this.state.scout.results.find(x=>String(x.id)===String(this.state.scout.compareWinnerId));if(!r)return;this.closeDialog('compareDialog');this.useScoutSpot(r,plan);},
    useScoutSpot(r,plan=false){this.state.location={key:'scout',name:r.name,lat:Number(r.lat),lon:Number(r.lon),source:`AnglerSignal Scout • ${r.type}`};this.state.targetSpecies=this.state.scout.species||this.state.targetSpecies;this.onLocationChanged();if(plan)setTimeout(()=>this.openPlanner(),150);else this.navigate('home');this.showToast(`${r.name} selected. Loading exact-location analysis…`);},

    renderGoMode(){
      if(!this.$('goModePanel'))return;const g=this.state.goMode||{},active=!!g.active,c=this.state.data?.current||{},best=this.state.data?this.findBestWindow(this.state.data.hours.filter(h=>h.dateIndex===0).slice(0,24)):{label:'—'};
      this.$('goModeBadge').textContent=active?'LIVE SESSION':'READY';this.$('goModeBadge').classList.toggle('live',active);this.$('goModeTitle').textContent=active?`Fishing ${g.species||this.state.targetSpecies}`:'Turn the forecast into a trip';
      this.$('goModeSummary').innerHTML=active?`<strong>${this.escape(g.location?.name||this.state.location.name)}</strong> • Started ${new Date(g.startedAt).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} • Best loaded window ${this.escape(best.label||'—')}`:'Start a live trip at your current fishing destination. AnglerSignal keeps your target, best window, conditions, catches, route shortcuts and checklist in one place.';
      const bp=g.baitPlan||this.baitIntelligence(g.species||this.state.targetSpecies);if(this.$('goBaitPlan'))this.$('goBaitPlan').innerHTML=`<span>BAIT PLAN</span><strong>${this.escape(this.titleCase(bp.primary||''))}</strong><small>${this.escape(bp.rig||'')} • backup ${this.escape(this.titleCase(bp.backup||''))}</small>`;
      this.$('goModeLiveStats').innerHTML=`<div><span>SCORE</span><strong>${this.currentScore()}</strong></div><div><span>WIND</span><strong>${this.fmt(c.windSpeed,0)} mph</strong></div><div><span>SURF</span><strong>${this.fmt(c.waveHeight,1)} ft</strong></div><div><span>WATER</span><strong>${this.fmt(c.waterTemp,0)}°</strong></div>`;
      const sessionCatches=active?this.sessionCatches():[];const mins=active?Math.max(0,Math.floor((Date.now()-new Date(g.startedAt).getTime())/60000)):0;
      if(this.$('goSessionTime'))this.$('goSessionTime').textContent=active?this.formatDuration(mins):'Not started';
      if(this.$('goSessionCatchCount'))this.$('goSessionCatchCount').textContent=String(sessionCatches.length);
      if(this.$('goSessionLastCatch'))this.$('goSessionLastCatch').textContent=sessionCatches[0]?`${sessionCatches[0].species}${sessionCatches[0].length?` • ${sessionCatches[0].length} in`:''}`:'—';
      const sessionBox=this.$('goSessionCatchList');if(sessionBox)sessionBox.innerHTML=active&&sessionCatches.length?sessionCatches.slice(0,4).map(x=>`<div class="session-catch-chip"><strong>${this.escape(x.species)}</strong><span>${this.escape(x.bait||'No bait listed')} • ${new Date(x.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span></div>`).join(''):'';
      const checks=g.checks||{};this.$('goModeChecklist').innerHTML=[['bait','Bait / lures'],['ice','Ice & drinks'],['license','License / regulations'],['gear','Rods, rigs & safety gear']].map(([k,label])=>`<label class="go-check ${checks[k]?'done':''}"><input type="checkbox" data-go-check="${k}" ${checks[k]?'checked':''}/><span>${checks[k]?'✓':'○'}</span><strong>${label}</strong></label>`).join('');
      this.$('startGoModeBtn').hidden=active;this.$('quickSessionCatchBtn').hidden=!active;this.$('endGoModeBtn').hidden=!active;this.$('goModeShopBtn').disabled=!active||!(this.state.data?.shops||[]).length;this.$('goModeSpotBtn').disabled=!active;
    },
    startGoMode(){if(this.state.goMode.active)return;const sessionId=`session-${Date.now()}`,bp=this.baitIntelligence();this.state.goMode={...this.state.goMode,active:true,startedAt:new Date().toISOString(),sessionId,location:{...this.state.location},species:this.state.targetSpecies,baitPlan:this.state.goMode.baitPlan||{species:bp.species,primary:bp.primary,backup:bp.backup,rig:bp.rig,presentation:bp.presentation,terminal:bp.terminal,created:new Date().toISOString()},checks:{bait:false,ice:false,license:false,gear:false}};this.save();this.renderGoMode();this.renderGearPlanner();this.showToast('Live fishing session started. Tight lines.');},
    sessionCatches(){const id=this.state.goMode?.sessionId;if(!id)return[];return this.state.catches.filter(c=>c.sessionId===id).sort((a,b)=>new Date(b.date)-new Date(a.date));},
    formatDuration(minutes){const m=Math.max(0,Number(minutes)||0);if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return`${h}h ${r}m`;},
    openSessionCatch(){if(!this.state.goMode?.active)return;this.clearCatchPhoto(false);this.ensureCatchDate();this.$('catchSpecies').value=this.state.goMode.species||this.state.targetSpecies;const recent=this.sessionCatches()[0]||this.state.catches.find(c=>c.species===(this.state.goMode.species||this.state.targetSpecies));if(recent?.bait)this.$('catchBait').value=recent.bait;else if(this.state.goMode.baitPlan?.primary)this.$('catchBait').value=this.titleCase(this.state.goMode.baitPlan.primary);this.$('catchSnapshot').textContent=`LIVE SESSION • ${this.snapshotConditions()}`;this.openDialog('catchDialog');},
    handleGoChecklist(e){const input=e.target.closest('[data-go-check]');if(!input)return;this.state.goMode.checks[input.dataset.goCheck]=!!input.checked;this.save();this.renderGoMode();},
    openGoShopRoute(){const s=(this.state.data?.shops||[])[0];if(!s)return this.showToast('No bait shop is loaded for this destination.');window.open(this.mapsUrl(s.lat,s.lon,s.name),'_blank','noopener');},
    openGoSpotRoute(){const l=this.state.goMode.location||this.state.location;window.open(this.mapsUrl(l.lat,l.lon,l.name),'_blank','noopener');},
    endGoMode(){if(!this.state.goMode.active)return;const start=new Date(this.state.goMode.startedAt||Date.now());const minutes=Math.max(1,Math.round((Date.now()-start.getTime())/60000));const sessionCatches=this.sessionCatches();this.state.goMode.history=[{id:Date.now(),sessionId:this.state.goMode.sessionId,location:this.state.goMode.location?.name||this.state.location.name,species:this.state.goMode.species||this.state.targetSpecies,startedAt:this.state.goMode.startedAt,endedAt:new Date().toISOString(),minutes,catchCount:sessionCatches.length,catchIds:sessionCatches.map(c=>c.id),checks:{...(this.state.goMode.checks||{})}},...(this.state.goMode.history||[])].slice(0,30);this.state.goMode.active=false;this.state.goMode.sessionId=null;this.state.trips=(Number(this.state.trips)||0)+1;this.save();this.renderGoMode();this.renderTrips();this.renderCatchIntelligence();this.showToast(`Trip ended • ${this.formatDuration(minutes)} • ${sessionCatches.length} catch${sessionCatches.length===1?'':'es'} logged.`);},


    async handleCatchPhotoInput(event){
      const file=event.target.files?.[0];if(!file)return;
      if(!/^image\//i.test(file.type)){this.showToast('Choose a photo from your camera or gallery.');event.target.value='';return;}
      try{
        this.showToast('Preparing catch photo…');
        this._catchPhotoDraft=await this.compressCatchPhoto(file);
        this.renderCatchPhotoPreview();
      }catch(_){this._catchPhotoDraft='';this.renderCatchPhotoPreview();this.showToast('That photo could not be prepared. Try another image.');}
    },

    compressCatchPhoto(file){
      return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onerror=()=>reject(new Error('read'));
        reader.onload=()=>{
          const img=new Image();
          img.onerror=()=>reject(new Error('image'));
          img.onload=()=>{
            const max=720,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
            const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
            const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#081a25';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
            let quality=.72,data=canvas.toDataURL('image/jpeg',quality);
            while(data.length>230000&&quality>.42){quality-=.08;data=canvas.toDataURL('image/jpeg',quality);}
            resolve(data);
          };
          img.src=reader.result;
        };
        reader.readAsDataURL(file);
      });
    },

    clearCatchPhoto(clearInput=true){
      this._catchPhotoDraft='';
      if(clearInput&&this.$('catchPhotoInput'))this.$('catchPhotoInput').value='';
      this.renderCatchPhotoPreview();
    },

    renderCatchPhotoPreview(){
      const box=this.$('catchPhotoPreview'),remove=this.$('removeCatchPhotoBtn');if(!box)return;
      if(this._catchPhotoDraft){box.innerHTML=`<img src="${this._catchPhotoDraft}" alt="Catch photo preview"/><span>Photo ready • compressed for your phone</span>`;box.classList.add('has-photo');if(remove)remove.hidden=false;}
      else{box.innerHTML='<span>Optional • add a catch photo from your camera or gallery</span>';box.classList.remove('has-photo');if(remove)remove.hidden=true;}
    },

    renderPhotoMemories(){
      const box=this.$('photoMemoryGrid'),badge=this.$('photoMemoryBadge');if(!box)return;
      const photos=this.state.catches.filter(c=>c.photo).slice(0,8);if(badge)badge.textContent=`${photos.length} recent`;
      if(!photos.length){box.innerHTML='<div class="empty-state">Add a photo when logging a catch and your recent fishing memories will appear here.</div>';return;}
      box.innerHTML=photos.map(c=>`<article class="photo-memory"><img src="${c.photo}" alt="${this.escape(c.species)} catch"/><div><strong>${this.escape(c.species)}</strong><span>${this.prettyDate(c.date)} • ${this.escape(c.location)}</span></div></article>`).join('');
    },

    openTackleDialog(){
      if(this.$('tackleName'))this.$('tackleName').value='';
      if(this.$('tackleCategory'))this.$('tackleCategory').value='Bait / Lure';
      if(this.$('tackleQty'))this.$('tackleQty').value='1';
      if(this.$('tackleMinQty'))this.$('tackleMinQty').value='1';
      if(this.$('tackleNotes'))this.$('tackleNotes').value='';
      this.openDialog('tackleDialog');
    },

    saveTackleItem(){
      const name=(this.$('tackleName')?.value||'').trim();if(!name){this.showToast('Give the tackle item a name.');return;}
      const item={id:Date.now(),name,category:this.$('tackleCategory')?.value||'Other',qty:Math.max(0,Number(this.$('tackleQty')?.value)||0),minQty:Math.max(0,Number(this.$('tackleMinQty')?.value)||0),notes:(this.$('tackleNotes')?.value||'').trim()};
      this.state.tackleBox.unshift(item);this.save();this.closeDialog('tackleDialog');this.renderTackleBox();this.showToast(`${name} added to your tackle box.`);
    },

    tackleStatus(item){
      const q=Number(item.qty)||0,m=Number(item.minQty)||0;if(q<=0)return'OUT';if(q<=m)return'LOW';return'READY';
    },

    renderTackleBox(){
      const box=this.$('tackleInventory'),shop=this.$('shoppingList');if(!box||!shop)return;
      const items=this.state.tackleBox||[],low=items.filter(i=>(Number(i.qty)||0)<=(Number(i.minQty)||0));
      if(this.$('tackleCount'))this.$('tackleCount').textContent=String(items.length);
      if(this.$('tackleLowCount'))this.$('tackleLowCount').textContent=String(low.length);
      box.innerHTML=items.length?items.map(i=>{const s=this.tackleStatus(i);return `<article class="tackle-row"><div class="tackle-main"><span class="tackle-status ${s.toLowerCase()}">${s}</span><div><strong>${this.escape(i.name)}</strong><small>${this.escape(i.category)}${i.notes?` • ${this.escape(i.notes)}`:''}</small></div></div><div class="tackle-qty"><button type="button" data-tackle-dec="${i.id}" aria-label="Decrease ${this.escape(i.name)}">−</button><strong>${Number(i.qty)||0}</strong><button type="button" data-tackle-inc="${i.id}" aria-label="Increase ${this.escape(i.name)}">+</button><button type="button" class="tackle-delete" data-tackle-del="${i.id}" aria-label="Delete ${this.escape(i.name)}">×</button></div></article>`}).join(''):'<div class="empty-state">Your tackle box is empty. Add hooks, rigs, lures, bait, line, weights and other supplies you want AnglerSignal to track.</div>';
      const list=this.state.shoppingList||[];
      shop.innerHTML=list.length?list.map((x,idx)=>`<label class="shopping-row ${x.done?'done':''}"><input type="checkbox" data-shopping-check="${idx}" ${x.done?'checked':''}/><div><strong>${this.escape(x.name)}</strong><span>${this.escape(x.reason||'Trip supply')}</span></div><button type="button" data-shopping-del="${idx}" aria-label="Remove ${this.escape(x.name)}">×</button></label>`).join(''):'<div class="empty-state">Generate a shopping list from low-stock tackle and your current bait plan.</div>';
    },

    handleTackleClick(event){
      const inc=event.target.closest('[data-tackle-inc]'),dec=event.target.closest('[data-tackle-dec]'),del=event.target.closest('[data-tackle-del]');
      const id=inc?.dataset.tackleInc||dec?.dataset.tackleDec||del?.dataset.tackleDel;if(!id)return;
      const item=this.state.tackleBox.find(i=>String(i.id)===String(id));if(!item)return;
      if(del){this.state.tackleBox=this.state.tackleBox.filter(i=>String(i.id)!==String(id));}
      else if(inc)item.qty=(Number(item.qty)||0)+1;
      else item.qty=Math.max(0,(Number(item.qty)||0)-1);
      this.save();this.renderTackleBox();
    },

    generateShoppingList(){
      const rows=[],seen=new Set(),add=(name,reason)=>{const key=String(name||'').trim().toLowerCase();if(!key||seen.has(key))return;seen.add(key);rows.push({name:this.titleCase(name),reason,done:false});};
      (this.state.tackleBox||[]).filter(i=>(Number(i.qty)||0)<=(Number(i.minQty)||0)).forEach(i=>add(i.name,`${this.tackleStatus(i)==='OUT'?'Out of stock':'Low stock'} • ${i.category}`));
      const bait=this.baitIntelligence();add(bait.primary,`${bait.species} top bait/lure`);add(bait.backup,`${bait.species} backup bait/lure`);
      const gear=this.gearItems();gear.filter(i=>['Bait','Terminal','Safety'].includes(i.category)).slice(0,5).forEach(i=>{const match=(this.state.tackleBox||[]).find(t=>t.name.toLowerCase().includes(i.name.toLowerCase().split(' ')[0]));if(!match)add(i.name,'Smart Gear Planner');});
      this.state.shoppingList=rows.slice(0,18);this.save();this.renderTackleBox();this.showToast(`Shopping list built with ${this.state.shoppingList.length} item${this.state.shoppingList.length===1?'':'s'}.`);
    },

    handleShoppingCheck(event){
      const input=event.target.closest('[data-shopping-check]');if(!input)return;const i=Number(input.dataset.shoppingCheck);if(!this.state.shoppingList[i])return;this.state.shoppingList[i].done=!!input.checked;this.save();this.renderTackleBox();
    },

    handleShoppingClick(event){
      const btn=event.target.closest('[data-shopping-del]');if(!btn)return;this.state.shoppingList.splice(Number(btn.dataset.shoppingDel),1);this.save();this.renderTackleBox();
    },

    saveOfflinePack(){
      if(!this.state.data)return this.showToast('Load a forecast before saving an offline pack.');
      const c=this.state.data.current||{},readiness=this.planningReadiness(),depart=this.departurePlan(),bait=this.baitIntelligence(),safety=this.safetyAssessment();
      const pack={id:Date.now(),savedAt:new Date().toISOString(),location:{...this.state.location},species:this.state.targetSpecies,score:this.currentScore(),readiness:{score:readiness.score,call:readiness.call},conditions:{temp:c.temp,weather:c.weather||this.weatherText(c.weatherCode),wind:c.windSpeed,windDir:c.windDir,gust:c.windGust,wave:c.waveHeight,period:c.wavePeriod,water:c.waterTemp,rain:c.rain},bestWindow:readiness.best?.label||this.findBestWindow(this.state.data.hours.filter(h=>h.dateIndex===0).slice(0,24)).label,bait:{primary:bait.primary,backup:bait.backup,rig:bait.rig},safety:{status:safety.status,detail:safety.detail},departure:depart&&depart.start!=null?{leave:depart.leaveText,arrive:depart.arriveText,fish:depart.fishText}:null,tides:(this.state.data.tides||[]).slice(0,6).map(t=>({type:t.type,time:t.time,height:t.height})),sourceHealth:{...this.state.sourceHealth}};
      this.state.offlinePacks=[pack,...(this.state.offlinePacks||[])].slice(0,8);this.save();this.renderOfflinePacks();this.showToast('Offline trip pack saved on this device.');
    },

    renderOfflinePacks(){
      const box=this.$('offlinePackList'),badge=this.$('offlinePackBadge');if(!box)return;const packs=this.state.offlinePacks||[];if(badge)badge.textContent=`${packs.length} saved`;
      if(!packs.length){box.innerHTML='<div class="empty-state">Save the current forecast and trip plan before you head somewhere with weak cell service.</div>';return;}
      box.innerHTML=packs.map(p=>`<article class="offline-pack-card"><div class="offline-pack-top"><div><span>${this.prettyDate(p.savedAt)}</span><strong>${this.escape(p.location?.name||'Fishing trip')}</strong></div><b>${p.score}/100</b></div><div class="offline-pack-grid"><span>${this.escape(p.species)}</span><span>${this.escape(p.bestWindow||'Best window')}</span><span>${this.compass(p.conditions?.windDir)} ${this.fmt(p.conditions?.wind,0)} mph</span><span>${this.fmt(p.conditions?.wave,1)} ft surf</span></div><div class="offline-pack-actions"><button type="button" class="mini-button" data-pack-view="${p.id}">View pack</button><button type="button" class="mini-button" data-pack-del="${p.id}">Delete</button></div></article>`).join('');
    },

    handleOfflinePackClick(event){
      const view=event.target.closest('[data-pack-view]'),del=event.target.closest('[data-pack-del]'),id=view?.dataset.packView||del?.dataset.packDel;if(!id)return;
      if(del){this.state.offlinePacks=this.state.offlinePacks.filter(p=>String(p.id)!==String(id));this.save();this.renderOfflinePacks();return;}
      const p=this.state.offlinePacks.find(x=>String(x.id)===String(id));if(!p)return;
      const tides=(p.tides||[]).map(t=>`${t.type} ${t.time}${t.height!=null?` • ${t.height} ft`:''}`).join('<br>')||'No tide snapshot saved';
      this.$('offlinePackTitle').textContent=p.location?.name||'Offline trip pack';
      this.$('offlinePackDetail').innerHTML=`<div class="offline-detail-score"><strong>${p.score}</strong><span>${this.escape(p.species)} • ${p.readiness?.score||'—'} readiness</span></div><dl><div><dt>Best window</dt><dd>${this.escape(p.bestWindow||'—')}</dd></div><div><dt>Conditions</dt><dd>${this.escape(`${this.fmt(p.conditions?.temp,0)}°F • ${this.compass(p.conditions?.windDir)} ${this.fmt(p.conditions?.wind,0)} mph • ${this.fmt(p.conditions?.wave,1)} ft surf • ${this.fmt(p.conditions?.water,0)}°F water`)}</dd></div><div><dt>Bait / rig</dt><dd>${this.escape(`${this.titleCase(p.bait?.primary||'')} • ${p.bait?.rig||''}`)}</dd></div><div><dt>Safety Guard</dt><dd>${this.escape(p.safety?.status||'VERIFY')} • ${this.escape(p.safety?.detail||'Recheck official conditions')}</dd></div>${p.departure?`<div><dt>Departure</dt><dd>Leave ${this.escape(p.departure.leave)} • fish ${this.escape(p.departure.fish)}</dd></div>`:''}<div><dt>Tides saved</dt><dd>${tides}</dd></div></dl><p>Saved ${this.escape(new Date(p.savedAt).toLocaleString())}. This is a snapshot; recheck live conditions and official warnings whenever service is available.</p>`;
      this.openDialog('offlinePackDialog');
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

      // Use an official state access layer when AnglerSignal has one registered for the selected coast.
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

      // Nationwide safety net: AnglerSignal can always analyze the selected coastal coordinate.
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
          const copy=provider==='official'?`Loaded ${this.state.mapPOIs.length} official state coastal access site${this.state.mapPOIs.length===1?'':'s'}.`:provider==='verified'?`Loaded ${this.state.mapPOIs.length} verified local access point${this.state.mapPOIs.length===1?'':'s'}.`:provider==='search'?`Found ${this.state.mapPOIs.length} indexed coastal place${this.state.mapPOIs.length===1?'':'s'} using location search.`:provider==='anchor'?`No verified public access was indexed here, so AnglerSignal loaded your selected ${this.coastRegion()} coordinate for live analysis.`:`Scanned ${this.state.mapPOIs.length} public fishing/access place${this.state.mapPOIs.length===1?'':'s'}.`;
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

    async genericTextTackleShops(radiusMiles=this.state.tackleRadius||20){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return[];
      const town=String(l.name||'').split(',').slice(0,3).join(',').trim();const maxDistance=Math.max(12,Number(radiusMiles)||20)*1.35;const out=[],seen=new Set();
      const add=(name,plat,plon,source,meta={})=>{plat=Number(plat);plon=Number(plon);if(!name||!Number.isFinite(plat)||!Number.isFinite(plon))return;if(!this.isLikelyTackleShop(name,meta))return;const d=this.haversine(lat,lon,plat,plon);if(d>maxDistance)return;const key=name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,28)+':'+plat.toFixed(3)+':'+plon.toFixed(3);if(seen.has(key))return;seen.add(key);out.push({name,lat:plat,lon:plon,source,tags:['Fishing / tackle','Location match'],meta});};
      for(const term of ['bait and tackle','bait shop','tackle shop','fishing store','fishing tackle','rod and reel shop']){
        const q=`${term} ${town}`;
        try{
          const rows=await this.fetchJSON(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&countrycodes=us&addressdetails=1&extratags=1&namedetails=1&q=${encodeURIComponent(q)}`,6000);
          (rows||[]).forEach(r=>{const name=String(r.namedetails?.name||r.name||r.display_name||'').split(',')[0];add(name,r.lat,r.lon,'Location search • OpenStreetMap',{display_name:r.display_name||'',type:r.type||'',shop:r.extratags?.shop||'',extratags:r.extratags||{}});});
        }catch(_){ }
        if(out.length>=10)break;await this.sleep(220);
      }
      try{
        const data=await this.fetchJSON(`https://photon.komoot.io/api/?limit=15&q=${encodeURIComponent('bait tackle fishing store '+town)}`,6500);
        (data?.features||[]).forEach(f=>{const c=f?.geometry?.coordinates||[],p=f?.properties||{};add(p.name||'',c[1],c[0],'Location search • Photon',{display_name:[p.name,p.street,p.city,p.state].filter(Boolean).join(', '),type:p.osm_value||'',shop:p.osm_key==='shop'?p.osm_value:'',tags:{shop:p.osm_key==='shop'?p.osm_value:'',sport:p.sport||''}});});
      }catch(_){ }
      return out;
    },

    async verifiedRegionalShops(){
      const l=this.state.location||{};const lat=Number(l.lat),lon=Number(l.lon);const out=[];
      const catalogs=[];
      if(this.isHoldenArea()||this.haversine(lat,lon,33.9140,-78.3030)<22){
        catalogs.push(
          {name:'Rod & Reel Shop',query:'3401 Holden Beach Rd SW, Holden Beach, NC 28462',source:'Verified • Fishing store',tags:['Bait & tackle','Verified local business']},
          {name:'Rigged & Ready Fishing Center',query:'1096-7 Sabbath Home Rd SW, Holden Beach, NC 28462',source:'Verified • Fishing store',tags:['Bait & tackle','Verified local business']},
          {name:'Beach Mart',query:'3368 Holden Beach Rd SW, Supply, NC 28462',source:'Verified • Sells fishing bait & tackle',tags:['Bait & tackle','Beach supplies']},
          {name:"Robinson's Hardware",query:'3263 Holden Beach Rd SW, Supply, NC 28462',source:'Verified • NC saltwater weigh station',tags:['Fishing supplies','Bait / hardware']},
          {name:'Seafood Shack',query:'3405 Holden Beach Rd SW, Supply, NC 28462',source:'Verified • Bait shop / seafood market',tags:['Bait','Seafood market']}
        );
      }
      for(const item of catalogs){
        const g=await this.geocodePlace(item.query);if(g)out.push({...item,...g,address:item.query,verified:true});await this.sleep(180);
      }
      return out;
    },

    async verifiedHoldenShops(){return this.verifiedRegionalShops();},

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
      if(this.$('topSpotReason'))this.$('topSpotReason').textContent=top?top.reason:'AnglerSignal will rank named beaches, piers, fishing access, marinas and boat ramps around your selected destination.';
      if(this.$('weekendIntel'))this.$('weekendIntel').innerHTML=bestDay?`<strong>Best trip day:</strong> ${this.escape(bestDay.day)} • ${bestDay.score}/100 • ${this.fmt(bestDay.wave,1)} ft surf • ${this.fmt(bestDay.rain,0)}% rain. ${top?`Start by analyzing <strong>${this.escape(top.name)}</strong> at exact coordinates.`:''}`:'Your best forecast day will appear here.';
      this.renderDestinationHub();
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
      const current=L.marker([l.lat,l.lon],{icon:this.markerIcon('current','AS')}).addTo(map).bindPopup(`<strong>${this.escape(l.name)}</strong><br>Current fishing destination<br><strong>${this.currentScore()}/100</strong> area score`);this.state.mapLayers.current.push(current);
      const ranked=[...this.state.mapPOIs].sort((a,b)=>b.match-a.match||a.distance-b.distance);const topIds=new Set(ranked.slice(0,5).map(p=>p.id));
      ranked.forEach(p=>{const top=topIds.has(p.id);const popup=`<div class="cc-popup"><strong>${this.escape(p.name)}</strong><br><span>${this.escape(p.type)} • ${this.fmt(p.distance,1)} mi</span><br><b>${p.match}/100 area match</b><div class="popup-actions"><button type="button" data-map-analyze="${this.escape(p.id)}">Analyze</button><button type="button" data-map-save="${this.escape(p.id)}">Save</button></div></div>`;const m=L.marker([p.lat,p.lon],{icon:this.markerIcon(top?'recommended':'access',top?p.match:this.typeAbbr(p.type))}).bindPopup(popup);m.addTo(map);this.state.mapLayers[top?'recommended':'access'].push(m);});
      this.state.waypoints.forEach(w=>{const m=L.marker([w.lat,w.lon],{icon:this.markerIcon('saved','★')}).bindPopup(`<strong>${this.escape(w.name)}</strong><br>${this.escape(w.notes||'Private saved spot')}`);m.addTo(map);this.state.mapLayers.spots.push(m);});
      this.state.catches.forEach(c=>{const lat=c.privacy==='private'?c.lat+.003:c.lat,lon=c.privacy==='private'?c.lon+.003:c.lon;const m=L.circleMarker([lat,lon],{radius:6,color:'#dff9ee',weight:2,fillColor:'#4FDFB5',fillOpacity:.95}).bindPopup(`<strong>${this.escape(c.species)}</strong><br>${this.escape(c.privacy==='private'?'Private catch — offset on map':c.location)}`);m.addTo(map);this.state.mapLayers.catches.push(m);});
      (this.state.data?.shops||[]).filter(s=>s.demo||s.verified||this.isLikelyTackleShop(s.name,{tags:s.osmTags||{},display_name:s.displayName||'',categories:s.categories||[]})).forEach((s,i)=>{if(!Number.isFinite(Number(s.lat))||!Number.isFinite(Number(s.lon)))return;const m=L.marker([s.lat,s.lon],{icon:this.markerIcon('bait',String(i+1))}).bindPopup(`<strong>${this.escape(s.name)}</strong><br>${this.fmt(s.distance,1)} mi from fishing spot<br><small>${this.escape(s.source||'Fishing-store result')}</small><div class="popup-actions"><a href="${this.mapsUrl(s.lat,s.lon,s.name)}" target="_blank" rel="noopener">To shop</a><a href="${this.mapsRouteUrl(s.lat,s.lon,l.lat,l.lon)}" target="_blank" rel="noopener">Shop → spot</a></div>`);m.addTo(map);this.state.mapLayers.shops.push(m);});
      this.applyMapFilter();this.$('mapSelection').innerHTML=`Centered on <strong>${this.escape(l.name)}</strong> • ${this.coastRegion()} • ${this.currentScore()}/100 current area score • ${this.state.mapPOIs.length} indexed spot${this.state.mapPOIs.length===1?'':'s'}.`;
    },
    typeAbbr(type){return({'Fishing access':'F','Pier':'P','Beach':'B','Boat ramp':'R','Marina':'M','Dock':'D'})[type]||'•';},
    setMapFilter(filter,button){this.state.mapFilter=filter;this.$$('.filter-chip').forEach(b=>b.classList.toggle('active',b===button));this.applyMapFilter();},
    applyMapFilter(){const map=this.state.map;if(!map)return;for(const [type,layers] of Object.entries(this.state.mapLayers)){const show=this.state.mapFilter==='all'||type===this.state.mapFilter||type==='current';layers.forEach(layer=>{const on=map.hasLayer(layer);if(show&&!on)layer.addTo(map);if(!show&&on)map.removeLayer(layer);});}},
    recenterMap(){if(!this.state.map)return;const l=this.state.location;this.state.map.setView([l.lat,l.lon],12);setTimeout(()=>this.renderMapLayers(),50);},

    resetApp(){
      if(!confirm('Reset saved AnglerSignal spots, catches, settings and preferences?')) return;
      try{localStorage.removeItem('coastcast-v12-state');localStorage.removeItem('coastcast-v11-state');localStorage.removeItem('coastcast-v10-state');localStorage.removeItem('coastcast-v9-state');localStorage.removeItem('coastcast-v8-state');localStorage.removeItem('coastcast-v7-state');localStorage.removeItem('coastcast-v6-state');localStorage.removeItem('coastcast-v5-state');localStorage.removeItem('coastcast-v4-state');localStorage.removeItem('coastcast-v3-state');}catch(_){ }
      this.state.live=false;try{['coastcast-v50-state','coastcast-v40-state','coastcast-v31-state','coastcast-v30-state','coastcast-v23-state','coastcast-v22-state','coastcast-v21-state','coastcast-v20-state','coastcast-v18-state','coastcast-v17-state','coastcast-v16-state','coastcast-v15-state','coastcast-v14-state','coastcast-v13-state','coastcast-v12-state','coastcast-v11-state','coastcast-v10-state','coastcast-v9-state','coastcast-v8-state'].forEach(k=>localStorage.removeItem(k));}catch(_){}this.state.location={key:'wrightsville',name:'Wrightsville Beach, NC',lat:34.2085,lon:-77.7964,source:'Saved coast'};this.state.radius=10;this.state.tackleRadius=20;this.state.geoapifyKey='';try{localStorage.removeItem('coastcast-geoapify-key');}catch(_){}this.state.fishingStyle='Surf fishing';this.state.targetSpecies='Red Drum';this.state.waypoints=[];this.state.catches=[];this.state.trips=0;this.state.savedTripPlans=[];this.state.alertRules=[];this.state.alertMatches=[];this.state.profile={name:'AnglerSignal Angler',homeCoast:'',favoriteSpecies:'Red Drum'};this.state.cloud={url:'',anonKey:'',email:'',autoSync:false,session:null,lastSync:null};this.state.scout={running:false,radius:25,period:'today',species:'Red Drum',results:[],compareIds:[],lastRun:null};this.state.goMode={active:false,startedAt:null,sessionId:null,location:null,species:null,baitPlan:null,checks:{bait:false,ice:false,license:false,gear:false},history:[]};this.state.gearPlan={checked:{},lastBuilt:null};this.state.departure={driveMinutes:45,setupMinutes:20,baitMinutes:20,selectedWindow:null};this.state.regChecks={};this.state.tackleBox=[];this.state.shoppingList=[];this.state.offlinePacks=[];this.state.community={tab:'feed',reactions:{},publishedLocalIds:[],challengeClaims:{},lastCloudRefresh:null};this.state.command={mode:'bite',lastPlan:null};this.state.watchCenter={running:false,results:[],lastRun:null,species:'Red Drum'};this.state.oceanNetwork={status:'idle',station:null,observation:null,history:[],lastChecked:null,error:null};this.state.experience={mode:'simple'};this.state.membership={tier:'premium',source:'beta',status:'active',preview:'premium',expiresAt:null,betaFullAccess:true,server:null};this.state.backend={installed:false,lastAccessCheck:null,isAdmin:false,familyMembers:[]};this.state.seasonal={selectedSpecies:null,lastViewedMonth:null};this.state.familyCrew={members:[],shareTrips:true,shareFavorites:false};this.state.liveUpdatedAt=null;this._cloudCommunityPosts=[];this.state.safetyAlerts=[];this.state.sourceHealth={weather:'demo',marine:'demo',tides:'demo',shops:'demo',alerts:'demo',buoy:'demo'};this.state.mapPOIs=[];this.state.mapPlacesStatus='idle';this.state.selectedIntelSpot=null;this.state.data=this.buildDemoData();this.closeDialog('settingsDialog');this.renderAll();this.showToast('AnglerSignal reset.');
    },


    populateProfileControls(){
      const el=this.$('profileSpeciesInput');if(!el)return;
      el.innerHTML=Object.keys(this.species).map(name=>`<option value="${this.escape(name)}">${this.escape(name)}</option>`).join('');
    },

    profileInitials(){
      const name=(this.state.profile?.name||'AnglerSignal Angler').trim();
      const parts=name.split(/\s+/).filter(Boolean);return ((parts[0]?.[0]||'C')+(parts.length>1?(parts[parts.length-1]?.[0]||''):'C')).toUpperCase().slice(0,2);
    },

    renderProfile(){
      const p=this.state.profile||{};const initials=this.profileInitials();
      if(this.$('profileInitials'))this.$('profileInitials').textContent=initials;
      if(this.$('profileAvatar'))this.$('profileAvatar').textContent=initials;
      if(this.$('profileDisplayHeading'))this.$('profileDisplayHeading').textContent=p.name||'AnglerSignal Angler';
      if(this.$('profileHomeSummary'))this.$('profileHomeSummary').textContent=p.homeCoast?`${p.homeCoast} • Favorite target: ${p.favoriteSpecies||this.state.targetSpecies}`:'Set a home coast and favorite target to personalize the app.';
      if(this.$('profileHomeCoast'))this.$('profileHomeCoast').textContent=p.homeCoast||'Not set';
      if(this.$('profileFavoriteSpecies'))this.$('profileFavoriteSpecies').textContent=p.favoriteSpecies||this.state.targetSpecies;
      if(this.$('profileFishingStyle'))this.$('profileFishingStyle').textContent=this.state.fishingStyle;
      if(this.$('profileCurrentLocation'))this.$('profileCurrentLocation').textContent=this.state.location.name;
      if(this.$('profileCatchCount'))this.$('profileCatchCount').textContent=String(this.state.catches.length);
      if(this.$('profileFavoriteCount'))this.$('profileFavoriteCount').textContent=String(this.state.waypoints.length);
      if(this.$('profileTripCount'))this.$('profileTripCount').textContent=String(this.state.savedTripPlans.length);
      if(this.$('profileAlertCount'))this.$('profileAlertCount').textContent=String(this.state.alertRules.length);
      const signed=this.cloudSignedIn();
      if(this.$('profileCloudBadge'))this.$('profileCloudBadge').textContent=signed?'CLOUD CONNECTED':'LOCAL';
      if(this.$('cloudConnectionBadge'))this.$('cloudConnectionBadge').textContent=signed?'CONNECTED':'NOT CONNECTED';
      if(this.$('cloudAccountSummary'))this.$('cloudAccountSummary').innerHTML=signed?`<strong>${this.escape(this.state.cloud.email||'Signed in')}</strong><span>Cloud sync is connected to your Supabase project.</span>`:`<strong>Local-only mode</strong><span>Add your own Supabase project when you want cross-device sync.</span>`;
      if(this.$('cloudSyncNowBtn'))this.$('cloudSyncNowBtn').disabled=!signed;
      if(this.$('cloudPullBtn'))this.$('cloudPullBtn').disabled=!signed;
      if(this.$('cloudAutoSyncToggle'))this.$('cloudAutoSyncToggle').checked=!!this.state.cloud.autoSync;
      if(this.$('cloudSyncStatus'))this.$('cloudSyncStatus').textContent=this.state.cloud.lastSync?`Last cloud sync: ${new Date(this.state.cloud.lastSync).toLocaleString()}`:(signed?'Connected. Run Sync now to create your first cloud backup.':'Cloud sync is optional and off by default.');
    },

    openProfileEditor(){
      const p=this.state.profile||{};this.$('profileNameInput').value=p.name||'AnglerSignal Angler';this.$('profileHomeInput').value=p.homeCoast||'';this.$('profileSpeciesInput').value=p.favoriteSpecies||this.state.targetSpecies;this.$('profileStyleInput').value=this.state.fishingStyle;this.openDialog('profileDialog');
    },

    saveProfile(){
      const name=(this.$('profileNameInput').value||'').trim().slice(0,40)||'AnglerSignal Angler';const home=(this.$('profileHomeInput').value||'').trim().slice(0,80);const species=this.$('profileSpeciesInput').value;const style=this.$('profileStyleInput').value;
      this.state.profile={name,homeCoast:home,favoriteSpecies:species};this.state.fishingStyle=style;this.save();this.closeDialog('profileDialog');this.recalculateScores();this.renderAll();this.showToast('Profile updated.');
    },

    backupPayload(){
      return {format:'coastcast-backup',version:'5.1.0',exportedAt:new Date().toISOString(),appState:{location:this.state.location,live:this.state.live,radius:this.state.radius,tackleRadius:this.state.tackleRadius,fishingStyle:this.state.fishingStyle,targetSpecies:this.state.targetSpecies,waypoints:this.state.waypoints,catches:this.state.catches,trips:this.state.trips,savedTripPlans:this.state.savedTripPlans,alertRules:this.state.alertRules,profile:this.state.profile,scout:this.state.scout,goMode:this.state.goMode,gearPlan:this.state.gearPlan,departure:this.state.departure,regChecks:this.state.regChecks,tackleBox:this.state.tackleBox,shoppingList:this.state.shoppingList,offlinePacks:this.state.offlinePacks,community:this.state.community,command:this.state.command,watchCenter:this.state.watchCenter,oceanNetwork:this.state.oceanNetwork,experience:this.state.experience,seasonal:this.state.seasonal,familyCrew:this.state.familyCrew,liveUpdatedAt:this.state.liveUpdatedAt}};
    },

    exportBackup(){
      try{const payload=this.backupPayload();const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`coastcast-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},300);if(this.$('backupStatus'))this.$('backupStatus').textContent=`Backup exported ${new Date().toLocaleString()}.`;this.showToast('AnglerSignal backup exported.');}catch(_){this.showToast('Could not export backup.');}
    },

    async importBackupFile(event){
      const file=event.target.files?.[0];if(!file)return;
      try{const text=await file.text();const parsed=JSON.parse(text);const d=parsed?.appState||parsed;if(!d||typeof d!=='object')throw new Error('Invalid');if(!confirm('Restore this AnglerSignal backup? Current local saved data will be replaced.'))return;
        if(d.location)this.state.location=d.location;if(typeof d.live==='boolean')this.state.live=d.live;if(d.radius)this.state.radius=Number(d.radius);if(d.tackleRadius)this.state.tackleRadius=Number(d.tackleRadius);if(d.fishingStyle)this.state.fishingStyle=d.fishingStyle;if(d.targetSpecies&&this.species[d.targetSpecies])this.state.targetSpecies=d.targetSpecies;if(Array.isArray(d.waypoints))this.state.waypoints=d.waypoints;if(Array.isArray(d.catches))this.state.catches=d.catches;if(Number.isFinite(d.trips))this.state.trips=d.trips;if(Array.isArray(d.savedTripPlans))this.state.savedTripPlans=d.savedTripPlans;if(Array.isArray(d.alertRules))this.state.alertRules=d.alertRules;if(d.profile)this.state.profile={...this.state.profile,...d.profile};if(d.scout)this.state.scout={...this.state.scout,...d.scout,running:false};if(d.goMode)this.state.goMode={...this.state.goMode,...d.goMode,checks:{...this.state.goMode.checks,...(d.goMode.checks||{})}};if(d.gearPlan)this.state.gearPlan={...this.state.gearPlan,...d.gearPlan,checked:{...(d.gearPlan.checked||{})}};if(d.departure)this.state.departure={...this.state.departure,...d.departure};if(d.regChecks)this.state.regChecks={...d.regChecks};if(Array.isArray(d.tackleBox))this.state.tackleBox=d.tackleBox;if(Array.isArray(d.shoppingList))this.state.shoppingList=d.shoppingList;if(Array.isArray(d.offlinePacks))this.state.offlinePacks=d.offlinePacks;if(d.community&&typeof d.community==='object')this.state.community={...this.state.community,...d.community,reactions:{...(d.community.reactions||{})},publishedLocalIds:Array.isArray(d.community.publishedLocalIds)?d.community.publishedLocalIds:[]};if(d.command&&typeof d.command==='object')this.state.command={...this.state.command,...d.command};if(d.watchCenter&&typeof d.watchCenter==='object')this.state.watchCenter={...this.state.watchCenter,...d.watchCenter,running:false,results:Array.isArray(d.watchCenter.results)?d.watchCenter.results:[]};if(d.oceanNetwork&&typeof d.oceanNetwork==='object')this.state.oceanNetwork={...this.state.oceanNetwork,...d.oceanNetwork,status:'idle'};if(d.experience&&typeof d.experience==='object')this.state.experience={...this.state.experience,...d.experience};if(d.seasonal&&typeof d.seasonal==='object')this.state.seasonal={...this.state.seasonal,...d.seasonal};if(d.familyCrew&&typeof d.familyCrew==='object')this.state.familyCrew={...this.state.familyCrew,...d.familyCrew,members:Array.isArray(d.familyCrew.members)?d.familyCrew.members:[]};if(d.liveUpdatedAt)this.state.liveUpdatedAt=d.liveUpdatedAt;
        this.save();this.state.data=this.buildDemoData();this.recalculateScores();this.renderAll();if(this.$('backupStatus'))this.$('backupStatus').textContent=`Backup restored from ${this.escape(file.name)}.`;this.showToast('Backup restored. Refresh live data for the restored destination.');
      }catch(_){this.showToast('That file is not a valid AnglerSignal backup.');}finally{event.target.value='';}
    },

    openCloudSetup(){
      const c=this.state.cloud||{},cfg=window.COASTCAST_CONFIG||{},managed=!!(cfg.supabaseUrl&&cfg.supabasePublishableKey);
      this.$('cloudUrlInput').value=c.url||cfg.supabaseUrl||'';this.$('cloudKeyInput').value=c.anonKey||cfg.supabasePublishableKey||'';this.$('cloudEmailInput').value=c.email||'';this.$('cloudPasswordInput').value='';this.$('rememberCloudToggle').checked=true;
      if(this.$('cloudTechnicalConfig'))this.$('cloudTechnicalConfig').hidden=managed;
      this.$('cloudDialogStatus').textContent=this.cloudSignedIn()?'Signed in. Your AnglerSignal access is server verified.':(managed?'Create an account or sign in to AnglerSignal.':'Developer setup is incomplete: add the AnglerSignal Supabase public configuration.');this.openDialog('cloudDialog');
    },

    openDeleteAccountDialog(){
      if(!this.cloudSignedIn()){this.showToast('Sign in to your AnglerSignal account first.');return;}
      if(this.state.backend?.isAdmin){this.showToast('Owner/admin accounts must be demoted before deletion.');return;}
      if(this.$('deleteAccountConfirmInput'))this.$('deleteAccountConfirmInput').value='';
      if(this.$('deleteAccountStatus'))this.$('deleteAccountStatus').textContent='This action cannot be undone.';
      this.openDialog('accountDeleteDialog');
    },

    async deleteAnglerSignalAccount(){
      if(!this.cloudSignedIn()){this.showToast('Sign in first.');return;}
      if((this.$('deleteAccountConfirmInput')?.value||'').trim()!=='DELETE'){this.$('deleteAccountStatus').textContent='Type DELETE exactly to confirm.';return;}
      const c=this.state.cloud,btn=this.$('confirmDeleteAccountBtn');if(btn)btn.disabled=true;
      try{
        this.$('deleteAccountStatus').textContent='Deleting account and server data…';
        const r=await fetch(`${c.url}/functions/v1/delete-account`,{method:'POST',headers:{'apikey':c.anonKey,'Authorization':`Bearer ${c.session.access_token}`,'Content-Type':'application/json'},body:'{}'});
        let body={};try{body=await r.json();}catch(_){}
        if(!r.ok)throw new Error(body?.error||body?.message||'Account deletion failed');
        try{['coastcast-v50-state','coastcast-v40-state','coastcast-v31-state','coastcast-v30-state','coastcast-v23-state','coastcast-v22-state','coastcast-v21-state','coastcast-v20-state'].forEach(k=>localStorage.removeItem(k));localStorage.removeItem('coastcast-geoapify-key');}catch(_){}
        this.closeDialog('accountDeleteDialog');this.showToast('AnglerSignal account deleted. Reloading…');setTimeout(()=>location.reload(),900);
      }catch(err){this.$('deleteAccountStatus').textContent=err.message||'Could not delete account.';this.showToast(err.message||'Could not delete account.');}
      finally{if(btn)btn.disabled=false;}
    },

    normalizeCloudUrl(url){return String(url||'').trim().replace(/\/+$/,'');},
    cloudSignedIn(){return !!(this.state.cloud?.session?.access_token&&this.state.cloud?.session?.user?.id);},
    cloudConfigFromForm(){
      const url=this.normalizeCloudUrl(this.$('cloudUrlInput').value),anonKey=(this.$('cloudKeyInput').value||'').trim(),email=(this.$('cloudEmailInput').value||'').trim(),password=this.$('cloudPasswordInput').value||'';
      if(!/^https:\/\/.+\.supabase\.co$/i.test(url))throw new Error('Enter a valid Supabase project URL.');if(anonKey.length<20)throw new Error('Enter the Supabase anon / publishable key.');if(!/^\S+@\S+\.\S+$/.test(email))throw new Error('Enter a valid email.');if(password.length<6)throw new Error('Password must be at least 6 characters.');return{url,anonKey,email,password};
    },

    cloudHeaders(token){const c=this.state.cloud;return{'apikey':c.anonKey,'Authorization':`Bearer ${token||c.anonKey}`,'Content-Type':'application/json'};},

    async cloudSignIn(){
      try{const cfg=this.cloudConfigFromForm();this.$('cloudDialogStatus').textContent='Signing in…';const r=await fetch(`${cfg.url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'apikey':cfg.anonKey,'Content-Type':'application/json'},body:JSON.stringify({email:cfg.email,password:cfg.password})});const body=await r.json();if(!r.ok)throw new Error(body?.msg||body?.error_description||body?.message||'Sign in failed');this.state.cloud={...this.state.cloud,url:cfg.url,anonKey:cfg.anonKey,email:cfg.email,session:body};this.save();this.$('cloudPasswordInput').value='';this.$('cloudDialogStatus').textContent='Signed in successfully.';this.renderProfile();this.showToast('AnglerSignal account connected.');setTimeout(()=>this.refreshServerAccess({quiet:true}),120);}
      catch(err){this.$('cloudDialogStatus').textContent=err.message||'Could not sign in.';this.showToast(err.message||'Could not sign in.');}
    },

    async cloudSignUp(){
      try{const cfg=this.cloudConfigFromForm();this.$('cloudDialogStatus').textContent='Creating account…';const r=await fetch(`${cfg.url}/auth/v1/signup`,{method:'POST',headers:{'apikey':cfg.anonKey,'Content-Type':'application/json'},body:JSON.stringify({email:cfg.email,password:cfg.password})});const body=await r.json();if(!r.ok)throw new Error(body?.msg||body?.error_description||body?.message||'Sign up failed');this.state.cloud={...this.state.cloud,url:cfg.url,anonKey:cfg.anonKey,email:cfg.email,session:body?.access_token?body:null};this.save();this.$('cloudPasswordInput').value='';this.$('cloudDialogStatus').textContent=body?.access_token?'Account created and signed in.':'Account created. Check your email if confirmation is enabled, then sign in.';this.renderProfile();this.showToast('AnglerSignal account created.');if(body?.access_token)setTimeout(()=>this.refreshServerAccess({quiet:true}),120);}
      catch(err){this.$('cloudDialogStatus').textContent=err.message||'Could not create account.';this.showToast(err.message||'Could not create account.');}
    },

    async cloudSignOut(){
      const c=this.state.cloud;try{if(c?.session?.access_token)await fetch(`${c.url}/auth/v1/logout`,{method:'POST',headers:this.cloudHeaders(c.session.access_token)});}catch(_){ }
      this.state.cloud.session=null;this.state.cloud.autoSync=false;this.state.membership.server=null;this.state.backend={...this.state.backend,installed:false,isAdmin:false,familyMembers:[]};this.save();this.renderProfile();this.renderMembership();if(this.$('cloudDialogStatus'))this.$('cloudDialogStatus').textContent='Signed out. Project settings remain on this device.';this.showToast('Cloud session disconnected.');
    },

    async refreshCloudSession(){
      const c=this.state.cloud;if(!c?.session?.refresh_token)return false;try{const r=await fetch(`${c.url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':c.anonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:c.session.refresh_token})});const b=await r.json();if(!r.ok)return false;this.state.cloud.session=b;this.save();return true;}catch(_){return false;}
    },

    cloudStatePayload(){
      const b=this.backupPayload();return {...b.appState,cloud:undefined};
    },

    async cloudRequest(url,options={},retry=true){
      const c=this.state.cloud;if(!this.cloudSignedIn())throw new Error('Sign in to cloud sync first.');const headers={...this.cloudHeaders(c.session.access_token),...(options.headers||{})};let r=await fetch(url,{...options,headers});if(r.status===401&&retry&&await this.refreshCloudSession()){return this.cloudRequest(url,options,false);}return r;
    },

    queueCloudSync(){clearTimeout(this._cloudSyncTimer);this._cloudSyncTimer=setTimeout(()=>this.cloudPush({quiet:true}),1800);},

    async cloudPush({manual=false,quiet=false}={}){
      if(!this.cloudSignedIn())return;if(this._cloudSyncing)return;this._cloudSyncing=true;const c=this.state.cloud;try{if(this.$('cloudSyncStatus'))this.$('cloudSyncStatus').textContent='Syncing local data to cloud…';const uid=c.session.user.id;const row={user_id:uid,data:this.cloudStatePayload(),updated_at:new Date().toISOString()};const r=await this.cloudRequest(`${c.url}/rest/v1/coastcast_user_data?on_conflict=user_id`,{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});if(!r.ok){let msg='Cloud sync failed';try{const b=await r.json();msg=b?.message||b?.hint||msg;}catch(_){ }throw new Error(msg);}this.state.cloud.lastSync=new Date().toISOString();this.saveCloudMetaOnly();this.renderProfile();if(manual&&!quiet)this.showToast('Cloud sync complete.');}
      catch(err){if(this.$('cloudSyncStatus'))this.$('cloudSyncStatus').textContent=err.message||'Cloud sync failed.';if(manual&&!quiet)this.showToast(err.message||'Cloud sync failed.');}
      finally{this._cloudSyncing=false;}
    },

    saveCloudMetaOnly(){
      try{const raw=localStorage.getItem('coastcast-v50-state')||localStorage.getItem('coastcast-v40-state')||localStorage.getItem('coastcast-v31-state')||localStorage.getItem('coastcast-v30-state')||localStorage.getItem('coastcast-v23-state')||localStorage.getItem('coastcast-v22-state')||localStorage.getItem('coastcast-v21-state')||localStorage.getItem('coastcast-v20-state');if(!raw)return;const p=JSON.parse(raw);p.cloud={url:this.state.cloud.url,anonKey:this.state.cloud.anonKey,email:this.state.cloud.email,autoSync:this.state.cloud.autoSync,session:this.state.cloud.session,lastSync:this.state.cloud.lastSync};localStorage.setItem('coastcast-v50-state',JSON.stringify(p));}catch(_){ }
    },

    async cloudPull(){
      if(!this.cloudSignedIn()){this.showToast('Sign in to cloud sync first.');return;}if(!confirm('Restore your cloud copy onto this device? Current local fishing data will be replaced.'))return;const c=this.state.cloud;try{if(this.$('cloudSyncStatus'))this.$('cloudSyncStatus').textContent='Downloading cloud data…';const uid=c.session.user.id;const r=await this.cloudRequest(`${c.url}/rest/v1/coastcast_user_data?user_id=eq.${encodeURIComponent(uid)}&select=data,updated_at&limit=1`,{method:'GET'});const rows=await r.json();if(!r.ok)throw new Error(rows?.message||'Could not download cloud data.');if(!Array.isArray(rows)||!rows.length)throw new Error('No cloud backup exists yet.');const d=rows[0].data||{};if(d.location)this.state.location=d.location;if(typeof d.live==='boolean')this.state.live=d.live;if(d.radius)this.state.radius=Number(d.radius);if(d.tackleRadius)this.state.tackleRadius=Number(d.tackleRadius);if(d.fishingStyle)this.state.fishingStyle=d.fishingStyle;if(d.targetSpecies&&this.species[d.targetSpecies])this.state.targetSpecies=d.targetSpecies;if(Array.isArray(d.waypoints))this.state.waypoints=d.waypoints;if(Array.isArray(d.catches))this.state.catches=d.catches;if(Number.isFinite(d.trips))this.state.trips=d.trips;if(Array.isArray(d.savedTripPlans))this.state.savedTripPlans=d.savedTripPlans;if(Array.isArray(d.alertRules))this.state.alertRules=d.alertRules;if(d.profile)this.state.profile={...this.state.profile,...d.profile};if(d.scout)this.state.scout={...this.state.scout,...d.scout,running:false};if(d.goMode)this.state.goMode={...this.state.goMode,...d.goMode,checks:{...this.state.goMode.checks,...(d.goMode.checks||{})}};if(d.gearPlan)this.state.gearPlan={...this.state.gearPlan,...d.gearPlan,checked:{...(d.gearPlan.checked||{})}};if(d.departure)this.state.departure={...this.state.departure,...d.departure};if(d.regChecks)this.state.regChecks={...d.regChecks};if(Array.isArray(d.tackleBox))this.state.tackleBox=d.tackleBox;if(Array.isArray(d.shoppingList))this.state.shoppingList=d.shoppingList;if(Array.isArray(d.offlinePacks))this.state.offlinePacks=d.offlinePacks;if(d.community&&typeof d.community==='object')this.state.community={...this.state.community,...d.community,reactions:{...(d.community.reactions||{})},publishedLocalIds:Array.isArray(d.community.publishedLocalIds)?d.community.publishedLocalIds:[]};if(d.command&&typeof d.command==='object')this.state.command={...this.state.command,...d.command};if(d.watchCenter&&typeof d.watchCenter==='object')this.state.watchCenter={...this.state.watchCenter,...d.watchCenter,running:false,results:Array.isArray(d.watchCenter.results)?d.watchCenter.results:[]};if(d.oceanNetwork&&typeof d.oceanNetwork==='object')this.state.oceanNetwork={...this.state.oceanNetwork,...d.oceanNetwork,status:'idle'};if(d.experience&&typeof d.experience==='object')this.state.experience={...this.state.experience,...d.experience};if(d.seasonal&&typeof d.seasonal==='object')this.state.seasonal={...this.state.seasonal,...d.seasonal};if(d.familyCrew&&typeof d.familyCrew==='object')this.state.familyCrew={...this.state.familyCrew,...d.familyCrew,members:Array.isArray(d.familyCrew.members)?d.familyCrew.members:[]};if(d.liveUpdatedAt)this.state.liveUpdatedAt=d.liveUpdatedAt;this.state.cloud.lastSync=rows[0].updated_at||new Date().toISOString();this.save();this.state.data=this.buildDemoData();this.recalculateScores();this.renderAll();this.showToast('Cloud data restored. Refresh live data for this destination.');}
      catch(err){if(this.$('cloudSyncStatus'))this.$('cloudSyncStatus').textContent=err.message||'Cloud restore failed.';this.showToast(err.message||'Cloud restore failed.');}
    },


    seasonMonthNow(){
      try{const tz=this.state.data?.timezone;if(tz){const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,month:'numeric'}).formatToParts(new Date());const m=Number(parts.find(p=>p.type==='month')?.value);if(m>=1&&m<=12)return m-1;}}catch(_){}
      return new Date().getMonth();
    },

    seasonPeaks(species,region=this.coastRegion()){
      const profiles={
        'Atlantic Coast':{
          'Striped Bass':[[3,4,9,10],2],'Bluefish':[[4,5,6,7,8,9],2],'Red Drum':[[6,7,8,9,10],2],'Flounder':[[4,5,6,7,8],2],'Black Drum':[[2,3,4,8,9],2],'Spanish Mackerel':[[4,5,6,7,8],2],'Speckled Trout':[[3,4,5,8,9,10],2]
        },
        'Gulf Coast':{
          'Red Drum':[[7,8,9,10],3],'Speckled Trout':[[3,4,5,9,10,11],2],'Flounder':[[2,3,4,9,10],2],'Pompano':[[2,3,4,8,9,10],2],'Snook':[[4,5,6,7,8,9],3],'Tarpon':[[4,5,6,7,8],2],'Spanish Mackerel':[[2,3,4,5,8,9],2],'Sheepshead':[[0,1,2,3],2]
        },
        'Pacific Coast':{
          'Surfperch':[[0,1,2,3,10,11],3],'California Halibut':[[3,4,5,6,7,8,9],2],'Lingcod':[[2,3,4,8,9,10],2],'Rockfish':[[3,4,5,6,7,8,9],2],'Striped Bass':[[3,4,5,8,9,10],2],'Salmon':[[4,5,6,7,8],2]
        },
        'Alaska':{'Pacific Halibut':[[4,5,6,7,8],2],'Salmon':[[4,5,6,7,8],2],'Rockfish':[[4,5,6,7,8],2],'Lingcod':[[5,6,7,8],2]},
        'Hawaiʻi':{'Bonefish':[[2,3,4,5,6,7,8,9],4],'Trevally':[[3,4,5,6,7,8,9,10],4]}
      };
      return profiles[region]?.[species]||[[4,5,6,7,8],2];
    },

    seasonalScore(species,month=this.seasonMonthNow()){
      const [peaks,shoulder]=this.seasonPeaks(species);let dist=12;for(const p of peaks){const d=Math.min((month-p+12)%12,(p-month+12)%12);dist=Math.min(dist,d);}
      let baseline=dist===0?96:dist===1?84:dist<=shoulder?72:dist===shoulder+1?58:44;
      const live=this.speciesTodayScore?.(species);if(Number.isFinite(live)&&month===this.seasonMonthNow())baseline=Math.round(baseline*.58+live*.42);
      return Math.max(35,Math.min(99,Math.round(baseline)));
    },

    seasonalRanking(month=this.seasonMonthNow()){
      return this.coastRegionSpecies().map(name=>({name,score:this.seasonalScore(name,month),abbr:this.species[name]?.abbr||name.slice(0,2).toUpperCase()})).sort((a,b)=>b.score-a.score);
    },

    renderSeasonalIntelligence(){
      if(!this.$('seasonPulseList'))return;const month=this.seasonMonthNow(),label=new Date(2026,month,1).toLocaleDateString([],{month:'long'}),rank=this.seasonalRanking(month).slice(0,4);this.$('seasonPulseMonth').textContent=label.toUpperCase();
      this.$('seasonPulseList').innerHTML=rank.map((r,i)=>`<article class="season-pulse-card"><div class="season-rank"><strong>${i+1}. ${this.escape(r.name)}</strong><b>${r.score}</b></div><small>${r.score>=88?'Peak seasonal fit':r.score>=75?'Strong seasonal fit':r.score>=60?'Transition / shoulder season':'Lower seasonal baseline'} • ${this.escape(this.coastRegion())}</small><div class="season-band"><span style="width:${r.score}%"></span></div></article>`).join('');
      const top=rank[0];this.$('seasonPulseCall').innerHTML=top?`<strong>${this.escape(top.name)}</strong> has the strongest broad seasonal + live-condition blend for ${this.escape(label)} at this coast. Use live forecasts, local reports and regulations before committing.`:'Seasonal ranking unavailable.';
    },

    renderSeasonCalendar(){
      if(!this.$('seasonCalendarGrid'))return;const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],now=this.seasonMonthNow(),species=this.coastRegionSpecies().slice(0,7);this.$('seasonCalendarRegion').textContent=this.coastRegion().toUpperCase();
      let out='<div class="season-cal-cell header">TARGET</div>'+months.map((m,i)=>`<div class="season-cal-cell header ${i===now?'current-month':''}">${m}</div>`).join('');
      for(const sp of species){out+=`<button type="button" class="season-cal-cell species" data-premium="Seasonal Intelligence" data-season-species="${this.escape(sp)}">${this.escape(sp)}</button>`;for(let m=0;m<12;m++){const s=this.seasonalScore(sp,m),cls=s>=88?'peak':s>=74?'strong':s>=58?'shoulder':'off';out+=`<div class="season-cal-cell score ${cls} ${m===now?'current-month':''}" title="${this.escape(sp)} • ${months[m]} • ${s}/100 seasonal planning score">${s}</div>`;}}
      this.$('seasonCalendarGrid').innerHTML=out;const top=this.seasonalRanking(now)[0];this.$('seasonCalendarCall').innerHTML=top?`Right now, <strong>${this.escape(top.name)}</strong> leads the regional seasonal board at <strong>${top.score}/100</strong>. Tap a species name to make it your active AnglerSignal target.`:'Seasonal calendar unavailable.';
    },

    handleSeasonCalendarClick(e){const b=e.target.closest('[data-season-species]');if(!b)return;const sp=b.dataset.seasonSpecies;if(!this.species[sp])return;this.setSpecies(sp);this.showToast(`${sp} is now your active target.`);},

    renderSeasonTripPlanner(){
      if(!this.$('seasonTripMonths'))return;const now=this.seasonMonthNow(),rows=[0,1,2].map(offset=>{const m=(now+offset)%12,rank=this.seasonalRanking(m),top=rank[0];return{month:m,top};});
      this.$('seasonTripMonths').innerHTML=rows.map((r,i)=>`<article class="season-trip-card"><div class="month-block">${new Date(2026,r.month,1).toLocaleDateString([],{month:'short'}).toUpperCase()}</div><div><strong>${this.escape(r.top?.name||'—')}</strong><small>${i===0?'Current month':i===1?'Next month':'Two months out'} • regional seasonal potential</small></div><b>${r.top?.score||'—'}</b></article>`).join('');const best=rows.reduce((a,b)=>!a||((b.top?.score||0)>(a.top?.score||0))?b:a,null);this.state.seasonal={...this.state.seasonal,upcomingBest:best?{month:best.month,species:best.top?.name,score:best.top?.score}:null};
    },

    useStrongestSeasonTarget(){const b=this.state.seasonal?.upcomingBest;if(!b?.species||!this.species[b.species])return this.showToast('Season Planner needs regional species data first.');this.setSpecies(b.species);const label=new Date(2026,b.month,1).toLocaleDateString([],{month:'long'});this.showToast(`${b.species} selected for the strongest ${label} seasonal signal.`);this.navigate('forecast');setTimeout(()=>this.$('seasonCalendarPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),120);},

    renderFamilyCrew(){
      if(!this.$('familyCrewList'))return;const f=this.state.familyCrew||{members:[]};
      if(this.cloudSignedIn()&&this.state.backend?.installed){
        const members=this.state.backend?.familyMembers||[];this.$('familyCrewBadge').textContent=members.length?`${members.length} SERVER MEMBER${members.length===1?'':'S'}`:'SERVER READY';
        this.$('familyCrewSummary').innerHTML=members.length?`<strong>${members.length} Family Crew member${members.length===1?'':'s'} linked on the AnglerSignal server.</strong> Active members receive Family Premium without purchasing another subscription.`:'No Family Crew members linked yet. Invite a family email from your Premium owner account.';
        this.$('familyCrewList').innerHTML=members.map(m=>`<div class="family-member-row"><div><strong>${this.escape(m.email||'Family member')}</strong><small>${this.escape(String(m.status||'invited').toUpperCase())} • server verified</small></div><span class="family-access">${m.status==='active'?'FAMILY PREMIUM':'INVITED'}</span></div>`).join('');
      }else{
        const members=Array.isArray(f.members)?f.members:[];this.$('familyCrewBadge').textContent=members.length?`${members.length} PREVIEW`:'PREVIEW';this.$('familyCrewSummary').innerHTML=members.length?`<strong>${members.length} family member${members.length===1?'':'s'} in this device preview.</strong> Connect the v5 backend to turn these into real server memberships.`:'No family members added to the preview yet. Sign in and install the v5 launch backend for real Family Premium.';
        this.$('familyCrewList').innerHTML=members.map(m=>`<div class="family-member-row"><div><strong>${this.escape(m.name)}</strong><small>${this.escape(m.email||'Email not set')}</small></div><span class="family-access">PREVIEW</span></div>`).join('');
      }
      if(this.$('familyShareTrips'))this.$('familyShareTrips').checked=f.shareTrips!==false;if(this.$('familyShareFavorites'))this.$('familyShareFavorites').checked=!!f.shareFavorites;this.renderFamilyDialogList();this.renderServerFamilyList();
    },

    openFamilyCrewDialog(){this.renderFamilyDialogList();this.openDialog('familyCrewDialog');},

    addFamilyMemberPreview(){const name=(this.$('familyMemberName')?.value||'').trim().slice(0,40),email=(this.$('familyMemberEmail')?.value||'').trim().slice(0,100);if(!name)return this.showToast('Enter a family member name.');if(email&&!/^\S+@\S+\.\S+$/.test(email))return this.showToast('Enter a valid email or leave it blank.');const members=this.state.familyCrew.members||[];members.push({id:Date.now(),name,email,status:'preview',created:new Date().toISOString()});this.state.familyCrew.members=members.slice(0,12);if(this.$('familyMemberName'))this.$('familyMemberName').value='';if(this.$('familyMemberEmail'))this.$('familyMemberEmail').value='';this.save();this.renderFamilyCrew();this.showToast('Family member added to the local preview.');},

    renderFamilyDialogList(){if(!this.$('familyDialogList'))return;const members=this.state.familyCrew?.members||[];this.$('familyDialogList').innerHTML=members.length?members.map(m=>`<div class="family-member-row"><div><strong>${this.escape(m.name)}</strong><small>${this.escape(m.email||'No email')} • preview only</small></div><button type="button" class="family-remove" data-family-remove="${m.id}">Remove</button></div>`).join(''):'<div class="vault-status">No family members in this device preview.</div>';},

    handleFamilyCrewClick(e){const b=e.target.closest('[data-family-remove]');if(!b)return;this.state.familyCrew.members=(this.state.familyCrew.members||[]).filter(m=>String(m.id)!==String(b.dataset.familyRemove));this.save();this.renderFamilyCrew();this.showToast('Family member removed from preview.');},

    renderPremiumValue(){
      if(!this.$('premiumValueGrid'))return;const items=[['FORECAST','Ocean Network + advanced tide/wind/swell intelligence'],['SCOUT','Nationwide spot ranking + compare tools'],['TARGET','Species, seasonal, bait & personal catch intelligence'],['TRIPS','Command Center, Coast Watch, alerts, offline packs & Mission Control'],['LOGBOOK','Photos, analytics, personal pattern learning & tackle inventory'],['FAMILY','Family Premium + owner-granted complimentary/lifetime access architecture']];this.$('premiumValueGrid').innerHTML=items.map(x=>`<article class="premium-value-item"><span>${x[0]}</span><strong>${this.escape(x[1].split(' + ')[0])}</strong><small>${this.escape(x[1])}</small></article>`).join('');
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
    hourFromIso(s){const m=String(s||'').match(/T(\d{1,2}):(\d{2})/);if(m){let h=Number(m[1]),ap=h>=12?'PM':'AM';h=h%12||12;return `${h} ${ap}`;}return String(s||'');},
    timeFromIso(s){if(!s)return'';return this.literalClock(s)||String(s);},
    dateIndexForIso(s){const d=new Date(s),today=new Date();d.setHours(0,0,0,0);today.setHours(0,0,0,0);return Math.round((d-today)/86400000);},
    dayName(s){const d=new Date(String(s)+'T12:00:00');return isNaN(d)?'DAY':d.toLocaleDateString([],{weekday:'short'}).toUpperCase();},
    shortDate(s){const d=new Date(String(s)+'T12:00:00');return isNaN(d)?String(s):d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});},
    noaaTime(s){return this.literalClock(s)||String(s||'');},
    parseTideDate(s){return this.parseLocationDate(s);},
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

  window.AnglerSignal=APP;
  APP.init();
})();
