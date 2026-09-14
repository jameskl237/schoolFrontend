export type ParentRelationType = 'FATHER' | 'MOTHER' | 'STEPFATHER' | 'STEPMOTHER' | 'OTHER'

export interface ParentStudentLink {
  relationType: ParentRelationType
  isPrimaryContact: boolean
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
}

export interface Parent {
  id: number
  establishmentId: number
  userId: number | null
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  occupation: string | null
  address: string | null
  createdAt: string
  updatedAt: string
  studentParents: ParentStudentLink[]
}

export interface StudentLinkRequest {
  studentId: number
  relationType: ParentRelationType
  isPrimaryContact?: boolean
}

export interface CreateParentRequest {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  occupation?: string
  address?: string
  students?: StudentLinkRequest[]
}

export interface UpdateParentRequest {
  id: number
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  occupation?: string
  address?: string
  students?: StudentLinkRequest[]
}
