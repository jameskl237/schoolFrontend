import type { SanctionType } from './types'

export const sanctionTypeLabels: Record<SanctionType, string> = {
  WARNING: 'Avertissement',
  REPRIMAND: 'Blâme',
  DETENTION: 'Retenue',
  SUSPENSION: 'Exclusion temporaire',
  EXPULSION: 'Exclusion définitive',
}