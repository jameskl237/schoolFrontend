import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  ClipboardCheck,
  FileText,
  Loader2,
  Lock,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useProfile } from '@/features/auth/hooks/use-profile'
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import {
  useDeleteEvaluationMutation,
  useEvaluationsQuery,
  useRemoveExamPaperMutation,
  useReopenEvaluationMutation,
  useUploadExamPaperMutation,
  useValidateEvaluationMutation,
} from '@/features/evaluations/api/evaluations-api'
import { EvaluationFormDialog } from '@/features/evaluations/components/evaluation-form-dialog'
import { evaluationTypeLabels } from '@/features/evaluations/labels'
import type { Evaluation } from '@/features/evaluations/types'
import { usePeriodsQuery } from '@/features/periods/api/periods-api'
import { useSequencesQuery } from '@/features/sequences/api/sequences-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { openExamPaper } from '@/lib/open-exam-paper'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function EvaluationsPage() {
  const navigate = useNavigate()
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)
  const { hasPermission } = usePermissions()
  const { teacherId } = useProfile()
  const canManage = hasPermission('evaluations.manage')

  // L'année d'exercice pilote tout le reste : les classes tenues, les trimestres,
  // les séquences. Par défaut, l'année en cours.
  const [yearFilter, setYearFilter] = useState(ALL)
  const [classFilter, setClassFilter] = useState(ALL)
  const [periodFilter, setPeriodFilter] = useState(ALL)
  const [sequenceFilter, setSequenceFilter] = useState(ALL)

  const yearId = yearFilter === ALL ? currentYear?.id : Number(yearFilter)
  const classId = classFilter === ALL ? undefined : Number(classFilter)
  const periodId = periodFilter === ALL ? undefined : Number(periodFilter)
  const sequenceId = sequenceFilter === ALL ? undefined : Number(sequenceFilter)

  const { data: classSubjects } = useClassSubjectsQuery(
    yearId ? { academicYearId: yearId } : undefined,
  )
  const { data: periods } = usePeriodsQuery(yearId)
  const { data: sequences } = useSequencesQuery(yearId ? { academicYearId: yearId } : undefined)

  /** Les classes que l'utilisateur tient cette année-là, dédupliquées. */
  const classes = useMemo(() => {
    const unique = new Map<number, string>()

    for (const item of classSubjects ?? []) {
      unique.set(item.class.id, item.class.name)
    }

    return [...unique.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [classSubjects])

  const availableSequences = useMemo(
    () => (sequences ?? []).filter((sequence) => !periodId || sequence.periodId === periodId),
    [sequences, periodId],
  )

  const { data: evaluations, isLoading } = useEvaluationsQuery({
    ...(yearId ? { academicYearId: yearId } : {}),
    ...(classId ? { classId } : {}),
    ...(periodId ? { periodId } : {}),
    ...(sequenceId ? { sequenceId } : {}),
  })
  const [validateEvaluation] = useValidateEvaluationMutation()
  const [reopenEvaluation] = useReopenEvaluationMutation()
  const [deleteEvaluation] = useDeleteEvaluationMutation()
  const [uploadExamPaper] = useUploadExamPaperMutation()
  const [removeExamPaper] = useRemoveExamPaperMutation()

  const [editing, setEditing] = useState<Evaluation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Upload d'une épreuve PDF : un seul input caché, dont l'évaluation cible est
  // retenue au clic sur le bouton de la ligne.
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUpload, setPendingUpload] = useState<Evaluation | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  /** Seul l'enseignant de la matière agit sur l'évaluation — le backend l'impose aussi. */
  const isOwner = (evaluation: Evaluation) =>
    teacherId !== null && evaluation.classSubject.teacherId === teacherId

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (evaluation: Evaluation) => {
    setEditing(evaluation)
    setDialogOpen(true)
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

  const handleDelete = (evaluation: Evaluation) => {
    if (!window.confirm(`Supprimer l'évaluation "${evaluation.title}" et ses notes ?`)) return

    void run(deleteEvaluation(evaluation.id).unwrap(), 'Évaluation supprimée')
  }

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !pendingUpload) return

    const evaluation = pendingUpload
    setPendingUpload(null)
    setUploadingId(evaluation.id)

    try {
      await uploadExamPaper({ id: evaluation.id, file }).unwrap()
      toast.success('Épreuve mise en ligne')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    } finally {
      setUploadingId(null)
    }
  }

  const handleRemovePaper = (evaluation: Evaluation) => {
    const name = evaluation.examPaperName ?? 'cette épreuve'

    if (!window.confirm(`Retirer l'épreuve "${name}" de cette évaluation ?`)) return

    void run(removeExamPaper(evaluation.id).unwrap(), 'Épreuve retirée')
  }

  const handleViewPaper = (evaluation: Evaluation) => {
    void openExamPaper(evaluation.id, evaluation.examPaperName ?? 'exam-paper.pdf').catch((error) =>
      toast.error(getErrorMessage(error) ?? 'Impossible de consulter l\u2019épreuve.'),
    )
  }

  return (
    <>
      <PageHeader
        title="Évaluations"
        description="Devoirs et contrôles, et l'état de validation de leurs notes."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvelle évaluation
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select
          value={yearFilter}
          onValueChange={(value) => {
            setYearFilter(value ?? ALL)
            setClassFilter(ALL)
            setPeriodFilter(ALL)
            setSequenceFilter(ALL)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? `Année en cours${currentYear ? ` (${currentYear.name})` : ''}`
                  : (academicYears?.find((y) => String(y.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>
              Année en cours{currentYear ? ` (${currentYear.name})` : ''}
            </SelectItem>
            {academicYears?.map((year) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={(value) => setClassFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? 'Toutes mes classes'
                  : (classes.find((klass) => String(klass.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes mes classes</SelectItem>
            {classes.map((klass) => (
              <SelectItem key={klass.id} value={String(klass.id)}>
                {klass.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={periodFilter}
          onValueChange={(value) => {
            setPeriodFilter(value ?? ALL)
            setSequenceFilter(ALL)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? 'Tous les trimestres'
                  : (periods?.find((p) => String(p.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les trimestres</SelectItem>
            {periods?.map((period) => (
              <SelectItem key={period.id} value={String(period.id)}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sequenceFilter} onValueChange={(value) => setSequenceFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? 'Toutes les séquences'
                  : (availableSequences.find((s) => String(s.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les séquences</SelectItem>
            {availableSequences.map((sequence) => (
              <SelectItem key={sequence.id} value={String(sequence.id)}>
                {sequence.name} — {sequence.period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !evaluations?.length ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Aucune évaluation"
              description="Créez une évaluation dans l'une de vos matières."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intitulé</TableHead>
                    <TableHead>Classe · Matière</TableHead>
                    <TableHead>Trimestre · Séquence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Barème</TableHead>
                    <TableHead className="text-right">Notes</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Épreuve</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((evaluation) => {
                    const owner = isOwner(evaluation)
                    const validated = evaluation.validatedAt !== null

                    return (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">
                          {evaluation.title}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            {evaluationTypeLabels[evaluation.type]}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {evaluation.classSubject.class.name} · {evaluation.classSubject.subject.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {evaluation.period.name}
                          {evaluation.sequence && ` · ${evaluation.sequence.name}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {dateFormatter.format(new Date(evaluation.date))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          /{evaluation.maxScore}
                          <span className="ml-1 text-xs text-muted-foreground">
                            coef. {evaluation.coefficient}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {evaluation._count.grades}
                        </TableCell>
                        <TableCell>
                          <Badge variant={validated ? 'default' : 'outline'}>
                            {validated ? 'Validée' : 'En saisie'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {owner ? (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={
                                  evaluation.examPaperName
                                    ? 'Remplacer l\u2019épreuve'
                                    : 'Mettre en ligne l\u2019épreuve'
                                }
                                disabled={uploadingId === evaluation.id}
                                onClick={() => {
                                  setPendingUpload(evaluation)
                                  fileInputRef.current?.click()
                                }}
                              >
                                {uploadingId === evaluation.id ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  <Paperclip />
                                )}
                              </Button>
                              {evaluation.examPaperName && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto max-w-28 overflow-hidden p-0 text-ellipsis"
                                    title={evaluation.examPaperName}
                                    onClick={() => handleViewPaper(evaluation)}
                                  >
                                    <FileText />
                                    {evaluation.examPaperName}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label="Retirer l’épreuve"
                                    onClick={() => handleRemovePaper(evaluation)}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : evaluation.examPaperName ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto max-w-40 overflow-hidden p-0 text-ellipsis"
                              title={evaluation.examPaperName}
                              onClick={() => handleViewPaper(evaluation)}
                            >
                              <FileText />
                              {evaluation.examPaperName}
                            </Button>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/grades?evaluationId=${evaluation.id}`)}
                              >
                                <PenLine />
                                {owner && !validated ? 'Saisir les notes' : 'Voir les notes'}
                              </DropdownMenuItem>
                              {owner && !validated && (
                                <DropdownMenuItem onClick={() => handleEdit(evaluation)}>
                                  Modifier
                                </DropdownMenuItem>
                              )}
                              {owner && !validated && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    void run(
                                      validateEvaluation(evaluation.id).unwrap(),
                                      'Notes validées',
                                    )
                                  }
                                >
                                  <Lock />
                                  Valider les notes
                                </DropdownMenuItem>
                              )}
                              {owner && validated && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    void run(
                                      reopenEvaluation(evaluation.id).unwrap(),
                                      'Évaluation rouverte',
                                    )
                                  }
                                >
                                  <Unlock />
                                  Rouvrir la saisie
                                </DropdownMenuItem>
                              )}
                              {owner && !validated && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(evaluation)}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => void handleUploadFile(event)}
      />

      <EvaluationFormDialog open={dialogOpen} onOpenChange={setDialogOpen} evaluation={editing} />
    </>
  )
}
