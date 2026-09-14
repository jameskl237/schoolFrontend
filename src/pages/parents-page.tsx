import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Plus, Users2 } from 'lucide-react'
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
import { useDeleteParentMutation, useParentsQuery } from '@/features/parents/api/parents-api'
import { ParentFormDialog } from '@/features/parents/components/parent-form-dialog'
import type { Parent } from '@/features/parents/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function ParentsPage() {
  const { data: parents, isLoading } = useParentsQuery()
  const [deleteParent] = useDeleteParentMutation()

  const [editing, setEditing] = useState<Parent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (parent: Parent) => {
    setEditing(parent)
    setDialogOpen(true)
  }

  const handleDelete = async (parent: Parent) => {
    if (!window.confirm(`Supprimer "${parent.firstName} ${parent.lastName}" ?`)) return

    try {
      await deleteParent(parent.id).unwrap()
      toast.success('Parent supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Parents"
        description="Les parents et leurs élèves à charge."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau parent
          </Button>
        }
      />

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !parents?.length ? (
            <EmptyState
              icon={Users2}
              title="Aucun parent"
              description="Créez le premier parent et rattachez-le à un élève."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">
                      {parent.firstName} {parent.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parent.phone ?? parent.email ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {parent.studentParents.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Aucun</span>
                        ) : (
                          parent.studentParents.map((link) => (
                            <Badge key={link.student.id} variant="secondary">
                              {link.student.firstName} {link.student.lastName}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(parent)}>Modifier</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(parent)}>
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

      <ParentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} parent={editing} />
    </>
  )
}
