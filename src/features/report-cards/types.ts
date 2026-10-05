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
/** Une ligne du bulletin, telle que le format camerounais l'attend. */
export interface BulletinSubjectLine {
  subjectId: number
  subject: string
  average: number | null
  coefficient: number
  /** Note × coefficient. */
  total: number | null
  rank: number | null
  teacherComment: string | null
  teacherName: string | null
}

export interface Bulletin {
  establishment: {
    name: string
    code: string
    logoUrl: string | null
    city: string | null
    poBox: string | null
    phone: string | null
  }
  academicYear: string
  period: { name: string; order: number }
  student: {
    firstName: string
    lastName: string
    studentNumber: string
    dateOfBirth: string
    placeOfBirth: string | null
    gender: string
    photoUrl: string | null
    repeating: boolean
  }
  className: string
  headTeacher: string | null
  lines: BulletinSubjectLine[]
  totals: { points: number; coefficients: number; average: number | null; rank: number | null }
  classStats: {
    size: number
    average: number | null
    highestAverage: number | null
    lowestAverage: number | null
  }
  conduct: string | null
  appreciation: string | null
  absences: { count: number; justified: number; late: number }
  publishedAt: string | null
}
