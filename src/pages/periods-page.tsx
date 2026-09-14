import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CalendarClock, MoreHorizontal, Plus } from 'lucide-react'
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
import { useDeletePeriodMutation, usePeriodsQuery } from '@/features/periods/api/periods-api'
import { PeriodFormDialog } from '@/features/periods/components/period-form-dialog'
import type { Period } from '@/features/periods/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function PeriodsPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const filterId = yearFilter === ALL ? undefined : Number(yearFilter)

  const { data: periods, isLoading } = usePeriodsQuery(filterId)
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('periods.manage')
  const [deletePeriod] = useDeletePeriodMutation()

  const [editing, setEditing] = useState<Period | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (period: Period) => {
    setEditing(period)
    setDialogOpen(true)
  }

  const handleDelete = async (period: Period) => {
    if (!window.confirm(`Supprimer la période "${period.name}" ?`)) return

    try {
      await deletePeriod(period.id).unwrap()
      toast.success('Période supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Périodes"
        description="Trimestres et semestres de chaque année scolaire."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvelle période
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
          ) : !periods?.length ? (
            <EmptyState
              icon={CalendarClock}
              title="Aucune période"
              description="Découpez l'année scolaire en trimestres ou semestres."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ordre</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Année scolaire</TableHead>
                  <TableHead>Du</TableHead>
                  <TableHead>Au</TableHead>
                  {canManage && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="tabular-nums text-muted-foreground">{period.order}</TableCell>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {period.academicYear.name}
                      {currentYear?.id === period.academicYearId && (
                        <Badge className="ml-2 bg-success/15 text-success">actuelle</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(period.startDate))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(period.endDate))}
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
                            <DropdownMenuItem onClick={() => handleEdit(period)}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(period)}>
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
          )}
        </Card>
      </Reveal>

      <PeriodFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        period={editing}
        defaultAcademicYearId={filterId ?? currentYear?.id}
      />
    </>
  )
}
