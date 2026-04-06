import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { SensorReadingDto } from '@/core/types/sensor.types'
import { ChartSkeleton } from '@/shared/ui/loading-skeleton'

interface SeismicChartProps {
  readonly data: ReadonlyArray<SensorReadingDto>
  readonly isLoading: boolean
}

interface TooltipPayloadEntry {
  readonly value: number
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<TooltipPayloadEntry>
  readonly label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const abs = Math.abs(val)
  const status = abs >= 6.0 ? { label: 'CRITICAL',  color: '#ef4444' }
    : abs >= 4.0 ? { label: 'ALERT',     color: '#eab308' }
    : abs >= 2.0 ? { label: 'ELEVATED',  color: '#f97316' }
    : { label: 'NOMINAL',   color: '#22c55e' }
  return (
    <div className="bg-[#0d1426] border border-[rgba(180,83,9,0.3)] rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-[--color-text-muted] mb-1">{label}</p>
      <p className="text-amber-400 font-bold">M {val.toFixed(2)}</p>
      <p style={{ color: status.color }} className="text-[9px] font-bold tracking-widest">{status.label}</p>
    </div>
  )
}

export function SeismicChart({ data, isLoading }: SeismicChartProps) {
  if (isLoading) return <ChartSkeleton height="220px" />

  const chartData = data.map((r, i) => ({
    t:     i % 12 === 0 ? `${i * 10}m` : '',
    value: +r.value.toFixed(2),
  }))

  const maxAbs = Math.max(...data.map((r) => Math.abs(r.value)), 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest">MAGNITUDE (WVF Monitor)</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-yellow-500/30 text-yellow-400/80 bg-yellow-500/10">⚠ M4.0</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/30 text-red-400/80 bg-red-500/10">🔴 M6.0</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="seismicStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#d97706" />
              <stop offset="50%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            domain={[-(maxAbs + 0.5), maxAbs + 0.5]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245,158,11,0.25)', strokeWidth: 1 }} />
          <ReferenceLine y={0}   stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <ReferenceLine y={4}   stroke="#ca8a04" strokeDasharray="4 3" strokeWidth={1} label={{ value: '+4', fill: '#ca8a04', fontSize: 8, fontFamily: 'monospace', position: 'right' }} />
          <ReferenceLine y={-4}  stroke="#ca8a04" strokeDasharray="4 3" strokeWidth={1} label={{ value: '-4', fill: '#ca8a04', fontSize: 8, fontFamily: 'monospace', position: 'right' }} />
          <ReferenceLine y={6}   stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1} label={{ value: '+6', fill: '#dc2626', fontSize: 8, fontFamily: 'monospace', position: 'right' }} />
          <ReferenceLine y={-6}  stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1} label={{ value: '-6', fill: '#dc2626', fontSize: 8, fontFamily: 'monospace', position: 'right' }} />
          <Line
            type="linear"
            dataKey="value"
            stroke="url(#seismicStroke)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 3, fill: '#f59e0b', stroke: '#d97706', strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
