import { useMemo, useState } from 'react'
import { FileText, GraduationCap } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useProfile } from '@/features/auth/hooks/use-profile'
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import { useEvaluationsQuery } from '@/features/evaluations/api/evaluations-api'
import { evaluationTypeLabels } from '@/features/evaluations/labels'
import { useGradesQuery } from '@/features/grades/api/grades-api'
import { GradeSheet } from '@/features/grades/components/grade-sheet'
import { useSequencesQuery } from '@/features/sequences/api/sequences-api'
import { getErrorMessage } from '@/lib/get-error-message'
import { openExamPaper } from '@/lib/open-exam-paper'
import { toast } from 'sonner'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

/** Vue élève : le relevé de ses propres notes, sans notion de feuille de saisie. */
function StudentGrades() {
  const { data: grades, isLoading } = useGradesQuery()

  const byPeriod = useMemo(() => {
    const groups = new Map<number, { name: string; grades: NonNullable<typeof grades> }>()

    for (const grade of grades ?? []) {
      const group = groups.get(grade.evaluation.period.id)

      if (group) {
        group.grades.push(grade)
      } else {
        groups.set(grade.evaluation.period.id, {
          name: grade.evaluation.period.name,
          grades: [grade],
        })
      }
    }

    return [...groups.values()]
  }, [grades])

  if (isLoading) {
    return (
      <Card className="gap-0 p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (!grades?.length) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <EmptyState
          icon={GraduationCap}
          title="Aucune note"
          description="Vos notes apparaîtront ici dès que vos enseignants les auront saisies."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {byPeriod.map((group) => {
        const scored = group.grades.filter((grade) => !grade.isAbsent && grade.score !== null)
        const average =
          scored.length > 0
            ? scored.reduce(
                (sum, grade) => sum + (grade.score as number) * (20 / grade.evaluation.maxScore),
                0,
              ) / scored.length
            : null

        return (
          <Card key={group.name} className="gap-0 overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <p className="font-medium">{group.name}</p>
              {average !== null && (
                <p className="text-sm text-muted-foreground">
                  Moyenne ramenée sur 20 : <span className="tabular-nums">{average.toFixed(2)}</span>
                </p>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
<TableRow>
                      <TableHead>Matière</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead>Séquence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Note</TableHead>
                      <TableHead className="text-right">Coef.</TableHead>
                      <TableHead>Appréciation</TableHead>
                      <TableHead>Épreuve</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">
                          {grade.evaluation.classSubject.subject.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {grade.evaluation.title}
                          <span className="ml-1.5 text-xs">
                            {evaluationTypeLabels[grade.evaluation.type]}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {grade.evaluation.sequence?.name ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {dateFormatter.format(new Date(grade.evaluation.date))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {grade.isAbsent ? (
                            <Badge variant="outline">Absent</Badge>
                          ) : grade.score === null ? (
                            '—'
                          ) : (
                            `${grade.score}/${grade.evaluation.maxScore}`
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {grade.evaluation.coefficient}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{grade.comment ?? '—'}</TableCell>
                        <TableCell>
                          {grade.evaluation.examPaperName ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto max-w-36 overflow-hidden p-0 text-ellipsis"
                              title={grade.evaluation.examPaperName}
                              onClick={() =>
                                void openExamPaper(
                                  grade.evaluation.id,
                                  grade.evaluation.examPaperName ?? 'exam-paper.pdf',
                                ).catch((error) =>
                                  toast.error(
                                    getErrorMessage(error) ?? 'Impossible de consulter l\u2019épreuve.',
                                  ),
                                )
                              }
                            >
                              <FileText />
                              {grade.evaluation.examPaperName}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

const ALL = 'all'

export function GradesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasPermission } = usePermissions()
  const { isStudent } = useProfile()
  // L'élève consulte un relevé ; les autres travaillent évaluation par évaluation.
  const showsOwnReport = isStudent && !hasPermission('grades.manage', 'students.view.all')

  const { data: academicYears } = useAcademicYearsQuery(undefined, { skip: showsOwnReport })
  const currentYear = academicYears?.find((year) => year.isCurrent)

  // On resserre par année, classe puis séquence avant de choisir l'évaluation :
  // sans cela, la liste mélange toutes les matières de toutes les années.
  const [yearFilter, setYearFilter] = useState(ALL)
  const [classFilter, setClassFilter] = useState(ALL)
  const [sequenceFilter, setSequenceFilter] = useState(ALL)

  const yearId = yearFilter === ALL ? currentYear?.id : Number(yearFilter)
  const classId = classFilter === ALL ? undefined : Number(classFilter)
  const sequenceId = sequenceFilter === ALL ? undefined : Number(sequenceFilter)

  const { data: classSubjects } = useClassSubjectsQuery(
    yearId ? { academicYearId: yearId } : undefined,
    { skip: showsOwnReport },
  )
  const { data: sequences } = useSequencesQuery(yearId ? { academicYearId: yearId } : undefined, {
    skip: showsOwnReport,
  })

  const classes = useMemo(() => {
    const unique = new Map<number, string>()

    for (const item of classSubjects ?? []) {
      unique.set(item.class.id, item.class.name)
    }

    return [...unique.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [classSubjects])

  const { data: evaluations, isLoading } = useEvaluationsQuery(
    {
      ...(yearId ? { academicYearId: yearId } : {}),
      ...(classId ? { classId } : {}),
      ...(sequenceId ? { sequenceId } : {}),
    },
    { skip: showsOwnReport },
  )

  const paramId = searchParams.get('evaluationId')
  const [fallbackId, setFallbackId] = useState('')
  const selectedId = paramId ?? fallbackId

  const selected = evaluations?.find((evaluation) => String(evaluation.id) === selectedId)

  const handleSelect = (value: string) => {
    setFallbackId(value)
    setSearchParams(value ? { evaluationId: value } : {}, { replace: true })
  }

  if (showsOwnReport) {
    return (
      <>
        <PageHeader title="Mes notes" description="Le relevé de vos notes, période par période." />
        <Reveal>
          <StudentGrades />
        </Reveal>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Notes"
        description="Choisissez une évaluation pour saisir ou consulter sa feuille de notes."
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <Select
          value={yearFilter}
          onValueChange={(value) => {
            setYearFilter(value ?? ALL)
            setClassFilter(ALL)
            setSequenceFilter(ALL)
            handleSelect('')
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

        <Select
          value={classFilter}
          onValueChange={(value) => {
            setClassFilter(value ?? ALL)
            handleSelect('')
          }}
        >
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
          value={sequenceFilter}
          onValueChange={(value) => {
            setSequenceFilter(value ?? ALL)
            handleSelect('')
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

      <div className="mb-4 max-w-xl">
        <Select value={selectedId} onValueChange={(value) => handleSelect(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => {
                if (!value) return 'Choisir une évaluation'
                const evaluation = evaluations?.find((item) => String(item.id) === value)
                return evaluation
                  ? `${evaluation.classSubject.class.name} · ${evaluation.classSubject.subject.name} — ${evaluation.title}`
                  : value
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {evaluations?.map((evaluation) => (
              <SelectItem key={evaluation.id} value={String(evaluation.id)}>
                {evaluation.classSubject.class.name} · {evaluation.classSubject.subject.name} —{' '}
                {evaluation.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        {isLoading ? (
          <Card className="gap-0 p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : !evaluations?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Aucune évaluation"
              description="Créez d'abord une évaluation pour pouvoir en saisir les notes."
            />
          </Card>
        ) : !selected ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Sélectionnez une évaluation"
              description="La feuille de notes de la classe s'affichera ici."
            />
          </Card>
        ) : (
          <GradeSheet evaluation={selected} />
        )}
      </Reveal>
    </>
  )
}
