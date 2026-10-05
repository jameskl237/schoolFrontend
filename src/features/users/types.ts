export interface StaffUserRole {
  id: number
  name: string
  description?: string | null
}

export interface StaffUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  establishmentId: number
  createdAt: string
  updatedAt: string
  /** Un compte porte exactement un rôle : c'est lui qui dit ce qu'il est. */
  roleId: number
  role: StaffUserRole
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roleId: number
}

export interface UpdateUserRequest {
  id: number
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
  roleId?: number
}
