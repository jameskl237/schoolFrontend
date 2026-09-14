export interface Subject {
  id: number
  establishmentId: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubjectRequest {
  name: string
  code: string
}

export interface UpdateSubjectRequest {
  id: number
  name?: string
  code?: string
}
