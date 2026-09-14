export type SanctionType = 'WARNING' | 'REPRIMAND' | 'DETENTION' | 'SUSPENSION' | 'EXPULSION'

export interface DisciplineRecord {
  id: number
  studentId: number
  type: SanctionType
  reason: string
  date: string
  durationDays: number | null
  description: string | null
  issuedById: number
  createdAt: string
  student: {
    id: number
    firstName: string
    lastName: string
    studentNumber: string
    enrollments: { class: { id: number; name: string; code: string } }[]
  }
  issuedBy: { id: number; firstName: string; lastName: string }
}

export interface DisciplineFilters {
  studentId?: number
  classId?: number
  type?: SanctionType
  from?: string
  to?: string
}

export interface CreateDisciplineRecordRequest {
  studentId: number
  type: SanctionType
  reason: string
  date: string
  durationDays?: number | null
  description?: string
}

export interface UpdateDisciplineRecordRequest {
  id: number
  type?: SanctionType
  reason?: string
  date?: string
  durationDays?: number | null
  description?: string | null
}