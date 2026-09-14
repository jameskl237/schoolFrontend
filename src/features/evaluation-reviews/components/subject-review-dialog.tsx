import { useEffect, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CheckCircle2, MessageSquareWarning } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEvaluationsQuery } from '@/features/evaluations/api/evaluations-api'
import { useGradesQuery } from '@/features/grades/api/grades-api'
import type { TeachingSubject } from '@/features/teaching/types'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateEvaluationReviewMutation } from '../api/evaluation-reviews-api'

interface SubjectReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: TeachingSubject | null
  className: string
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

/**
 * Le professeur principal examine les notes d'une matière de sa classe : il les
 * consulte, puis vise ou demande une correction. Il ne peut rien y modifier —
 * la saisie appartient à l'enseignant de la matière.
 */
export function SubjectReviewDialog({
  open,
  onOpenChange,
  subject,
  className,
}: SubjectReviewDialogProps) {
  const { data: evaluations, isLoading } = useEvaluationsQuery(
    subject ? { classSubjectId: subject.classSubjectId } : undefined,
    { skip: !subject || !open },
  )
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: grades } = useGradesQuery(selectedId ? { evaluationId: selectedId } : undefined, {
    skip: selectedId === null,
  })
  const [createReview, { isLoading: isSubmitting }] = useCreateEvaluationReviewMutation()
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!open) return

    setSelectedId(null)
    setComment('')
  }, [open, subject])

  const selected = evaluations?.find((evaluation) => evaluation.id === selectedId)

  const submit = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!selected) return

    if (decision === 'CHANGES_REQUESTED' && !comment.trim()) {
      toast.error('Précisez ce qui doit être revu.')
      return
    }

    try {
      await createReview({
        evaluationId: selected.id,
        decision,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }).unwrap()
      toast.success(
        decision === 'APPROVED' ? 'Notes visées' : "Correction demandée, l'enseignant est notifié",
      )
      setComment('')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const average = (() => {
    const scored = (grades ?? []).filter((grade) => !grade.isAbsent && grade.score !== null)

    if (scored.length === 0) return null

    return scored.reduce((sum, grade) => sum + (grade.score as number), 0) / scored.length
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {subject?.name} — {className}
          </DialogTitle>
          <DialogDescription>
            Enseignée par {subject?.teacher.firstName} {subject?.teacher.lastName}. Vous consultez
            ces notes et les visez ; vous ne pouvez pas les modifier.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        ) : !evaluations?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune évaluation saisie dans cette matière.
          </p>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Évaluations</Label>
              <div className="flex flex-wrap gap-2">
                {evaluations.map((evaluation) => {
                  const lastReview = evaluation.reviews[0]

                  return (
                    <Button
                      key={evaluation.id}
                      type="button"
                      size="sm"
                      variant={evaluation.id === selectedId ? 'default' : 'outline'}
                      onClick={() => setSelectedId(evaluation.id)}
                    >
                      {evaluation.sequence?.name ?? evaluation.period.name} · {evaluation.title}
                      {lastReview && !lastReview.resolvedAt && lastReview.decision === 'CHANGES_REQUESTED' && (
                        <MessageSquareWarning className="size-3.5" />
                      )}
                      {lastReview?.decision === 'APPROVED' && <CheckCircle2 className="size-3.5" />}
                    </Button>
                  )
                })}
              </div>
            </div>

            {selected && (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={selected.validatedAt ? 'default' : 'outline'}>
                    {selected.validatedAt ? 'Validée par l’enseignant' : 'En saisie'}
                  </Badge>
                  <span>
                    {selected._count.grades} note(s) sur /{selected.maxScore}
                    {average !== null && ` — moyenne ${average.toFixed(2)}`}
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élève</TableHead>
                        <TableHead className="text-right">Note</TableHead>
                        <TableHead>Appréciation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(grades ?? []).map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.student.firstName} {grade.student.lastName}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {grade.isAbsent
                              ? 'Absent'
                              : grade.score === null
                                ? '—'
                                : `${grade.score}/${selected.maxScore}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {grade.comment ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selected.reviews.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Dernier visa :{' '}
                    {selected.reviews[0]!.decision === 'APPROVED'
                      ? 'notes visées'
                      : 'correction demandée'}{' '}
                    le {dateFormatter.format(new Date(selected.reviews[0]!.createdAt))}
                    {selected.reviews[0]!.comment && ` — « ${selected.reviews[0]!.comment} »`}
                    {selected.reviews[0]!.resolvedAt && ' (traité)'}
                  </p>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="reviewComment">
                    Avis{' '}
                    <span className="font-normal text-muted-foreground">
                      (obligatoire pour demander une correction)
                    </span>
                  </Label>
                  <Input
                    id="reviewComment"
                    placeholder="Deux notes semblent inversées…"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!selected || isSubmitting}
            onClick={() => void submit('CHANGES_REQUESTED')}
          >
            <MessageSquareWarning />
            Demander une correction
          </Button>
          <Button type="button" disabled={!selected || isSubmitting} onClick={() => void submit('APPROVED')}>
            <CheckCircle2 />
            Viser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
