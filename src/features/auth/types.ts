export interface User {
  id: number
  establishmentId: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  permissions: string[]
  /**
   * Identité applicative du compte. Elle détermine ce que l'utilisateur voit
   * (ses classes, ses notes) et ce qu'il peut éditer — un enseignant ne valide
   * que ses propres évaluations.
   */
  teacherId: number | null
  studentId: number | null
  parentId: number | null
  guardianId: number | null
}

export interface LoginRequest {
  email: string
  password: string
  /** Format TYPE-VILLE-000, ex. SEC-YDE-014 */
  establishmentCode: string
}

export interface AuthPayload {
  user: User
  accessToken: string
}
