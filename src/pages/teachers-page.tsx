import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Plus, Presentation } from 'lucide-react'
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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useDeleteTeacherMutation, useTeachersQuery } from '@/features/teachers/api/teachers-api'
import { TeacherFormDialog } from '@/features/teachers/components/teacher-form-dialog'
import type { Teacher } from '@/features/teachers/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function TeachersPage() {
  const { data: teachers, isLoading } = useTeachersQuery()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('teachers.manage')
  const [deleteTeacher] = useDeleteTeacherMutation()

  const [editing, setEditing] = useState<Teacher | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (teacher: Teacher) => {
    setEditing(teacher)
    setDialogOpen(true)
  }

  const handleDelete = async (teacher: Teacher) => {
    if (!window.confirm(`Supprimer l'enseignant "${teacher.firstName} ${teacher.lastName}" ?`)) return

    try {
      await deleteTeacher(teacher.id).unwrap()
      toast.success('Enseignant supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Enseignants"
        description="Le corps enseignant et les matières qui lui sont confiées."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvel enseignant
            </Button>
          )
        }
      />

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !teachers?.length ? (
            <EmptyState
              icon={Presentation}
              title="Aucun enseignant"
              description="Enregistrez le premier enseignant de votre établissement."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Affectations</TableHead>
                    <TableHead>Compte</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                        {teacher.specialty && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            {teacher.specialty}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {teacher.employeeNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher.phone ?? teacher.email ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher.classSubjects.length === 0
                          ? '—'
                          : `${teacher.classSubjects.length} matière(s) · ${
                              new Set(teacher.classSubjects.map((a) => a.class.id)).size
                            } classe(s)`}
                      </TableCell>
                      <TableCell>
                        {teacher.user ? (
                          <Badge variant={teacher.user.isActive ? 'default' : 'outline'}>
                            {teacher.user.isActive ? 'Actif' : 'Désactivé'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non rattaché</Badge>
                        )}
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
                              <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(teacher)}
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

      <TeacherFormDialog open={dialogOpen} onOpenChange={setDialogOpen} teacher={editing} />
    </>
  )
}
