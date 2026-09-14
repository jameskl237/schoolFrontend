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
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreatePeriodMutation, useUpdatePeriodMutation } from '../api/periods-api'
import type { Period } from '../types'

interface PeriodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period: Period | null
  defaultAcademicYearId?: number
}

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function PeriodFormDialog({
  open,
  onOpenChange,
  period,
  defaultAcademicYearId,
}: PeriodFormDialogProps) {
  const isEditing = Boolean(period)
  const { data: academicYears } = useAcademicYearsQuery()
  const [createPeriod, { isLoading: isCreating }] = useCreatePeriodMutation()
  const [updatePeriod, { isLoading: isUpdating }] = useUpdatePeriodMutation()

  const [academicYearId, setAcademicYearId] = useState('')
  const [name, setName] = useState('')
  const [order, setOrder] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (!open) return

    setAcademicYearId(
      period
        ? String(period.academicYearId)
        : defaultAcademicYearId
          ? String(defaultAcademicYearId)
          : '',
    )
    setName(period?.name ?? '')
    setOrder(period ? String(period.order) : '1')
    setStartDate(period ? toDateInputValue(period.startDate) : '')
    setEndDate(period ? toDateInputValue(period.endDate) : '')
  }, [open, period, defaultAcademicYearId])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && period) {
        await updatePeriod({
          id: period.id,
          name,
          order: Number(order),
          startDate,
          endDate,
        }).unwrap()
        toast.success('Période mise à jour')
      } else {
        await createPeriod({
          academicYearId: Number(academicYearId),
          name,
          order: Number(order),
          startDate,
          endDate,
        }).unwrap()
        toast.success('Période créée')
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
          <DialogTitle>{isEditing ? 'Modifier la période' : 'Nouvelle période'}</DialogTitle>
          <DialogDescription>
            Trimestre ou semestre : c&rsquo;est à une période que se rattachent les évaluations.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="academicYearId">Année scolaire</Label>
            <Select
              value={academicYearId}
              onValueChange={(value) => setAcademicYearId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="academicYearId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une année'
                    return academicYears?.find((y) => String(y.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.name}
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
                placeholder="1er trimestre"
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
            <Button type="submit" disabled={isLoading || !academicYearId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
