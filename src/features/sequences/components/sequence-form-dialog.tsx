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
import { usePeriodsQuery } from '@/features/periods/api/periods-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateSequenceMutation, useUpdateSequenceMutation } from '../api/sequences-api'
import type { Sequence } from '../types'

interface SequenceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sequence: Sequence | null
  defaultPeriodId?: number
}

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function SequenceFormDialog({
  open,
  onOpenChange,
  sequence,
  defaultPeriodId,
}: SequenceFormDialogProps) {
  const isEditing = Boolean(sequence)
  const { data: periods } = usePeriodsQuery(undefined)
  const [createSequence, { isLoading: isCreating }] = useCreateSequenceMutation()
  const [updateSequence, { isLoading: isUpdating }] = useUpdateSequenceMutation()

  const [periodId, setPeriodId] = useState('')
  const [name, setName] = useState('')
  const [order, setOrder] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!open) return

    setPeriodId(
      sequence ? String(sequence.periodId) : defaultPeriodId ? String(defaultPeriodId) : '',
    )
    setName(sequence?.name ?? '')
    setOrder(sequence ? String(sequence.order) : '1')
    setStartDate(sequence ? toDateInputValue(sequence.startDate) : '')
    setEndDate(sequence ? toDateInputValue(sequence.endDate) : '')
  }, [open, sequence, defaultPeriodId])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && sequence) {
        await updateSequence({
          id: sequence.id,
          name,
          order: Number(order),
          startDate,
          endDate,
        }).unwrap()
        toast.success('Séquence mise à jour')
      } else {
        await createSequence({
          periodId: Number(periodId),
          name,
          order: Number(order),
          startDate,
          endDate,
        }).unwrap()
        toast.success('Séquence créée')
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
          <DialogTitle>{isEditing ? 'Modifier la séquence' : 'Nouvelle séquence'}</DialogTitle>
          <DialogDescription>
            Le découpage d&rsquo;un trimestre : c&rsquo;est à une séquence que se rattachent les
            évaluations séquentielles.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="periodId">Trimestre</Label>
            <Select
              value={periodId}
              onValueChange={(value) => setPeriodId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="periodId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un trimestre'
                    const period = periods?.find((p) => String(p.id) === value)
                    return period ? `${period.name} — ${period.academicYear.name}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {periods?.map((period) => (
                  <SelectItem key={period.id} value={String(period.id)}>
                    {period.name} — {period.academicYear.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Séquence 1"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid w-24 gap-1.5">
              <Label htmlFor="order">Ordre</Label>
              <Input
                id="order"
                type="number"
                min="1"
                required
                value={order}
                onChange={(event) => setOrder(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Début</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate">Fin</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !periodId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
