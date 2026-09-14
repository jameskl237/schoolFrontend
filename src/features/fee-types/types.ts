export interface FeeType {
  id: number
  establishmentId: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateFeeTypeRequest {
  name: string
  description?: string
}

export interface UpdateFeeTypeRequest {
  id: number
  name?: string
  description?: string
}
