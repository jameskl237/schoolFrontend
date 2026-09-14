import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Plus, X } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateParentMutation, useUpdateParentMutation } from '../api/parents-api'
import { parentRelationLabels } from '../labels'
import type { Parent, ParentRelationType } from '../types'

interface ParentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: Parent | null
}

interface LinkRow {
  studentId: string
  relationType: ParentRelationType
  isPrimaryContact: boolean
}

export function ParentFormDialog({ open, onOpenChange, parent }: ParentFormDialogProps) {
  const isEditing = Boolean(parent)
  const { data: students } = useStudentsQuery()
  const [createParent, { isLoading: isCreating }] = useCreateParentMutation()
  const [updateParent, { isLoading: isUpdating }] = useUpdateParentMutation()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occupation, setOccupation] = useState('')
  const [address, setAddress] = useState('')
  const [links, setLinks] = useState<LinkRow[]>([])

  useEffect(() => {
    if (!open) return

    setFirstName(parent?.firstName ?? '')
    setLastName(parent?.lastName ?? '')
    setPhone(parent?.phone ?? '')
    setEmail(parent?.email ?? '')
    setOccupation(parent?.occupation ?? '')
    setAddress(parent?.address ?? '')
    setLinks(
      parent?.studentParents.map((link) => ({
        studentId: String(link.student.id),
        relationType: link.relationType,
        isPrimaryContact: link.isPrimaryContact,
      })) ?? [],
    )
  }, [open, parent])

  const addLink = () => {
    setLinks((current) => [...current, { studentId: '', relationType: 'FATHER', isPrimaryContact: false }])
  }

  const removeLink = (index: number) => {
    setLinks((current) => current.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, patch: Partial<LinkRow>) => {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validLinks = links
      .filter((link) => link.studentId)
      .map((link) => ({
        studentId: Number(link.studentId),
        relationType: link.relationType,
        isPrimaryContact: link.isPrimaryContact,
      }))

    const payload = {
      firstName,
      lastName,
      phone: phone || undefined,
      email: email || undefined,
      occupation: occupation || undefined,
      address: address || undefined,
      students: validLinks,
    }

    try {
      if (isEditing && parent) {
        await updateParent({ id: parent.id, ...payload }).unwrap()
        toast.success('Parent mis à jour')
      } else {
        await createParent(payload).unwrap()
        toast.success('Parent créé')
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
          <DialogTitle>{isEditing ? 'Modifier le parent' : 'Nouveau parent'}</DialogTitle>
          <DialogDescription>Coordonnées du parent et élèves dont il/elle est responsable.</DialogDescription>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="occupation">Profession</Label>
              <Input
                id="occupation"
                value={occupation}
                onChange={(event) => setOccupation(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
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
                  <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-lg border border-border p-2">
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
                      onValueChange={(value) => updateLink(index, { relationType: value as ParentRelationType })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>{(value: ParentRelationType) => parentRelationLabels[value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(parentRelationLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Switch
                        checked={link.isPrimaryContact}
                        onCheckedChange={(checked) => updateLink(index, { isPrimaryContact: checked })}
                      />
                      Principal
                    </label>

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
    </Dialog>
  )
}
