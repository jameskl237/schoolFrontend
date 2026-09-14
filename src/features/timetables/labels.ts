import type { DayOfWeek } from './types'

export const dayOfWeekLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
}

export const orderedDays: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

/**
 * Le backend renvoie une colonne TIME sérialisée en ISO sur l'époque UTC :
 * on n'en garde que les heures et minutes, sans conversion de fuseau.
 */
export const formatTime = (iso: string): string => {
  const match = /T(\d{2}):(\d{2})/.exec(iso)

  if (match) return `${match[1]}:${match[2]}`

  return iso.slice(0, 5)
}
