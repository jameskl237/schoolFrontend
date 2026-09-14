import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CalendarRange, MoreHorizontal, Plus } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AcademicYearFormDialog } from '@/features/academic-years/components/academic-year-form-dialog'
import {
  useAcademicYearsQuery,
  useDeleteAcademicYearMutation,
  useUpdateAcademicYearMutation,
} from '@/features/academic-years/api/academic-years-api'
import type { AcademicYear } from '@/features/academic-years/types'
import { getErrorMessage } from '@/lib/get-error-message'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function AcademicYearsPage() {
  const { data: years, isLoading } = useAcademicYearsQuery()
  const [updateYear] = useUpdateAcademicYearMutation()
  const [deleteYear] = useDeleteAcademicYearMutation()

  const [editing, setEditing] = useState<AcademicYear | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (year: AcademicYear) => {
    setEditing(year)
    setDialogOpen(true)
  }

  const handleSetCurrent = async (year: AcademicYear) => {
    try {
      await updateYear({ id: year.id, isCurrent: true }).unwrap()
      toast.success(`"${year.name}" est maintenant l'année scolaire actuelle`)
    } catch (error) {
      toast.error(getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Action impossible.')
    }
  }

  const handleDelete = async (year: AcademicYear) => {
    if (!window.confirm(`Supprimer l'année scolaire "${year.name}" ?`)) return

    try {
      await deleteYear(year.id).unwrap()
      toast.success('Année scolaire supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Années scolaires"
        description="Gérez les années scolaires de votre établissement."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouvelle année
          </Button>
        }
      />

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !years?.length ? (
            <EmptyState
              icon={CalendarRange}
              title="Aucune année scolaire"
              description="Créez la première année scolaire de votre établissement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(year.startDate))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(year.endDate))}
                    </TableCell>
                    <TableCell>
                      {year.isCurrent ? (
                        <Badge className="bg-success/15 text-success">Actuelle</Badge>
                      ) : (
                        <Badge variant="outline">Archivée</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(year)}>Modifier</DropdownMenuItem>
                          {!year.isCurrent && (
                            <DropdownMenuItem onClick={() => handleSetCurrent(year)}>
                              Définir comme actuelle
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(year)}>
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Reveal>

      <AcademicYearFormDialog open={dialogOpen} onOpenChange={setDialogOpen} year={editing} />
    </>
  )
}
