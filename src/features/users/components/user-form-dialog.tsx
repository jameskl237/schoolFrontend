import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRolesQuery } from '@/features/roles/api/roles-api'
import { formatRoleName } from '@/lib/format-role-name'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateUserMutation, useUpdateUserMutation } from '../api/users-api'
import type { StaffUser } from '../types'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: StaffUser | null
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = Boolean(user)
  const { data: roles } = useRolesQuery()
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [roleIds, setRoleIds] = useState<number[]>([])

  useEffect(() => {
    if (!open) return

    setEmail(user?.email ?? '')
    setPassword('')
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    setPhone(user?.phone ?? '')
    setRoleIds(user?.roles.map((role) => role.id) ?? [])
  }, [open, user])

  const toggleRole = (roleId: number, checked: boolean) => {
    setRoleIds((current) => (checked ? [...current, roleId] : current.filter((id) => id !== roleId)))
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && user) {
        await updateUser({
          id: user.id,
          email,
          firstName,
          lastName,
          phone: phone || undefined,
          roleIds,
          ...(password ? { password } : {}),
        }).unwrap()
        toast.success('Utilisateur mis à jour')
      } else {
        await createUser({
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
          roleIds,
        }).unwrap()
        toast.success('Utilisateur créé')
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Mettez à jour les informations et les rôles de ce compte.'
              : 'Créez un compte et affectez-lui un ou plusieurs rôles.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">
              Mot de passe
              {isEditing && (
                <span className="font-normal text-muted-foreground"> (laisser vide pour ne pas changer)</span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              required={!isEditing}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>

          {roles && roles.length > 0 && (
            <div className="grid gap-2">
              <Label>Rôles</Label>
              <div className="grid gap-2.5 rounded-lg border border-border p-3">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{formatRoleName(role.name)}</span>
                    <Switch
                      checked={roleIds.includes(role.id)}
                      onCheckedChange={(checked) => toggleRole(role.id, checked)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
