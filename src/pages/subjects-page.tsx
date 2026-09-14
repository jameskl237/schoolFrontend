import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { BookMarked, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
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
import { useDeleteSubjectMutation, useSubjectsQuery } from '@/features/subjects/api/subjects-api'
import { SubjectFormDialog } from '@/features/subjects/components/subject-form-dialog'
import type { Subject } from '@/features/subjects/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjectsQuery()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('subjects.manage')
  const [deleteSubject] = useDeleteSubjectMutation()

  const [editing, setEditing] = useState<Subject | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (subject: Subject) => {
    setEditing(subject)
    setDialogOpen(true)
  }

  const handleDelete = async (subject: Subject) => {
    if (!window.confirm(`Supprimer la matière "${subject.name}" ?`)) return

    try {
      await deleteSubject(subject.id).unwrap()
      toast.success('Matière supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Matières"
        description="Les matières enseignées dans votre établissement."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvelle matière
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
          ) : !subjects?.length ? (
            <EmptyState
              icon={BookMarked}
              title="Aucune matière"
              description="Ajoutez la première matière de votre établissement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  {canManage && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {subject.code}
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
                            <DropdownMenuItem onClick={() => handleEdit(subject)}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(subject)}>
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

      <SubjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} subject={editing} />
    </>
  )
}
