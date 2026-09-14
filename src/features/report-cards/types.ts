export interface ReportCardLine {
  id: number
  reportCardId: number
  subjectId: number
  subject: { id: number; name: string; code: string }
  average: number | null
  coefficient: number
  rank: number | null
  teacherComment: string | null
}

export interface ReportCard {
  id: number
  studentId: number
  periodId: number
  classId: number
  generalAverage: number | null
  rank: number | null
  conduct: string | null
  appreciation: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  period: {
    id: number
    name: string
    order: number
    academicYear: { id: number; name: string }
  }
  class: { id: number; name: string; code: string }
  lines: ReportCardLine[]
}

export interface ReportCardFilters {
  studentId?: number
  periodId?: number
  classId?: number
}

export interface ReportCardLineRequest {
  subjectId: number
  average?: number | null
  coefficient?: number
  rank?: number | null
  teacherComment?: string | null
}

export interface CreateReportCardRequest {
  studentId: number
  periodId: number
  generalAverage?: number | null
  rank?: number | null
  conduct?: string | null
  appreciation?: string | null
  lines?: ReportCardLineRequest[]
  published?: boolean
}

export interface UpdateReportCardRequest {
  id: number
  generalAverage?: number | null
  rank?: number | null
  conduct?: string | null
  appreciation?: string | null
  lines?: ReportCardLineRequest[]
  published?: boolean
}