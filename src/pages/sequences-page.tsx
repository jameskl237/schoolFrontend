import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { ListOrdered, MoreHorizontal, Plus } from 'lucide-react'
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
import { useDeleteSequenceMutation, useSequencesQuery } from '@/features/sequences/api/sequences-api'
import { SequenceFormDialog } from '@/features/sequences/components/sequence-form-dialog'
import type { Sequence } from '@/features/sequences/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function SequencesPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const filterId = yearFilter === ALL ? undefined : Number(yearFilter)

  const { data: sequences, isLoading } = useSequencesQuery({ academicYearId: filterId })
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('periods.manage')
  const [deleteSequence] = useDeleteSequenceMutation()

  const [editing, setEditing] = useState<Sequence | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (sequence: Sequence) => {
    setEditing(sequence)
    setDialogOpen(true)
  }

  const handleDelete = async (sequence: Sequence) => {
    if (!window.confirm(`Supprimer la séquence "${sequence.name}" ?`)) return

    try {
      await deleteSequence(sequence.id).unwrap()
      toast.success('Séquence supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Séquences"
        description="Le découpage des trimestres en séquences d'évaluation."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvelle séquence
            </Button>
          )
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={yearFilter} onValueChange={(value) => setYearFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL ? 'Toutes les années' : academicYears?.find((y) => String(y.id) === value)?.name
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les années</SelectItem>
            {academicYears?.map((year) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !sequences?.length ? (
            <EmptyState
              icon={ListOrdered}
              title="Aucune séquence"
              description="Découpez chaque trimestre en séquences d'évaluation."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ordre</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Trimestre</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Du</TableHead>
                    <TableHead>Au</TableHead>
                    <TableHead className="text-right">Évaluations</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sequences.map((sequence) => (
                    <TableRow key={sequence.id}>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {sequence.order}
                      </TableCell>
                      <TableCell className="font-medium">{sequence.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sequence.period.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sequence.period.academicYear.name}
                        {currentYear?.id === sequence.period.academicYear.id && (
                          <Badge className="ml-2 bg-success/15 text-success">actuelle</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dateFormatter.format(new Date(sequence.startDate))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dateFormatter.format(new Date(sequence.endDate))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {sequence._count.evaluations}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(sequence)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(sequence)}
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </Reveal>

      <SequenceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} sequence={editing} />
    </>
  )
}
