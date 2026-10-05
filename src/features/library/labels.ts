import type { BookCopyStatus, LoanStatus } from './types'

export const copyStatusLabels: Record<BookCopyStatus, string> = {
  AVAILABLE: 'Disponible',
  BORROWED: 'Emprunté',
  LOST: 'Perdu',
  DAMAGED: 'Abîmé',
  RETIRED: 'Retiré',
}

export const loanStatusLabels: Record<LoanStatus, string> = {
  ONGOING: 'En cours',
  RETURNED: 'Rendu',
  OVERDUE: 'En retard',
  LOST: 'Perdu',
}
