export interface Sequence {
  id: number
  periodId: number
  name: string
  order: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  period: {
    id: number
    name: string
    order: number
    academicYear: { id: number; name: string; isCurrent: boolean }
  }
  _count: { evaluations: number }
}

export interface SequenceFilters {
  periodId?: number
  academicYearId?: number
}

export interface CreateSequenceRequest {
  periodId: number
  name: string
  order: number
  startDate: string
  endDate: string
}

export interface UpdateSequenceRequest {
  id: number
  name?: string
  order?: number
  startDate?: string
  endDate?: string
}
