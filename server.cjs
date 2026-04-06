const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 3000
const DIST = path.join(__dirname, 'dist')

/* ── MIME types ─────────────────────────────────────────────── */
const MIME = {
  '.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff',
  '.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp',
}

/* ── Seeded RNG ─────────────────────────────────────────────── */
function seededRng(seed) {
  let s = seed | 0
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff }
}

/* ── Barangay seed data ─────────────────────────────────────── */
const BARANGAY_RAW = [
  ['Acacia',14.245,120.98,'MODERATE',4200],['Adlas',14.238,121.01,'LOW',3800],
  ['Anahaw I',14.26,120.965,'MODERATE',4500],['Anahaw II',14.262,120.968,'MODERATE',4100],
  ['Balite I',14.19,120.94,'HIGH',5200],['Balite II',14.192,120.942,'HIGH',4900],
  ['Balubad',14.22,120.92,'CRITICAL',6100],['Banaba',14.235,120.93,'HIGH',5400],
  ['Barangay I (Pob.)',14.2246,120.9741,'CRITICAL',7200],['Barangay II (Pob.)',14.2224,120.9735,'CRITICAL',6800],
  ['Barangay III (Pob.)',14.226,120.975,'CRITICAL',7100],['Barangay IV (Pob.)',14.228,120.976,'HIGH',6500],
  ['Barangay V (Pob.)',14.227,120.9755,'HIGH',6300],['Batas',14.24,120.955,'MODERATE',4300],
  ['Biga I',14.205,120.96,'MODERATE',4700],['Biga II',14.207,120.962,'MODERATE',4400],
  ['Biluso',14.185,120.97,'HIGH',5800],['Bucal',14.25,121.0,'LOW',3600],
  ['Buho',14.215,120.945,'HIGH',5100],['Bulihan',14.23,120.95,'MODERATE',4600],
  ['Cabangaan',14.27,120.99,'LOW',3500],['Carmen',14.255,120.975,'MODERATE',4200],
  ['Hoyo',14.18,121.0,'HIGH',4800],['Hukay',14.275,120.96,'LOW',3200],
  ['Iba',14.21,121.02,'MODERATE',4000],['Inchican',14.25,120.97,'MODERATE',4500],
  ['Ipil I',14.28,120.98,'LOW',3400],['Ipil II',14.282,120.982,'LOW',3100],
  ['Kalubkob',14.175,120.93,'HIGH',4900],['Kaong',14.195,120.98,'MODERATE',4300],
  ['Lalaan I',14.17,120.96,'HIGH',5300],['Lalaan II',14.172,120.962,'HIGH',5000],
  ['Litlit',14.29,120.97,'LOW',2900],['Lucsuhin',14.265,121.015,'LOW',3300],
  ['Lumil',14.248,120.94,'MODERATE',4100],['Maguyam',14.26,120.99,'MODERATE',4600],
  ['Malabag',14.235,121.005,'LOW',3700],['Malaking Tatyao',14.165,120.99,'HIGH',5100],
  ['Mataas Na Burol',14.245,120.965,'MODERATE',4200],['Munting Ilog',14.22,120.935,'CRITICAL',6400],
  ['Narra I',14.27,120.945,'LOW',3500],['Narra II',14.272,120.947,'LOW',3300],
  ['Narra III',14.274,120.949,'LOW',3100],['Paligawan',14.2,120.915,'HIGH',5400],
  ['Pasong Langka',14.23,121.03,'LOW',3600],['Pooc I',14.215,120.935,'CRITICAL',6200],
  ['Pooc II',14.217,120.937,'CRITICAL',5900],['Pulong Bunga',14.255,120.95,'MODERATE',4300],
  ['Pulong Saging',14.205,120.97,'MODERATE',4100],['Puting Kahoy',14.19,121.005,'MODERATE',4400],
  ['Sabutan',14.285,120.995,'LOW',3000],['San Miguel I',14.24,120.985,'MODERATE',4200],
  ['San Miguel II',14.242,120.987,'MODERATE',3900],['San Vicente I',14.2,121.01,'MODERATE',4500],
  ['San Vicente II',14.202,121.012,'MODERATE',4200],['Santol',14.275,121.005,'LOW',3200],
  ['Tartaria',14.23,121.015,'LOW',3700],['Tibig',14.195,120.955,'HIGH',5200],
  ['Toledo',14.185,120.99,'HIGH',4900],['Tubuan I',14.21,120.98,'MODERATE',4300],
  ['Tubuan II',14.212,120.982,'MODERATE',4100],['Tubuan III',14.214,120.984,'MODERATE',3900],
  ['Ulat',14.265,120.92,'LOW',3300],['Yakal',14.29,121.01,'LOW',2800],
]

