export interface StaffUserRole {
  id: number
  name: string
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
  roles: StaffUserRole[]
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roleIds?: number[]
}

export interface UpdateUserRequest {
  id: number
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
  roleIds?: number[]
}
