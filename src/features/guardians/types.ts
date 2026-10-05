export type GuardianRelationType =
  | 'LEGAL_GUARDIAN'
  | 'GRANDPARENT'
  | 'UNCLE_AUNT'
  | 'SIBLING'
  | 'FAMILY_FRIEND'
  | 'OTHER'

export interface GuardianStudentLink {
  relationType: GuardianRelationType
  isFinanciallyResponsible: boolean
  canPickup: boolean
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
}

export interface Guardian {
  id: number
  establishmentId: number
  userId: number | null
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  address: string | null
  createdAt: string
  updatedAt: string
  studentGuardians: GuardianStudentLink[]
}

export interface StudentLinkRequest {
  studentId: number
  relationType: GuardianRelationType
  isFinanciallyResponsible?: boolean
  canPickup?: boolean
}

/** Identifiants du compte ouvert d'office pour le tuteur. */
export interface CreatedAccountCredentials {
  loginEmail: string
  password: string
}

export type CreateGuardianResponse = Guardian & { account: CreatedAccountCredentials }

export interface CreateGuardianRequest {
  /** Mot de passe initial du compte créé. */
  password?: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  address?: string
  students?: StudentLinkRequest[]
}

export interface UpdateGuardianRequest {
  id: number
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
  students?: StudentLinkRequest[]
}
