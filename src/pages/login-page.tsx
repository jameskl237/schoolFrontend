import { useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthLayout } from '@/components/layout/auth-layout'
import { useLoginMutation } from '@/features/auth/api/auth-api'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ApiErrorResponse } from '@/types/api'

interface EstablishmentChoice {
  code: string
  name: string
}

/**
 * Le backend ne réclame l'établissement que si les mêmes identifiants en ouvrent
 * plusieurs. On récupère alors la liste qu'il renvoie pour la faire choisir.
 */
function readEstablishmentChoices(
  error: FetchBaseQueryError | SerializedError | undefined,
): EstablishmentChoice[] | null {
  if (!error || !('status' in error)) return null

  const body = error.data as ApiErrorResponse | undefined

  if (body?.error?.code !== 'ESTABLISHMENT_REQUIRED') return null

  const details = body.error.details as { establishments?: EstablishmentChoice[] } | undefined

  return details?.establishments ?? null
}

export function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [establishmentCode, setEstablishmentCode] = useState('')

  const choices = readEstablishmentChoices(error)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    login({ email, password, ...(establishmentCode ? { establishmentCode } : {}) })
      .unwrap()
      .then(() => navigate('/', { replace: true }))
      .catch(() => {
        /* the error is already surfaced below via the `error` state */
      })
  }

  const errorMessage = getErrorMessage(error)

  return (
    <AuthLayout>
      <h1 className="text-center font-heading text-2xl font-semibold md:text-left">Connexion</h1>
      <p className="mt-1.5 text-center text-muted-foreground md:text-left">
        Accédez à l&rsquo;espace de gestion de votre établissement.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Connexion impossible</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {choices && choices.length > 0 && (
          <div className="grid gap-1.5">
            <Label htmlFor="establishmentChoice">Votre établissement</Label>
            <Select
              value={establishmentCode}
              onValueChange={(value) => setEstablishmentCode(value ?? '')}
            >
              <SelectTrigger id="establishmentChoice" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value
                      ? (choices.find((choice) => choice.code === value)?.name ?? value)
                      : 'Choisir votre établissement'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {choices.map((choice) => (
                  <SelectItem key={choice.code} value={choice.code}>
                    {choice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="mt-2">
          {isLoading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  )
}
