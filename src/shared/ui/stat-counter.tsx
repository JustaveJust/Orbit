import { useCountUp } from '@/shared/hooks/use-count-up'
import { cn } from '@/shared/utils/cn'

interface StatCounterProps {
  readonly value: number
  readonly label: string
  readonly unit?: string
  readonly color?: string
  readonly className?: string
  readonly animate?: boolean
}

export function StatCounter({ value, label, unit, color, className, animate = true }: StatCounterProps) {
  const count = useCountUp(value, 1200, animate)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline gap-1">
        <span
          className="font-display text-2xl font-semibold tabular-nums leading-none"
          style={{ color: color ?? 'var(--color-accent)' }}
        >
          {count.toLocaleString()}
        </span>
        {unit && (
          <span className="text-xs text-[--color-text-muted] font-medium">{unit}</span>
        )}
      </div>
      <p className="text-[10px] text-[--color-text-muted] font-medium leading-none">{label}</p>
    </div>
  )
}
