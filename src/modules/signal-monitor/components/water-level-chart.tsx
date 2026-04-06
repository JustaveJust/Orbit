import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { SensorReadingDto } from '@/core/types/sensor.types'
import { ChartSkeleton } from '@/shared/ui/loading-skeleton'

interface WaterLevelChartProps {
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
  const status = val >= 6.0 ? { label: 'CRITICAL', color: '#ef4444' }
    : val >= 4.0 ? { label: 'WARNING', color: '#eab308' }
    : { label: 'NORMAL', color: '#22c55e' }
  return (
    <div className="bg-[#0d1426] border border-[rgba(14,165,233,0.25)] rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-[--color-text-muted] mb-1">{label}</p>
      <p className="text-sky-400 font-bold">{val.toFixed(2)} m</p>
      <p style={{ color: status.color }} className="text-[9px] font-bold tracking-widest">{status.label}</p>
    </div>
  )
}

export function WaterLevelChart({ data, isLoading }: WaterLevelChartProps) {
  if (isLoading) return <ChartSkeleton height="220px" />

  const chartData = data.map((r, i) => ({
    t:      i % 6 === 0 ? `${i}h` : '',
    value:  +r.value.toFixed(2),
    alert:  r.isAlert && !r.isCritical ? r.value : null,
    danger: r.isCritical ? r.value : null,
  }))

  const maxVal = Math.max(...data.map((r) => r.value), 5)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest">WATER LEVEL — IMUS RIVER (m)</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-yellow-500/30 text-yellow-400/80 bg-yellow-500/10">⚠ 4.0 m</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/30 text-red-400/80 bg-red-500/10">🔴 6.0 m</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="waterGradNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0ea5e9" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="waterGradAlert" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#eab308" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#eab308" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="waterGradDanger" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
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
            domain={[0, maxVal + 1]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(14,165,233,0.3)', strokeWidth: 1 }} />
          <ReferenceLine
            y={4}
            stroke="#ca8a04"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: '4m', fill: '#ca8a04', fontSize: 8, fontFamily: 'monospace', position: 'right' }}
          />
          <ReferenceLine
            y={6}
            stroke="#dc2626"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: '6m', fill: '#dc2626', fontSize: 8, fontFamily: 'monospace', position: 'right' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#waterGradNormal)"
            dot={false}
            activeDot={{ r: 3, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="alert"
            stroke="#eab308"
            strokeWidth={0}
            fill="url(#waterGradAlert)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="danger"
            stroke="#ef4444"
            strokeWidth={0}
            fill="url(#waterGradDanger)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
