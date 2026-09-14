import type { EvaluationType } from '@/features/evaluations/types'

export interface Grade {
  id: number
  evaluationId: number
  studentId: number
  score: number | null
  isAbsent: boolean
  comment: string | null
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  evaluation: {
    id: number
    title: string
    type: EvaluationType
    date: string
    maxScore: number
    coefficient: number
    validatedAt: string | null
    classSubject: {
      id: number
      teacherId: number
      subject: { id: number; name: string; code: string }
      class: { id: number; name: string; code: string; mainTeacherId: number | null }
      teacher: { id: number; firstName: string; lastName: string }
    }
    period: { id: number; name: string; order: number }
    sequence: { id: number; name: string; order: number } | null
  }
}

export interface GradeFilters {
  evaluationId?: number
  studentId?: number
  periodId?: number
  sequenceId?: number
  classId?: number
  academicYearId?: number
}

export interface GradeEntry {
  studentId: number
  score?: number | null
  isAbsent?: boolean
  comment?: string
}

/** La feuille de notes d'une évaluation s'enregistre d'un bloc. */
export interface SaveGradesRequest {
  evaluationId: number
  grades: GradeEntry[]
}

export interface UpdateGradeRequest {
  id: number
  score?: number | null
  isAbsent?: boolean
  comment?: string | null
}
