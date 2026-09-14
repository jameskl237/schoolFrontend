export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface Timetable {
  id: number
  classSubjectId: number
  classroomId: number
  dayOfWeek: DayOfWeek
  /** Heure ISO stockée en colonne TIME : seule la partie horaire compte. */
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
  classroom: { id: number; name: string; code: string }
  classSubject: {
    id: number
    teacherId: number
    subject: { id: number; name: string; code: string }
    class: { id: number; name: string; code: string }
    teacher: { id: number; firstName: string; lastName: string }
    academicYear: { id: number; name: string; isCurrent: boolean }
  }
}

export interface TimetableFilters {
  classId?: number
  teacherId?: number
  classroomId?: number
  academicYearId?: number
}

export interface CreateTimetableRequest {
  classSubjectId: number
  classroomId: number
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export interface UpdateTimetableRequest {
  id: number
  classroomId?: number
  dayOfWeek?: DayOfWeek
  startTime?: string
  endTime?: string
}
