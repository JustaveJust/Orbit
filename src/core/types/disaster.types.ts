export type DisasterType  = 'TYPHOON' | 'FLOOD' | 'EARTHQUAKE' | 'LANDSLIDE'
export type SeverityLevel = 'MODERATE' | 'MAJOR' | 'CRITICAL'

export interface DisasterEventDto {
  readonly id: number
  readonly name: string
  readonly description: string
  readonly disasterType: DisasterType
  readonly typeIcon: string
  readonly severity: SeverityLevel
  readonly severityColor: string
  readonly eventDate: string
  readonly peakRainfallMmPerHour: number
  readonly peakSeismicMagnitude: number
  readonly peakWaterLevelMeters: number
  readonly beforeImageUrl: string | null
  readonly afterImageUrl: string | null
}