const RISK_COLORS = { LOW:'#22c55e', MODERATE:'#eab308', HIGH:'#f97316', CRITICAL:'#ef4444' }
const DAMAGE_COLORS = { UNDAMAGED:'#22c55e', MINOR:'#eab308', MAJOR:'#f97316', DESTROYED:'#ef4444' }
const SEVERITY_COLORS = { MODERATE:'#f59e0b', MAJOR:'#f97316', CRITICAL:'#ef4444' }
const TYPE_ICONS = { TYPHOON:'🌀', FLOOD:'🌊', EARTHQUAKE:'⚡', LANDSLIDE:'⛰️' }

const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&STYLES=&CRS=EPSG:4326&BBOX=13.00,119.50,15.50,122.50&WIDTH=1920&HEIGHT=1080&FORMAT=image/png&TIME='

const barangays = BARANGAY_RAW.map((b, i) => ({
  id: i + 1, name: b[0], latitude: b[1], longitude: b[2],
  riskLevel: b[3], riskColor: RISK_COLORS[b[3]], basePopulation: b[4], baseStructures: Math.floor(b[4] / 4),
}))

const disasters = [
  { id:1, name:'Typhoon Vamco (Ulysses)', description:'Category 4 super typhoon. Cavite declared state of calamity. Houses submerged across Silang.', disasterType:'TYPHOON', typeIcon:TYPE_ICONS.TYPHOON, severity:'CRITICAL', severityColor:SEVERITY_COLORS.CRITICAL, eventDate:'2020-11-11', peakRainfallMmPerHour:285.4, peakSeismicMagnitude:1.2, peakWaterLevelMeters:7.2, beforeImageUrl:GIBS_BASE+'2020-11-05', afterImageUrl:GIBS_BASE+'2020-11-13' },
  { id:2, name:'Silang Upland Landslide', description:'Heavy monsoon rainfall triggered landslides in upland barangays. Slope failures affecting residential areas.', disasterType:'LANDSLIDE', typeIcon:TYPE_ICONS.LANDSLIDE, severity:'MAJOR', severityColor:SEVERITY_COLORS.MAJOR, eventDate:'2020-10-25', peakRainfallMmPerHour:95.2, peakSeismicMagnitude:1.5, peakWaterLevelMeters:2.3, beforeImageUrl:GIBS_BASE+'2020-10-20', afterImageUrl:GIBS_BASE+'2020-10-27' },
  { id:3, name:'Typhoon Glenda (Rammasun)', description:'Typhoon Rammasun made landfall. Cavite placed under state of calamity. Over 26,000 houses damaged.', disasterType:'TYPHOON', typeIcon:TYPE_ICONS.TYPHOON, severity:'MAJOR', severityColor:SEVERITY_COLORS.MAJOR, eventDate:'2014-07-16', peakRainfallMmPerHour:198.2, peakSeismicMagnitude:1.0, peakWaterLevelMeters:5.4, beforeImageUrl:GIBS_BASE+'2014-07-10', afterImageUrl:GIBS_BASE+'2014-07-18' },
  { id:4, name:'West Valley Fault Scenario', description:'Simulated M7.2 earthquake scenario. West Valley Fault runs directly through Silang. Based on PHIVOLCS assessment.', disasterType:'EARTHQUAKE', typeIcon:TYPE_ICONS.EARTHQUAKE, severity:'CRITICAL', severityColor:SEVERITY_COLORS.CRITICAL, eventDate:'2024-03-15', peakRainfallMmPerHour:5.0, peakSeismicMagnitude:7.2, peakWaterLevelMeters:2.1, beforeImageUrl:GIBS_BASE+'2024-03-08', afterImageUrl:GIBS_BASE+'2024-03-15' },
  { id:5, name:'Imus River Flash Flood', description:'Intense monsoon rains triggered flash flooding along Imus River basin. Low-lying barangays inundated.', disasterType:'FLOOD', typeIcon:TYPE_ICONS.FLOOD, severity:'MODERATE', severityColor:SEVERITY_COLORS.MODERATE, eventDate:'2023-08-05', peakRainfallMmPerHour:142.8, peakSeismicMagnitude:0.8, peakWaterLevelMeters:6.1, beforeImageUrl:GIBS_BASE+'2023-07-28', afterImageUrl:GIBS_BASE+'2023-08-07' },
]

