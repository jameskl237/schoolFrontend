import type { InvoiceStatus, PaymentMethod } from './types'

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  PENDING: 'En attente',
  PARTIALLY_PAID: 'Partiellement payée',
  PAID: 'Payée',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulée',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Espèces',
  BANK_TRANSFER: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile Money',
  CHEQUE: 'Chèque',
  CARD: 'Carte',
}
