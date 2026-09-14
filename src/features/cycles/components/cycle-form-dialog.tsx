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

import { useCreateCycleMutation, useUpdateCycleMutation } from '../api/cycles-api'
import type { Cycle } from '../types'

interface CycleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycle: Cycle | null
  defaultSectionId?: number
}

export function CycleFormDialog({ open, onOpenChange, cycle, defaultSectionId }: CycleFormDialogProps) {
  const isEditing = Boolean(cycle)
  const { sections, sectionPath } = useSchoolStructure()
  const [createCycle, { isLoading: isCreating }] = useCreateCycleMutation()
  const [updateCycle, { isLoading: isUpdating }] = useUpdateCycleMutation()

  const [sectionId, setSectionId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) return

    setSectionId(String(cycle?.sectionId ?? defaultSectionId ?? ''))
    setName(cycle?.name ?? '')
    setCode(cycle?.code ?? '')
  }, [open, cycle, defaultSectionId])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && cycle) {
        await updateCycle({ id: cycle.id, sectionId: Number(sectionId), name, code }).unwrap()
        toast.success('Cycle mis à jour')
      } else {
        await createCycle({ sectionId: Number(sectionId), name, code }).unwrap()
        toast.success('Cycle créé')
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
          <DialogTitle>{isEditing ? 'Modifier le cycle' : 'Nouveau cycle'}</DialogTitle>
          <DialogDescription>
            Le regroupement pédagogique officiel (ex. Cycle 1 = SIL + CP) au sein d&rsquo;une section.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="sectionId">Section</Label>
            <Select value={sectionId} onValueChange={(value) => setSectionId(value ?? '')}>
              <SelectTrigger id="sectionId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? sectionPath(Number(value)) : 'Choisir une section')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections?.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {sectionPath(section.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Cycle d'initiation"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="C1"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !sectionId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
