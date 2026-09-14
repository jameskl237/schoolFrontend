import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { ClipboardList, MoreHorizontal, Plus } from 'lucide-react'
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
import { useDeleteEnrollmentMutation, useEnrollmentsQuery } from '@/features/enrollments/api/enrollments-api'
import { EnrollmentFormDialog } from '@/features/enrollments/components/enrollment-form-dialog'
import { enrollmentStatusLabels } from '@/features/enrollments/labels'
import type { Enrollment } from '@/features/enrollments/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  GRADUATED: 'secondary',
  TRANSFERRED: 'outline',
  WITHDRAWN: 'outline',
  REPEATING: 'outline',
}

export function EnrollmentsPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const filterId = yearFilter === ALL ? undefined : Number(yearFilter)

  const { data: enrollments, isLoading } = useEnrollmentsQuery({ academicYearId: filterId })
  const [deleteEnrollment] = useDeleteEnrollmentMutation()

  const [editing, setEditing] = useState<Enrollment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (enrollment: Enrollment) => {
    setEditing(enrollment)
    setDialogOpen(true)
  }

  const handleDelete = async (enrollment: Enrollment) => {
    if (
      !window.confirm(
        `Retirer l'inscription de "${enrollment.student.firstName} ${enrollment.student.lastName}" ?`,
      )
    )
      return

    try {
      await deleteEnrollment(enrollment.id).unwrap()
      toast.success('Inscription supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Inscriptions"
        description="Les élèves inscrits dans une classe pour une année scolaire."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouvelle inscription
          </Button>
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
          ) : !enrollments?.length ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune inscription"
              description="Inscrivez un élève dans une classe pour commencer."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Année scolaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                      <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                        {enrollment.student.studentNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{enrollment.class.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {enrollment.academicYear.name}
                      {currentYear?.id === enrollment.academicYearId && (
                        <Badge className="ml-2 bg-success/15 text-success">actuelle</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[enrollment.status] ?? 'outline'}>
                        {enrollmentStatusLabels[enrollment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(enrollment)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(enrollment)}>
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

      <EnrollmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        enrollment={editing}
        defaultAcademicYearId={filterId ?? currentYear?.id}
      />
    </>
  )
}
