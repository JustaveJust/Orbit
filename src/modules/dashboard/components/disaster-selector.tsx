import { motion } from 'framer-motion'
import { DisasterEventDto } from '@/core/types/disaster.types'

interface DisasterSelectorProps {
  readonly disasters: ReadonlyArray<DisasterEventDto>
  readonly selectedId: number | null
  readonly onSelect: (id: number) => void
  readonly isLoading: boolean
}

const TYPE_COLORS: Record<string, string> = {
  TYPHOON:    '#8b5cf6',
  FLOOD:      '#0ea5e9',
  EARTHQUAKE: '#f59e0b',
  LANDSLIDE:  '#78716c',
}

export function DisasterSelector({ disasters, selectedId, onSelect, isLoading }: DisasterSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[--color-text-muted] font-medium shrink-0">Event</span>
      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-32 rounded-lg animate-pulse"
              style={{ background: 'var(--color-surface-raised)' }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {disasters.map((d, idx) => {
            const color = TYPE_COLORS[d.disasterType] ?? '#00c8f0'
            const isSelected = d.id === selectedId
            return (
              <motion.button
                key={d.id}
                onClick={() => onSelect(d.id)}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background:  isSelected ? `${color}20` : 'var(--color-surface-raised)',
                  border:      `1px solid ${isSelected ? `${color}50` : 'var(--color-border)'}`,
                  color:       isSelected ? color : 'var(--color-text-secondary)',
                }}
                aria-pressed={isSelected}
              >
                <span>{d.typeIcon}</span>
                <span>{d.name.split(' ').slice(0, 2).join(' ')}</span>
                <span
                  className="opacity-60 text-[10px] font-normal"
                  style={{ color: isSelected ? color : undefined }}
                >
                  {d.severity}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
