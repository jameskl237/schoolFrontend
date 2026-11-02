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
  /**
   * Facultatif : l'adresse suffit. Le code n'est réclamé que si les mêmes
   * identifiants ouvrent un compte dans plusieurs établissements.
   */
  establishmentCode?: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  /** Format TYPE-VILLE-000, ex. SEC-YDE-014 */
  establishmentCode: string
  /** Revérifiée côté serveur : doit être identique à `password`. */
  confirmPassword: string
}

export interface AuthPayload {
  user: User
  accessToken: string
}
