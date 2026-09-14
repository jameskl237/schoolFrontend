import type { Gender } from '@/features/students/types'

export interface TeacherAssignment {
  id: number
  coefficient: number
  hoursPerWeek: number | null
  subject: { id: number; name: string; code: string }
  class: { id: number; name: string; code: string; gradeLevelId: number }
  academicYear: { id: number; name: string; isCurrent: boolean }
}

export interface Teacher {
  id: number
  establishmentId: number
  userId: number | null
  employeeNumber: string
  firstName: string
  lastName: string
  gender: Gender
  phone: string | null
  email: string | null
  hireDate: string | null
  specialty: string | null
  createdAt: string
  updatedAt: string
  user: { id: number; email: string; isActive: boolean } | null
  classSubjects: TeacherAssignment[]
}

export interface CreateTeacherRequest {
  employeeNumber: string
  firstName: string
  lastName: string
  gender: Gender
  phone?: string
  email?: string
  hireDate?: string
  specialty?: string
  userId?: number
}

export interface UpdateTeacherRequest {
  id: number
  employeeNumber?: string
  firstName?: string
  lastName?: string
  gender?: Gender
  phone?: string | null
  email?: string | null
  hireDate?: string | null
  specialty?: string | null
  userId?: number | null
}
