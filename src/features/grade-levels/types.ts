export interface GradeLevel {
  id: number
  cycleId: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface CreateGradeLevelRequest {
  cycleId: number
  name: string
  code: string
}

export interface UpdateGradeLevelRequest {
  id: number
  cycleId?: number
  name?: string
  code?: string
}
