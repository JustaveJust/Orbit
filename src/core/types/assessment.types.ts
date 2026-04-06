export type DamageLevel = 'UNDAMAGED' | 'MINOR' | 'MAJOR' | 'DESTROYED'

export interface DamageAssessmentDto {
  readonly id: number
  readonly barangayId: number
  readonly barangayName: string
  readonly barangayLat: number
  readonly barangayLng: number
  readonly disasterId: number
  readonly disasterName: string
  readonly damageLevel: DamageLevel
  readonly damageLevelColor: string
  readonly structuresAssessed: number
  readonly structuresAffected: number
  readonly damagePercent: number
  readonly populationAffected: number
  readonly aiConfidence: number
  readonly notes: string
}

export interface SummaryDto {
  readonly disasterId: number
  readonly disasterName: string
  readonly disasterType: string
  readonly severity: string
  readonly eventDate: string
  readonly totalAssessments: number
  readonly affectedBarangays: number
  readonly totalStructuresAssessed: number
  readonly totalStructuresAffected: number
  readonly undamagedCount: number
  readonly minorCount: number
  readonly majorCount: number
  readonly destroyedCount: number
  readonly totalPopulationAffected: number
  readonly avgDamagePercent: number
  readonly avgAiConfidence: number
}
