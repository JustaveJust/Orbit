export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export interface BarangayDto {
  readonly id: number
  readonly name: string
  readonly latitude: number
  readonly longitude: number
  readonly riskLevel: RiskLevel
  readonly riskColor: string
  readonly basePopulation: number
  readonly baseStructures: number
}
