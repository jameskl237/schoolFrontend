import { FileText, GraduationCap } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChildSelect } from '@/features/children/components/child-select'
import { useMyChildren } from '@/features/children/hooks/use-my-children'
import { useReportCardsQuery } from '@/features/report-cards/api/report-cards-api'

const childLabel = (student: { firstName: string; lastName: string }) =>
  `${student.firstName} ${student.lastName}`

export function MyChildrenReportCardsPage() {
  const { children, isLoading: isLoadingChildren, selectedChild, selectedChildId, selectChild } =
    useMyChildren()

  const { data: reportCards, isLoading: isLoadingReportCards } = useReportCardsQuery(
    selectedChild ? { studentId: selectedChild.id } : undefined,
    { skip: !selectedChild },
  )

  return (
    <>
      <PageHeader
        title="Bulletins de mon enfant"
        description="Les bulletins publiés par la scolarité, période par période."
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
        {isLoadingChildren || isLoadingReportCards ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : !selectedChild ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Sélectionnez un enfant"
              description="Les bulletins de l'enfant choisi s'afficheront ici."
            />
          </Card>
        ) : !reportCards?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={FileText}
              title="Aucun bulletin publié"
              description="Les bulletins apparaîtront ici une fois publiés par la scolarité."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {reportCards.map((reportCard) => (
              <Card key={reportCard.id} className="gap-0 overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <p className="font-medium">{reportCard.period.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {reportCard.period.academicYear.name}
                    </span>
                    <Badge variant="secondary">{reportCard.class.name}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {reportCard.rank !== null && (
                      <p className="text-muted-foreground">Rang : {reportCard.rank}e</p>
                    )}
                    {reportCard.generalAverage !== null && (
                      <p className="font-medium">
                        Moyenne :{' '}
                        <span className="tabular-nums">{reportCard.generalAverage.toFixed(2)}</span>
                        <span className="text-muted-foreground">/20</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matière</TableHead>
                        <TableHead className="text-right">Moyenne</TableHead>
                        <TableHead className="text-right">Coef.</TableHead>
                        <TableHead className="text-right">Rang</TableHead>
                        <TableHead>Appréciation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportCard.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">{line.subject.name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.average === null ? '—' : `${line.average.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {line.coefficient}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {line.rank === null ? '—' : `${line.rank}e`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {line.teacherComment ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
                  {reportCard.conduct && (
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Conduite
                      </p>
                      <p className="text-sm">{reportCard.conduct}</p>
                    </div>
                  )}
                  {reportCard.appreciation && (
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Appréciation du conseil
                      </p>
                      <p className="text-sm">{reportCard.appreciation}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Reveal>
    </>
  )
}