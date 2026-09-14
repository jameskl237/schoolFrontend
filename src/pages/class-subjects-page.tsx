import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Network, Plus } from 'lucide-react'
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
import {
  useClassSubjectsQuery,
  useDeleteClassSubjectMutation,
} from '@/features/class-subjects/api/class-subjects-api'
import { ClassSubjectFormDialog } from '@/features/class-subjects/components/class-subject-form-dialog'
import type { ClassSubject } from '@/features/class-subjects/types'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

export function ClassSubjectsPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const filterId = yearFilter === ALL ? undefined : Number(yearFilter)

  const { data: classSubjects, isLoading } = useClassSubjectsQuery({ academicYearId: filterId })
  const { gradeLevelPath } = useSchoolStructure()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('class-subjects.manage')
  const [deleteClassSubject] = useDeleteClassSubjectMutation()

  const [editing, setEditing] = useState<ClassSubject | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (classSubject: ClassSubject) => {
    setEditing(classSubject)
    setDialogOpen(true)
  }

  const handleDelete = async (classSubject: ClassSubject) => {
    if (
      !window.confirm(
        `Retirer "${classSubject.subject.name}" de la classe "${classSubject.class.name}" ?`,
      )
    )
      return

    try {
      await deleteClassSubject(classSubject.id).unwrap()
      toast.success('Affectation supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Affectations"
        description="Qui enseigne quelle matière, dans quelle classe."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvelle affectation
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
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !classSubjects?.length ? (
            <EmptyState
              icon={Network}
              title="Aucune affectation"
              description="Confiez une matière d'une classe à un enseignant."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classe</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead className="text-right">Coef.</TableHead>
                    <TableHead className="text-right">H/sem.</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSubjects.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {gradeLevelPath(item.class.gradeLevelId)} · {item.class.name}
                      </TableCell>
                      <TableCell>{item.subject.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.teacher.firstName} {item.teacher.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.academicYear.name}
                        {currentYear?.id === item.academicYearId && (
                          <Badge className="ml-2 bg-success/15 text-success">actuelle</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{item.coefficient}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {item.hoursPerWeek ?? '—'}
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
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item)}>
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

      <ClassSubjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classSubject={editing}
        defaultAcademicYearId={filterId ?? currentYear?.id}
      />
    </>
  )
}
