import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { SensorReadingDto } from '@/core/types/sensor.types'
import { ChartSkeleton } from '@/shared/ui/loading-skeleton'

interface RainfallChartProps {
  readonly data: ReadonlyArray<SensorReadingDto>
  readonly isLoading: boolean
}

interface TooltipPayloadEntry {
  readonly value: number
  readonly name: string
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<TooltipPayloadEntry>
  readonly label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const status = val >= 250 ? { label: 'CRITICAL', color: '#ef4444' }
    : val >= 150 ? { label: 'WARNING',  color: '#eab308' }
    : { label: 'NOMINAL', color: '#22c55e' }
  return (
    <div className="bg-[#0d1426] border border-[rgba(0,212,255,0.2)] rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-[--color-text-muted] mb-1">{label}</p>
      <p className="text-sky-400 font-bold">{val} mm/hr</p>
      <p style={{ color: status.color }} className="text-[9px] font-bold tracking-widest">{status.label}</p>
    </div>
  )
}

export function RainfallChart({ data, isLoading }: RainfallChartProps) {
  if (isLoading) return <ChartSkeleton height="220px" />

  const chartData = data.map((r, i) => ({
    t:     i % 6 === 0 ? `${Math.floor(i / 6)}h` : '',
    value: +r.value.toFixed(1),
  }))

  const maxVal = Math.max(...data.map((r) => r.value), 50)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[--color-text-muted] uppercase tracking-widest">RAINFALL (mm/hr)</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-yellow-500/30 text-yellow-400/80 bg-yellow-500/10">⚠ 150</span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/30 text-red-400/80 bg-red-500/10">🔴 250</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rainfallGradFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.55} />
              <stop offset="50%"  stopColor="#0284c7" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rainfallStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#0ea5e9" />
              <stop offset="50%"  stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
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
            domain={[0, maxVal + 30]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(56,189,248,0.3)', strokeWidth: 1 }} />
          <ReferenceLine
            y={150}
            stroke="#ca8a04"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: 'WARN', fill: '#ca8a04', fontSize: 8, fontFamily: 'monospace', position: 'right' }}
          />
          <ReferenceLine
            y={250}
            stroke="#dc2626"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: 'CRIT', fill: '#dc2626', fontSize: 8, fontFamily: 'monospace', position: 'right' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#rainfallStroke)"
            strokeWidth={2}
            fill="url(#rainfallGradFill)"
            dot={false}
            activeDot={{ r: 3, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
