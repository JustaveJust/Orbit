import { cn } from '@/shared/utils/cn'

interface SkeletonProps {
  readonly className?: string
  readonly style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[--color-surface-raised]',
        className,
      )}
      style={style}
    />
  )
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-[--color-surface] rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-[--color-accent] border-t-transparent animate-spin" />
        <p className="text-[--color-text-muted] font-mono text-sm">Loading satellite data...</p>
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = '200px' }: { readonly height?: string }) {
  return (
    <div className="w-full bg-[--color-surface] rounded-lg flex items-end gap-2 p-4" style={{ height }}>
      {Array.from({ length: 12 }, (_, i) => (
        <Skeleton key={i} className={`flex-1 rounded-sm`} style={{ height: `${20 + (i % 4) * 15}%` }} />
      ))}
    </div>
  )
}
