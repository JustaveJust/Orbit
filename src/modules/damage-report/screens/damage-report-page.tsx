import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DisasterEventDto } from '@/core/types/disaster.types'
import { DamageAssessmentDto, SummaryDto } from '@/core/types/assessment.types'
import { fetchAllDisasters } from '@/shared/api/disaster.api'
import { fetchAssessments, fetchSummary } from '@/shared/api/assessment.api'
import { SeverityPieChart } from '../components/severity-pie-chart'
import { BarangayTable } from '../components/barangay-table'
import { Skeleton } from '@/shared/ui/loading-skeleton'
import { StatCounter } from '@/shared/ui/stat-counter'
import { FileBarChart2, Building2, Users, AlertTriangle, Skull } from 'lucide-react'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export function DamageReportPage(): JSX.Element {
  const [disasters,   setDisasters]   = useState<ReadonlyArray<DisasterEventDto>>([])
  const [selectedId,  setSelectedId]  = useState<number | null>(null)
  const [assessments, setAssessments] = useState<ReadonlyArray<DamageAssessmentDto>>([])
  const [summary,     setSummary]     = useState<SummaryDto | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const d = await fetchAllDisasters()
        setDisasters(d)
        if (d.length > 0) setSelectedId(d[0].id)
      } catch {
        setError('Failed to connect to the API. Ensure the backend is running.')
      }
    })()
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const [a, s] = await Promise.all([fetchAssessments(selectedId), fetchSummary(selectedId)])
        if (cancelled) return
        setAssessments(a)
        setSummary(s)
      } catch {
        if (!cancelled) setError('Failed to load assessment data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [selectedId])

  const selected = disasters.find((d) => d.id === selectedId)

  const KPI_ITEMS = summary ? [
    { value: summary.totalStructuresAssessed, label: 'Structures Assessed', unit: '',  color: '#00d4ff', icon: Building2 },
    { value: summary.totalPopulationAffected, label: 'Population Affected', unit: '',  color: '#7c3aed', icon: Users },
    { value: Math.round(summary.avgDamagePercent), label: 'Avg Damage',     unit: '%', color: '#f97316', icon: AlertTriangle },
    { value: summary.destroyedCount,           label: 'Destroyed',          unit: '',  color: '#ef4444', icon: Skull },
  ] : []

  return (
    <div className="p-5 lg:p-6 space-y-5 overflow-y-auto h-full">

      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_PREMIUM }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.20)' }}
          >
            <FileBarChart2 size={18} style={{ color: '#f97316' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[--color-text-primary] tracking-tight">Damage Report</h1>
            <p className="text-xs text-[--color-text-muted] font-mono mt-0.5">
              {assessments.length > 0 ? `${assessments.length} barangays assessed` : 'Loading…'} · Silang, Cavite
            </p>
          </div>
        </div>

        {/* Event selector */}
        <div className="flex gap-1.5 flex-wrap">
          {disasters.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.05, ease: EASE_PREMIUM }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedId(d.id)}
              className="relative flex flex-col items-start px-3 py-2 rounded-lg text-[11px] font-mono border transition-colors"
              style={{
                background:  d.id === selectedId ? d.severityColor : `${d.severityColor}12`,
                borderColor: d.id === selectedId ? d.severityColor : `${d.severityColor}35`,
                color:       d.id === selectedId ? '#0a0e1a' : d.severityColor,
              }}
            >
              {d.id === selectedId && (
                <motion.div
                  layoutId="report-tab-fill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: d.severityColor, zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10 font-bold">{d.typeIcon} {d.name.split(' ').slice(0, 2).join(' ')}</span>
              <span className="relative z-10 text-[9px]" style={{ color: d.id === selectedId ? '#0a0e1a' : `${d.severityColor}80` }}>
                {new Date(d.eventDate).getFullYear()}
              </span>
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
          <button onClick={() => window.location.reload()} className="px-3 py-1 rounded-md text-[10px] font-bold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)' }}>RETRY</button>
        </div>
      )}

      {/* ── Selected disaster context ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-mono"
            style={{ background: `${selected.severityColor}0c`, borderColor: `${selected.severityColor}30`, color: selected.severityColor }}
          >
            <div className="relative w-2.5 h-2.5 shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: `${selected.severityColor}40`, animation: 'ripple-expand 2.5s ease-out infinite' }} />
              <div className="relative w-2.5 h-2.5 rounded-full" style={{ background: selected.severityColor }} />
            </div>
            <span className="font-bold uppercase tracking-wider">{selected.name}</span>
            <span className="text-[--color-text-muted]">·</span>
            <span className="text-[--color-text-secondary] hidden sm:inline">{selected.description}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI row ───────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl p-5 space-y-2" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPI_ITEMS.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + idx * 0.06, ease: EASE_PREMIUM, duration: 0.4 }}
                className="relative rounded-xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'var(--color-surface-raised)', border: `1px solid ${kpi.color}20` }}
              >
                <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)` }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${kpi.color}06 0%, transparent 60%)` }} />

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}12`, border: `1px solid ${kpi.color}25` }}>
                    <Icon size={14} style={{ color: kpi.color }} />
                  </div>
                  <span className="text-[9px] font-mono text-[--color-text-muted] uppercase tracking-wider">{kpi.label}</span>
                </div>
                <StatCounter value={kpi.value} label="" unit={kpi.unit} color={kpi.color} />
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Charts + Table grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Pie chart */}
        <motion.div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, ease: EASE_PREMIUM, duration: 0.45 }}
        >
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)' }} />

          <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-wider mb-3">
            Damage Distribution
          </p>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-[--color-accent] border-t-transparent animate-spin" />
            </div>
          ) : summary ? (
            <SeverityPieChart summary={summary} />
          ) : null}

          {summary && (
            <div className="space-y-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              {[
                { label: 'Total Structures', value: summary.totalStructuresAssessed.toLocaleString(), color: '#00d4ff' },
                { label: 'Total Affected',   value: summary.totalStructuresAffected.toLocaleString(), color: '#f97316' },
                { label: 'Avg AI Confidence', value: `${(summary.avgAiConfidence * 100).toFixed(1)}%`, color: '#22c55e' },
              ].map((s, idx) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06, ease: EASE_PREMIUM, duration: 0.25 }}
                  className="flex justify-between items-center text-[11px] font-mono"
                >
                  <span className="text-[--color-text-muted]">{s.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          className="xl:col-span-2 rounded-xl p-5 relative overflow-hidden"
          style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, ease: EASE_PREMIUM, duration: 0.45 }}
        >
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />

          <p className="text-xs font-bold font-mono text-[--color-text-primary] uppercase tracking-wider mb-3">
            Barangay Assessment Table — {assessments.length} Barangays
          </p>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <BarangayTable assessments={assessments} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
