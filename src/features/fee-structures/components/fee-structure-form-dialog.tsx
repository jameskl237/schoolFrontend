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
import { useClassesQuery } from '@/features/classes/api/classes-api'
import { useFeeTypesQuery } from '@/features/fee-types/api/fee-types-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateFeeStructureMutation, useUpdateFeeStructureMutation } from '../api/fee-structures-api'
import type { FeeStructure } from '../types'

interface FeeStructureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeStructure: FeeStructure | null
}

const ALL_CLASSES = 'all'

export function FeeStructureFormDialog({ open, onOpenChange, feeStructure }: FeeStructureFormDialogProps) {
  const isEditing = Boolean(feeStructure)
  const { data: feeTypes } = useFeeTypesQuery()
  const { data: academicYears } = useAcademicYearsQuery()
  const { data: classes } = useClassesQuery(undefined)
  const { gradeLevelPath } = useSchoolStructure()
  const [createFeeStructure, { isLoading: isCreating }] = useCreateFeeStructureMutation()
  const [updateFeeStructure, { isLoading: isUpdating }] = useUpdateFeeStructureMutation()

  const [feeTypeId, setFeeTypeId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [classId, setClassId] = useState(ALL_CLASSES)
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!open) return

    setFeeTypeId(feeStructure ? String(feeStructure.feeTypeId) : '')
    setAcademicYearId(feeStructure ? String(feeStructure.academicYearId) : '')
    setClassId(feeStructure?.classId ? String(feeStructure.classId) : ALL_CLASSES)
    setAmount(feeStructure?.amount ?? '')
    setDueDate(feeStructure?.dueDate ? feeStructure.dueDate.slice(0, 10) : '')
  }, [open, feeStructure])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && feeStructure) {
        await updateFeeStructure({
          id: feeStructure.id,
          feeTypeId: Number(feeTypeId),
          academicYearId: Number(academicYearId),
          classId: classId === ALL_CLASSES ? null : Number(classId),
          amount: Number(amount),
          dueDate: dueDate || null,
        }).unwrap()
        toast.success('Frais mis à jour')
      } else {
        await createFeeStructure({
          feeTypeId: Number(feeTypeId),
          academicYearId: Number(academicYearId),
          amount: Number(amount),
          ...(classId !== ALL_CLASSES ? { classId: Number(classId) } : {}),
          ...(dueDate ? { dueDate } : {}),
        }).unwrap()
        toast.success('Frais créé')
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
          <DialogTitle>{isEditing ? 'Modifier le frais' : 'Nouveau frais'}</DialogTitle>
          <DialogDescription>Le montant à facturer pour un type de frais, sur une année scolaire.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="feeTypeId">Type de frais</Label>
            <Select value={feeTypeId} onValueChange={(value) => setFeeTypeId(value ?? '')}>
              <SelectTrigger id="feeTypeId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? feeTypes?.find((f) => String(f.id) === value)?.name : 'Choisir un type')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {feeTypes?.map((feeType) => (
                  <SelectItem key={feeType.id} value={String(feeType.id)}>
                    {feeType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="academicYearId">Année scolaire</Label>
            <Select value={academicYearId} onValueChange={(value) => setAcademicYearId(value ?? '')}>
              <SelectTrigger id="academicYearId" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value ? academicYears?.find((y) => String(y.id) === value)?.name : 'Choisir une année'
                  }
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

          <div className="grid gap-1.5">
            <Label htmlFor="classId">
              Classe <span className="font-normal text-muted-foreground">(optionnel — sinon s&rsquo;applique à tous)</span>
            </Label>
            <Select value={classId} onValueChange={(value) => setClassId(value ?? ALL_CLASSES)}>
              <SelectTrigger id="classId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (value === ALL_CLASSES) return 'Toutes les classes'
                    const klass = classes?.find((c) => String(c.id) === value)
                    return klass ? `${gradeLevelPath(klass.gradeLevelId)} · ${klass.name}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLASSES}>Toutes les classes</SelectItem>
                {classes?.map((klass) => (
                  <SelectItem key={klass.id} value={String(klass.id)}>
                    {gradeLevelPath(klass.gradeLevelId)} · {klass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="1"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dueDate">
                Échéance <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !feeTypeId || !academicYearId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
