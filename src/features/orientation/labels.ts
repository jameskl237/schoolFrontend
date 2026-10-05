import type { OrientationStatus } from './types'

export const orientationStatusLabels: Record<OrientationStatus, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  REJECTED: 'Rejetée',
}
