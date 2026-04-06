import type { DamageLevel } from '@/core/types/assessment.types'

export const DAMAGE_COLORS: Record<DamageLevel, string> = {
  UNDAMAGED: '#22c55e',
  MINOR:     '#eab308',
  MAJOR:     '#f97316',
  DESTROYED: '#ef4444',
}

export const DAMAGE_LABELS: Record<DamageLevel, string> = {
  UNDAMAGED: 'Undamaged',
  MINOR:     'Minor Damage',
  MAJOR:     'Major Damage',
  DESTROYED: 'Destroyed',
}

export function damageLevelToColor(level: DamageLevel): string {
  return DAMAGE_COLORS[level]
}

export function damageLevelToClass(level: DamageLevel): string {
  const map: Record<DamageLevel, string> = {
    UNDAMAGED: 'damage-undamaged',
    MINOR:     'damage-minor',
    MAJOR:     'damage-major',
    DESTROYED: 'damage-destroyed',
  }
  return map[level]
}
