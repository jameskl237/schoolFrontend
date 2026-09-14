import { ClipboardCheck, GraduationCap } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChildSelect } from '@/features/children/components/child-select'
import { useMyChildren } from '@/features/children/hooks/use-my-children'
import { useDisciplinesQuery } from '@/features/disciplines/api/disciplines-api'
import { sanctionTypeLabels } from '@/features/disciplines/labels'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const childLabel = (student: { firstName: string; lastName: string }) =>
  `${student.firstName} ${student.lastName}`

export function MyChildrenDisciplinePage() {
  const { children, isLoading: isLoadingChildren, selectedChild, selectedChildId, selectChild } =
    useMyChildren()

  const { data: records, isLoading: isLoadingRecords } = useDisciplinesQuery(
    selectedChild ? { studentId: selectedChild.id } : undefined,
    { skip: !selectedChild },
  )

  return (
    <>
      <PageHeader
        title="Discipline de mon enfant"
        description="Les mesures disciplinaires enregistrées par la vie scolaire."
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
        {isLoadingChildren || isLoadingRecords ? (
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
              description="Le suivi disciplinaire de l'enfant choisi s'affichera ici."
            />
          </Card>
        ) : !records?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={ClipboardCheck}
              title="Aucune mesure disciplinaire"
              description="Aucune mesure n'a été enregistrée pour cet enfant."
            />
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mesure</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Décision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {dateFormatter.format(new Date(record.date))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sanctionTypeLabels[record.type]}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">{record.reason}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.durationDays === null
                          ? '—'
                          : record.durationDays === 1
                            ? '1 jour'
                            : `${record.durationDays} jours`}
                      </TableCell>
                      <TableCell className="max-w-xs text-muted-foreground">
                        {record.description ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.issuedBy.firstName} {record.issuedBy.lastName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </Reveal>
    </>
  )
}