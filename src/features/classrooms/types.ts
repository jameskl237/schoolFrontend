export interface Classroom {
  id: number
  establishmentId: number
  name: string
  code: string
  capacity: number | null
  createdAt: string
  updatedAt: string
  class: { id: number; name: string; code: string } | null
}

export interface CreateClassroomRequest {
  name: string
  code: string
  capacity?: number
}

export interface UpdateClassroomRequest {
  id: number
  name?: string
  code?: string
  capacity?: number | null
}
