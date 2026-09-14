export interface AcademicYear {
  id: number
  establishmentId: number
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAcademicYearRequest {
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

export interface UpdateAcademicYearRequest {
  id: number
  name?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
}
