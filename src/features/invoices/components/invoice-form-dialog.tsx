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
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { useFeeTypesQuery } from '@/features/fee-types/api/fee-types-api'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateInvoiceMutation } from '../api/invoices-api'

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAcademicYearId?: number
}

interface LineRow {
  feeTypeId: string
  amount: string
  description: string
}

const amountFormatter = new Intl.NumberFormat('fr-FR')

export function InvoiceFormDialog({ open, onOpenChange, defaultAcademicYearId }: InvoiceFormDialogProps) {
  const { data: students } = useStudentsQuery()
  const { data: academicYears } = useAcademicYearsQuery()
  const { data: feeTypes } = useFeeTypesQuery()
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation()

  const [studentId, setStudentId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [lines, setLines] = useState<LineRow[]>([{ feeTypeId: '', amount: '', description: '' }])

  useEffect(() => {
    if (!open) return

    setStudentId('')
    setAcademicYearId(defaultAcademicYearId ? String(defaultAcademicYearId) : '')
    setDueDate('')
    setLines([{ feeTypeId: '', amount: '', description: '' }])
  }, [open, defaultAcademicYearId])

  const addLine = () => setLines((current) => [...current, { feeTypeId: '', amount: '', description: '' }])
  const removeLine = (index: number) => setLines((current) => current.filter((_, i) => i !== index))
  const updateLine = (index: number, patch: Partial<LineRow>) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))

  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validLines = lines
      .filter((line) => line.feeTypeId && line.amount)
      .map((line) => ({
        feeTypeId: Number(line.feeTypeId),
        amount: Number(line.amount),
        description: line.description || undefined,
      }))

    if (validLines.length === 0) {
      toast.error('Ajoutez au moins une ligne de facturation.')
      return
    }

    try {
      await createInvoice({
        studentId: Number(studentId),
        academicYearId: Number(academicYearId),
        dueDate,
        lines: validLines,
      }).unwrap()
      toast.success('Facture créée')
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
          <DialogTitle>Nouvelle facture</DialogTitle>
          <DialogDescription>Émettre une facture pour un élève, composée d&rsquo;une ou plusieurs lignes.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="studentId">Élève</Label>
            <Select value={studentId} onValueChange={(value) => setStudentId(value ?? '')}>
              <SelectTrigger id="studentId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un élève'
                    const student = students?.find((s) => String(s.id) === value)
                    return student ? `${student.firstName} ${student.lastName}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.firstName} {student.lastName} ({student.studentNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="academicYearId">Année scolaire</Label>
              <Select value={academicYearId} onValueChange={(value) => setAcademicYearId(value ?? '')}>
                <SelectTrigger id="academicYearId" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value ? academicYears?.find((y) => String(y.id) === value)?.name : 'Choisir'
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
              <Label htmlFor="dueDate">Échéance</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Lignes de facturation</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus />
                Ajouter une ligne
              </Button>
            </div>

            <div className="grid gap-2">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_auto] items-center gap-2">
                  <Select
                    value={line.feeTypeId}
                    onValueChange={(value) => updateLine(index, { feeTypeId: value ?? '' })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => {
                          if (!value) return 'Type de frais'
                          return feeTypes?.find((f) => String(f.id) === value)?.name ?? value
                        }}
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

                  <Input
                    type="number"
                    min={0}
                    placeholder="Montant"
                    value={line.amount}
                    onChange={(event) => updateLine(index, { amount: event.target.value })}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Retirer la ligne"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-right text-sm font-medium">
              Total : <span className="tabular-nums">{amountFormatter.format(total)} FCFA</span>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !studentId || !academicYearId || !dueDate}>
              {isLoading ? 'Création…' : 'Créer la facture'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
