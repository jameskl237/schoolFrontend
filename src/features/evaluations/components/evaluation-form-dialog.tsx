import { useEffect, useMemo, useState, type FormEvent } from 'react'
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
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import { usePeriodsQuery } from '@/features/periods/api/periods-api'
import { useSequencesQuery } from '@/features/sequences/api/sequences-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateEvaluationMutation, useUpdateEvaluationMutation } from '../api/evaluations-api'
import { evaluationTypeLabels } from '../labels'
import type { Evaluation, EvaluationType } from '../types'

interface EvaluationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: Evaluation | null
  /** Présélectionne la matière quand on part de l'atelier d'une classe. */
  defaultClassSubjectId?: number
}

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function EvaluationFormDialog({
  open,
  onOpenChange,
  evaluation,
  defaultClassSubjectId,
}: EvaluationFormDialogProps) {
  const isEditing = Boolean(evaluation)
  const { data: classSubjects } = useClassSubjectsQuery()
  const { data: periods } = usePeriodsQuery(undefined)
  const { data: sequences } = useSequencesQuery()
  const [createEvaluation, { isLoading: isCreating }] = useCreateEvaluationMutation()
  const [updateEvaluation, { isLoading: isUpdating }] = useUpdateEvaluationMutation()

  const [classSubjectId, setClassSubjectId] = useState('')
  const [periodId, setPeriodId] = useState('')
  const [sequenceId, setSequenceId] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EvaluationType>('HOMEWORK')
  const [date, setDate] = useState('')
  const [maxScore, setMaxScore] = useState('20')
  const [coefficient, setCoefficient] = useState('1')

  useEffect(() => {
    if (!open) return

    setClassSubjectId(
      evaluation
        ? String(evaluation.classSubjectId)
        : defaultClassSubjectId
          ? String(defaultClassSubjectId)
          : '',
    )
    setPeriodId(evaluation ? String(evaluation.periodId) : '')
    setSequenceId(evaluation?.sequenceId ? String(evaluation.sequenceId) : '')
    setTitle(evaluation?.title ?? '')
    setType(evaluation?.type ?? 'HOMEWORK')
    setDate(evaluation ? toDateInputValue(evaluation.date) : new Date().toISOString().slice(0, 10))
    setMaxScore(evaluation ? String(evaluation.maxScore) : '20')
    setCoefficient(evaluation ? String(evaluation.coefficient) : '1')
  }, [open, evaluation, defaultClassSubjectId])

  /** Les périodes de l'année de l'affectation choisie : une évaluation ne traverse pas les années. */
  const availablePeriods = useMemo(() => {
    const selected = classSubjects?.find((item) => String(item.id) === classSubjectId)
    if (!selected) return periods ?? []
    return (periods ?? []).filter((period) => period.academicYearId === selected.academicYearId)
  }, [classSubjects, classSubjectId, periods])

  /** Les séquences du trimestre choisi : une évaluation ne traverse pas les trimestres. */
  const availableSequences = useMemo(
    () => (sequences ?? []).filter((sequence) => String(sequence.periodId) === periodId),
    [sequences, periodId],
  )

  const classSubjectLabel = (id: number) => {
    const item = classSubjects?.find((cs) => cs.id === id)
    if (!item) return String(id)
    return `${item.class.name} · ${item.subject.name}`
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && evaluation) {
        await updateEvaluation({
          id: evaluation.id,
          periodId: Number(periodId),
          sequenceId: Number(sequenceId),
          title,
          type,
          date,
          maxScore: Number(maxScore),
          coefficient: Number(coefficient),
        }).unwrap()
        toast.success('Évaluation mise à jour')
      } else {
        await createEvaluation({
          classSubjectId: Number(classSubjectId),
          periodId: Number(periodId),
          sequenceId: Number(sequenceId),
          title,
          type,
          date,
          maxScore: Number(maxScore),
          coefficient: Number(coefficient),
        }).unwrap()
        toast.success('Évaluation créée')
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
          <DialogTitle>{isEditing ? "Modifier l'évaluation" : 'Nouvelle évaluation'}</DialogTitle>
          <DialogDescription>
            Vous ne pouvez créer une évaluation que dans les matières qui vous sont confiées.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="classSubjectId">Classe et matière</Label>
            <Select
              value={classSubjectId}
              onValueChange={(value) => setClassSubjectId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="classSubjectId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? classSubjectLabel(Number(value)) : 'Choisir une matière')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classSubjects?.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.class.name} · {item.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="periodId">Période</Label>
            <Select
              value={periodId}
              onValueChange={(value) => {
                setPeriodId(value ?? '')
                setSequenceId('')
              }}
            >
              <SelectTrigger id="periodId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une période'
                    const period = availablePeriods.find((p) => String(p.id) === value)
                    return period ? `${period.name} — ${period.academicYear.name}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availablePeriods.map((period) => (
                  <SelectItem key={period.id} value={String(period.id)}>
                    {period.name} — {period.academicYear.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sequenceId">Séquence</Label>
            <Select
              value={sequenceId}
              onValueChange={(value) => setSequenceId(value ?? '')}
              disabled={!periodId}
            >
              <SelectTrigger id="sequenceId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!periodId) return "Choisir d'abord une période"
                    if (!value) return 'Choisir une séquence'
                    return availableSequences.find((s) => String(s.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableSequences.map((sequence) => (
                  <SelectItem key={sequence.id} value={String(sequence.id)}>
                    {sequence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="title">Intitulé</Label>
            <Input
              id="title"
              placeholder="Devoir surveillé n°1"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as EvaluationType)}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue>{(value: EvaluationType) => evaluationTypeLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(evaluationTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="maxScore">Barème</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                step="1"
                required
                value={maxScore}
                onChange={(event) => setMaxScore(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                min="0.5"
                step="0.5"
                required
                value={coefficient}
                onChange={(event) => setCoefficient(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !periodId || !sequenceId || (!isEditing && !classSubjectId)}
            >
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
