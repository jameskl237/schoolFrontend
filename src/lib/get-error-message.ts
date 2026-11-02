import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import type { ApiErrorResponse } from '@/types/api'

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as { success: unknown }).success === false
  )
}

function firstFieldErrorMessage(details: unknown): string | null {
  if (typeof details !== 'object' || details === null) return null

  for (const value of Object.values(details as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0]
    }
  }

  return null
}

/**
 * The backend's AppError messages are in English (internal/log-facing convention).
 * User-facing French copy lives here, keyed by the stable `code`, so it applies
 * consistently everywhere this error can surface — not just on the login form.
 */
const ERROR_MESSAGES: Record<string, string> = {
  ESTABLISHMENT_NOT_FOUND: "Ce code établissement n'existe pas.",
  USER_NOT_IN_ESTABLISHMENT: "Aucun compte avec cet e-mail dans cet établissement.",
  USER_NOT_FOUND: "Aucun compte avec cet e-mail.",
  ESTABLISHMENT_REQUIRED:
    'Cet e-mail est utilisé dans plusieurs établissements : précisez le vôtre.',
  INVALID_PASSWORD: 'Mot de passe incorrect.',
  INVALID_CREDENTIALS: 'E-mail ou mot de passe incorrect.',
  ACCOUNT_DISABLED: 'Ce compte a été désactivé.',
  EMAIL_ALREADY_EXISTS: 'Cet e-mail est déjà utilisé pour cet établissement.',
  MISSING_REFRESH_TOKEN: 'Votre session a expiré. Veuillez vous reconnecter.',
  INVALID_REFRESH_TOKEN: 'Votre session a expiré. Veuillez vous reconnecter.',
  INVALID_TOKEN: 'Votre session a expiré. Veuillez vous reconnecter.',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page.',
  TOO_MANY_REQUESTS: 'Trop de tentatives. Réessayez dans quelques minutes.',
}

const FALLBACK_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string | null {
  if (!error) return null

  if ('status' in error) {
    if (!isApiErrorResponse(error.data)) return FALLBACK_MESSAGE

    const { code, message, details } = error.data.error

    // Zod validation errors carry the precise, already-French message in `details`
    const fieldMessage = firstFieldErrorMessage(details)
    if (fieldMessage) return fieldMessage

    return ERROR_MESSAGES[code] ?? message ?? FALLBACK_MESSAGE
  }

  return error.message ?? FALLBACK_MESSAGE
}
