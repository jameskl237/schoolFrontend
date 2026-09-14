import type { EnrollmentStatus } from './types'

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  PENDING: 'Non inscrit',
  ACTIVE: 'Actif',
  TRANSFERRED: 'Transféré',
  WITHDRAWN: 'Retiré',
  GRADUATED: 'Diplômé',
  REPEATING: 'Redouble',
}
