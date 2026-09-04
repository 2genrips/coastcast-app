(() => {
  'use strict';

  const APP = {
    state: {
      view: 'home',
      live: false,
      location: { key: 'wrightsville', name: 'Wrightsville Beach, NC', lat: 34.2085, lon: -77.7964 },
      radius: 10,
      fishingStyle: 'Surf fishing',
      forecastDay: 0,
      targetSpecies: 'Red Drum',
      weather: null,
      tides: null,
      shops: null,
      waypoints: [],
      catches: [],
      communityPosts: []
    },

    presets: {
      wrightsville: { name: 'Wrightsville Beach, NC', lat: 34.2085, lon: -77.7964 },
      carolina: { name: 'Carolina Beach, NC', lat: 34.0352, lon: -77.8936 },
      topsail: { name: 'Topsail Beach, NC', lat: 34.3655, lon: -77.6305 },
      surfCity: { name: 'Surf City, NC', lat: 34.4271, lon: -77.5461 },
      nagsHead: { name: 'Nags Head, NC', lat: 35.9574, lon: -75.6241 },
      myrtle: { name: 'Myrtle Beach, SC', lat: 33.6891, lon: -78.8867 }
    },

    speciesTips: {
      'Red Drum': 'Best prototype strategy: focus on moving water around troughs, cuts and inlets. Try cut mullet, shrimp, crab or paddletails depending on conditions.',
      'Speckled Trout': 'Look for cleaner water, current seams and structure. Shrimp imitations, suspending baits and soft plastics can be productive.',
      'Flounder': 'Fish the bottom near structure, inlets and drop-offs. Slow-moving bait or soft plastics along the bottom are good starting points.',
      'Bluefish': 'Watch for bait activity and birds. Metal spoons and fast-moving plugs are good search baits; use appropriate leader when needed.',
      'Spanish Mackerel': 'Target clearer water and bait schools. Fast retrieves with spoons or small casting jigs are common approaches.',
      'Black Drum': 'Structure and current matter. Natural baits such as shrimp, crab and shellfish are common choices.',
      'Sheepshead': 'Focus tightly around pilings, rocks and jetties. Fiddler crabs, shrimp and other crustaceans are common baits.',
      'Striped Bass': 'Look for current, bait concentrations and cooler-water windows. Bucktails, plugs and bait presentations can all work.',
      'Other': 'Use the forecast, tide movement and local reports to match your presentation to the species and structure you are targeting.'
    },

    mock: {
      days: [
        { day:'THU', label:'Today', icon:'🌤️', high:78, low:66, wind:'NE 7', rain:10, score:91 },
        { day:'FRI', label:'Fri', icon:'⛅', high:80, low:68, wind:'E 10', rain:20, score:82 },
        { day:'SAT', label:'Sat', icon:'☀️', high:77, low:64, wind:'NW 5', rain:8, score:95 },
        { day:'SUN', label:'Sun', icon:'🌥️', high:81, low:69, wind:'SE 13', rain:34, score:74 },
        { day:'MON', label:'Mon', icon:'🌧️', high:76, low:67, wind:'E 15', rain:58, score:68 },
        { day:'TUE', label:'Tue', icon:'⛅', high:79, low:65, wind:'N 8', rain:17, score:88 },
        { day:'WED', label:'Wed', icon:'☀️', high:78, low:63, wind:'NW 6', rain:6, score:90 }
      ],
      hours: [
        {time:'5 AM',icon:'🌙',temp:64,wind:'NE 6',rain:0,tide:'Rising',score:85},
        {time:'6 AM',icon:'🌅',temp:64,wind:'NE 6',rain:0,tide:'Rising',score:88},
        {time:'7 AM',icon:'☀️',temp:66,wind:'NE 7',rain:0,tide:'Rising',score:92},
        {time:'8 AM',icon:'🌤️',temp:68,wind:'NE 7',rain:0,tide:'Rising',score:94},
        {time:'9 AM',icon:'☀️',temp:70,wind:'NE 8',rain:0,tide:'High',score:90},
        {time:'10 AM',icon:'🌤️',temp:72,wind:'NE 9',rain:0,tide:'Falling',score:78},
        {time:'11 AM',icon:'🌤️',temp:73,wind:'NE 10',rain:0,tide:'Falling',score:68},
        {time:'12 PM',icon:'☁️',temp:74,wind:'NE 10',rain:10,tide:'Falling',score:62},
        {time:'1 PM',icon:'☁️',temp:75,wind:'NE 11',rain:10,tide:'Falling',score:60},
        {time:'2 PM',icon:'🌥️',temp:76,wind:'NE 11',rain:10,tide:'Low',score:58},
        {time:'3 PM',icon:'🌤️',temp:76,wind:'E 10',rain:10,tide:'Rising',score:63},
        {time:'4 PM',icon:'☀️',temp:75,wind:'E 9',rain:5,tide:'Rising',score:72},
        {time:'5 PM',icon:'☀️',temp:73,wind:'ENE 8',rain:5,tide:'Rising',score:82},
        {time:'6 PM',icon:'🌇',temp:71,wind:'ENE 7',rain:5,tide:'Rising',score:87}
      ],
      tides: [
        { type:'High', time:'8:34 AM', height:3.6, trend:'up' },
        { type:'Low', time:'2:18 PM', height:0.4, trend:'down' },
        { type:'High', time:'8:46 PM', height:3.2, trend:'up' },
        { type:'Low', time:'2:56 AM', height:0.2, trend:'down' }
      ],
      shops: [
        { name:'Seaside Bait & Tackle', distance:1.4, drive:4, rating:4.8, tags:['Live bait','Tackle','Ice'] },
        { name:'Island Tackle Shop', distance:2.7, drive:6, rating:4.6, tags:['Bait','Surf rigs','Ice'] },
        { name:'Hooked Up Bait & Tackle', distance:4.1, drive:9, rating:4.4, tags:['Tackle','Line','Local tips'] }
      ],
      community: [
        { user:'CapeFearAngler', species:'Red Drum', size:'27 in', ago:'2h', bait:'Cut mullet', water:'Wrightsville Beach', text:'Good bite on the incoming tide near a trough. Released healthy.' },
        { user:'SaltLineNC', species:'Speckled Trout', size:'19 in', ago:'5h', bait:'Paddletail', water:'Masonboro area', text:'Cleaner water early. Slow retrieve near a current seam.' },
        { user:'SurfDad', species:'Bluefish', size:'', ago:'Yesterday', bait:'Metal spoon', water:'Carolina Beach', text:'Small blues were chasing bait just outside the wash.' }
      ]
    },

    $: (id) => document.getElementById(id),
    $$: (sel) => [...document.querySelectorAll(sel)],

    init() {
      this.restore();
      this.bindNav();
      this.bindDialogs();
      this.bindControls();
      this.seedCommunity();
      this.renderAll();
      this.registerServiceWorker();
    },

    restore() {
      try {
        const raw = localStorage.getItem('coastcast-state-v1');
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.location) this.state.location = saved.location;
        if (typeof saved.live === 'boolean') this.state.live = saved.live;
        if (saved.radius) this.state.radius = saved.radius;
        if (saved.fishingStyle) this.state.fishingStyle = saved.fishingStyle;
        if (Array.isArray(saved.waypoints)) this.state.waypoints = saved.waypoints;
        if (Array.isArray(saved.catches)) this.state.catches = saved.catches;
        if (saved.targetSpecies) this.state.targetSpecies = saved.targetSpecies;
        if (Array.isArray(saved.communityPosts)) this.state.communityPosts = saved.communityPosts;
      } catch (_) {}
    },

    save() {
      const safe = {
        live:this.state.live, location:this.state.location, radius:this.state.radius,
        fishingStyle:this.state.fishingStyle, waypoints:this.state.waypoints,
        catches:this.state.catches, targetSpecies:this.state.targetSpecies,
        communityPosts:this.state.communityPosts
      };
      try { localStorage.setItem('coastcast-state-v1', JSON.stringify(safe)); } catch (_) {}
    },

    bindNav() {
      this.$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => this.navigate(btn.dataset.viewTarget)));
      this.$$('[data-nav]').forEach(btn => btn.addEventListener('click', () => this.navigate(btn.dataset.nav)));
    },

    navigate(view) {
      this.state.view = view;
      this.$$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
      this.$$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.viewTarget === view));
      window.scrollTo({ top:0, behavior:'smooth' });
      if (view === 'map') this.renderMap();
      if (view === 'logbook') this.renderLogbook();
      if (view === 'community') this.renderCommunity();
    },

    bindDialogs() {
      this.$('chooseLocationBtn').addEventListener('click', () => this.openLocationDialog());
      this.$('settingsBtn').addEventListener('click', () => this.openSettings());
      this.$('logCatchBtn').addEventListener('click', () => this.$('catchDialog').showModal());
      this.$('shareCatchBtn').addEventListener('click', () => this.$('catchDialog').showModal());
      this.$('addWaypointBtn').addEventListener('click', () => this.$('waypointDialog').showModal());
      this.$('plannerBtn').addEventListener('click', () => this.openPlanner());

      this.$('saveLocationBtn').addEventListener('click', (e) => { e.preventDefault(); this.saveCustomLocation(); });
      this.$('saveCatchBtn').addEventListener('click', (e) => { e.preventDefault(); this.saveCatch(); });
      this.$('saveWaypointBtn').addEventListener('click', (e) => { e.preventDefault(); this.saveWaypoint(); });
      this.$('findBestTripBtn').addEventListener('click', () => this.findBestTrip());
    },

    bindControls() {
      this.$('liveModeBtn').addEventListener('click', () => this.setLiveMode(true));
      this.$('liveModeToggle').addEventListener('change', (e) => this.setLiveMode(e.target.checked));
      this.$('radiusSetting').addEventListener('change', (e) => { this.state.radius = Number(e.target.value); this.save(); });
      this.$('fishingStyleSetting').addEventListener('change', (e) => { this.state.fishingStyle = e.target.value; this.save(); this.renderScore(); });
      this.$('useMyLocationBtn').addEventListener('click', () => this.useMyLocation());
      this.$('favoriteSpotBtn').addEventListener('click', () => this.quickSaveSpot());
      this.$('targetSpecies').addEventListener('change', (e) => { this.state.targetSpecies = e.target.value; this.save(); this.renderSpeciesTip(); this.renderScore(); });
      this.$('logPrivacyFilter').addEventListener('change', () => this.renderCatchList());
      this.$('communitySpeciesFilter').addEventListener('change', () => this.renderCommunity());
      this.$('refreshShopsBtn').addEventListener('click', () => this.loadNearbyShops(true));
      this.$('refreshChecklistBtn').addEventListener('click', () => this.renderChecklist());
      this.$('tideDetailsBtn').addEventListener('click', () => this.showToast('Tide details are displayed below the event cards. Live mode uses the nearest NOAA tide prediction station when available.'));
      this.$('presetLocation').addEventListener('change', (e) => {
        const p = this.presets[e.target.value];
        if (!p) return;
        this.$('latInput').value = p.lat;
        this.$('lonInput').value = p.lon;
        this.$('customLocationName').value = p.name;
      });
      this.$$('.forecast-day').forEach(() => {});
      this.$$('.chip').forEach(chip => chip.addEventListener('click', () => this.filterMap(chip.dataset.mapFilter, chip)));
      this.$$('.map-pin').forEach(pin => pin.addEventListener('click', () => {
        this.$('mapSelection').textContent = pin.dataset.pinName || 'Map item';
      }));
    },

    openLocationDialog() {
      const loc = this.state.location;
      this.$('latInput').value = loc.lat;
      this.$('lonInput').value = loc.lon;
      this.$('customLocationName').value = loc.name;
      this.$('locationDialog').showModal();
    },

    openSettings() {
      this.$('liveModeToggle').checked = this.state.live;
      this.$('radiusSetting').value = String(this.state.radius);
      this.$('fishingStyleSetting').value = this.state.fishingStyle;
      this.$('settingsDialog').showModal();
    },

    openPlanner() {
      this.$('tripStartDate').value = new Date().toISOString().slice(0,10);
      this.$('tripSpecies').value = this.state.targetSpecies === 'Other' ? 'Anything biting' : this.state.targetSpecies;
      this.$('plannerResult').textContent = 'Tap “Find best trip” to rank the available forecast days.';
      this.$('plannerDialog').showModal();
    },

    saveCustomLocation() {
      const lat = Number(this.$('latInput').value);
      const lon = Number(this.$('lonInput').value);
      const name = this.$('customLocationName').value.trim() || 'Fishing location';
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        this.showToast('Enter valid latitude and longitude.'); return;
      }
      this.state.location = { key:'custom', name, lat, lon };
      this.state.weather = null; this.state.tides = null; this.state.shops = null;
      this.save();
      this.$('locationDialog').close();
      this.renderAll();
      if (this.state.live) this.refreshLiveData();
    },

    useMyLocation() {
      if (!navigator.geolocation) { this.showToast('Geolocation is not supported in this browser.'); return; }
      this.showToast('Requesting your location…');
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.state.location = { key:'gps', name:'My current fishing area', lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5) };
          this.state.weather = null; this.state.tides = null; this.state.shops = null;
          this.save(); this.renderAll(); this.showToast('Location updated.');
          if (this.state.live) this.refreshLiveData();
        },
        () => this.showToast('Location permission was not available. You can enter coordinates manually.'),
        { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
      );
    },

    setLiveMode(value) {
      this.state.live = !!value;
      this.$('liveModeToggle').checked = this.state.live;
      this.save(); this.renderMode();
      if (this.state.live) this.refreshLiveData();
      else { this.state.weather=null; this.state.tides=null; this.state.shops=null; this.renderAll(); }
    },

    async refreshLiveData() {
      this.showToast('Loading live public forecast data…');
      const results = await Promise.allSettled([this.loadNwsWeather(), this.loadNoaaTides(), this.loadNearbyShops(false)]);
      const ok = results.filter(r => r.status === 'fulfilled' && r.value).length;
      this.renderAll();
      this.showToast(ok ? `Live data updated from ${ok} source${ok===1?'':'s'}.` : 'Live sources were unavailable. Demo data remains active.');
    },

    async loadNwsWeather() {
      const {lat,lon} = this.state.location;
      try {
        const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers:{'Accept':'application/geo+json'} });
        if (!pointRes.ok) throw new Error('NWS point lookup failed');
        const point = await pointRes.json();
        const hourlyUrl = point?.properties?.forecastHourly;
        const dailyUrl = point?.properties?.forecast;
        if (!hourlyUrl || !dailyUrl) throw new Error('NWS forecast URLs missing');
        const [hourlyRes,dailyRes] = await Promise.all([fetch(hourlyUrl), fetch(dailyUrl)]);
        if (!hourlyRes.ok || !dailyRes.ok) throw new Error('NWS forecast failed');
        const hourly = await hourlyRes.json();
        const daily = await dailyRes.json();
        this.state.weather = { hourly:hourly.properties?.periods || [], daily:daily.properties?.periods || [], source:'NWS' };
        return true;
      } catch (e) { console.warn(e); return false; }
    },

    async loadNoaaTides() {
      const {lat,lon} = this.state.location;
      try {
        const stationRes = await fetch('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions');
        if (!stationRes.ok) throw new Error('NOAA station lookup failed');
        const payload = await stationRes.json();
        const stations = (payload.stations || []).filter(s => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)));
        if (!stations.length) throw new Error('No stations');
        stations.forEach(s => s._distance = this.haversine(lat,lon,Number(s.lat),Number(s.lng)));
        stations.sort((a,b)=>a._distance-b._distance);
        const station = stations[0];
        const begin = this.formatDateYYYYMMDD(new Date());
        const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=CoastCast&begin_date=${begin}&range=48&datum=MLLW&station=${encodeURIComponent(station.id)}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
        const predRes = await fetch(url);
        if (!predRes.ok) throw new Error('NOAA predictions failed');
        const pred = await predRes.json();
        if (!Array.isArray(pred.predictions)) throw new Error('No predictions');
        this.state.tides = { station, predictions: pred.predictions, source:'NOAA CO-OPS' };
        return true;
      } catch (e) { console.warn(e); return false; }
    },

    async loadNearbyShops(forceMessage) {
      if (!this.state.live) { if (forceMessage) this.showToast('Turn on Live Data to search nearby stores.'); return false; }
      const {lat,lon} = this.state.location;
      const radiusMeters = Math.round(this.state.radius * 1609.344);
      const q = `[out:json][timeout:20];(nwr(around:${radiusMeters},${lat},${lon})[shop=fishing];nwr(around:${radiusMeters},${lat},${lon})[name~"bait|tackle",i];nwr(around:${radiusMeters},${lat},${lon})[shop=outdoor][name~"fish|bait|tackle",i];);out center tags;`;
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body:'data='+encodeURIComponent(q) });
        if (!res.ok) throw new Error('Overpass failed');
        const json = await res.json();
        const shops = (json.elements || []).map(el => {
          const slat = el.lat ?? el.center?.lat, slon = el.lon ?? el.center?.lon;
          if (!Number.isFinite(slat) || !Number.isFinite(slon)) return null;
          const miles = this.haversine(lat,lon,slat,slon);
          return {
            name:el.tags?.name || 'Bait / tackle shop', distance:+miles.toFixed(1), drive:Math.max(2,Math.round(miles*2.4+1)), rating:null,
            tags:['Fishing supplies'], lat:slat, lon:slon, source:'OpenStreetMap'
          };
        }).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,8);
        if (!shops.length) throw new Error('No shops found');
        this.state.shops = shops;
        this.renderShops();
        if (forceMessage) this.showToast(`Found ${shops.length} nearby fishing-supply location${shops.length===1?'':'s'}.`);
        return true;
      } catch (e) {
        console.warn(e); if (forceMessage) this.showToast('Live bait-shop lookup failed. Showing demo stores.'); return false;
      }
    },

    renderAll() {
      this.renderLocation(); this.renderMode(); this.renderScore(); this.renderMetrics(); this.renderTides();
      this.renderHourly(); this.renderDays(); this.renderShops(); this.renderForecast(); this.renderChecklist();
      this.renderMap(); this.renderLogbook(); this.renderCommunity();
    },

    renderLocation() {
      const l=this.state.location;
      this.$('locationName').textContent=l.name;
      this.$('forecastLocation').textContent=l.name;
      this.$('locationCoords').textContent=`${Number(l.lat).toFixed(4)}, ${Number(l.lon).toFixed(4)}`;
    },

    renderMode() {
      const dot=this.$('modeDot');
      dot.classList.toggle('live',this.state.live);
      this.$('modeText').textContent=this.state.live?'Live Data Mode — public sources + fallback':'Demo Mode — sample data';
      this.$('liveModeBtn').textContent=this.state.live?'Refresh Live':'Try Live Data';
      this.$('liveModeBtn').onclick = () => this.state.live ? this.refreshLiveData() : this.setLiveMode(true);
    },

    renderScore() {
      let score=91;
      const wx=this.liveCurrent();
      if (wx) {
        const wind=this.parseWindMph(wx.windSpeed);
        const rain=wx.probabilityOfPrecipitation?.value ?? 0;
        score=92-Math.max(0,wind-7)*1.3-rain*.22;
        if (/thunder|storm/i.test(wx.shortForecast||'')) score-=25;
        if (/rain|shower/i.test(wx.shortForecast||'')) score-=7;
      }
      if (/Pier/i.test(this.state.fishingStyle)) score+=2;
      if (this.state.targetSpecies==='Red Drum') score+=1;
      score=Math.round(Math.max(35,Math.min(98,score)));
      this.$('fishingScore').textContent=score;
      const label=score>=90?'EXCELLENT':score>=80?'VERY GOOD':score>=70?'GOOD':score>=60?'FAIR':'POOR';
      this.$('scoreLabel').textContent=label;
      this.$('scoreLabel').className='score-label '+(score>=85?'excellent':'');
      this.$('scoreReason').textContent=this.state.live&&wx?`Forecast score blends wind (${wx.windSpeed}), rain risk and tide timing. Add local knowledge before choosing your exact spot.`:'Incoming tide, light offshore wind and sunrise line up for a strong morning bite.';
      this.$('bestWindow').textContent=score>=85?'5:45 AM – 8:20 AM':'6:15 AM – 8:00 AM';
      this.$('bestWindowReason').textContent=score>=85?'Incoming tide • Sunrise • Light offshore wind':'Best balance of tide movement • Wind • Weather';
    },

    renderMetrics() {
      const wx=this.liveCurrent();
      if (wx) {
        this.$('airTemp').textContent=`${wx.temperature}°${wx.temperatureUnit||'F'}`;
        this.$('feelsLike').textContent='NWS hourly forecast';
        this.$('weatherText').textContent=wx.shortForecast||'Forecast';
        this.$('precipNow').textContent=`Rain ${wx.probabilityOfPrecipitation?.value ?? 0}%`;
        this.$('windNow').textContent=`${wx.windDirection||''} ${wx.windSpeed||''}`.trim();
        this.$('gustNow').textContent='Check latest local observations';
      } else {
        this.$('airTemp').textContent='72°F';this.$('feelsLike').textContent='Feels 72°F';this.$('weatherText').textContent='Partly Cloudy';this.$('precipNow').textContent='Rain 10%';this.$('windNow').textContent='NE 7 mph';this.$('gustNow').textContent='Gusts 10 mph';
      }
      this.$('surfNow').textContent='2.0 ft';this.$('periodNow').textContent='9 sec period';this.$('waterTemp').textContent='75°F';this.$('pressureNow').textContent='30.08 in';this.$('pressureTrend').textContent='Rising ↑';
    },

    renderTides() {
      let events=this.mock.tides, station='Nearest tide station';
      if (this.state.tides?.predictions?.length) {
        station=`${this.state.tides.station?.name || 'NOAA station'} • ${(this.state.tides.station?._distance||0).toFixed(1)} mi`;
        events=this.state.tides.predictions.slice(0,4).map(p=>({type:p.type==='H'?'High':'Low',time:this.formatNoaaTime(p.t),height:Number(p.v),trend:p.type==='H'?'up':'down'}));
      }
      this.$('tideStationLabel').textContent=station;
      this.$('tideEvents').innerHTML=events.map(e=>`<div class="tide-event"><small>${e.type} tide</small><strong>${this.escape(e.time)}</strong><span>${Number(e.height).toFixed(1)} ft <b class="${e.trend==='up'?'tide-up':'tide-down'}">${e.trend==='up'?'↑':'↓'}</b></span></div>`).join('');
      this.drawTideChart(events);
    },

    drawTideChart(events) {
      const canvas=this.$('tideCanvas'); const ctx=canvas.getContext('2d');
      const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h);
      const values=[]; for(let i=0;i<49;i++){ const x=i/48*Math.PI*4.1; values.push(1.7+1.45*Math.sin(x-1.2)+.2*Math.sin(x*2.1)); }
      const min=-.2,max=3.5,pad=28;
      ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;
      for(let j=0;j<4;j++){const y=pad+(h-pad*2)*j/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke();}
      const pts=values.map((v,i)=>({x:pad+(w-pad*2)*i/(values.length-1),y:h-pad-(v-min)/(max-min)*(h-pad*2)}));
      const grad=ctx.createLinearGradient(0,pad,0,h-pad);grad.addColorStop(0,'rgba(41,199,255,.35)');grad.addColorStop(1,'rgba(41,199,255,.02)');
      ctx.beginPath();ctx.moveTo(pts[0].x,h-pad);pts.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(pts[pts.length-1].x,h-pad);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#29c7ff';ctx.lineWidth=5;ctx.stroke();
      ctx.fillStyle='rgba(244,251,255,.7)';ctx.font='24px system-ui';ctx.fillText('12 AM',pad,h-2);ctx.fillText('6 AM',w*.27,h-2);ctx.fillText('12 PM',w*.49,h-2);ctx.fillText('6 PM',w*.73,h-2);ctx.fillText('12 AM',w-pad-70,h-2);
    },

    renderHourly() {
      const live=this.state.weather?.hourly?.slice(0,12);
      const hours=live?.length?live.map((p,i)=>({time:this.hourFromIso(p.startTime),icon:this.weatherIcon(p.shortForecast),temp:p.temperature,wind:`${p.windDirection} ${p.windSpeed}`,rain:p.probabilityOfPrecipitation?.value??0,tide:i<5?'Rising':i<8?'High/Falling':'Falling',score:this.hourScore(p,i)})):this.mock.hours.slice(0,12);
      this.$('hourlyStrip').innerHTML=hours.map(h=>`<div class="hour-card ${h.score>=90?'best':''}"><div class="time">${this.escape(h.time)}</div><div class="wx">${h.icon}</div><div class="temp">${h.temp}°</div><div class="sub">${this.escape(h.wind)}</div><div class="sub">${h.rain}% rain</div><div class="sub">Score ${h.score}</div></div>`).join('');
    },

    renderDays() {
      const days=this.getDays();
      const best=days.reduce((a,b)=>b.score>a.score?b:a,days[0]);
      this.$('bestDayBadge').textContent=`${best.day} • ${best.score}`;
      this.$('dayScores').innerHTML=days.map(d=>`<div class="day-score ${d===best?'best':''}"><div class="day">${d.day}</div><div class="num">${d.score}</div><div class="bar"><span style="width:${d.score}%"></span></div></div>`).join('');
    },

    getDays() {
      if (!this.state.weather?.daily?.length) return this.mock.days;
      const periods=this.state.weather.daily; const byDate=new Map();
      periods.forEach(p=>{const key=p.startTime.slice(0,10);if(!byDate.has(key))byDate.set(key,[]);byDate.get(key).push(p);});
      return [...byDate.entries()].slice(0,7).map(([date,ps],i)=>{
        const dayp=ps.find(p=>p.isDaytime)||ps[0]; const night=ps.find(p=>!p.isDaytime);
        const wind=this.parseWindMph(dayp.windSpeed); const rain=dayp.probabilityOfPrecipitation?.value??0;
        let score=Math.round(94-Math.max(0,wind-6)*1.4-rain*.22-(i*0.4)); if(/thunder|storm/i.test(dayp.shortForecast||''))score-=25;
        score=Math.max(35,Math.min(98,score)); const dt=new Date(date+'T12:00:00');
        return { day:dt.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase(),label:dt.toLocaleDateString(undefined,{weekday:'short'}),icon:this.weatherIcon(dayp.shortForecast),high:dayp.temperature,low:night?.temperature??dayp.temperature-8,wind:`${dayp.windDirection} ${wind}`,rain,score };
      });
    },

    renderShops() {
      const shops=(this.state.shops?.length?this.state.shops:this.mock.shops).slice(0,5);
      const html=shops.map((s,i)=>`<div class="list-item"><div class="rank">${i+1}</div><div><div class="list-title">${this.escape(s.name)}</div><div class="list-sub">${s.distance} mi • ~${s.drive} min ${s.rating?`• ★ ${s.rating}`:''}</div><div class="list-sub">${(s.tags||[]).join(' • ')}</div></div><button class="icon-btn list-action shop-open" data-shop-index="${i}" aria-label="Open directions">›</button></div>`).join('');
      this.$('baitShopList').innerHTML=html; this.$('mapShopList').innerHTML=html;
      document.querySelectorAll('.shop-open').forEach(btn=>btn.addEventListener('click',()=>this.openShopDirections(shops[Number(btn.dataset.shopIndex)])));
    },

    openShopDirections(shop) {
      let url;
      if (Number.isFinite(shop?.lat) && Number.isFinite(shop?.lon)) url=`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lon}`;
      else url=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop?.name+' near '+this.state.location.name)}`;
      window.open(url,'_blank','noopener');
    },

    renderForecast() {
      const days=this.getDays();
      this.$('forecastDays').innerHTML=days.map((d,i)=>`<div class="forecast-day ${i===this.state.forecastDay?'active':''}"><button data-day-index="${i}"><strong>${d.day}</strong><div class="date">${i===0?'Today':d.label}</div><div class="emoji">${d.icon}</div><div class="highlow">${d.high}° / ${d.low}°</div><div class="score">${d.score}</div></button></div>`).join('');
      this.$$('#forecastDays button').forEach(b=>b.addEventListener('click',()=>{this.state.forecastDay=Number(b.dataset.dayIndex);this.renderForecast();}));
      const selected=days[this.state.forecastDay]||days[0]; this.$('selectedForecastDay').textContent=`${selected.day} • Fishing score ${selected.score}`;
      let hours=this.mock.hours;
      if(this.state.forecastDay===0 && this.state.weather?.hourly?.length){hours=this.state.weather.hourly.slice(0,18).map((p,i)=>({time:this.hourFromIso(p.startTime),icon:this.weatherIcon(p.shortForecast),temp:p.temperature,wind:`${p.windDirection} ${p.windSpeed}`,rain:p.probabilityOfPrecipitation?.value??0,tide:i<5?'Rising':i<8?'High/Falling':'Falling',score:this.hourScore(p,i)}));}
      this.$('hourlyTable').innerHTML=hours.map(h=>`<tr><td><strong>${this.escape(h.time)}</strong></td><td>${h.icon}</td><td>${h.temp}°</td><td>${this.escape(h.wind)}</td><td>${h.rain}%</td><td>${this.escape(h.tide)}</td><td class="score-cell ${h.score>=80?'score-high':h.score>=65?'score-mid':'score-low'}">${h.score}</td></tr>`).join('');
    },

    renderChecklist() {
      const wx=this.liveCurrent(); const rain=wx?.probabilityOfPrecipitation?.value??10; const wind=this.parseWindMph(wx?.windSpeed||'7 mph'); const temp=wx?.temperature??72;
      const items=['Fishing license / required permits','Rods, reels, terminal tackle','Bait / lures for '+this.state.targetSpecies,'Pliers, dehooker & measuring tool','Water, snacks & phone battery','Sunscreen / sun protection'];
      if(rain>=25)items.push('Rain jacket / dry storage'); if(wind>=12)items.push('Heavier sinkers / wind-ready surf setup'); if(temp<60)items.push('Warm layers'); else items.push('Breathable clothing / hat'); items.push('First-aid kit & surf safety plan');
      this.$('tripChecklist').innerHTML=items.map((x,i)=>`<label class="check-row"><input type="checkbox" ${i<2?'checked':''}/><span>${this.escape(x)}</span></label>`).join('');
    },

    renderMap() { this.renderWaypoints(); this.renderShops(); },

    filterMap(filter,button) {
      this.$$('.chip').forEach(c=>c.classList.toggle('active',c===button));
      this.$$('.map-pin').forEach(pin=>{ pin.style.display=(filter==='all'||pin.dataset.pinType===filter)?'grid':'none'; });
    },

    quickSaveSpot() {
      const existing=this.state.waypoints.some(w=>w.name===this.state.location.name && w.lat===this.state.location.lat);
      if(existing){this.showToast('This fishing location is already saved.');return;}
      this.state.waypoints.unshift({id:Date.now(),name:this.state.location.name,notes:'Saved fishing location',lat:this.state.location.lat,lon:this.state.location.lon});this.save();this.renderWaypoints();this.$('favoriteSpotBtn').textContent='★';this.showToast('Fishing spot saved.');
    },

    saveWaypoint() {
      const name=this.$('waypointName').value.trim()||'Fishing waypoint'; const notes=this.$('waypointNotes').value.trim();
      this.state.waypoints.unshift({id:Date.now(),name,notes,lat:this.state.location.lat,lon:this.state.location.lon});this.save();this.$('waypointDialog').close();this.$('waypointForm').reset();this.renderWaypoints();this.showToast('Waypoint saved.');
    },

    renderWaypoints() {
      const list=this.$('waypointList'); this.$('waypointCount').textContent=this.state.waypoints.length;
      if(!this.state.waypoints.length){list.className='list-stack empty-state';list.textContent='No saved waypoints yet.';return;}
      list.className='list-stack'; list.innerHTML=this.state.waypoints.map((w,i)=>`<div class="list-item"><div class="rank">${i+1}</div><div><div class="list-title">${this.escape(w.name)}</div><div class="list-sub">${this.escape(w.notes||'Saved spot')} • ${Number(w.lat).toFixed(4)}, ${Number(w.lon).toFixed(4)}</div></div><button class="text-btn delete-waypoint" data-id="${w.id}">Delete</button></div>`).join('');
      this.$$('.delete-waypoint').forEach(b=>b.addEventListener('click',()=>{this.state.waypoints=this.state.waypoints.filter(w=>String(w.id)!==String(b.dataset.id));this.save();this.renderWaypoints();}));
    },

    renderLogbook() {
      this.$('targetSpecies').value=this.state.targetSpecies;this.renderSpeciesTip();this.renderCatchList();
      this.$('catchCount').textContent=this.state.catches.length;
      this.$('speciesCount').textContent=new Set(this.state.catches.map(c=>c.species)).size;
      const pb=new Map();this.state.catches.forEach(c=>{const len=Number(c.length)||0;if(len>(pb.get(c.species)||0))pb.set(c.species,len)});this.$('pbCount').textContent=[...pb.values()].filter(v=>v>0).length;
    },

    renderSpeciesTip() { this.$('speciesTip').textContent=this.speciesTips[this.state.targetSpecies]||this.speciesTips.Other; },

    saveCatch() {
      const species=this.$('catchSpecies').value; const length=this.$('catchLength').value; const weight=this.$('catchWeight').value; const bait=this.$('catchBait').value.trim(); const privacy=this.$('catchPrivacy').value; const notes=this.$('catchNotes').value.trim();
      const catchItem={id:Date.now(),species,length,weight,bait,privacy,notes,date:new Date().toISOString(),location:this.state.location.name,lat:this.state.location.lat,lon:this.state.location.lon,conditions:this.snapshotConditions()};
      this.state.catches.unshift(catchItem);this.save();this.$('catchDialog').close();this.$('catchForm').reset();this.renderLogbook();this.showToast('Catch saved to your logbook.');
    },

    renderCatchList() {
      const filter=this.$('logPrivacyFilter').value||'all'; const items=this.state.catches.filter(c=>filter==='all'||c.privacy===filter); const list=this.$('catchList');
      if(!items.length){list.className='list-stack empty-state';list.textContent='Your catches will appear here.';return;}
      list.className='list-stack';list.innerHTML=items.map(c=>`<div class="catch-card"><div class="catch-top"><div><strong>${this.escape(c.species)}</strong><div class="list-sub">${this.prettyDate(c.date)} • ${this.escape(c.location)}</div></div><span class="privacy">${c.privacy==='public'?'Public spot':c.privacy==='water'?'Water only':'Private'}</span></div><div class="list-sub" style="margin-top:8px">${c.length?`${this.escape(c.length)} in`:''}${c.length&&c.weight?' • ':''}${c.weight?`${this.escape(c.weight)} lb`:''}${c.bait?` • ${this.escape(c.bait)}`:''}</div>${c.notes?`<div style="margin-top:7px;font-size:13px">${this.escape(c.notes)}</div>`:''}<div class="list-sub" style="margin-top:7px">Saved conditions: ${this.escape(c.conditions)}</div></div>`).join('');
    },

    seedCommunity() { if(!this.state.communityPosts.length)this.state.communityPosts=[]; },

    renderCommunity() {
      const filter=this.$('communitySpeciesFilter').value||'all'; const local=this.state.catches.filter(c=>c.privacy!=='private').map(c=>({user:'You',species:c.species,size:c.length?`${c.length} in`:'',ago:this.prettyDate(c.date),bait:c.bait||'Not listed',water:c.location,text:c.notes||'Logged a catch.'}));
      const posts=[...local,...this.mock.community,...this.state.communityPosts].filter(p=>filter==='all'||p.species===filter);
      this.$('communityFeed').innerHTML=posts.map(p=>`<article class="feed-card"><div class="feed-user"><div class="avatar">${this.escape((p.user||'A')[0])}</div><div><strong>${this.escape(p.user)}</strong><div class="list-sub">${this.escape(p.ago)} • ${this.escape(p.water)}</div></div></div><div class="feed-photo">🐟</div><div style="margin-top:10px"><strong>${this.escape(p.species)}</strong>${p.size?` • ${this.escape(p.size)}`:''}</div><div class="list-sub">Bait: ${this.escape(p.bait||'Not listed')}</div><p style="margin-top:7px;font-size:13px">${this.escape(p.text||'')}</p></article>`).join('') || '<div class="empty-state">No posts match that species yet.</div>';
    },

    findBestTrip() {
      const days=this.getDays(); const best=days.reduce((a,b)=>b.score>a.score?b:a,days[0]); const session=this.$('tripSession').value; const species=this.$('tripSpecies').value;
      this.$('plannerResult').innerHTML=`<strong>${best.day} is currently the best option — ${best.score}/100.</strong><br>${this.escape(species)} • ${this.escape(session)} • ${best.icon} ${best.high}°/${best.low}° • Wind ${this.escape(best.wind)} • Rain ${best.rain}%.<br><span class="muted">Use the hourly table and tide chart to pick the exact window.</span>`;
    },

    snapshotConditions() {
      const wx=this.liveCurrent(); if(wx)return `${wx.temperature}°${wx.temperatureUnit||'F'}, ${wx.shortForecast}, wind ${wx.windDirection} ${wx.windSpeed}`; return '72°F, partly cloudy, NE 7 mph, incoming tide';
    },

    liveCurrent() { return this.state.weather?.hourly?.[0] || null; },
    hourScore(p,i) { let s=94-Math.max(0,this.parseWindMph(p.windSpeed)-6)*1.3-(p.probabilityOfPrecipitation?.value??0)*.2; if(i>5)s-=Math.min(18,(i-5)*2); if(/thunder|storm/i.test(p.shortForecast||''))s-=30; return Math.round(Math.max(30,Math.min(98,s))); },
    parseWindMph(v) { const nums=String(v||'').match(/\d+/g); return nums?Math.max(...nums.map(Number)):0; },
    weatherIcon(s='') { s=s.toLowerCase(); if(/thunder/.test(s))return'⛈️';if(/rain|shower/.test(s))return'🌧️';if(/snow/.test(s))return'🌨️';if(/fog/.test(s))return'🌫️';if(/mostly sunny|sunny|clear/.test(s))return'☀️';if(/partly/.test(s))return'🌤️';if(/cloud|overcast/.test(s))return'☁️';return'🌥️'; },
    hourFromIso(s){const d=new Date(s);return d.toLocaleTimeString([], {hour:'numeric'});},
    formatNoaaTime(s){const d=new Date(String(s).replace(' ','T'));return isNaN(d)?String(s):d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});},
    formatDateYYYYMMDD(d){return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;},
    prettyDate(iso){const d=new Date(iso);return isNaN(d)?String(iso):d.toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});},
    haversine(lat1,lon1,lat2,lon2){const R=3958.8,toRad=x=>x*Math.PI/180;const dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));},
    escape(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
    showToast(msg){const t=this.$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(this._toastTimer);this._toastTimer=setTimeout(()=>t.classList.remove('show'),2800);},
    registerServiceWorker(){if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(()=>{});}}
  };

  window.CoastCast = APP;
  APP.init();
})();
