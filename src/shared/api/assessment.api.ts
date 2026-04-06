import { apiClient } from './client'
import type { DamageAssessmentDto, SummaryDto } from '@/core/types/assessment.types'

export async function fetchAssessments(disasterId: number): Promise<DamageAssessmentDto[]> {
  const { data } = await apiClient.get<DamageAssessmentDto[]>('/assessments', {
    params: { disasterId },
  })
  return data
}

export async function fetchSummary(disasterId: number): Promise<SummaryDto> {
  const { data } = await apiClient.get<SummaryDto>('/stats/summary', {
    params: { disasterId },
  })
  return data
}
