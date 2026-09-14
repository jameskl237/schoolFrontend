export type EnrollmentStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'TRANSFERRED'
  | 'WITHDRAWN'
  | 'GRADUATED'
  | 'REPEATING'

export interface Enrollment {
  id: number
  studentId: number
  classId: number
  academicYearId: number
  enrollmentDate: string
  status: EnrollmentStatus
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  class: { id: number; name: string; code: string }
  academicYear: { id: number; name: string }
}

export interface EnrollmentFilters {
  classId?: number
  academicYearId?: number
}

export interface CreateEnrollmentRequest {
  studentId: number
  classId: number
  academicYearId: number
  status?: EnrollmentStatus
}

export interface UpdateEnrollmentRequest {
  id: number
  classId?: number
  academicYearId?: number
  status?: EnrollmentStatus
}
