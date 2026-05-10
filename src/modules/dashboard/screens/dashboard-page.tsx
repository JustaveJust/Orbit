import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DisasterEventDto } from '@/core/types/disaster.types'
import { DamageAssessmentDto, SummaryDto } from '@/core/types/assessment.types'
import { BarangayDto } from '@/core/types/barangay.types'
import { fetchAllDisasters } from '@/shared/api/disaster.api'
import { fetchAllBarangays } from '@/shared/api/barangay.api'
import { fetchAssessments, fetchSummary } from '@/shared/api/assessment.api'
import { DisasterSelector } from '../components/disaster-selector'
import { KpiCardStrip } from '../components/kpi-card-strip'
import { LiveSignalPanel } from '../components/live-signal-panel'
import { SilangMap } from '../components/silang-map'

/* Dashboard collapses 4-tier damage into 3 (Major absorbs Destroyed) for the layperson view */
const DAMAGE_LEVELS = [
  { color: '#22c55e', label: 'Undamaged' },
  { color: '#eab308', label: 'Minor'     },
  { color: '#f97316', label: 'Major'     },
]

/* Status items derived from actual state — not hardcoded fiction */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

function SectionDivider({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div
        className="w-1 h-1 rounded-full shrink-0"
        style={{ background: 'var(--color-accent)', boxShadow: '0 0 4px rgba(0,212,255,0.8)' }}
      />
      <span className="text-[9px] font-mono font-bold text-[--color-text-muted] uppercase tracking-[0.18em] whitespace-nowrap">
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.25), transparent)' }}
      />
    </div>
  )
}

