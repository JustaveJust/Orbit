export type SensorType = 'RAINFALL' | 'SEISMIC' | 'WATER_LEVEL'

export interface SensorReadingDto {
  readonly timestamp: string
  readonly value: number
  readonly stationId: string
  readonly stationName: string
  readonly sensorType: SensorType
  readonly unit: string
  readonly isAlert: boolean
  readonly isCritical: boolean
}
