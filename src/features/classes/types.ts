export interface SchoolClass {
  id: number
  gradeLevelId: number
  classroomId: number | null
  mainTeacherId: number | null
  name: string
  code: string
  createdAt: string
  updatedAt: string
  classroom: { id: number; name: string; code: string } | null
  mainTeacher: { id: number; firstName: string; lastName: string; employeeNumber: string } | null
}

export interface CreateClassRequest {
  gradeLevelId: number
  classroomId?: number
  mainTeacherId?: number
  name: string
  code: string
}

export interface UpdateClassRequest {
  id: number
  gradeLevelId?: number
  classroomId?: number | null
  mainTeacherId?: number | null
  name?: string
  code?: string
}
