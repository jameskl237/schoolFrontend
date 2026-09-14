import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { DoorOpen, MoreHorizontal, Plus } from 'lucide-react'
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
import { useClassroomsQuery, useDeleteClassroomMutation } from '@/features/classrooms/api/classrooms-api'
import { ClassroomFormDialog } from '@/features/classrooms/components/classroom-form-dialog'
import type { Classroom } from '@/features/classrooms/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function ClassroomsPage() {
  const { data: classrooms, isLoading } = useClassroomsQuery()
  const [deleteClassroom] = useDeleteClassroomMutation()

  const [editing, setEditing] = useState<Classroom | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (classroom: Classroom) => {
    setEditing(classroom)
    setDialogOpen(true)
  }

  const handleDelete = async (classroom: Classroom) => {
    if (!window.confirm(`Supprimer la salle "${classroom.name}" ?`)) return

    try {
      await deleteClassroom(classroom.id).unwrap()
      toast.success('Salle supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Salles de classe"
        description="Les espaces physiques disponibles pour les emplois du temps."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouvelle salle
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
          ) : !classrooms?.length ? (
            <EmptyState
              icon={DoorOpen}
              title="Aucune salle de classe"
              description="Créez la première salle de votre établissement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell className="text-muted-foreground">{classroom.code}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {classroom.capacity ?? '—'}
                    </TableCell>
                    <TableCell>
                      {classroom.class ? (
                        <Badge variant="secondary">{classroom.class.name}</Badge>
                      ) : (
                        <Badge className="bg-success/15 text-success">Libre</Badge>
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
                          <DropdownMenuItem onClick={() => handleEdit(classroom)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(classroom)}>
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

      <ClassroomFormDialog open={dialogOpen} onOpenChange={setDialogOpen} classroom={editing} />
    </>
  )
}
