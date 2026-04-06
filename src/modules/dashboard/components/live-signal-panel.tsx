import { useEffect, useState, useCallback } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { fetchRainfall, fetchSeismic, fetchWaterLevel } from '@/shared/api/sensor.api'
import { SensorReadingDto } from '@/core/types/sensor.types'

interface LiveSignalPanelProps {
  readonly disasterId: number | null
}

interface MiniChartProps {
  readonly data: ReadonlyArray<{ readonly value: number; readonly time: string }>
  readonly color: string
  readonly label: string
  readonly current: number
  readonly unit: string
  readonly isAlert: boolean
  readonly isCritical: boolean
  readonly gradId: string
}

function MiniChart({ data, color, label, current, unit, isAlert, isCritical, gradId }: MiniChartProps) {
  const statusColor = isCritical ? '#ef4444' : isAlert ? '#f59e0b' : color

  return (
    <div
      className="rounded-lg p-3 space-y-2 transition-all duration-200"
      style={{
        background: 'var(--color-surface-raised)',
        border: `1px solid ${isCritical ? '#ef444430' : isAlert ? '#f59e0b20' : 'var(--color-border)'}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[--color-text-muted] font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          {/* Status dot only — no verbose badge */}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: statusColor,
              boxShadow: isCritical ? `0 0 6px ${statusColor}` : undefined,
            }}
          />
          <span className="font-display text-sm font-semibold tabular-nums" style={{ color: statusColor }}>
            {current.toFixed(1)}
            <span className="text-[10px] text-[--color-text-muted] font-normal ml-0.5">{unit}</span>
          </span>
        </div>
      </div>

      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[...data]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={statusColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={statusColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={statusColor}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function LiveSignalPanel({ disasterId }: LiveSignalPanelProps) {
  const [rainfall, setRainfall] = useState<ReadonlyArray<SensorReadingDto>>([])
  const [seismic,  setSeismic]  = useState<ReadonlyArray<SensorReadingDto>>([])
  const [water,    setWater]    = useState<ReadonlyArray<SensorReadingDto>>([])
  const [sensorError, setSensorError] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const [r, s, w] = await Promise.all([
        fetchRainfall(disasterId ?? undefined),
        fetchSeismic(disasterId ?? undefined),
        fetchWaterLevel(disasterId ?? undefined),
      ])
      setRainfall(r)
      setSeismic(s)
      setWater(w)
      setSensorError(false)
      setLastFetchTime(new Date())
    } catch {
      setSensorError(true)
    }
  }, [disasterId])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const id = setInterval(() => { void load() }, 8000)
    return () => clearInterval(id)
  }, [load])

  const lastRainfall = rainfall[rainfall.length - 1]
  const lastSeismic  = seismic[seismic.length - 1]
  const lastWater    = water[water.length - 1]

  const WINDOW_SIZE = 20
  const rainfallSlice = rainfall.slice(-WINDOW_SIZE).map((r) => ({ value: r.value, time: r.timestamp }))
  const seismicSlice  = seismic.slice(-WINDOW_SIZE).map((r) => ({ value: Math.abs(r.value), time: r.timestamp }))
  const waterSlice    = water.slice(-WINDOW_SIZE).map((r) => ({ value: r.value, time: r.timestamp }))

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[--color-text-muted] font-medium">Sensor Feed</p>
        <div className="flex items-center gap-1.5">
          {sensorError ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              <span className="text-[10px] text-[#ef4444]">Disconnected</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[--color-undamaged] animate-pulse" />
              <span className="text-[10px] text-[--color-text-muted]">
                {lastFetchTime ? `${lastFetchTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Connecting…'}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {lastRainfall && (
          <MiniChart
            data={rainfallSlice}
            color="#38bdf8"
            label="Rainfall"
            current={lastRainfall.value}
            unit="mm/hr"
            isAlert={lastRainfall.isAlert}
            isCritical={lastRainfall.isCritical}
            gradId="live-rain-grad"
          />
        )}
        {lastSeismic && (
          <MiniChart
            data={seismicSlice}
            color="#f59e0b"
            label="Seismic"
            current={Math.abs(lastSeismic.value)}
            unit="mag"
            isAlert={lastSeismic.isAlert}
            isCritical={lastSeismic.isCritical}
            gradId="live-seis-grad"
          />
        )}
        {lastWater && (
          <MiniChart
            data={waterSlice}
            color="#0ea5e9"
            label="Water Level"
            current={lastWater.value}
            unit="m"
            isAlert={lastWater.isAlert}
            isCritical={lastWater.isCritical}
            gradId="live-water-grad"
          />
        )}
      </div>
    </div>
  )
}
