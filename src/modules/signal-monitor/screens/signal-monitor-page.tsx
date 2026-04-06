import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SensorReadingDto } from '@/core/types/sensor.types'
import { DisasterEventDto } from '@/core/types/disaster.types'
import { fetchRainfall, fetchSeismic, fetchWaterLevel } from '@/shared/api/sensor.api'
import { fetchAllDisasters } from '@/shared/api/disaster.api'
import { RainfallChart } from '../components/rainfall-chart'
import { SeismicChart } from '../components/seismic-chart'
import { WaterLevelChart } from '../components/water-level-chart'
import { CloudRain, Activity, Waves, Radio } from 'lucide-react'

const STATIONS = [
  { id: 'STA-POB', name: 'Poblacion',   lat: '14.2246°N', lng: '120.9741°E', active: true  },
  { id: 'STA-BIL', name: 'Biluso',      lat: '14.1867°N', lng: '120.9700°E', active: true  },
  { id: 'STA-MAG', name: 'Maguyam',     lat: '14.1900°N', lng: '120.9900°E', active: true  },
  { id: 'STA-TAR', name: 'Tartaria',    lat: '14.2500°N', lng: '121.0150°E', active: true  },
  { id: 'STA-BIG', name: 'Biga',        lat: '14.2100°N', lng: '120.9600°E', active: true  },
  { id: 'STA-TIB', name: 'Tibig',       lat: '14.1950°N', lng: '120.9550°E', active: false },
  { id: 'STA-INC', name: 'Inchican',    lat: '14.2350°N', lng: '120.9700°E', active: true  },
  { id: 'STA-SVI', name: 'San Vicente', lat: '14.2450°N', lng: '121.0100°E', active: true  },
]

