import { motion } from 'framer-motion'
import { SummaryDto } from '@/core/types/assessment.types'
import { StatCounter } from '@/shared/ui/stat-counter'
import { Skeleton } from '@/shared/ui/loading-skeleton'

interface KpiCardStripProps {
  readonly summary: SummaryDto | null
  readonly isLoading: boolean
}

export function KpiCardStrip({ summary, isLoading }: KpiCardStripProps) {
  const cards = summary
    ? [
        {
          label: 'Barangays Affected',
          value: summary.affectedBarangays,
          unit: `/ ${summary.totalAssessments}`,
          color: 'var(--color-accent)',
          hexColor: '#00c8f0',
        },
        {
          label: 'Structures Assessed',
          value: summary.totalStructuresAssessed,
          unit: '',
          color: '#a78bfa',
          hexColor: '#a78bfa',
        },
        {
          label: 'Avg Damage',
          value: Math.round(summary.avgDamagePercent),
          unit: '%',
          color: summary.avgDamagePercent > 60
            ? 'var(--color-destroyed)'
            : summary.avgDamagePercent > 30
              ? 'var(--color-major)'
              : 'var(--color-minor)',
          hexColor: summary.avgDamagePercent > 60 ? '#ef4444' : summary.avgDamagePercent > 30 ? '#f97316' : '#eab308',
        },
        {
          label: 'AI Confidence',
          value: Math.round(summary.avgAiConfidence * 100),
          unit: '%',
          color: 'var(--color-undamaged)',
          hexColor: '#22c55e',
        },
      ]
    : []

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        <p className="text-xs text-[--color-text-muted] font-medium">Overview</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
            >
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-[--color-text-muted] font-medium">Overview</p>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl p-4 group cursor-default transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${card.hexColor}30`
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${card.hexColor}12`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = ''
              ;(e.currentTarget as HTMLElement).style.boxShadow = ''
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-4 right-4 h-px rounded-full opacity-60"
              style={{ background: card.hexColor }}
            />

            <StatCounter
              value={card.value}
              label={card.label}
              unit={card.unit}
              color={card.color}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
