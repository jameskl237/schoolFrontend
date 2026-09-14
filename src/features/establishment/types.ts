export type SchoolType = 'PRIMARY' | 'SECONDARY' | 'BOTH'

export interface Establishment {
  id: number
  name: string
  code: string
  type: SchoolType
  createdAt: string
  updatedAt: string
  counts: {
    users: number
    students: number
    classrooms: number
    teachers: number
  }
}

export interface UpdateEstablishmentRequest {
  name?: string
  type?: SchoolType
}
