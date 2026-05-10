import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DamageLevel } from '@/core/types/assessment.types'
import { DamageAssessmentDto } from '@/core/types/assessment.types'
import { damageLevelToColor } from '@/shared/utils/damage-colors'

/* Display layer collapses DESTROYED into MAJOR — type/data still 4-tier */
const displayLevel = (lvl: DamageLevel): DamageLevel => (lvl === 'DESTROYED' ? 'MAJOR' : lvl)

interface BarangayTableProps {
  readonly assessments: ReadonlyArray<DamageAssessmentDto>
}

type SortKey = 'name' | 'damageLevel' | 'damagePercent' | 'populationAffected' | 'aiConfidence'
type SortDir = 'asc' | 'desc'

const DAMAGE_ORDER: Record<string, number> = {
  DESTROYED: 4, MAJOR: 3, MINOR: 2, UNDAMAGED: 1,
}

export function BarangayTable({ assessments }: BarangayTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('damageLevel')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter,  setFilter]  = useState<string>('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    const filtered = filter
      ? assessments.filter((a) =>
          a.barangayName.toLowerCase().includes(filter.toLowerCase()) ||
          displayLevel(a.damageLevel).toLowerCase().includes(filter.toLowerCase())
        )
      : assessments

    return [...filtered].sort((a, b) => {
      let diff = 0
      if (sortKey === 'name')               diff = a.barangayName.localeCompare(b.barangayName)
      if (sortKey === 'damageLevel')        diff = (DAMAGE_ORDER[a.damageLevel] ?? 0) - (DAMAGE_ORDER[b.damageLevel] ?? 0)
      if (sortKey === 'damagePercent')      diff = a.damagePercent - b.damagePercent
      if (sortKey === 'populationAffected') diff = a.populationAffected - b.populationAffected
      if (sortKey === 'aiConfidence')       diff = a.aiConfidence - b.aiConfidence
      return sortDir === 'asc' ? diff : -diff
    })
  }, [assessments, sortKey, sortDir, filter])

  const sortArrow = (key: SortKey) =>
    sortKey === key
      ? sortDir === 'asc'
        ? <span className="ml-1 text-[--color-accent]">↑</span>
        : <span className="ml-1 text-[--color-accent]">↓</span>
      : <span className="ml-1 opacity-20">↕</span>

  const cols: Array<{ key: SortKey; label: string }> = [
    { key: 'name',               label: 'Barangay' },
    { key: 'damageLevel',        label: 'Level' },
    { key: 'damagePercent',      label: 'Dmg %' },
    { key: 'populationAffected', label: 'Pop. Affected' },
    { key: 'aiConfidence',       label: 'AI Conf.' },
  ]

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search barangay or damage level…"
          className="w-full bg-[--color-surface-raised] border border-[--color-border] rounded-lg px-3 py-2 pl-8 text-xs font-mono text-[--color-text-secondary] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-accent] focus:shadow-[0_0_0_1px_var(--color-accent)] transition-all"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--color-text-muted] text-xs">🔍</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[--color-border] overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-[--color-surface-raised] border-b border-[--color-border]">
              {cols.map((c) => (
                <th
                  key={c.key}
                  className="text-left py-2 px-3 text-[--color-text-muted] uppercase tracking-widest text-[9px] cursor-pointer hover:text-[--color-accent] transition-colors select-none whitespace-nowrap"
                  onClick={() => handleSort(c.key)}
                >
                  <span className="inline-flex items-center">{c.label}{sortArrow(c.key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const shownLevel = displayLevel(a.damageLevel)
              const color = damageLevelToColor(shownLevel)
              const isHighSeverity = shownLevel === 'MAJOR'
              return (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                  className="border-b border-[--color-border]/30 transition-all duration-150 group"
                  style={{
                    background: isHighSeverity ? `${color}04` : undefined,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${color}10`
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${color}`
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isHighSeverity ? `${color}04` : ''
                    ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                  }}
                >
                  <td className="py-2 px-3 text-[--color-text-secondary] whitespace-nowrap font-medium">{a.barangayName}</td>
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest"
                      style={{
                        color,
                        background: `${color}18`,
                        border: `1px solid ${color}35`,
                        boxShadow: isHighSeverity ? `0 0 8px ${color}25` : undefined,
                      }}
                    >
                      {shownLevel}
                    </span>
                  </td>
                  <td className="py-2 px-3 tabular-nums" style={{ color }}>
                    <div className="flex items-center gap-2">
                      <span>{a.damagePercent.toFixed(1)}%</span>
                      <div className="w-12 h-1 bg-[--color-surface-raised] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${a.damagePercent}%`, background: color }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-[--color-text-muted] tabular-nums">
                    {a.populationAffected.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 tabular-nums">
                    <span style={{ color: a.aiConfidence >= 0.85 ? '#22c55e' : a.aiConfidence >= 0.70 ? '#eab308' : '#f97316' }}>
                      {(a.aiConfidence * 100).toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-center text-[--color-text-muted] font-mono text-xs py-10">
            No barangays match the filter.
          </p>
        )}
      </div>

      <p className="text-[10px] font-mono text-[--color-text-muted]">
        Showing <span className="text-[--color-accent]">{sorted.length}</span> of {assessments.length} barangays
        <span className="ml-2 opacity-50">· click headers to sort</span>
      </p>
    </div>
  )
}
