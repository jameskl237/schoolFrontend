import type { EnrollmentStatus } from '@/features/enrollments/types'
import type { ParentRelationType } from '@/features/parents/types'

export type Gender = 'MALE' | 'FEMALE'

/** L'inscription courante de l'élève, portée par sa fiche pour l'affichage classe + statut. */
export interface StudentEnrollment {
  id: number
  studentId: number
  classId: number
  academicYearId: number
  enrollmentDate: string
  status: EnrollmentStatus
  class: { id: number; name: string; code: string; gradeLevelId: number }
  academicYear: { id: number; name: string }
}

export interface StudentParentLink {
  id: number
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  userId: number | null
  relationType: ParentRelationType
  isPrimaryContact: boolean
}

export interface Student {
  id: number
  establishmentId: number
  userId: number | null
  studentNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string | null
  gender: Gender
  nationality: string | null
  address: string | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
  currentEnrollment: StudentEnrollment | null
  isEnrolled: boolean
  parents: StudentParentLink[]
}

/** Identifiants remis à la secrétaire lors de la création d'un compte parent. */
export interface CreatedParentCredentials {
  id: number
  firstName: string
  lastName: string
  email: string | null
  loginEmail: string | null
  password: string | null
}

export type CreateStudentResponse = Student & { createdParent?: CreatedParentCredentials }

/** Cible une classe et/ou une année : pour un enseignant, le périmètre est corrélé aux deux. */
export interface StudentFilters {
  classId?: number
  academicYearId?: number
}

export interface ParentWithStudentRequest {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  occupation?: string
  address?: string
  relationType: ParentRelationType
  password?: string
}

export interface CreateStudentRequest {
  studentNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth?: string
  gender: Gender
  nationality?: string
  address?: string
  classId: number
  academicYearId?: number
  parent?: ParentWithStudentRequest
}

export interface UpdateStudentRequest {
  id: number
  studentNumber?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  placeOfBirth?: string
  gender?: Gender
  nationality?: string
  address?: string
  classId?: number
}

/** Mise à jour du statut d'inscription par la scolarité. */
export interface UpdateStudentEnrollmentRequest {
  id: number
  status: EnrollmentStatus
  classId?: number
}
