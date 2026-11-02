import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/auth-layout'
import { useRegisterMutation } from '@/features/auth/api/auth-api'
import type { RegisterRequest } from '@/features/auth/types'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ApiErrorResponse } from '@/types/api'

type FieldName = keyof RegisterRequest
type FieldErrors = Partial<Record<FieldName, string>>

// Mêmes règles que le backend (auth.dto.ts) : le serveur reste la référence,
// le client ne fait qu'éviter un aller-retour pour une erreur évidente.
const ESTABLISHMENT_CODE_REGEX = /^(PRI|SEC|MIX)-[A-Z]{3}-\d{3}$/
const PHONE_REGEX = /^(\+237)?[26]\d{8}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[\p{L}][\p{L}\p{M}' .-]*$/u

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (value: string) => value.length >= 8 },
  { label: 'Une minuscule', test: (value: string) => /[a-z]/.test(value) },
  { label: 'Une majuscule', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Un chiffre', test: (value: string) => /\d/.test(value) },
  { label: 'Un caractère spécial', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

const normalizePhone = (value: string) => value.replace(/[\s.-]/g, '')

function validate(values: RegisterRequest): FieldErrors {
  const errors: FieldErrors = {}

  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()

  if (!firstName) errors.firstName = 'Le prénom est obligatoire.'
  else if (!NAME_REGEX.test(firstName)) errors.firstName = 'Le prénom contient des caractères invalides.'

  if (!lastName) errors.lastName = 'Le nom est obligatoire.'
  else if (!NAME_REGEX.test(lastName)) errors.lastName = 'Le nom contient des caractères invalides.'

  if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Adresse e-mail invalide.'

  if (values.phone && !PHONE_REGEX.test(normalizePhone(values.phone))) {
    errors.phone = 'Numéro invalide (ex. +237 6XX XXX XXX).'
  }

  if (!ESTABLISHMENT_CODE_REGEX.test(values.establishmentCode.trim())) {
    errors.establishmentCode = 'Format attendu : TYPE-VILLE-000 (ex. SEC-YDE-014).'
  }

  if (!PASSWORD_RULES.every((rule) => rule.test(values.password))) {
    errors.password = 'Le mot de passe ne respecte pas toutes les règles.'
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
  }

  return errors
}

/** Erreurs de champ renvoyées par le serveur (Zod : `{ champ: [messages] }`). */
function readServerFieldErrors(error: unknown): FieldErrors {
  if (!error || typeof error !== 'object' || !('data' in error)) return {}

  const details = (error.data as ApiErrorResponse | undefined)?.error?.details

  if (!details || typeof details !== 'object') return {}

  const errors: FieldErrors = {}

  for (const [field, messages] of Object.entries(details as Record<string, unknown>)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      errors[field as FieldName] = messages[0]
    }
  }

  return errors
}

const EMPTY_FORM: RegisterRequest = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  establishmentCode: '',
  password: '',
  confirmPassword: '',
}

interface FieldProps {
  id: FieldName
  label: string
  error: string | undefined
  hint?: ReactNode
  children: ReactNode
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const [values, setValues] = useState<RegisterRequest>(EMPTY_FORM)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const serverErrors = readServerFieldErrors(error)
  // Une fois soumis, on revalide à chaque frappe pour que l'erreur disparaisse dès qu'elle est corrigée.
  const fieldErrors: FieldErrors = { ...serverErrors, ...(submitted ? validate(values) : clientErrors) }
  const hasFieldErrors = Object.keys(serverErrors).length > 0
  const errorMessage = hasFieldErrors ? null : getErrorMessage(error)

  const update = (field: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'establishmentCode' ? event.target.value.toUpperCase() : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
  }

  const inputProps = (field: FieldName) => ({
    id: field,
    name: field,
    value: values[field] ?? '',
    onChange: update(field),
    'aria-invalid': fieldErrors[field] ? true : undefined,
    'aria-describedby': fieldErrors[field] ? `${field}-error` : undefined,
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const errors = validate(values)
    setClientErrors(errors)

    if (Object.keys(errors).length > 0) return

    const phone = values.phone ? normalizePhone(values.phone) : ''

    register({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      establishmentCode: values.establishmentCode.trim(),
      ...(phone ? { phone } : {}),
    })
      .unwrap()
      .then(() => navigate('/', { replace: true }))
      .catch(() => {
        /* the error is already surfaced below via the `error` state */
      })
  }

  const PasswordToggleIcon = showPassword ? EyeOff : Eye

  return (
    <AuthLayout>
      <h1 className="text-center font-heading text-2xl font-semibold md:text-left">Créer un compte</h1>
      <p className="mt-1.5 text-center text-muted-foreground md:text-left">
        Inscrivez-vous avec le code fourni par votre établissement.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Inscription impossible</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="Prénom" error={fieldErrors.firstName}>
            <Input {...inputProps('firstName')} autoComplete="given-name" maxLength={100} required />
          </Field>

          <Field id="lastName" label="Nom" error={fieldErrors.lastName}>
            <Input {...inputProps('lastName')} autoComplete="family-name" maxLength={100} required />
          </Field>
        </div>

        <Field id="email" label="E-mail" error={fieldErrors.email}>
          <Input {...inputProps('email')} type="email" autoComplete="email" maxLength={191} required />
        </Field>

        <Field id="phone" label="Téléphone (facultatif)" error={fieldErrors.phone}>
          <Input {...inputProps('phone')} type="tel" autoComplete="tel" placeholder="+237 6XX XXX XXX" />
        </Field>

        <Field id="establishmentCode" label="Code établissement" error={fieldErrors.establishmentCode}>
          <Input
            {...inputProps('establishmentCode')}
            placeholder="SEC-YDE-014"
            autoComplete="off"
            spellCheck={false}
            maxLength={11}
            required
          />
        </Field>

        <Field id="password" label="Mot de passe" error={fieldErrors.password}>
          <div className="relative">
            <Input
              {...inputProps('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              maxLength={72}
              className="pr-9"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
            >
              <PasswordToggleIcon className="size-4" />
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs" aria-label="Règles du mot de passe">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(values.password)
              const Icon = ok ? Check : X
              return (
                <li
                  key={rule.label}
                  className={ok ? 'flex items-center gap-1 text-emerald-600 dark:text-emerald-400' : 'flex items-center gap-1 text-muted-foreground'}
                >
                  <Icon className="size-3" aria-hidden />
                  <span>{rule.label}</span>
                  <span className="sr-only">{ok ? ' (respectée)' : ' (non respectée)'}</span>
                </li>
              )
            })}
          </ul>
        </Field>

        <Field id="confirmPassword" label="Confirmer le mot de passe" error={fieldErrors.confirmPassword}>
          <Input
            {...inputProps('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            maxLength={72}
            required
          />
        </Field>

        <Button type="submit" disabled={isLoading} className="mt-2">
          {isLoading ? 'Inscription…' : "S'inscrire"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground md:text-left">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
