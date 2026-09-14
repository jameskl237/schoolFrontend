import type { GuardianRelationType } from './types'

export const guardianRelationLabels: Record<GuardianRelationType, string> = {
  LEGAL_GUARDIAN: 'Tuteur légal',
  GRANDPARENT: 'Grand-parent',
  UNCLE_AUNT: 'Oncle/Tante',
  SIBLING: 'Frère/Sœur',
  FAMILY_FRIEND: 'Proche de la famille',
  OTHER: 'Autre',
}
