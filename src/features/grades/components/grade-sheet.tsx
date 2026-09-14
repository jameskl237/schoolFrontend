import { useEffect, useMemo, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Lock, Save, Unlock } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProfile } from '@/features/auth/hooks/use-profile'
import {
  useReopenEvaluationMutation,
  useValidateEvaluationMutation,
} from '@/features/evaluations/api/evaluations-api'
import { evaluationTypeLabels } from '@/features/evaluations/labels'
import type { Evaluation } from '@/features/evaluations/types'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useGradesQuery, useSaveGradesMutation } from '../api/grades-api'

interface GradeSheetProps {
  evaluation: Evaluation
}

interface RowState {
  studentId: number
  firstName: string
  lastName: string
  studentNumber: string
  score: string
  isAbsent: boolean
  comment: string
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export function GradeSheet({ evaluation }: GradeSheetProps) {
  const { teacherId } = useProfile()
  // L'effectif exact de la classe évaluée, pour l'année de l'affectation : c'est
  // le backend qui le borne, pas un filtre côté client.
  const { data: students, isLoading: studentsLoading } = useStudentsQuery({
    classId: evaluation.classSubject.class.id,
    academicYearId: evaluation.classSubject.academicYear.id,
  })
  const { data: grades, isLoading: gradesLoading } = useGradesQuery({ evaluationId: evaluation.id })
  const [saveGrades, { isLoading: isSaving }] = useSaveGradesMutation()
  const [validateEvaluation] = useValidateEvaluationMutation()
  const [reopenEvaluation] = useReopenEvaluationMutation()

  const isValidated = evaluation.validatedAt !== null
  const isOwner = teacherId !== null && evaluation.classSubject.teacherId === teacherId
  const isEditable = isOwner && !isValidated

  const [rows, setRows] = useState<RowState[]>([])

  /** L'effectif de la classe, complété par les notes déjà saisies. */
  const roster = useMemo(() => {
    const byStudentId = new Map(grades?.map((grade) => [grade.studentId, grade]))

    return (students ?? []).map((student) => {
      const grade = byStudentId.get(student.id)

      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        score: grade?.score != null ? String(grade.score) : '',
        isAbsent: grade?.isAbsent ?? false,
        comment: grade?.comment ?? '',
      }
    })
  }, [students, grades])

  useEffect(() => {
    setRows(roster)
  }, [roster])

  const updateRow = (studentId: number, patch: Partial<RowState>) => {
    setRows((current) =>
      current.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)),
    )
  }

  const run = async (action: Promise<unknown>, successMessage: string) => {
    try {
      await action
      toast.success(successMessage)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const handleSave = () => {
    const invalid = rows.find(
      (row) => row.score !== '' && (Number(row.score) < 0 || Number(row.score) > evaluation.maxScore),
    )

    if (invalid) {
      toast.error(`Les notes doivent être comprises entre 0 et ${evaluation.maxScore}.`)
      return
    }

    void run(
      saveGrades({
        evaluationId: evaluation.id,
        grades: rows.map((row) => ({
          studentId: row.studentId,
          score: row.isAbsent || row.score === '' ? null : Number(row.score),
          isAbsent: row.isAbsent,
          ...(row.comment ? { comment: row.comment } : {}),
        })),
      }).unwrap(),
      'Notes enregistrées',
    )
  }

  const average = useMemo(() => {
    const scores = rows
      .filter((row) => !row.isAbsent && row.score !== '')
      .map((row) => Number(row.score))

    if (scores.length === 0) return null

    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }, [rows])

  const isLoading = studentsLoading || gradesLoading

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="gap-1 border-b p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {evaluation.title}
              <Badge variant="secondary">{evaluationTypeLabels[evaluation.type]}</Badge>
              <Badge variant={isValidated ? 'default' : 'outline'}>
                {isValidated ? 'Validée' : 'En saisie'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {evaluation.classSubject.class.name} · {evaluation.classSubject.subject.name} —{' '}
              {evaluation.classSubject.academicYear.name} — {evaluation.period.name}
              {evaluation.sequence && ` · ${evaluation.sequence.name}`} —{' '}
              {dateFormatter.format(new Date(evaluation.date))} — barème /
              {evaluation.maxScore}, coefficient {evaluation.coefficient}
              {average !== null && ` — moyenne ${average.toFixed(2)}`}
            </CardDescription>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              {isEditable && (
                <>
                  <Button onClick={handleSave} disabled={isSaving || rows.length === 0}>
                    <Save />
                    {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      void run(validateEvaluation(evaluation.id).unwrap(), 'Notes validées')
                    }
                  >
                    <Lock />
                    Valider
                  </Button>
                </>
              )}
              {isValidated && (
                <Button
                  variant="outline"
                  onClick={() => void run(reopenEvaluation(evaluation.id).unwrap(), 'Saisie rouverte')}
                >
                  <Unlock />
                  Rouvrir
                </Button>
              )}
            </div>
          )}
        </div>

        {isValidated && (
          <p className="mt-1 text-xs text-muted-foreground">
            Ces notes sont validées : elles ne sont plus modifiables, y compris par l&rsquo;administration.
            {evaluation.validatedBy &&
              ` Validées par ${evaluation.validatedBy.firstName} ${evaluation.validatedBy.lastName}.`}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Save}
            title="Aucun élève dans cette classe"
            description="Inscrivez des élèves dans la classe pour pouvoir saisir des notes."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead className="w-32">Note</TableHead>
                  <TableHead className="w-24">Absent</TableHead>
                  <TableHead>Appréciation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell className="font-medium">
                      {row.firstName} {row.lastName}
                      <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
                        {row.studentNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditable ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max={evaluation.maxScore}
                            step="0.25"
                            className="w-20 tabular-nums"
                            disabled={row.isAbsent}
                            value={row.score}
                            onChange={(event) =>
                              updateRow(row.studentId, { score: event.target.value })
                            }
                            aria-label={`Note de ${row.firstName} ${row.lastName}`}
                          />
                          <span className="text-xs text-muted-foreground">/{evaluation.maxScore}</span>
                        </div>
                      ) : (
                        <span className="tabular-nums">
                          {row.isAbsent ? '—' : row.score === '' ? '—' : `${row.score}/${evaluation.maxScore}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditable ? (
                        <Switch
                          checked={row.isAbsent}
                          onCheckedChange={(checked) =>
                            updateRow(row.studentId, { isAbsent: checked, ...(checked ? { score: '' } : {}) })
                          }
                          aria-label={`Absent : ${row.firstName} ${row.lastName}`}
                        />
                      ) : row.isAbsent ? (
                        <Badge variant="outline">Absent</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditable ? (
                        <Input
                          value={row.comment}
                          placeholder="Optionnel"
                          onChange={(event) => updateRow(row.studentId, { comment: event.target.value })}
                          aria-label={`Appréciation de ${row.firstName} ${row.lastName}`}
                        />
                      ) : (
                        <span className="text-muted-foreground">{row.comment || '—'}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