export function DashboardPage() {
  const [disasters,   setDisasters]   = useState<ReadonlyArray<DisasterEventDto>>([])
  const [barangays,   setBarangays]   = useState<ReadonlyArray<BarangayDto>>([])
  const [assessments, setAssessments] = useState<ReadonlyArray<DamageAssessmentDto>>([])
  const [summary,     setSummary]     = useState<SummaryDto | null>(null)
  const [selectedId,  setSelectedId]  = useState<number | null>(null)
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [lastDataSync, setLastDataSync] = useState<Date | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const [d, b] = await Promise.all([fetchAllDisasters(), fetchAllBarangays()])
        setDisasters(d)
        setBarangays(b)
        if (d.length > 0) setSelectedId(d[0].id)
        setInitError(null)
      } catch {
        setInitError('Failed to connect to the API. Ensure the backend is running on port 8080.')
      } finally {
        setLoadingInit(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    setLoadingData(true)
    setDataError(null)
    void (async () => {
      try {
        const [a, s] = await Promise.all([fetchAssessments(selectedId), fetchSummary(selectedId)])
        setAssessments(a)
        setSummary(s)
        setLastDataSync(new Date())
      } catch {
        setDataError('Failed to load assessment data for this event.')
      } finally {
        setLoadingData(false)
      }
    })()
  }, [selectedId])

  const selectedDisaster = disasters.find((d) => d.id === selectedId)

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Event selector strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_PREMIUM }}
        className="flex-shrink-0 border-b border-[--color-border] px-5 py-3"
        style={{ background: 'var(--color-surface)' }}
      >
        <DisasterSelector
          disasters={disasters}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isLoading={loadingInit}
        />
      </motion.div>

      {/* ── Empty state: no disasters ── */}
      {!loadingInit && !initError && disasters.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="max-w-sm text-center rounded-xl p-8 space-y-3"
            style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm text-[--color-text-primary] font-medium">No Disaster Events</p>
            <p className="text-xs text-[--color-text-muted] leading-relaxed">
              No disaster events found in the database. The backend may need to be reseeded.
            </p>
          </div>
        </div>
      )}

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

      {/* ── Body: map + right panel ── */}
      {!initError && <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Map zone */}
        <div className="flex-1 relative min-w-0 overflow-hidden">
          <div className="absolute inset-0">
            <SilangMap
              barangays={barangays}
              assessments={assessments}
              isLoading={loadingInit || loadingData}
            />
          </div>

          {/* Legend — floats bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: EASE_PREMIUM }}
            className="absolute bottom-4 left-4 z-[500] flex items-center gap-3 px-3.5 py-2 rounded-lg"
            style={{
              background:           'rgba(12, 15, 26, 0.85)',
              backdropFilter:       'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border:               '1px solid var(--color-border)',
            }}
          >
            {DAMAGE_LEVELS.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px] text-[--color-text-muted]">{d.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#4a5568]" />
              <span className="text-[10px] text-[--color-text-muted]">No data</span>
            </div>
          </motion.div>
        </div>

        {/* ── Right panel ── */}
        <div
          className="w-72 xl:w-80 flex-shrink-0 border-l border-[--color-border] overflow-y-auto flex flex-col gap-4 p-4"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Event alert card — top of right panel */}
          <AnimatePresence mode="wait" initial={false}>
            {selectedDisaster && (
              <motion.div
                key={selectedDisaster.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ ease: EASE_PREMIUM, duration: 0.32 }}
                className="rounded-xl p-3.5 space-y-2 relative overflow-hidden shrink-0"
                style={{
                  background: `${selectedDisaster.severityColor}10`,
                  border:     `1px solid ${selectedDisaster.severityColor}30`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${selectedDisaster.severityColor}90, transparent)` }}
                />

                {/* Severity row + icon */}
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `${selectedDisaster.severityColor}50`,
                        animation: 'ripple-expand 2.5s ease-out infinite',
                      }}
                    />
                    <div
                      className="relative w-1.5 h-1.5 rounded-full z-10"
                      style={{ background: selectedDisaster.severityColor }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                    style={{ color: selectedDisaster.severityColor }}
                  >
                    {selectedDisaster.severity}
                  </span>
                  <span className="ml-auto text-xl leading-none">{selectedDisaster.typeIcon}</span>
                </div>

                {/* Disaster name */}
                <p className="text-sm font-display font-semibold text-[--color-text-primary] leading-tight">
                  {selectedDisaster.name}
                </p>

                {/* Date */}
                <p className="text-[10px] font-mono text-[--color-text-muted]">
                  {new Date(selectedDisaster.eventDate).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SITREP panel header */}
          <div
            className="flex items-center justify-between py-1 border-b relative"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-accent)', boxShadow: '0 0 6px rgba(0,212,255,0.9)' }}
              />
              <span className="text-[9px] font-mono font-bold text-[--color-accent] uppercase tracking-[0.22em]">SITREP</span>
            </div>
            <span className="text-[9px] font-mono text-[--color-text-muted]">
              {selectedDisaster
                ? new Date(selectedDisaster.eventDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Silang, Cavite'}
            </span>
          </div>

          {/* Data error banner */}
          {dataError && (
            <div
              className="rounded-lg px-3 py-2 text-[11px] font-mono"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#ef4444' }}
            >
              {dataError}
            </div>
          )}

          {/* KPI cards — section 1 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, ease: EASE_PREMIUM, duration: 0.42 }}
          >
            <KpiCardStrip summary={summary} isLoading={loadingData} />
          </motion.div>

          {/* Damage breakdown — section 2 */}
          <AnimatePresence>
            {summary && (
              <motion.div
                key="damage-breakdown"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, ease: EASE_PREMIUM, duration: 0.42 }}
                className="space-y-2.5"
              >
                <SectionDivider label="Damage Breakdown" />
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
                >
                  {[
                    { label: 'Undamaged', value: summary.undamagedCount,                          color: '#22c55e' },
                    { label: 'Minor',     value: summary.minorCount,                              color: '#eab308' },
                    { label: 'Major',     value: summary.majorCount + summary.destroyedCount,     color: '#f97316' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + idx * 0.07, ease: EASE_PREMIUM, duration: 0.32 }}
                      className="space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-xs text-[--color-text-secondary]">{item.label}</span>
                        </div>
                        <span className="text-xs font-medium tabular-nums" style={{ color: item.color }}>
                          {item.value}
                          <span className="text-[--color-text-muted] font-normal">/ {summary.totalAssessments}</span>
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-overlay)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: item.color,
                            boxShadow: `0 0 4px ${item.color}70`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: summary.totalAssessments > 0 ? `${(item.value / summary.totalAssessments) * 100}%` : '0%' }}
                          transition={{ duration: 0.9, ease: EASE_PREMIUM, delay: 0.3 + idx * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live signals — section 3 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, ease: EASE_PREMIUM, duration: 0.42 }}
          >
            <LiveSignalPanel disasterId={selectedId} />
          </motion.div>

          {/* System status — section 4 (honest indicators from actual state) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, ease: EASE_PREMIUM, duration: 0.42 }}
            className="space-y-2"
          >
            <SectionDivider label="System Status" />
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'API',
                  status: initError ? 'Offline' : 'Connected',
                  dot: initError ? '#ef4444' : '#22c55e',
                },
                {
                  label: 'Data',
                  status: dataError ? 'Error' : summary ? 'Loaded' : 'Pending',
                  dot: dataError ? '#ef4444' : summary ? '#22c55e' : '#f59e0b',
                },
                {
                  label: 'Events',
                  status: disasters.length > 0 ? `${disasters.length} loaded` : 'None',
                  dot: disasters.length > 0 ? '#22c55e' : '#f59e0b',
                },
                {
                  label: 'Last Sync',
                  status: lastDataSync
                    ? lastDataSync.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'N/A',
                  dot: lastDataSync ? '#00c8f0' : '#4b5670',
                },
              ].map((s, idx) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.48 + idx * 0.06, ease: EASE_PREMIUM, duration: 0.28 }}
                  className="relative flex flex-col gap-1.5 rounded-lg p-2.5 overflow-hidden"
                  style={{
                    background:  `${s.dot}08`,
                    border:      `1px solid ${s.dot}25`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${s.dot}50, transparent)` }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-[--color-text-muted] leading-none">{s.label}</span>
                    <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: `${s.dot}35`, animation: 'ripple-expand 2.5s ease-out infinite' }}
                      />
                      <div
                        className="relative w-1.5 h-1.5 rounded-full z-10"
                        style={{ background: s.dot, boxShadow: `0 0 4px ${s.dot}` }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold tracking-wider"
                    style={{ color: s.dot }}
                  >
                    {s.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Location — section 5 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.54, ease: EASE_PREMIUM, duration: 0.42 }}
            className="rounded-xl p-3.5 space-y-1 relative shrink-0"
            style={{
              background: 'var(--color-accent-subtle)',
              border:     '1px solid var(--color-accent-dim)',
            }}
          >
            {/* Subtle shine */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }}
            />
            <p className="text-xs font-display font-medium" style={{ color: 'var(--color-accent)' }}>
              Silang, Cavite
            </p>
            <p className="text-[10px] text-[--color-text-muted]">14.2183°N · 120.9729°E</p>
            <p className="text-[10px] text-[--color-text-muted]">209.43 km² · {barangays.length} barangays</p>
          </motion.div>
        </div>
      </div>}
    </div>
  )
}
