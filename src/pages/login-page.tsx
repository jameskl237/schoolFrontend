import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/auth-layout'
import { useLoginMutation } from '@/features/auth/api/auth-api'
import { getErrorMessage } from '@/lib/get-error-message'

export function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()
  const [establishmentCode, setEstablishmentCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    login({ establishmentCode, email, password })
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
          <Label htmlFor="establishmentCode">Code établissement</Label>
          <Input
            id="establishmentCode"
            type="text"
            placeholder="SEC-YDE-014"
            pattern="^(PRI|SEC|MIX)-[A-Z]{3}-\d{3}$"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            required
            value={establishmentCode}
            onChange={(event) => setEstablishmentCode(event.target.value.toUpperCase())}
          />
          <p className="text-xs text-muted-foreground">
            Fourni par votre établissement, format TYPE-VILLE-000.
          </p>
        </div>

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

        <Button type="submit" disabled={isLoading} className="mt-2">
          {isLoading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  )
}
