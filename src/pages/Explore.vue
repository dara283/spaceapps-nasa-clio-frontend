<script setup>
import WeatherIcon from '@/components/ui/WeatherIcon.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import StatsLineChart from '@/components/charts/StatsLineChart.vue'
import '@/assets/theme.css'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { saveItem, getSaved } from '@/utils/saved'

/* ===== API base (use .env: VITE_API_BASE=http://localhost:5050) ===== */
const API = import.meta.env.VITE_API_BASE || ''   // if using Vite proxy, leave ''

/* ===== Leaflet map state ===== */
const center = ref([0, 0])   // Atlantic center start
const zoom = ref(2)
const marker = ref(null)
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; OpenStreetMap contributors'
function onMapClick(e){
  marker.value = e.latlng
  const lat = e.latlng.lat.toFixed(4)
  const lng = e.latlng.lng.toFixed(4)
  coordsText.value = `${lat}, ${lng}`
  locationText.value = coordsText.value
}

/* ===== auth/save ===== */
const route = useRoute()
const router = useRouter()
const { state, isAuthed } = useAuth()

function saveCurrent(){
  if (!isAuthed.value) {
    router.push({ name:'login', query:{ redirect: '/explore' } })
    return
  }
  saveItem(state.user.email, {
    location: locationText.value || '(no location)',
    timeDesc: timeDescription(),
    variables: [...selectedVariables.value],
    thresholds: JSON.parse(JSON.stringify(thresholds.value)),
    analysisData: analysisData.value
  })
  alert('Saved to your dashboard.')
}

function goSaved(){
  router.push('/dashboard')
}
function iconFor(key){
  switch(key){
    case 'temperature': return 'thermometer'
    case 'precipitation': return 'cloud-rain'
    case 'wind': return 'wind'
    case 'humidity': return 'droplet'
    case 'cloud': return 'cloud'
    case 'dust': return 'cloud'       // simple icon; you can customize
    case 'snow': return 'snow'
    case 'solar': return 'sun'
    default: return 'sun'
  }
}

function summaryFor(key, d){
  const prob = Math.round(d?.probability || 0)
  const when = timeDescription()
  const ranges = { hi: 'high', mid: 'moderate', lo: 'low' }
  const band = prob >= 70 ? 'hi' : prob >= 30 ? 'mid' : 'lo'

  const phrases = {
    temperature: { hi:'very hot conditions', mid:'warm to hot conditions', lo:'mild temperatures' },
    precipitation:{ hi:'heavy rain likely', mid:'possible showers', lo:'little rain expected' },
    wind:        { hi:'very windy conditions', mid:'breezy conditions', lo:'light winds' },
    humidity:    { hi:'very muggy/humid', mid:'moderate humidity', lo:'drier feel' },
    cloud:       { hi:'mostly cloudy', mid:'partly cloudy', lo:'mostly clear' },
    dust:        { hi:'dusty/hazy air', mid:'some haze', lo:'good air clarity' },
    snow:        { hi:'snow likely', mid:'chance of snow', lo:'little/no snow' },
    solar:       { hi:'strong UV', mid:'moderate UV', lo:'low UV' }
  }
  const text = (phrases[key] || phrases.cloud)[band]
  return `${when}: ${text} (${prob}%).`
}

// Add this helper near your other helpers:
function colorFor(k){
  const map = {
    temperature: '#2E96F5',  // blue
    precipitation: '#0960E1',// deeper blue
    wind: '#67e8f9',         // teal-ish
    humidity: '#22c55e',     // green
    cloud: '#94a3b8',        // slate
    dust: '#d97706',         // amber
    snow: '#60a5fa',         // light blue
    solar: '#f59e0b'         // orange
  }
  return map[k] || 'var(--blue-yonder, #2E96F5)'
}

function areaFor(lineHex){
  // convert #rrggbb to rgba with light opacity
  try {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(lineHex)
    if (!m) return null
    const r = parseInt(m[1],16), g = parseInt(m[2],16), b = parseInt(m[3],16)
    return `rgba(${r},${g},${b},0.18)`
  } catch { return null }
}

