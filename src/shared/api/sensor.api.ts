import { apiClient } from './client'
import type { SensorReadingDto } from '@/core/types/sensor.types'

export async function fetchRainfall(disasterId?: number): Promise<SensorReadingDto[]> {
  const { data } = await apiClient.get<SensorReadingDto[]>('/sensors/rainfall', {
    params: disasterId ? { disasterId } : undefined,
  })
  return data
}

export async function fetchSeismic(disasterId?: number): Promise<SensorReadingDto[]> {
  const { data } = await apiClient.get<SensorReadingDto[]>('/sensors/seismic', {
    params: disasterId ? { disasterId } : undefined,
  })
  return data
}

export async function fetchWaterLevel(disasterId?: number): Promise<SensorReadingDto[]> {
  const { data } = await apiClient.get<SensorReadingDto[]>('/sensors/water-level', {
    params: disasterId ? { disasterId } : undefined,
  })
  return data
}
