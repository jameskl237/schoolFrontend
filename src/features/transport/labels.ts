import type { TransportSubscriptionStatus } from './types'

export const transportStatusLabels: Record<TransportSubscriptionStatus, string> = {
  PENDING: 'En attente',
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  CANCELLED: 'Résilié',
}
