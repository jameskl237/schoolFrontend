import type { PaymentMethod } from '@/features/invoices/types'

export interface CreatePaymentRequest {
  invoiceId: number
  amount: number
  method: PaymentMethod
  reference?: string
}
