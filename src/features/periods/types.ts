export interface Period {
  id: number
  academicYearId: number
  name: string
  order: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  academicYear: { id: number; name: string; isCurrent: boolean }
}

export interface CreatePeriodRequest {
  academicYearId: number
  name: string
  order: number
  startDate: string
  endDate: string
}

export interface UpdatePeriodRequest {
  id: number
  name?: string
  order?: number
  startDate?: string
  endDate?: string
}
