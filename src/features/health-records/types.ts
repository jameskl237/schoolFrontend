export interface Vaccination {
  id: number
  medicalRecordId: number
  name: string
  date: string
  nextDueDate: string | null
}

export interface MedicalRecord {
  id: number
  studentId: number
  bloodGroup: string | null
  allergies: string | null
  chronicConditions: string | null
  emergencyContact: string | null
  doctorName: string | null
  doctorPhone: string | null
  insuranceNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string; dateOfBirth: string }
  vaccinations: Vaccination[]
}

export interface InfirmaryVisit {
  id: number
  studentId: number
  date: string
  reason: string
  treatment: string | null
  temperature: number | null
  notifiedParent: boolean
  handledById: number
  createdAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string; dateOfBirth: string }
  handledBy: { id: number; firstName: string; lastName: string }
}

export interface SaveMedicalRecordRequest {
  studentId: number
  bloodGroup?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  emergencyContact?: string | null
  doctorName?: string | null
  doctorPhone?: string | null
  insuranceNumber?: string | null
  notes?: string | null
}

export interface CreateVaccinationRequest {
  studentId: number
  name: string
  date: string
  nextDueDate?: string | null
}

export interface CreateVisitRequest {
  studentId: number
  date?: string
  reason: string
  treatment?: string | null
  temperature?: number | null
  notifiedParent?: boolean
}
