export type SchoolLevelType = 'PRESCHOOL' | 'PRIMARY' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL'

export interface SchoolLevel {
  id: number
  establishmentId: number
  name: string
  type: SchoolLevelType
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolLevelRequest {
  name: string
  type: SchoolLevelType
}

export interface UpdateSchoolLevelRequest {
  id: number
  name?: string
  type?: SchoolLevelType
}
