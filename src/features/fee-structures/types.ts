export interface FeeStructure {
  id: number
  feeTypeId: number
  academicYearId: number
  classId: number | null
  amount: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
  feeType: { id: number; name: string }
  academicYear: { id: number; name: string }
  class: { id: number; name: string; code: string } | null
}

export interface CreateFeeStructureRequest {
  feeTypeId: number
  academicYearId: number
  classId?: number
  amount: number
  dueDate?: string
}

export interface UpdateFeeStructureRequest {
  id: number
  feeTypeId?: number
  academicYearId?: number
  classId?: number | null
  amount?: number
  dueDate?: string | null
}
