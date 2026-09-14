export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export interface Attendance {
  id: number
  studentId: number
  classId: number
  timetableId: number | null
  date: string
  status: AttendanceStatus
  justification: string | null
  recordedById: number
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  class: { id: number; name: string; code: string }
  recordedBy: { id: number; firstName: string; lastName: string }
  timetable: {
    id: number
    dayOfWeek: string
    startTime: string
    endTime: string
    classSubject: { id: number; subject: { id: number; name: string } }
  } | null
}

export interface AttendanceFilters {
  classId?: number
  studentId?: number
  from?: string
  to?: string
}

export interface AttendanceEntry {
  studentId: number
  status: AttendanceStatus
  justification?: string
}

/** L'appel s'enregistre classe entière, pour une date donnée. */
export interface SaveAttendancesRequest {
  classId: number
  date: string
  timetableId?: number
  entries: AttendanceEntry[]
}

export interface UpdateAttendanceRequest {
  id: number
  status?: AttendanceStatus
  justification?: string | null
}
