import { cn } from '@/shared/utils/cn'

type BadgeVariant = 'teal' | 'amber' | 'red' | 'green' | 'purple' | 'blue' | 'orange'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  teal:   'bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border-[rgba(0,212,255,0.30)]',
  amber:  'bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border-[rgba(245,158,11,0.30)]',
  red:    'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border-[rgba(239,68,68,0.30)]',
  green:  'bg-[rgba(34,197,94,0.12)] text-[#22c55e] border-[rgba(34,197,94,0.30)]',
  purple: 'bg-[rgba(124,58,237,0.12)] text-[#7c3aed] border-[rgba(124,58,237,0.30)]',
  blue:   'bg-[rgba(2,132,199,0.12)] text-[#0284c7] border-[rgba(2,132,199,0.30)]',
  orange: 'bg-[rgba(249,115,22,0.12)] text-[#f97316] border-[rgba(249,115,22,0.30)]',
}

interface NeonBadgeProps {
  readonly variant?: BadgeVariant
  readonly children: React.ReactNode
  readonly className?: string
  readonly pulse?: boolean
}

export function NeonBadge({ variant = 'teal', children, className, pulse }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border',
        VARIANT_CLASSES[variant],
        pulse && 'animate-pulse-slow',
        className,
      )}
    >
      {children}
    </span>
  )
}
