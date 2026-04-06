import { apiClient } from './client'
import type { DisasterEventDto } from '@/core/types/disaster.types'

export async function fetchAllDisasters(): Promise<DisasterEventDto[]> {
  const { data } = await apiClient.get<DisasterEventDto[]>('/disasters')
  return data
}

export async function fetchDisaster(id: number): Promise<DisasterEventDto> {
  const { data } = await apiClient.get<DisasterEventDto>(`/disasters/${id}`)
  return data
}
