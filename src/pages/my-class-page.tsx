import { useMemo, useState } from 'react'
import { ArrowLeft, ClipboardCheck, MessageSquareWarning, Plus, Star, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProfile } from '@/features/auth/hooks/use-profile'
import { SubjectReviewDialog } from '@/features/evaluation-reviews/components/subject-review-dialog'
import { useEvaluationsQuery } from '@/features/evaluations/api/evaluations-api'
import { EvaluationFormDialog } from '@/features/evaluations/components/evaluation-form-dialog'
import { evaluationTypeLabels } from '@/features/evaluations/labels'
import { GradeSheet } from '@/features/grades/components/grade-sheet'
import { useSequencesQuery } from '@/features/sequences/api/sequences-api'
import { useMyClassesQuery } from '@/features/teaching/api/teaching-api'
import type { TeachingSubject } from '@/features/teaching/types'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

export function MyClassPage() {
  const { classId } = useParams()
  const { teacherId } = useProfile()
  const { data, isLoading } = useMyClassesQuery(undefined)

  const klass = data?.classes.find((entry) => String(entry.id) === classId)
  const academicYear = data?.academicYear

  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [sequenceFilter, setSequenceFilter] = useState(ALL)
  const [evaluationId, setEvaluationId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [reviewSubject, setReviewSubject] = useState<TeachingSubject | null>(null)

  // La première matière est sélectionnée d'office : l'enseignant arrive sur son travail.
  const selectedSubject = useMemo(() => {
    if (!klass) return null

    return klass.mySubjects.find((s) => s.classSubjectId === subjectId) ?? klass.mySubjects[0] ?? null
  }, [klass, subjectId])

  const { data: sequences } = useSequencesQuery(
    academicYear ? { academicYearId: academicYear.id } : undefined,
    { skip: !academicYear },
  )

  const { data: evaluations, isLoading: evaluationsLoading } = useEvaluationsQuery(
    selectedSubject
      ? {
          classSubjectId: selectedSubject.classSubjectId,
          ...(sequenceFilter === ALL ? {} : { sequenceId: Number(sequenceFilter) }),
        }
      : undefined,
    { skip: !selectedSubject },
  )

  const selectedEvaluation = evaluations?.find((evaluation) => evaluation.id === evaluationId)

  /** Les matières de la classe dont je ne suis pas l'enseignant : je les vise, sans les saisir. */
  const subjectsToReview = useMemo(() => {
    if (!klass?.isMainTeacher) return []

    return klass.allSubjects.filter((subject) => subject.teacher.id !== teacherId)
  }, [klass, teacherId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!klass) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <EmptyState
          icon={Users}
          title="Classe introuvable"
          description="Cette classe ne fait pas partie de celles que vous tenez cette année."
        />
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title={klass.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {academicYear?.name} · {klass.studentCount} élève
              {klass.studentCount > 1 ? 's' : ''}
            </span>
            {klass.isMainTeacher && (
              <Badge className="gap-1 bg-success/15 text-success">
                <Star className="size-3" />
                Professeur principal
              </Badge>
            )}
          </span>
        }
        actions={
          <Button variant="outline" nativeButton={false} render={<Link to="/my-classes" />}>
            <ArrowLeft />
            Mes classes
          </Button>
        }
      />

      <div className="space-y-6">
        <Reveal>
          <Card className="gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">Mes matières dans cette classe</p>
              {selectedSubject && (
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus />
                  Nouvelle évaluation
                </Button>
              )}
            </div>

            {klass.mySubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Vous n&rsquo;enseignez aucune matière dans cette classe : vous n&rsquo;y saisissez
                donc pas de notes.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {klass.mySubjects.map((subject) => (
                  <Button
                    key={subject.classSubjectId}
                    type="button"
                    size="sm"
                    variant={
                      selectedSubject?.classSubjectId === subject.classSubjectId
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => {
                      setSubjectId(subject.classSubjectId)
                      setEvaluationId(null)
                    }}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </Reveal>

        {selectedSubject && (
          <Reveal>
            <Card className="gap-0 overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <p className="font-medium">Évaluations — {selectedSubject.name}</p>
                <div className="w-full max-w-56">
                  <Select
                    value={sequenceFilter}
                    onValueChange={(value) => {
                      setSequenceFilter(value ?? ALL)
                      setEvaluationId(null)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          value === ALL
                            ? 'Toutes les séquences'
                            : (sequences?.find((s) => String(s.id) === value)?.name ?? value)
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Toutes les séquences</SelectItem>
                      {sequences?.map((sequence) => (
                        <SelectItem key={sequence.id} value={String(sequence.id)}>
                          {sequence.name} — {sequence.period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {evaluationsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                  ))}
                </div>
              ) : !evaluations?.length ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="Aucune évaluation"
                  description="Créez une évaluation pour saisir les notes de cette matière."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Intitulé</TableHead>
                        <TableHead>Séquence</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Notes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-32" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluations.map((evaluation) => {
                        const review = evaluation.reviews[0]
                        const needsFix =
                          review?.decision === 'CHANGES_REQUESTED' && !review.resolvedAt

                        return (
                          <TableRow key={evaluation.id}>
                            <TableCell className="font-medium">
                              {evaluation.title}
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                {evaluationTypeLabels[evaluation.type]}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {evaluation.sequence?.name ?? evaluation.period.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {dateFormatter.format(new Date(evaluation.date))}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {evaluation._count.grades}
                            </TableCell>
                            <TableCell>
                              {needsFix ? (
                                <Badge variant="outline" className="gap-1">
                                  <MessageSquareWarning className="size-3" />À revoir
                                </Badge>
                              ) : (
                                <Badge variant={evaluation.validatedAt ? 'default' : 'outline'}>
                                  {evaluation.validatedAt ? 'Validée' : 'En saisie'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={evaluation.id === evaluationId ? 'default' : 'outline'}
                                onClick={() =>
                                  setEvaluationId(evaluation.id === evaluationId ? null : evaluation.id)
                                }
                              >
                                {evaluation.id === evaluationId ? 'Masquer' : 'Notes'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </Reveal>
        )}

        {selectedEvaluation && (
          <Reveal>
            <GradeSheet evaluation={selectedEvaluation} />
          </Reveal>
        )}

        {klass.isMainTeacher && subjectsToReview.length > 0 && (
          <Reveal>
            <Card className="gap-0 overflow-hidden p-0">
              <div className="border-b px-4 py-3">
                <p className="font-medium">Visa des autres matières</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  En tant que professeur principal, vous consultez et visez les notes de toute la
                  classe. Vous ne pouvez pas les saisir à la place de vos collègues.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matière</TableHead>
                      <TableHead>Enseignant</TableHead>
                      <TableHead className="text-right">Coef.</TableHead>
                      <TableHead className="w-32" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectsToReview.map((subject) => (
                      <TableRow key={subject.classSubjectId}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {subject.teacher.firstName} {subject.teacher.lastName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {subject.coefficient}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setReviewSubject(subject)}>
                            Examiner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </Reveal>
        )}
      </div>

      <EvaluationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        evaluation={null}
        defaultClassSubjectId={selectedSubject?.classSubjectId}
      />
      <SubjectReviewDialog
        open={reviewSubject !== null}
        onOpenChange={(open) => !open && setReviewSubject(null)}
        subject={reviewSubject}
        className={klass.name}
      />
    </>
  )
}
