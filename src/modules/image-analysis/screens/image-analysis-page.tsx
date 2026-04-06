import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DisasterEventDto } from '@/core/types/disaster.types'
import { SummaryDto } from '@/core/types/assessment.types'
import { fetchAllDisasters } from '@/shared/api/disaster.api'
import { fetchSummary } from '@/shared/api/assessment.api'
import { BeforeAfterSlider } from '../components/before-after-slider'
import { Skeleton } from '@/shared/ui/loading-skeleton'

// ── Constants ─────────────────────────────────────────────────────────────────

const DAMAGE_LEVELS = [
  { level: 'UNDAMAGED', label: 'No Damage',    color: '#22c55e' },
  { level: 'MINOR',     label: 'Minor',         color: '#eab308' },
  { level: 'MAJOR',     label: 'Major',         color: '#f97316' },
  { level: 'DESTROYED', label: 'Destroyed',     color: '#ef4444' },
] as const

/* Methodology stages — static representation of the research pipeline, not live processing */
const PIPELINE_STEPS = [
  { step: '01', label: 'ACQUIRE',   status: 'DONE', color: '#22c55e' },
  { step: '02', label: 'PREPROCESS', status: 'DONE', color: '#22c55e' },
  { step: '03', label: 'CLASSIFY',  status: 'DONE', color: '#22c55e' },
  { step: '04', label: 'EVALUATE',  status: 'DONE', color: '#22c55e' },
  { step: '05', label: 'REPORT',    status: 'DONE', color: '#22c55e' },
] as const

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

// Semicircle arch SVG path: center (50,58), radius 42 — upper arch
const ARCH_PATH    = 'M 8 58 A 42 42 0 0 0 92 58'
const ARCH_STROKE  = 6.5

function dataSourceLabel(disasterType: string | undefined): string {
  if (disasterType === 'LANDSLIDE')  return 'Optical'
  if (disasterType === 'EARTHQUAKE') return 'SAR / InSAR'
  return 'SAR'
}

// ── Sub-components removed: TargetingReticle (decorative) ─────────────────────

// ── Page ──────────────────────────────────────────────────────────────────────

