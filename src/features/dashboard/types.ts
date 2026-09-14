export interface DashboardStats {
  establishment: { name: string; code: string; type: string } | null
  userCount: number
  studentCount: number
  teacherCount: number
  classroomCount: number
  currentYear: { id: number; name: string; startDate: string; endDate: string } | null
  usersByRole: { role: string; count: number }[]
}
