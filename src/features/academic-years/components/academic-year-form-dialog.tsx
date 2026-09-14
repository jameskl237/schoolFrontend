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
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateAcademicYearMutation, useUpdateAcademicYearMutation } from '../api/academic-years-api'
import type { AcademicYear } from '../types'

interface AcademicYearFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: AcademicYear | null
}

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function AcademicYearFormDialog({ open, onOpenChange, year }: AcademicYearFormDialogProps) {
  const isEditing = Boolean(year)
  const [createYear, { isLoading: isCreating }] = useCreateAcademicYearMutation()
  const [updateYear, { isLoading: isUpdating }] = useUpdateAcademicYearMutation()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)

  useEffect(() => {
    if (!open) return

    setName(year?.name ?? '')
    setStartDate(year ? toDateInputValue(year.startDate) : '')
    setEndDate(year ? toDateInputValue(year.endDate) : '')
    setIsCurrent(year?.isCurrent ?? false)
  }, [open, year])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && year) {
        await updateYear({ id: year.id, name, startDate, endDate, isCurrent }).unwrap()
        toast.success('Année scolaire mise à jour')
      } else {
        await createYear({ name, startDate, endDate, isCurrent }).unwrap()
        toast.success('Année scolaire créée')
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
          <DialogTitle>{isEditing ? "Modifier l'année scolaire" : 'Nouvelle année scolaire'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Mettez à jour les dates ou le statut de cette année scolaire.'
              : 'Définissez le nom et les dates de la nouvelle année scolaire.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="2026-2027"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
            <span>
              Année scolaire actuelle
              <span className="block text-xs font-normal text-muted-foreground">
                Remplace automatiquement l&rsquo;année actuellement active.
              </span>
            </span>
            <Switch checked={isCurrent} onCheckedChange={setIsCurrent} />
          </label>

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