export function ImageAnalysisPage() {
  const [disasters,   setDisasters]   = useState<ReadonlyArray<DisasterEventDto>>([])
  const [selectedId,  setSelectedId]  = useState<number | null>(null)
  const [summary,     setSummary]     = useState<SummaryDto | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadData,    setLoadData]    = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [initError,   setInitError]   = useState<string | null>(null)
  const [dataError,   setDataError]   = useState<string | null>(null)
  const [pollStale,   setPollStale]   = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const d = await fetchAllDisasters()
        setDisasters(d)
        if (d.length > 0) setSelectedId(d[0].id)
        setInitError(null)
      } catch {
        setInitError('Failed to connect to the API. Ensure the backend is running on port 8080.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    let cancelled = false

    const loadSummary = async (isInitial: boolean): Promise<void> => {
      if (isInitial) {
        setSummary(null)
        setLoadData(true)
        setDataError(null)
      }
      try {
        const result = await fetchSummary(selectedId)
        if (cancelled) return
        setSummary(result)
        setLastUpdated(new Date())
        setPollStale(false)
        if (isInitial) setDataError(null)
      } catch {
        if (cancelled) return
        if (isInitial) {
          setDataError('Failed to load analysis data for this event.')
        } else {
          setPollStale(true)
        }
      } finally {
        if (!cancelled && isInitial) setLoadData(false)
      }
    }

    void loadSummary(true)
    const interval = setInterval(() => void loadSummary(false), 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [selectedId])

  const selected   = disasters.find((d) => d.id === selectedId)
  const total      = summary?.totalAssessments ?? 0
  const confidence = summary?.avgAiConfidence ?? 0

  const breakdown = summary
    ? [
        { level: 'UNDAMAGED', count: summary.undamagedCount, pct: total > 0 ? (summary.undamagedCount / total) * 100 : 0 },
        { level: 'MINOR',     count: summary.minorCount,     pct: total > 0 ? (summary.minorCount     / total) * 100 : 0 },
        { level: 'MAJOR',     count: summary.majorCount,     pct: total > 0 ? (summary.majorCount     / total) * 100 : 0 },
        { level: 'DESTROYED', count: summary.destroyedCount, pct: total > 0 ? (summary.destroyedCount / total) * 100 : 0 },
      ]
    : []

  const sourceLabel = dataSourceLabel(selected?.disasterType)

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── COMMAND BAR ───────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-stretch border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* System identifier */}
        <div
          className="flex items-center gap-2.5 px-5 shrink-0 border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="relative w-2 h-2 shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(0,212,255,0.30)', animation: 'ripple-expand 2.5s ease-out infinite' }}
            />
            <div
              className="relative w-2 h-2 rounded-full"
              style={{ background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,1)' }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-[--color-accent] uppercase tracking-[0.22em] whitespace-nowrap py-2.5">
            ORBITAL · IMAGE ANALYSIS
          </span>
        </div>

        {/* Disaster tabs — scrollable */}
        <div className="flex items-center gap-1.5 px-4 py-2 flex-1 overflow-x-auto min-w-0">
          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-28 shrink-0" />)
            : disasters.map((d, i) => (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.88, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, ease: EASE_PREMIUM, duration: 0.32 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedId(d.id)}
                  className="relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-colors"
                  style={{
                    background:  d.id === selectedId ? d.severityColor       : `${d.severityColor}12`,
                    borderColor: d.id === selectedId ? d.severityColor       : `${d.severityColor}40`,
                    color:       d.id === selectedId ? '#060c18'             : d.severityColor,
                    fontWeight:  d.id === selectedId ? 700                   : 400,
                  }}
                >
                  {d.id === selectedId && (
                    <motion.div
                      layoutId="orbit-tab-fill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: d.severityColor, zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10 text-base leading-none">{d.typeIcon}</span>
                  <span className="relative z-10">{d.name.split(' ').slice(0, 2).join(' ')}</span>
                </motion.button>
              ))}
        </div>

        {/* Telemetry pills + live timestamp */}
        {selected && (
          <div
            className="flex items-center gap-1.5 px-4 py-2 border-l shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {[sourceLabel, 'Prototype', 'Silang, Cavite'].map((pill) => (
              <span
                key={pill}
                className="text-[9px] font-mono px-2 py-0.5 rounded tabular-nums"
                style={{
                  color:      'var(--color-accent)',
                  background: 'rgba(0,212,255,0.07)',
                  border:     '1px solid rgba(0,212,255,0.18)',
                }}
              >
                {pill}
              </span>
            ))}
            {lastUpdated && (
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded tabular-nums"
                style={{
                  color:      pollStale ? 'rgba(245,158,11,0.80)' : 'rgba(34,197,94,0.80)',
                  background: pollStale ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)',
                  border:     pollStale ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(34,197,94,0.22)',
                }}
              >
                {pollStale ? '⚠ Stale' : '●'} Updated {Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago
              </span>
            )}
            {dataError && (
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}
              >
                ● Error
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Init error state ── */}
      {initError && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="max-w-md text-center rounded-xl p-8 space-y-4"
            style={{ background: 'var(--color-surface-raised)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.10)' }}>
              <span className="text-xl">⚠</span>
            </div>
            <p className="text-sm text-[--color-text-primary] font-medium">Connection Error</p>
            <p className="text-xs text-[--color-text-muted] leading-relaxed">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-xs font-mono font-medium"
              style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)', border: '1px solid rgba(0,212,255,0.25)' }}
            >
              RETRY
            </button>
          </div>
        </div>
      )}

      {/* ── IMAGERY (flex-1) ──────────────────────────────────────────────── */}
      {!initError && <><div className="flex-1 min-h-0 relative overflow-hidden">

        {/* Slider fills the entire imagery area */}
        {selected
          ? (
            <BeforeAfterSlider
              disasterName={selected.name}
              disasterType={selected.disasterType}
              beforeImageUrl={selected.beforeImageUrl}
              afterImageUrl={selected.afterImageUrl}
            />
          )
          : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ background: 'var(--color-bg)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.18)' }}
              >
                <span className="text-3xl">🛰️</span>
              </div>
              <p className="text-sm font-mono text-[--color-text-muted]">Select a disaster event to load imagery</p>
            </div>
          )}

        {/* HUD: event badge — centered top */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0,   filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ ease: EASE_PREMIUM, duration: 0.36 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{
                background:           `${selected.severityColor}10`,
                backdropFilter:       'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border:               `1px solid ${selected.severityColor}35`,
                color:                selected.severityColor,
              }}
            >
              <div className="relative w-2.5 h-2.5 flex items-center justify-center shrink-0">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `${selected.severityColor}45`, animation: 'ripple-expand 2.5s ease-out infinite' }}
                />
                <div className="relative w-1.5 h-1.5 rounded-full z-10" style={{ background: selected.severityColor }} />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap">{selected.severity}</span>
              <span className="text-xs opacity-35">·</span>
              <span className="text-xs font-medium text-[--color-text-primary] whitespace-nowrap">{selected.name}</span>
              <span className="text-xs opacity-35">·</span>
              <span className="text-xs text-[--color-text-secondary] whitespace-nowrap">
                {new Date(selected.eventDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-base ml-1">{selected.typeIcon}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── DATA HORIZON LINE ─────────────────────────────────────────────── */}
      <div
        className="shrink-0 h-px relative overflow-visible z-10 flex items-center justify-center"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.35) 30%, rgba(0,212,255,0.35) 70%, transparent)' }}
      >
        <span
          className="absolute text-[7.5px] font-mono font-bold tracking-[0.32em] uppercase whitespace-nowrap px-3 py-0.5 rounded-full"
          style={{
            background: 'var(--color-surface)',
            border:     '1px solid rgba(0,212,255,0.22)',
            color:      'rgba(0,212,255,0.65)',
          }}
        >
          ANALYSIS OUTPUT
        </span>
      </div>

      {/* ── BOTTOM DATA STRIP ─────────────────────────────────────────────── */}
      <div
        className="shrink-0 grid grid-cols-1 lg:grid-cols-[176px_1fr_272px] border-t overflow-y-auto lg:overflow-y-hidden"
        style={{
          minHeight: 156,
          maxHeight: 320,
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >

        {/* ▌ Panel 1: AI Confidence Arc Gauge ▐ */}
        <div
          className="flex flex-col items-center justify-center gap-1 border-r relative overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.45), transparent)' }}
          />
          <p className="text-[7.5px] font-mono font-bold text-[--color-text-muted] uppercase tracking-[0.24em] mb-0.5">
            AI CONFIDENCE
          </p>

          {/* SVG arc gauge */}
          <div className="relative">
            <svg width="110" height="62" viewBox="0 0 100 62" role="img" aria-label={`AI confidence: ${Math.round(confidence * 100)}%`}>
              {/* Track arc */}
              <path
                d={ARCH_PATH}
                fill="none"
                stroke="rgba(0,212,255,0.10)"
                strokeWidth={ARCH_STROKE}
                strokeLinecap="round"
              />
              {/* Active arc */}
              <motion.path
                d={ARCH_PATH}
                fill="none"
                stroke="#00d4ff"
                strokeWidth={ARCH_STROKE}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.75))' }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: loadData ? 0 : confidence }}
                transition={{ duration: 1.4, ease: EASE_PREMIUM, delay: 0.25 }}
              />
              {/* Percentage label */}
              <text
                x="50" y="53"
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                fontFamily="monospace"
                fill="#e8f4ff"
              >
                {loadData ? '…' : `${Math.round(confidence * 100)}%`}
              </text>
            </svg>
          </div>

          <p className="text-[8.5px] font-mono text-[--color-text-muted]">U-Net · xBD Dataset</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[7.5px] font-mono text-[--color-text-muted] tracking-widest">PROTOTYPE MODEL</span>
          </div>
        </div>

        {/* ▌ Panel 2: Damage Spectrum ▐ */}
        <div
          className="flex flex-col justify-center gap-2 px-5 py-3 border-r relative overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.40), transparent)' }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[7.5px] font-mono font-bold text-[--color-text-muted] uppercase tracking-[0.24em]">
              DAMAGE SPECTRUM
            </p>
            {summary && (
              <span className="text-[7.5px] font-mono text-[--color-text-muted]">
                {summary.totalAssessments} barangays
              </span>
            )}
          </div>

          {/* 2×2 chip grid */}
          {loadData
            ? (
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
              </div>
            )
            : breakdown.length > 0
            ? (
              <div className="grid grid-cols-2 gap-1.5">
                {breakdown.map((b, idx) => {
                  const info = DAMAGE_LEVELS.find((d) => d.level === b.level)!
                  return (
                    <motion.div
                      key={b.level}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 + idx * 0.07, ease: EASE_PREMIUM, duration: 0.32 }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: `${info.color}0d`,
                        border:     `1px solid ${info.color}30`,
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: info.color, boxShadow: `0 0 4px ${info.color}` }}
                      />
                      <span
                        className="text-[10px] font-mono font-bold tabular-nums"
                        style={{ color: info.color }}
                      >
                        {b.count}
                      </span>
                      <span className="text-[8.5px] font-mono text-[--color-text-muted] flex-1 truncate">
                        {info.label}
                      </span>
                      <span
                        className="text-[8px] font-mono tabular-nums ml-auto"
                        style={{ color: `${info.color}99` }}
                      >
                        {b.pct.toFixed(0)}%
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )
            : (
              <div className="grid grid-cols-2 gap-1.5">
                {DAMAGE_LEVELS.map(({ level, label, color }) => (
                  <div
                    key={level}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: `${color}07`, border: `1px solid ${color}20` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: color }} />
                    <span className="text-[8.5px] font-mono text-[--color-text-muted] opacity-40">{label}</span>
                  </div>
                ))}
              </div>
            )}

          {/* Segmented spectrum bar */}
          <div className="flex gap-px h-1.5 rounded-full overflow-hidden">
            {breakdown.length > 0
              ? breakdown.map((b, idx) => {
                  const info = DAMAGE_LEVELS.find((d) => d.level === b.level)!
                  return (
                    <motion.div
                      key={b.level}
                      className="h-full"
                      style={{
                        background: info.color,
                        boxShadow:  `0 0 4px ${info.color}55`,
                      }}
                      initial={{ flex: 0 }}
                      animate={{ flex: b.pct }}
                      transition={{ duration: 1.1, ease: EASE_PREMIUM, delay: 0.28 + idx * 0.09 }}
                    />
                  )
                })
              : <div className="flex-1 rounded-full" style={{ background: 'var(--color-surface-overlay)' }} />}
          </div>
        </div>

        {/* ▌ Panel 3: Analysis Pipeline ▐ */}
        <div className="flex flex-col justify-center px-5 py-3 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.40), transparent)' }}
          />
          <p className="text-[7.5px] font-mono font-bold text-[--color-text-muted] uppercase tracking-[0.24em] mb-4">
            METHODOLOGY PIPELINE
          </p>

          {/* Horizontal stepper */}
          <div className="relative flex items-start">
            {/* Connecting wire */}
            <div
              className="absolute top-[10px] left-[11px] right-[11px] h-px"
              style={{
                background: 'linear-gradient(90deg, rgba(34,197,94,0.55) 0%, rgba(34,197,94,0.55) 60%, rgba(0,212,255,0.55) 75%, rgba(255,255,255,0.06) 100%)',
              }}
            />

            {PIPELINE_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  className="flex-1 flex flex-col items-center gap-1.5 relative z-10"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.09, ease: EASE_PREMIUM, duration: 0.32 }}
                >
                  <div
                    className="flex items-center justify-center rounded-full text-[8px] font-mono font-bold"
                    style={{
                      width: '22px', height: '22px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1.5px solid rgba(34,197,94,0.55)',
                      color: '#22c55e',
                    }}
                  >
                    ✓
                  </div>
                  <span
                    className="text-[7px] font-mono text-center leading-tight tracking-wider"
                    style={{ color: 'rgba(34,197,94,0.80)' }}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
          </div>

          {/* Pipeline status */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }}
            />
            <span className="text-[8.5px] font-mono" style={{ color: 'rgba(34,197,94,0.80)' }}>
              ALL STAGES COMPLETE
            </span>
          </div>
        </div>
      </div></>}
    </div>
  )
}
