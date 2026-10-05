export interface Role {
  id: number
  name: string
  description: string | null
  permissions: string[]
  /** Nombre de comptes portant ce rôle : il bloque la suppression. */
  userCount: number
}

export interface Permission {
  id: number
  code: string
  name: string
  description: string | null
}

export interface CreateRoleRequest {
  name: string
  description?: string | null
  permissions?: string[]
}

export interface UpdateRoleRequest {
  id: number
  description?: string | null
}

export interface SetRolePermissionsRequest {
  id: number
  permissions: string[]
}
