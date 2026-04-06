import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { SummaryDto } from '@/core/types/assessment.types'

interface SeverityPieChartProps {
  readonly summary: SummaryDto
}

const ENTRIES = [
  { key: 'undamagedCount', label: 'Undamaged', color: '#22c55e' },
  { key: 'minorCount',     label: 'Minor',     color: '#eab308' },
  { key: 'majorCount',     label: 'Major',     color: '#f97316' },
  { key: 'destroyedCount', label: 'Destroyed', color: '#ef4444' },
] as const

interface TooltipPayloadEntry {
  readonly name: string
  readonly value: number
  readonly payload: { readonly color: string }
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<TooltipPayloadEntry>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div
      className="bg-[#0d1426] rounded-lg px-3 py-2 text-xs font-mono shadow-xl border"
      style={{ borderColor: `${entry.payload.color}40` }}
    >
      <p style={{ color: entry.payload.color }} className="font-bold">{entry.name}</p>
      <p className="text-[--color-text-muted]">{entry.value} barangays</p>
    </div>
  )
}

export function SeverityPieChart({ summary }: SeverityPieChartProps) {
  const data = ENTRIES
    .map((e) => ({ name: e.label, value: summary[e.key], color: e.color }))
    .filter((d) => d.value > 0)

  const totalAffected = summary.majorCount + summary.destroyedCount

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <defs>
            {data.map((d) => (
              <radialGradient key={d.color} id={`pieGrad-${d.color.replace('#', '')}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={d.color} stopOpacity={1} />
                <stop offset="100%" stopColor={d.color} stopOpacity={0.75} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={900}
          >
            {data.map((entry) => (
              <Cell
                key={entry.color}
                fill={`url(#pieGrad-${entry.color.replace('#', '')})`}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)`, cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="font-display text-3xl font-black tabular-nums" style={{ color: '#ef4444' }}>
          {totalAffected}
        </p>
        <p className="text-[9px] font-mono text-[--color-text-muted] uppercase tracking-widest mt-0.5">
          HIGH SEVERITY
        </p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}70` }}
            />
            <span className="text-[10px] font-mono text-[--color-text-muted]">
              {entry.name} <span style={{ color: entry.color }} className="font-bold">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
