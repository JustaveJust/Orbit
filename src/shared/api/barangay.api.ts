import { apiClient } from './client'
import type { BarangayDto } from '@/core/types/barangay.types'
import { SILANG_BARANGAYS } from '@/core/constants/silang-barangays'

export async function fetchAllBarangays(): Promise<ReadonlyArray<BarangayDto>> {
  try {
    const { data } = await apiClient.get<BarangayDto[]>('/barangays')
    return data.length > 0 ? data : SILANG_BARANGAYS
  } catch {
    return SILANG_BARANGAYS
  }
}

export async function fetchBarangay(id: number): Promise<BarangayDto> {
  const { data } = await apiClient.get<BarangayDto>(`/barangays/${id}`)
  return data
}