/* When opening with ?load=<id> restore the saved analysis */
onMounted(() => {
  const id = route.query.load
  if (id && state.user?.email) {
    const it = getSaved(state.user.email).find(x => x.id === id)
    if (it) {
      locationText.value = it.location
      selectedVariables.value = [...it.variables]
      thresholds.value = it.thresholds || {}
      // Make sure every selected var has thresholds (in case old saves lacked them)
      ensureThresholdsForSelected()
      analysisData.value = it.analysisData || {}
      resultsVisible.value = true
    }
  }
})

/* ===== form/state ===== */
const selectedVariables = ref([])
const currentMethod = ref('search')
const timeframe = ref('')
const date = ref('')
const time = ref('')        // HH:mm
const month = ref('1')
const season = ref('spring')
const resultsVisible = ref(false)
const analysisTab = ref('probabilities')
const coordsText = ref('')
const locationText = ref('')
const thresholds = ref({})          // per-variable thresholds
const analysisData = ref({})        // backend result

/* keep manual coord inputs in sync */
const latInput = ref('')
const lonInput = ref('')
watch([latInput, lonInput], ([lat, lon]) => {
  if (lat && lon) {
    const la = Number(lat), lo = Number(lon)
    if (!Number.isNaN(la) && !Number.isNaN(lo)) {
      coordsText.value = `${la.toFixed(4)}, ${lo.toFixed(4)}`
      locationText.value = coordsText.value
    }
  }
})

/* ===== Your fixed variable list (do NOT replace keys) ===== */
const variableList = [
  { key:'temperature',   name:'Temperature',   desc:'Daily min/max, extreme indices' },
  { key:'precipitation', name:'Precipitation', desc:'Rainfall, snowfall, intensity' },
  { key:'wind',          name:'Wind Speed',    desc:'Surface winds, gusts' },
  { key:'humidity',      name:'Humidity',      desc:'Relative humidity, dewpoint' },
  { key:'cloud',         name:'Cloud Cover',   desc:'Cloud fraction, types' },
  { key:'dust',          name:'Dust/Aerosols', desc:'Air quality, visibility' },
  { key:'snow',          name:'Snow',          desc:'Snow depth, coverage' },
  { key:'solar',         name:'Solar Radiation', desc:'UV index, solar irradiance' },
]

function defaultThresholds(k){
  return ({
    temperature:{ high:35, low:-10, unit:'°C' },
    precipitation:{ high:50, low:0,  unit:'mm/day' },
    wind:{ high:40, low:0,          unit:'km/h' },
    humidity:{ high:90, low:10,     unit:'%' },
    cloud:{ high:90, low:10,        unit:'%' },
    dust:{ high:150, low:0,         unit:'μg/m³' },
    snow:{ high:30,  low:0,         unit:'cm' },
    solar:{ high:11,  low:0,        unit:'UV Index' },
  })[k] ?? { high:100, low:0, unit:'units' }
}

function ensureThresholdsForSelected(){
  for (const k of selectedVariables.value) {
    if (!thresholds.value[k]) thresholds.value[k] = { ...defaultThresholds(k) }
  }
  // remove stale threshold keys
  for (const k of Object.keys(thresholds.value)) {
    if (!selectedVariables.value.includes(k)) delete thresholds.value[k]
  }
}

function toggleVariable(k){
  const i = selectedVariables.value.indexOf(k)
  if (i>=0){
    selectedVariables.value.splice(i,1)
    delete thresholds.value[k]
  } else {
    selectedVariables.value.push(k)
    thresholds.value[k] = { ...defaultThresholds(k) }
  }
}

/* ===== helpers ===== */
function currentCoordinates() {
  if (coordsText.value) {
    const [lt, ln] = coordsText.value.split(',').map(s => parseFloat(s.trim()))
    if (!Number.isNaN(lt) && !Number.isNaN(ln)) return { lat: lt, lon: ln }
  }
  return null
}

const showDate = computed(()=> timeframe.value==='specific-date')
const showMonth = computed(()=> timeframe.value==='month')
const showSeason = computed(()=> timeframe.value==='season')

