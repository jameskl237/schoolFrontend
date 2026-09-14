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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateSchoolLevelMutation, useUpdateSchoolLevelMutation } from '../api/school-levels-api'
import { schoolLevelTypeLabels } from '../labels'
import type { SchoolLevel, SchoolLevelType } from '../types'

interface SchoolLevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: SchoolLevel | null
}

export function SchoolLevelFormDialog({ open, onOpenChange, level }: SchoolLevelFormDialogProps) {
  const isEditing = Boolean(level)
  const [createLevel, { isLoading: isCreating }] = useCreateSchoolLevelMutation()
  const [updateLevel, { isLoading: isUpdating }] = useUpdateSchoolLevelMutation()

  const [name, setName] = useState('')
  const [type, setType] = useState<SchoolLevelType>('PRIMARY')

  useEffect(() => {
    if (!open) return

    setName(level?.name ?? '')
    setType(level?.type ?? 'PRIMARY')
  }, [open, level])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && level) {
        await updateLevel({ id: level.id, name, type }).unwrap()
        toast.success('Niveau scolaire mis à jour')
      } else {
        await createLevel({ name, type }).unwrap()
        toast.success('Niveau scolaire créé')
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
          <DialogTitle>{isEditing ? 'Modifier le niveau scolaire' : 'Nouveau niveau scolaire'}</DialogTitle>
          <DialogDescription>
            Un niveau scolaire regroupe des cycles (ex. Primaire regroupe CP, CE, CM).
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Primaire"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as SchoolLevelType)}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue>{(value: SchoolLevelType) => schoolLevelTypeLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(schoolLevelTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
