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
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateSubjectMutation, useUpdateSubjectMutation } from '../api/subjects-api'
import type { Subject } from '../types'

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject | null
}

export function SubjectFormDialog({ open, onOpenChange, subject }: SubjectFormDialogProps) {
  const isEditing = Boolean(subject)
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation()
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) return

    setName(subject?.name ?? '')
    setCode(subject?.code ?? '')
  }, [open, subject])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && subject) {
        await updateSubject({ id: subject.id, name, code }).unwrap()
        toast.success('Matière mise à jour')
      } else {
        await createSubject({ name, code }).unwrap()
        toast.success('Matière créée')
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
          <DialogTitle>{isEditing ? 'Modifier la matière' : 'Nouvelle matière'}</DialogTitle>
          <DialogDescription>Le code identifie la matière de façon unique.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Mathématiques"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="MATH"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
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
