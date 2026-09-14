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
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateGradeLevelMutation, useUpdateGradeLevelMutation } from '../api/grade-levels-api'
import type { GradeLevel } from '../types'

interface GradeLevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeLevel: GradeLevel | null
  defaultCycleId?: number
}

export function GradeLevelFormDialog({
  open,
  onOpenChange,
  gradeLevel,
  defaultCycleId,
}: GradeLevelFormDialogProps) {
  const isEditing = Boolean(gradeLevel)
  const { cycles, cyclePath } = useSchoolStructure()
  const [createGradeLevel, { isLoading: isCreating }] = useCreateGradeLevelMutation()
  const [updateGradeLevel, { isLoading: isUpdating }] = useUpdateGradeLevelMutation()

  const [cycleId, setCycleId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) return

    setCycleId(String(gradeLevel?.cycleId ?? defaultCycleId ?? ''))
    setName(gradeLevel?.name ?? '')
    setCode(gradeLevel?.code ?? '')
  }, [open, gradeLevel, defaultCycleId])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && gradeLevel) {
        await updateGradeLevel({ id: gradeLevel.id, cycleId: Number(cycleId), name, code }).unwrap()
        toast.success('Niveau mis à jour')
      } else {
        await createGradeLevel({ cycleId: Number(cycleId), name, code }).unwrap()
        toast.success('Niveau créé')
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
          <DialogTitle>{isEditing ? 'Modifier le niveau' : 'Nouveau niveau'}</DialogTitle>
          <DialogDescription>
            Le niveau/année (ex. CP, CE1) — regroupe les classes de cette année.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="cycleId">Cycle</Label>
            <Select value={cycleId} onValueChange={(value) => setCycleId(value ?? '')}>
              <SelectTrigger id="cycleId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? cyclePath(Number(value)) : 'Choisir un cycle')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cycles?.map((cycle) => (
                  <SelectItem key={cycle.id} value={String(cycle.id)}>
                    {cyclePath(cycle.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Cours préparatoire"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="CP"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !cycleId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
