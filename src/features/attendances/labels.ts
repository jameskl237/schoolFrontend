import type { AttendanceStatus } from './types'

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'En retard',
  EXCUSED: 'Excusé',
}
