import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { CredentialsDialog, type AccountCredentials } from '@/components/credentials-dialog'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateGuardianMutation, useUpdateGuardianMutation } from '../api/guardians-api'
import { guardianRelationLabels } from '../labels'
import type { Guardian, GuardianRelationType } from '../types'

interface GuardianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guardian: Guardian | null
}

interface LinkRow {
  studentId: string
  relationType: GuardianRelationType
  isFinanciallyResponsible: boolean
  canPickup: boolean
}

export function GuardianFormDialog({ open, onOpenChange, guardian }: GuardianFormDialogProps) {
  const isEditing = Boolean(guardian)
  const { data: students } = useStudentsQuery()
  const [createGuardian, { isLoading: isCreating }] = useCreateGuardianMutation()
  const [updateGuardian, { isLoading: isUpdating }] = useUpdateGuardianMutation()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [links, setLinks] = useState<LinkRow[]>([])

  useEffect(() => {
    if (!open) return

    setFirstName(guardian?.firstName ?? '')
    setLastName(guardian?.lastName ?? '')
    setPhone(guardian?.phone ?? '')
    setEmail(guardian?.email ?? '')
    setAddress(guardian?.address ?? '')
    setLinks(
      guardian?.studentGuardians.map((link) => ({
        studentId: String(link.student.id),
        relationType: link.relationType,
        isFinanciallyResponsible: link.isFinanciallyResponsible,
        canPickup: link.canPickup,
      })) ?? [],
    )
  }, [open, guardian])

  const addLink = () => {
    setLinks((current) => [
      ...current,
      { studentId: '', relationType: 'LEGAL_GUARDIAN', isFinanciallyResponsible: false, canPickup: true },
    ])
  }

  const removeLink = (index: number) => {
    setLinks((current) => current.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, patch: Partial<LinkRow>) => {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  const isLoading = isCreating || isUpdating
  const [createdAccount, setCreatedAccount] = useState<AccountCredentials | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validLinks = links
      .filter((link) => link.studentId)
      .map((link) => ({
        studentId: Number(link.studentId),
        relationType: link.relationType,
        isFinanciallyResponsible: link.isFinanciallyResponsible,
        canPickup: link.canPickup,
      }))

    const payload = {
      firstName,
      lastName,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      students: validLinks,
    }

    try {
      if (isEditing && guardian) {
        await updateGuardian({ id: guardian.id, ...payload }).unwrap()
        toast.success('Tuteur mis à jour')
      } else {
        const result = await createGuardian(payload).unwrap()
        toast.success('Tuteur créé')

        if (result.account) {
          setCreatedAccount(result.account)
        }
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le tuteur' : 'Nouveau tuteur'}</DialogTitle>
          <DialogDescription>Coordonnées du tuteur et élèves dont il/elle a la charge.</DialogDescription>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Élèves</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus />
                Ajouter un élève
              </Button>
            </div>

            {links.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun élève rattaché pour l&rsquo;instant.</p>
            ) : (
              <div className="grid gap-2">
                {links.map((link, index) => (
                  <div key={index} className="grid gap-2 rounded-lg border border-border p-2">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                      <Select
                        value={link.studentId}
                        onValueChange={(value) => updateLink(index, { studentId: value ?? '' })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: string) => {
                              if (!value) return 'Élève'
                              const student = students?.find((s) => String(s.id) === value)
                              return student ? `${student.firstName} ${student.lastName}` : value
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {students?.map((student) => (
                            <SelectItem key={student.id} value={String(student.id)}>
                              {student.firstName} {student.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={link.relationType}
                        onValueChange={(value) =>
                          updateLink(index, { relationType: value as GuardianRelationType })
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue>
                            {(value: GuardianRelationType) => guardianRelationLabels[value]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(guardianRelationLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Retirer"
                        onClick={() => removeLink(index)}
                      >
                        <X />
                      </Button>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={link.isFinanciallyResponsible}
                          onCheckedChange={(checked) => updateLink(index, { isFinanciallyResponsible: checked })}
                        />
                        Responsable financier
                      </label>
                      <label className="flex items-center gap-1.5">
                        <Switch
                          checked={link.canPickup}
                          onCheckedChange={(checked) => updateLink(index, { canPickup: checked })}
                        />
                        Peut récupérer l&rsquo;élève
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

      <CredentialsDialog
        credentials={createdAccount}
        onClose={() => setCreatedAccount(null)}
        title="Compte tuteur créé"
        personName={`${firstName} ${lastName}`}
      />
    </Dialog>
  )
}