/* ── Generate assessments (seeded, deterministic) ───────────── */
function generateAssessments() {
  const rng = seededRng(20241115)
  const assessments = []
  let id = 1
  for (const d of disasters) {
    for (const b of barangays) {
      const roll = rng()
      const isC = b.riskLevel === 'CRITICAL', isH = b.riskLevel === 'HIGH', isL = b.riskLevel === 'LOW'
      let level
      if (d.disasterType === 'TYPHOON') {
        if (d.severity === 'CRITICAL') {
          level = isC ? (roll<.4?'DESTROYED':roll<.8?'MAJOR':'MINOR') : isH ? (roll<.2?'DESTROYED':roll<.65?'MAJOR':'MINOR') : isL ? (roll<.05?'MAJOR':roll<.4?'MINOR':'UNDAMAGED') : (roll<.1?'MAJOR':roll<.55?'MINOR':'UNDAMAGED')
        } else {
          level = isC ? (roll<.25?'MAJOR':roll<.7?'MINOR':'UNDAMAGED') : isH ? (roll<.1?'MAJOR':roll<.6?'MINOR':'UNDAMAGED') : (roll<.05?'MINOR':'UNDAMAGED')
        }
      } else if (d.disasterType === 'LANDSLIDE') {
        level = (isC||isH) ? (roll<.2?'DESTROYED':roll<.55?'MAJOR':roll<.85?'MINOR':'UNDAMAGED') : (roll<.05?'MAJOR':roll<.3?'MINOR':'UNDAMAGED')
      } else if (d.disasterType === 'EARTHQUAKE') {
        level = isC ? (roll<.35?'DESTROYED':roll<.75?'MAJOR':'MINOR') : isH ? (roll<.2?'DESTROYED':roll<.6?'MAJOR':'MINOR') : (roll<.08?'DESTROYED':roll<.4?'MAJOR':roll<.75?'MINOR':'UNDAMAGED')
      } else {
        level = isC ? (roll<.3?'MAJOR':roll<.85?'MINOR':'UNDAMAGED') : isH ? (roll<.1?'MAJOR':roll<.5?'MINOR':'UNDAMAGED') : (roll<.85?'UNDAMAGED':'MINOR')
      }
      const ratioMap = { UNDAMAGED: rng()*.02, MINOR: .1+rng()*.2, MAJOR: .35+rng()*.3, DESTROYED: .75+rng()*.2 }
      const pctMap = { UNDAMAGED: rng()*3, MINOR: 10+rng()*20, MAJOR: 45+rng()*30, DESTROYED: 80+rng()*15 }
      const structures = b.baseStructures
      const affected = Math.floor(structures * ratioMap[level])
      const pct = Math.round(pctMap[level] * 10) / 10
      const popAffected = Math.floor(b.basePopulation * (pct / 100))
      const confidence = Math.round((0.72 + rng() * 0.26) * 1000) / 1000
      assessments.push({
        id: id++, barangayId: b.id, barangayName: b.name, barangayLat: b.latitude, barangayLng: b.longitude,
        disasterId: d.id, disasterName: d.name, damageLevel: level, damageLevelColor: DAMAGE_COLORS[level],
        structuresAssessed: structures, structuresAffected: affected, damagePercent: pct,
        populationAffected: popAffected, aiConfidence: confidence,
        notes: `AI assessment via U-Net segmentation. ${d.name} — ${b.name}: ${level} damage detected.`,
      })
    }
  }
  return assessments
}
const allAssessments = generateAssessments()

/* ── LIVE sensor data (generated fresh each request) ────────── */
const STATIONS = [
  { id:'SS01',name:'Poblacion Station' },{ id:'SS02',name:'Biluso Station' },
  { id:'SS03',name:'Maguyam Station' },{ id:'SS04',name:'Tartaria Station' },
  { id:'SS05',name:'Biga Station' },{ id:'SS06',name:'Tibig Station' },
  { id:'SS07',name:'Inchican Station' },{ id:'SS08',name:'San Vicente Station' },
]

function generateLiveSensors(type, count, intervalMinutes, disasterId) {
  const now = Date.now()
  const readings = []
  const did = disasterId || 0
  const station = STATIONS[Math.abs(did * 3) % STATIONS.length]

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * intervalMinutes * 60000)
    const phase = (now / 60000 + i * 0.7 + did * 11) % 360
    const noise = Math.sin(phase * 0.1) * 0.5 + Math.cos(phase * 0.23) * 0.3 + (Math.sin(phase * 0.57 + did) * 0.2)

    let value, unit, sensorType, isAlert, isCritical
    if (type === 'rainfall') {
      const base = did === 1 ? 120 : did === 5 ? 90 : did === 3 ? 80 : 30
      value = Math.max(0, base + noise * 80 + Math.sin(i * 0.15 + now/100000) * 40)
      value = Math.round(value * 10) / 10
      unit = 'mm/hr'; sensorType = 'RAINFALL'
      isAlert = value >= 150; isCritical = value >= 250
    } else if (type === 'seismic') {
      const base = did === 4 ? 3.5 : 0.8
      value = base + noise * 1.5 + Math.sin(i * 0.08 + now/200000) * 0.8
      value = Math.round(value * 100) / 100
      unit = 'Richter'; sensorType = 'SEISMIC'
      isAlert = Math.abs(value) >= 4.0; isCritical = Math.abs(value) >= 6.0
    } else {
      const base = did === 1 ? 5.0 : did === 5 ? 4.5 : 2.5
      value = Math.max(0.5, base + noise * 1.5 + Math.sin(i * 0.12 + now/150000) * 0.8)
      value = Math.round(value * 100) / 100
      unit = 'meters'; sensorType = 'WATER_LEVEL'
      isAlert = value >= 4.0; isCritical = value >= 6.0
    }

    readings.push({
      timestamp: t.toISOString(), value, stationId: station.id, stationName: station.name,
      sensorType, unit, isAlert, isCritical,
    })
  }
  return readings
}

