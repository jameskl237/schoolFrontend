export interface Cycle {
  id: number
  sectionId: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface CreateCycleRequest {
  sectionId: number
  name: string
  code: string
}

export interface UpdateCycleRequest {
  id: number
  sectionId?: number
  name?: string
  code?: string
}