const SENSOR_CHANNELS = [
  { key: 'rainfall', label: 'Rainfall',    unit: 'mm/hr',  icon: CloudRain, color: '#38bdf8', warnAt: 150, critAt: 250 },
  { key: 'seismic',  label: 'Seismic',     unit: 'mag',    icon: Activity,  color: '#f59e0b', warnAt: 4.0, critAt: 6.0 },
  { key: 'water',    label: 'Water Level', unit: 'm',      icon: Waves,     color: '#0ea5e9', warnAt: 4.0, critAt: 6.0 },
] as const

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export function SignalMonitorPage(): JSX.Element {
  const [disasters,  setDisasters]  = useState<ReadonlyArray<DisasterEventDto>>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [rainfall,   setRainfall]   = useState<ReadonlyArray<SensorReadingDto>>([])
  const [seismic,    setSeismic]    = useState<ReadonlyArray<SensorReadingDto>>([])
  const [water,      setWater]      = useState<ReadonlyArray<SensorReadingDto>>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [lastPoll,   setLastPoll]   = useState<Date | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const d = await fetchAllDisasters()
        setDisasters(d)
        if (d.length > 0) setSelectedId(d[0].id)
      } catch {
        setError('Failed to connect to the API.')
      }
    })()
  }, [])

  const loadSensors = async (id: number | null): Promise<void> => {
    setLoading(true)
    try {
      const [r, s, w] = await Promise.all([
        fetchRainfall(id ?? undefined),
        fetchSeismic(id ?? undefined),
        fetchWaterLevel(id ?? undefined),
      ])
      setRainfall(r); setSeismic(s); setWater(w)
      setLastPoll(new Date())
      setError(null)
    } catch {
      setError('Sensor data unavailable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadSensors(selectedId) }, [selectedId])
  useEffect(() => {
    const id = setInterval(() => { void loadSensors(selectedId) }, 10_000)
    return () => clearInterval(id)
  }, [selectedId])

  const lastReadings = [
    rainfall[rainfall.length - 1],
    seismic[seismic.length - 1],
    water[water.length - 1],
  ] as const

  const chartData = [rainfall, seismic, water] as const
  const ChartComponents = [RainfallChart, SeismicChart, WaterLevelChart] as const

  /* Derive alert list */
  const alerts: Array<{ message: string; isCritical: boolean }> = []
  const lr = lastReadings[0]
  const ls = lastReadings[1]
  const lw = lastReadings[2]
  if (lr?.isCritical) alerts.push({ message: 'Rainfall exceeds 250 mm/hr danger threshold', isCritical: true })
  else if (lr?.isAlert) alerts.push({ message: 'Rainfall exceeds 150 mm/hr warning threshold', isCritical: false })
  if (ls?.isCritical) alerts.push({ message: 'Seismic activity exceeds Magnitude 6.0', isCritical: true })
  else if (ls?.isAlert) alerts.push({ message: 'Seismic activity above M4.0 elevated level', isCritical: false })
  if (lw?.isCritical) alerts.push({ message: 'Imus River above 6.0m danger mark', isCritical: true })
  else if (lw?.isAlert) alerts.push({ message: 'Imus River above 4.0m warning level', isCritical: false })

  /* Format last values */
  const lastValues = [
    lr ? lr.value.toFixed(1) : null,
    ls ? Math.abs(ls.value).toFixed(2) : null,
    lw ? lw.value.toFixed(2) : null,
  ] as const

  const statusOf = (reading: SensorReadingDto | undefined): 'CRITICAL' | 'WARNING' | 'NOMINAL' =>
    reading?.isCritical ? 'CRITICAL' : reading?.isAlert ? 'WARNING' : 'NOMINAL'

  const statusColor = (s: 'CRITICAL' | 'WARNING' | 'NOMINAL', fallback: string): string =>
    s === 'CRITICAL' ? '#ef4444' : s === 'WARNING' ? '#eab308' : fallback

  return (
    <div className="p-5 lg:p-6 space-y-5 overflow-y-auto h-full">

      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_PREMIUM }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.20)' }}
          >
            <Radio size={18} style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[--color-text-primary] tracking-tight">Signal Monitor</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[--color-text-muted] font-mono">
                {STATIONS.filter((s) => s.active).length}/{STATIONS.length} stations online · Silang, Cavite
              </p>
              {lastPoll && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.20)' }}>
                  Polled {lastPoll.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event selector */}
        <div className="flex gap-1.5 flex-wrap">
          {disasters.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, ease: EASE_PREMIUM }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedId(d.id)}
              className="relative px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors"
              style={{
                background:  d.id === selectedId ? d.severityColor : `${d.severityColor}12`,
                borderColor: d.id === selectedId ? d.severityColor : `${d.severityColor}35`,
                color:       d.id === selectedId ? '#0a0e1a' : d.severityColor,
                fontWeight:  d.id === selectedId ? 700 : 400,
              }}
            >
              {d.id === selectedId && (
                <motion.div
                  layoutId="signal-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: d.severityColor, zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10">{d.typeIcon} {d.name.split(' ').slice(0, 2).join(' ')}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Error state ───────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-xs font-mono flex items-center justify-between"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#ef4444' }}
        >
          <span>{error}</span>
          <button
            onClick={() => void loadSensors(selectedId)}
            className="px-3 py-1 rounded-md text-[10px] font-bold"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)' }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* ── Alert banners ─────────────────────────────────────── */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            className="space-y-1.5 overflow-hidden"
          >
            {alerts.map((alert, i) => {
              const alertColor = alert.isCritical ? '#ef4444' : '#eab308'
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, ease: EASE_PREMIUM, duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-mono"
                  style={{ background: `${alertColor}0c`, borderColor: `${alertColor}35`, color: alertColor }}
                >
                  <div className="relative w-2.5 h-2.5 shrink-0">
                    <div className="absolute inset-0 rounded-full" style={{ background: `${alertColor}40`, animation: 'ripple-expand 2s ease-out infinite' }} />
                    <div className="relative w-2.5 h-2.5 rounded-full" style={{ background: alertColor }} />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider shrink-0">{alert.isCritical ? 'CRITICAL' : 'WARNING'}</span>
                  <span className="opacity-30">·</span>
                  <span>{alert.message}</span>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live sensor readings — large value cards ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SENSOR_CHANNELS.map((ch, idx) => {
          const reading = lastReadings[idx]
          const status = statusOf(reading)
          const valColor = statusColor(status, ch.color)
          const Icon = ch.icon
          const val = lastValues[idx]

          return (
            <motion.div
              key={ch.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + idx * 0.05, ease: EASE_PREMIUM, duration: 0.4 }}
              className="relative rounded-xl p-5 overflow-hidden"
              style={{ background: 'var(--color-surface-raised)', border: `1px solid ${valColor}20` }}
            >
              {/* Top accent */}
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${valColor}, transparent)` }} />
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${valColor}06 0%, transparent 60%)` }} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ch.color}12`, border: `1px solid ${ch.color}25` }}>
                    <Icon size={16} style={{ color: ch.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-[--color-text-primary] uppercase tracking-wider">{ch.label}</p>
                    <p className="text-[9px] font-mono text-[--color-text-muted]">{ch.unit}</p>
                  </div>
                </div>
                <span
                  className="text-[9px] font-mono font-bold px-2 py-1 rounded-full"
                  style={{ background: `${valColor}12`, color: valColor, border: `1px solid ${valColor}28` }}
                >
                  {status}
                </span>
              </div>

              {/* Big value */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={val ?? 'empty'}
                  initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-baseline gap-1.5"
                >
                  <span className="font-display text-3xl font-black tabular-nums" style={{ color: valColor }}>
                    {val ?? '—'}
                  </span>
                  <span className="text-xs font-mono text-[--color-text-muted]">{ch.unit}</span>
                </motion.div>
              </AnimatePresence>

              {/* Threshold bar */}
              {reading && (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-overlay)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: valColor, boxShadow: `0 0 6px ${valColor}50` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((Math.abs(reading.value) / ch.critAt) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: EASE_PREMIUM }}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {SENSOR_CHANNELS.map((ch, idx) => {
          const ChartComponent = ChartComponents[idx]
          const data = chartData[idx]
          const reading = lastReadings[idx]
          const status = statusOf(reading)
          const valColor = statusColor(status, ch.color)
          const val = lastValues[idx]
          const Icon = ch.icon

          return (
            <motion.div
              key={ch.key}
              className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.06, ease: EASE_PREMIUM, duration: 0.45 }}
            >
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${ch.color}80, transparent)` }} />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} style={{ color: ch.color }} />
                  <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-wider">{ch.label}</p>
                  <span className="text-[9px] font-mono text-[--color-text-muted]">
                    {ch.key === 'rainfall' ? '72 hrs' : ch.key === 'seismic' ? '24 hrs' : '48 hrs'}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[--color-text-muted] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    SIMULATED
                  </span>
                </div>
                {val && (
                  <motion.span
                    key={val}
                    initial={{ opacity: 0.5, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    className="text-sm font-mono font-bold tabular-nums"
                    style={{ color: valColor }}
                  >
                    {val} {ch.unit}
                  </motion.span>
                )}
              </div>
              <ChartComponent data={data} isLoading={loading} />
            </motion.div>
          )
        })}
      </div>

      {/* ── Station grid ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: EASE_PREMIUM, duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio size={14} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-wider">
              Monitoring Stations
            </p>
          </div>
          <span className="text-[9px] font-mono text-[--color-text-muted]">
            {STATIONS.filter((s) => s.active).length}/{STATIONS.length} ONLINE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STATIONS.map((st, idx) => (
            <motion.div
              key={st.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + idx * 0.04, ease: EASE_PREMIUM, duration: 0.35 }}
              className="relative rounded-lg p-3.5 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: st.active ? 'rgba(34,197,94,0.04)' : 'var(--color-surface-raised)',
                borderColor: st.active ? 'rgba(34,197,94,0.18)' : 'var(--color-border)',
              }}
            >
              {st.active && (
                <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-mono text-[--color-text-muted] tracking-widest">{st.id}</span>
                <div className="flex items-center gap-1">
                  {/* Signal strength bars */}
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className="rounded-sm"
                      style={{
                        width: 2,
                        height: 3 + bar * 2,
                        background: st.active
                          ? bar <= 3 ? '#22c55e' : 'rgba(34,197,94,0.3)'
                          : 'rgba(100,116,139,0.2)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs font-mono font-bold text-[--color-text-primary] mb-0.5">{st.name}</p>
              <p className="text-[9px] font-mono text-[--color-text-muted]">{st.lat}</p>

              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: st.active ? '#22c55e' : '#64748b',
                    boxShadow: st.active ? '0 0 4px #22c55e' : 'none',
                  }}
                />
                <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: st.active ? '#22c55e' : '#64748b' }}>
                  {st.active ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
