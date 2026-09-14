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

import { useCreateClassroomMutation, useUpdateClassroomMutation } from '../api/classrooms-api'
import type { Classroom } from '../types'

interface ClassroomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: Classroom | null
}

export function ClassroomFormDialog({ open, onOpenChange, classroom }: ClassroomFormDialogProps) {
  const isEditing = Boolean(classroom)
  const [createClassroom, { isLoading: isCreating }] = useCreateClassroomMutation()
  const [updateClassroom, { isLoading: isUpdating }] = useUpdateClassroomMutation()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('')

  useEffect(() => {
    if (!open) return

    setName(classroom?.name ?? '')
    setCode(classroom?.code ?? '')
    setCapacity(classroom?.capacity != null ? String(classroom.capacity) : '')
  }, [open, classroom])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && classroom) {
        await updateClassroom({
          id: classroom.id,
          name,
          code,
          capacity: capacity ? Number(capacity) : null,
        }).unwrap()
        toast.success('Salle mise à jour')
      } else {
        await createClassroom({
          name,
          code,
          ...(capacity ? { capacity: Number(capacity) } : {}),
        }).unwrap()
        toast.success('Salle créée')
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
          <DialogTitle>{isEditing ? 'Modifier la salle' : 'Nouvelle salle de classe'}</DialogTitle>
          <DialogDescription>Les salles sont utilisées pour les emplois du temps.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Salle 12"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="S12"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="capacity">
              Capacité <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
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
