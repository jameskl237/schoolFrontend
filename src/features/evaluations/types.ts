export type EvaluationType = 'HOMEWORK' | 'QUIZ' | 'TEST' | 'EXAM'

export interface Evaluation {
  id: number
  classSubjectId: number
  periodId: number
  sequenceId: number | null
  title: string
  type: EvaluationType
  date: string
  maxScore: number
  coefficient: number
  validatedAt: string | null
  validatedById: number | null
  /** Épreuve PDF mise en ligne par l'enseignant (nom d'origine côté client). */
  examPaperPath: string | null
  examPaperName: string | null
  createdAt: string
  updatedAt: string
  classSubject: {
    id: number
    teacherId: number
    coefficient: number
    subject: { id: number; name: string; code: string }
    class: { id: number; name: string; code: string; mainTeacherId: number | null }
    teacher: { id: number; firstName: string; lastName: string }
    academicYear: { id: number; name: string }
  }
  period: { id: number; name: string; order: number }
  sequence: { id: number; name: string; order: number } | null
  validatedBy: { id: number; firstName: string; lastName: string } | null
  /** Le dernier visa du professeur principal, s'il y en a un. */
  reviews: {
    id: number
    decision: 'APPROVED' | 'CHANGES_REQUESTED'
    comment: string | null
    resolvedAt: string | null
    createdAt: string
    author: { id: number; firstName: string; lastName: string }
  }[]
  _count: { grades: number }
}

export interface EvaluationFilters {
  classSubjectId?: number
  periodId?: number
  sequenceId?: number
  classId?: number
  academicYearId?: number
}

export interface CreateEvaluationRequest {
  classSubjectId: number
  periodId: number
  sequenceId: number
  title: string
  type: EvaluationType
  date: string
  maxScore?: number
  coefficient?: number
}

export interface UpdateEvaluationRequest {
  id: number
  periodId?: number
  sequenceId?: number
  title?: string
  type?: EvaluationType
  date?: string
  maxScore?: number
  coefficient?: number
}