/* ── Summary computation ────────────────────────────────────── */
function computeSummary(disasterId) {
  const d = disasters.find(x => x.id === disasterId)
  if (!d) return null
  const items = allAssessments.filter(a => a.disasterId === disasterId)
  const undamaged = items.filter(a => a.damageLevel === 'UNDAMAGED').length
  const minor = items.filter(a => a.damageLevel === 'MINOR').length
  const major = items.filter(a => a.damageLevel === 'MAJOR').length
  const destroyed = items.filter(a => a.damageLevel === 'DESTROYED').length
  const affected = items.filter(a => a.damageLevel !== 'UNDAMAGED').length
  const totalStr = items.reduce((s,a) => s + a.structuresAssessed, 0)
  const totalAff = items.reduce((s,a) => s + a.structuresAffected, 0)
  const totalPop = items.reduce((s,a) => s + a.populationAffected, 0)
  const avgDmg = items.length ? items.reduce((s,a) => s + a.damagePercent, 0) / items.length : 0
  const avgConf = items.length ? items.reduce((s,a) => s + a.aiConfidence, 0) / items.length : 0
  return {
    disasterId: d.id, disasterName: d.name, disasterType: d.disasterType, severity: d.severity, eventDate: d.eventDate,
    totalAssessments: items.length, affectedBarangays: affected,
    totalStructuresAssessed: totalStr, totalStructuresAffected: totalAff,
    undamagedCount: undamaged, minorCount: minor, majorCount: major, destroyedCount: destroyed,
    totalPopulationAffected: totalPop,
    avgDamagePercent: Math.round(avgDmg * 10) / 10, avgAiConfidence: Math.round(avgConf * 1000) / 1000,
  }
}

/* ── API router ─────────────────────────────────────────────── */
function handleApi(pathname, query) {
  if (pathname === '/api/v1/barangays') return barangays
  if (pathname.match(/^\/api\/v1\/barangays\/\d+$/)) {
    const id = parseInt(pathname.split('/').pop())
    return barangays.find(b => b.id === id) || null
  }
  if (pathname === '/api/v1/disasters') return disasters
  if (pathname.match(/^\/api\/v1\/disasters\/\d+$/)) {
    const id = parseInt(pathname.split('/').pop())
    return disasters.find(d => d.id === id) || null
  }
  if (pathname === '/api/v1/assessments') {
    const did = parseInt(query.disasterId)
    return did ? allAssessments.filter(a => a.disasterId === did) : allAssessments
  }
  if (pathname === '/api/v1/sensors/rainfall') {
    const did = query.disasterId ? parseInt(query.disasterId) : null
    return generateLiveSensors('rainfall', 72, 60, did)
  }
  if (pathname === '/api/v1/sensors/seismic') {
    const did = query.disasterId ? parseInt(query.disasterId) : null
    return generateLiveSensors('seismic', 144, 10, did)
  }
  if (pathname === '/api/v1/sensors/water-level') {
    const did = query.disasterId ? parseInt(query.disasterId) : null
    return generateLiveSensors('water', 48, 60, did)
  }
  if (pathname === '/api/v1/stats/summary') {
    const did = parseInt(query.disasterId)
    return did ? computeSummary(did) : null
  }
  return undefined
}

/* ── HTTP server ────────────────────────────────────────────── */
const indexHtml = fs.existsSync(path.join(DIST, 'index.html'))
  ? fs.readFileSync(path.join(DIST, 'index.html'))
  : '<html><body>Build not found. Run npm run build first.</body></html>'

http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  // API routes
  if (pathname.startsWith('/api/')) {
    const result = handleApi(pathname, parsed.query || {})
    if (result === undefined) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Not found' }))
    } else if (result === null) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Resource not found' }))
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
    }
    return
  }

  // Static files
  const filePath = path.join(DIST, pathname)
  if (pathname !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  // SPA fallback
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(indexHtml)
}).listen(PORT, '0.0.0.0', () => {
  console.log(`SatSentinel running on port ${PORT} — ${barangays.length} barangays, ${disasters.length} disasters, ${allAssessments.length} assessments`)
})
