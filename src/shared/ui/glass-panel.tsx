import { cn } from '@/shared/utils/cn'
import type { HTMLAttributes } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly neon?: boolean
  readonly elevated?: boolean
}

export function GlassPanel({ neon, elevated, className, children, ...rest }: GlassPanelProps) {
  return (
    <div
      {...rest}
      className={cn(
        'glass-panel transition-all duration-300',
        neon && 'border-[--color-accent]',
        elevated && 'bg-[--color-surface-raised]',
        className,
      )}
    >
      {children}
    </div>
  )
}
