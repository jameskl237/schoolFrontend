export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHEQUE' | 'CARD'

export interface InvoiceLine {
  id: number
  invoiceId: number
  feeTypeId: number
  amount: string
  description: string | null
  feeType: { id: number; name: string }
}

export interface InvoicePayment {
  id: number
  amount: string
  paymentDate: string
  method: PaymentMethod
  reference: string | null
}

export interface Invoice {
  id: number
  studentId: number
  academicYearId: number
  issueDate: string
  dueDate: string
  totalAmount: string
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  academicYear: { id: number; name: string }
  lines: InvoiceLine[]
  payments: InvoicePayment[]
}

export interface CreateInvoiceLineRequest {
  feeTypeId: number
  amount: number
  description?: string
}

export interface CreateInvoiceRequest {
  studentId: number
  academicYearId: number
  dueDate: string
  lines: CreateInvoiceLineRequest[]
}

export interface UpdateInvoiceRequest {
  id: number
  dueDate?: string
  status?: InvoiceStatus
}