function timeDescription(){
  if (timeframe.value==='specific-date' && date.value) {
    const at = time.value ? ` @ ${time.value}` : ''
    return new Date(date.value).toLocaleDateString('en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric'
    }) + at
  }
  if (timeframe.value==='month') {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][Number(month.value)-1]
  }
  if (timeframe.value==='season') {
    return season.value[0].toUpperCase()+season.value.slice(1)
  }
  return 'Year-round'
}

function displayName(k){
  const found = Array.isArray(variableList) ? variableList.find(v => v.key === k) : null
  return found ? found.name : k
}

/* ===== fallback simulator (if backend fails) ===== */
function simulateNASAData(){
  const out = {}
  for(const v of selectedVariables.value){
    out[v] = {
      probability: Math.random()*100,
      trend: (Math.random()-0.5)*2,
      mean: Math.random()*100,
      median: Math.random()*100,
      percentile90: Math.random()*100,
      percentile10: Math.random()*100,
      historicalData: Array.from({length:30},()=> Math.random()*100)
    }
  }
  return out
}

/* ===== submit: call your CSV-backed backend ===== */
async function submitForm(e){
  e.preventDefault()
  if (!timeframe.value) {
    alert('Pick a Time Analysis option.')
    return
  }
  if (selectedVariables.value.length === 0) {
    alert('Select at least one variable.')
    return
  }
  ensureThresholdsForSelected()

  const body = {
    location: locationText.value || '',
    coordinates: currentCoordinates(),  // {lat, lon} or null
    timeframe: timeframe.value,
    date: date.value || null,
    month: month.value || null,
    season: season.value || null,
    variables: selectedVariables.value,
    thresholds: thresholds.value,
    trendAdjust: { enable: true }
  }

  try {
    const res = await fetch(`${API}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const json = await res.json()
    analysisData.value = json.data || {}
  } catch (err) {
    console.error('Backend failed, using local simulation:', err)
    analysisData.value = simulateNASAData()
  }

  resultsVisible.value = true
  requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({behavior:'smooth'}))
}

/* ===== downloads ===== */
function downloadData(fmt){
  const meta = { location: locationText.value||'(unset)', selectedTime: timeDescription(), variables:selectedVariables.value }
  let content='', mime='', filename=''
  if (fmt==='json'){
    content = JSON.stringify({meta,data:analysisData.value}, null, 2)
    mime = 'application/json'; filename='nasa_weather_analysis.json'
  } else if (fmt==='csv'){
    content = generateCSV(analysisData.value, meta)
    mime = 'text/csv'; filename='nasa_weather_analysis.csv'
  } else {
    alert('PDF report coming later.')
    return
  }
  const blob = new Blob([content], { type:mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

function generateCSV(data, meta){
  let csv = '# NASA Weather Analysis\n'
  csv += `# Location: ${meta.location}\n# Time: ${meta.selectedTime}\n#\n`
  csv += 'Variable,Probability(%),Trend,Mean,Median,90th,10th,Unit\n'
  for(const k of Object.keys(data)){
    const d = data[k]
    const t = thresholds.value[k] || { unit:'units' }
    csv += `${displayName(k)},${d.probability.toFixed(1)},${d.trend.toFixed(3)},${d.mean.toFixed(1)},${d.median.toFixed(1)},${d.percentile90.toFixed(1)},${d.percentile10.toFixed(1)},${t.unit}\n`
  }
  return csv
}

/* ===== chart labels for demo ===== */
const chartLabels = computed(()=>{
  const n=30, now=new Date(), start= now.getFullYear()-n+1
  return Array.from({length:n},(_,i)=> new Date(start+i,0,1))
})
</script>

<template>
  <div style="max-width:1200px;margin:auto;padding:20px">
    <header style="text-align:center;margin-bottom:24px">
      <h1>NASA Weather Intelligence System</h1>
      <p style="color:var(--muted)">Explore historical probabilities and climate trends for any place and time of year.</p>
    </header>

    <section class="card" style="padding:24px;margin-bottom:24px">
      <form @submit="submitForm" id="weatherForm">
        <!-- Location method -->
        <div style="margin-bottom:12px">
          <label>Location Selection Method</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <button type="button" class="btn" :class="{'btn-primary': currentMethod==='search'}" @click="currentMethod='search'">Search</button>
            <button type="button" class="btn" :class="{'btn-primary': currentMethod==='coordinates'}" @click="currentMethod='coordinates'">Coordinates</button>
            <button type="button" class="btn" :class="{'btn-primary': currentMethod==='map'}" @click="currentMethod='map'">Interactive Map</button>
          </div>
        </div>

        <!-- Location inputs -->
        <div v-show="currentMethod==='search'">
          <label>Enter Location</label>
          <input class="input" placeholder="City, State, Country or landmark" v-model="locationText">
        </div>

        <div v-show="currentMethod==='coordinates'" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label>Latitude</label><input class="input" type="number" step="0.0001" min="-90" max="90" v-model="latInput"></div>
          <div><label>Longitude</label><input class="input" type="number" step="0.0001" min="-180" max="180" v-model="lonInput"></div>
        </div>

        <div v-show="currentMethod==='map'" class="card" style="padding:14px;margin-top:12px">
          <l-map
            v-model:zoom="zoom"
            :center="center"
            :use-global-leaflet="false"
            style="height: 340px; border-radius: 12px; overflow: hidden; border:1px solid rgba(255,255,255,.08)"
            @click="onMapClick"
          >
            <l-tile-layer :url="tileUrl" :attribution="attribution" />
            <l-marker v-if="marker" :lat-lng="marker">
              <l-popup>
                Selected: {{ marker.lat.toFixed(4) }}, {{ marker.lng.toFixed(4) }}
              </l-popup>
            </l-marker>
          </l-map>
          <p class="map-note" style="margin-top:8px;opacity:.75">Click the map to drop a pin.</p>
          <div v-if="coordsText" style="margin-top:8px">Selected: <strong>{{ coordsText }}</strong></div>
        </div>

        <!-- Time / exact time -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px">
          <div>
            <label>Time Analysis</label>
            <select class="input" v-model="timeframe" required>
              <option value="">Select…</option>
              <option value="specific-date">Specific Date</option>
              <option value="month">Entire Month</option>
              <option value="season">Season</option>
              <option value="year-round">Year-round</option>
            </select>
          </div>

          <div v-show="showDate">
            <label>Date</label>
            <input class="input" type="date" v-model="date">
          </div>

          <div v-show="showMonth">
            <label>Month</label>
            <select class="input" v-model="month">
              <option v-for="m in 12" :key="m" :value="String(m)">{{ m }}</option>
            </select>
          </div>

          <div v-show="showSeason">
            <label>Season</label>
            <select class="input" v-model="season">
              <option value="spring">Spring (Mar–May)</option>
              <option value="summer">Summer (Jun–Aug)</option>
              <option value="fall">Fall (Sep–Nov)</option>
              <option value="winter">Winter (Dec–Feb)</option>
            </select>
          </div>

          <div>
            <label>Exact Time</label>
            <input class="input" type="time" v-model="time" placeholder="HH:MM">
          </div>
        </div>

        <!-- Variables -->
        <div style="margin-top:18px">
          <label>NASA Earth Observation Variables</label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:8px">
            <button
              v-for="v in variableList" :key="v.key" type="button"
              class="btn"
              :class="{'btn-primary': selectedVariables.includes(v.key)}"
              @click="toggleVariable(v.key)"
              style="text-align:left"
            >
              <div style="font-weight:700">{{ v.name }}</div>
              <div style="font-size:12px;color:var(--muted)">{{ v.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Thresholds -->
        <div v-show="selectedVariables.length" style="margin-top:18px">
          <label>Custom Threshold Settings</label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:8px">
            <div class="card" style="padding:12px" v-for="v in selectedVariables" :key="v">
              <h4 style="margin:0 0 8px">{{ displayName(v) }} Thresholds</h4>
              <div style="display:flex;gap:10px">
                <label style="flex:1">Extreme High<input class="input" type="number" v-model.number="thresholds[v].high"></label>
                <label style="flex:1">Extreme Low<input class="input" type="number" v-model.number="thresholds[v].low"></label>
              </div>
              <small style="color:var(--muted)">Units: {{ thresholds[v]?.unit }}</small>
            </div>
          </div>
        </div>

        <div style="margin-top:16px">
          <button type="submit" class="btn btn-primary">Generate NASA Weather Analysis</button>
        </div>
      </form>
    </section>

    <!-- Results -->
    <section id="results" v-show="resultsVisible" class="card" style="padding:24px">
      <header style="text-align:center;margin-bottom:16px">
        <h2>NASA Earth Observation Analysis</h2>
        <div style="background:#0f1b2d;border:1px solid #1c2c49;border-radius:10px;padding:10px;margin-top:10px">
          <strong>{{ locationText || '(no location)' }}</strong> • <strong>{{ timeDescription() }}</strong>
        </div>
        <div style="margin-top:8px">
          <div style="display:flex;gap:10px;justify-content:center;margin-top:10px">
            <button class="btn btn-cta" @click="saveCurrent">Save</button>
            <button class="btn btn-white" @click="goSaved">View Saved</button>
          </div>
        </div>
      </header>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
        <button class="btn" :class="{'btn-primary': analysisTab==='probabilities'}" @click="analysisTab='probabilities'">Probabilities</button>
        <button class="btn" :class="{'btn-primary': analysisTab==='trends'}" @click="analysisTab='trends'">Climate Trends</button>
        <button class="btn" :class="{'btn-primary': analysisTab==='statistics'}" @click="analysisTab='statistics'">Statistics</button>
        <button class="btn" :class="{'btn-primary': analysisTab==='download'}" @click="analysisTab='download'">Download</button>
      </div>

      <!-- Probabilities -->
<!-- Probabilities -->
<div v-show="analysisTab==='probabilities'" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
  <div
    class="card"
    style="padding:16px;display:flex;gap:12px;align-items:center"
    v-for="v in selectedVariables" :key="`p-${v}`">
    <div style="flex:0 0 auto">
      <WeatherIcon :name="iconFor(v)" :size="34" color="#EAFE07" :opacity="0.95" />
    </div>
    <div style="flex:1 1 auto">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <h4 style="margin:0">{{ displayName(v) }}</h4>
        <div style="font-size:28px;font-weight:900;line-height:1">
          {{ Math.round(analysisData[v]?.probability||0) }}%
        </div>
      </div>
      <small style="color:var(--muted)">
        {{ summaryFor(v, analysisData[v]) }}
      </small>
    </div>
  </div>
</div>


      <!-- Trends -->
      <div v-show="analysisTab==='trends'" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
        <div class="card" style="padding:16px" v-for="v in selectedVariables" :key="`t-${v}`">
          <h4 style="margin:0 0 6px">{{ displayName(v) }} Trend</h4>
          <div :style="{color:(analysisData[v]?.trend||0)>0.1 ? '#E43700' : (analysisData[v]?.trend||0)<-0.1 ? '#2ee68b' : '#9db0c6'}">
            <strong>{{ (analysisData[v]?.trend||0) > 0.1 ? 'INCREASING' : (analysisData[v]?.trend||0) < -0.1 ? 'DECREASING' : 'STABLE' }}</strong>
          </div>
          <small style="color:var(--muted)">~ {{ Math.abs((analysisData[v]?.trend||0)*100).toFixed(1) }}% change/decade</small>
        </div>
      </div>

<!-- Statistics with charts -->
<div v-show="analysisTab==='statistics'" style="display:grid;grid-template-columns:1fr;gap:18px">
  <div class="card" style="padding:14px" v-for="v in selectedVariables" :key="`s-${v}`">
    <h4 style="margin:0 0 8px">{{ displayName(v) }} — time series</h4>
<StatsLineChart
  :labels="chartLabels"
  :mean="analysisData[v]?.historicalData || []"
  :title="displayName(v)"
  :yUnit="thresholds[v]?.unit || ''"
  :lineColor="colorFor(v)"
  :areaColor="areaFor(colorFor(v))"
/>

  </div>
</div>


      <!-- Download -->
      <div v-show="analysisTab==='download'">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" @click="downloadData('csv')">Download CSV</button>
          <button class="btn btn-primary" @click="downloadData('json')">Download JSON</button>
          <button class="btn" @click="downloadData('pdf')">Generate PDF</button>
        </div>
      </div>
    </section>
  </div>
</template>
