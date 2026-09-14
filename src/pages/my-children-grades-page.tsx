import { useMemo } from 'react'
import { GraduationCap } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChildSelect } from '@/features/children/components/child-select'
import { useMyChildren } from '@/features/children/hooks/use-my-children'
import { evaluationTypeLabels } from '@/features/evaluations/labels'
import { useGradesQuery } from '@/features/grades/api/grades-api'
import type { Grade } from '@/features/grades/types'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const childLabel = (student: { firstName: string; lastName: string }) =>
  `${student.firstName} ${student.lastName}`

export function MyChildrenGradesPage() {
  const { children, isLoading: isLoadingChildren, selectedChild, selectedChildId, selectChild } =
    useMyChildren()

  const { data: grades, isLoading: isLoadingGrades } = useGradesQuery(
    selectedChild ? { studentId: selectedChild.id } : undefined,
    { skip: !selectedChild },
  )

  const byPeriod = useMemo(() => {
    const groups = new Map<number, { name: string; grades: Grade[] }>()

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

  return (
    <>
      <PageHeader
        title="Notes de mon enfant"
        description="Notes et moyennes par période, pour l'enfant sélectionné."
      />

      <div className="mb-4">
        <ChildSelect
          students={children}
          value={selectedChildId}
          onValueChange={selectChild}
          label={childLabel}
        />
      </div>

      <Reveal>
        {isLoadingChildren || isLoadingGrades ? (
          <Card className="gap-0 p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : !selectedChild ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Sélectionnez un enfant"
              description="Le relevé de notes de l'enfant choisi s'affichera ici."
            />
          </Card>
        ) : !grades?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Aucune note"
              description="Les notes de cet enfant apparaîtront ici dès qu'elles auront été saisies."
            />
          </Card>
        ) : (
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
                        Moyenne ramenée sur 20 :{' '}
                        <span className="tabular-nums">{average.toFixed(2)}</span>
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
                            <TableCell className="text-muted-foreground">
                              {grade.comment ?? '—'}
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
        )}
      </Reveal>
    </>
  )
}