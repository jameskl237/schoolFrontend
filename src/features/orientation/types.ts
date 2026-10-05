export type OrientationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED'

export interface CounselingSession {
  id: number
  orientationRecordId: number
  counselorId: number
  date: string
  notes: string | null
  followUpDate: string | null
  counselor: { id: number; firstName: string; lastName: string }
}

export interface OrientationRecord {
  id: number
  studentId: number
  academicYearId: number
  recommendedTrack: string | null
  finalDecision: string | null
  status: OrientationStatus
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  academicYear: { id: number; name: string; isCurrent: boolean }
  sessions: CounselingSession[]
}

export interface OrientationFilters {
  studentId?: number
  academicYearId?: number
  status?: OrientationStatus
}

export interface CreateOrientationRequest {
  studentId: number
  academicYearId?: number
  recommendedTrack?: string | null
  finalDecision?: string | null
  status?: OrientationStatus
}

export interface UpdateOrientationRequest {
  id: number
  recommendedTrack?: string | null
  finalDecision?: string | null
  status?: OrientationStatus
}

export interface CreateSessionRequest {
  orientationRecordId: number
  date?: string
  notes?: string | null
  followUpDate?: string | null
}
