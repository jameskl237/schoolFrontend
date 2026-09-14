export interface ClassSubject {
  id: number
  classId: number
  subjectId: number
  teacherId: number
  academicYearId: number
  coefficient: number
  hoursPerWeek: number | null
  createdAt: string
  updatedAt: string
  class: { id: number; name: string; code: string; gradeLevelId: number }
  subject: { id: number; name: string; code: string }
  teacher: { id: number; firstName: string; lastName: string; employeeNumber: string }
  academicYear: { id: number; name: string; isCurrent: boolean }
}

export interface ClassSubjectFilters {
  classId?: number
  teacherId?: number
  academicYearId?: number
}

export interface CreateClassSubjectRequest {
  classId: number
  subjectId: number
  teacherId: number
  academicYearId: number
  coefficient?: number
  hoursPerWeek?: number
}

export interface UpdateClassSubjectRequest {
  id: number
  teacherId?: number
  coefficient?: number
  hoursPerWeek?: number | null
}
