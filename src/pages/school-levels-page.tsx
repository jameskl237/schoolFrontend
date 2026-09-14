import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Layers, MoreHorizontal, Plus } from 'lucide-react'
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
import { useDeleteSchoolLevelMutation, useSchoolLevelsQuery } from '@/features/school-levels/api/school-levels-api'
import { SchoolLevelFormDialog } from '@/features/school-levels/components/school-level-form-dialog'
import { schoolLevelTypeLabels } from '@/features/school-levels/labels'
import type { SchoolLevel } from '@/features/school-levels/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function SchoolLevelsPage() {
  const { data: levels, isLoading } = useSchoolLevelsQuery()
  const [deleteLevel] = useDeleteSchoolLevelMutation()

  const [editing, setEditing] = useState<SchoolLevel | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (level: SchoolLevel) => {
    setEditing(level)
    setDialogOpen(true)
  }

  const handleDelete = async (level: SchoolLevel) => {
    if (!window.confirm(`Supprimer le niveau "${level.name}" ? Les cycles et classes associés seront aussi supprimés.`))
      return

    try {
      await deleteLevel(level.id).unwrap()
      toast.success('Niveau scolaire supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Niveaux scolaires"
        description="La structure de base de votre établissement (ex. Primaire, Collège)."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau niveau
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
          ) : !levels?.length ? (
            <EmptyState
              icon={Layers}
              title="Aucun niveau scolaire"
              description="Créez le premier niveau de votre établissement, par exemple Primaire."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{schoolLevelTypeLabels[level.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(level)}>Modifier</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(level)}>
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

      <SchoolLevelFormDialog open={dialogOpen} onOpenChange={setDialogOpen} level={editing} />
    </>
  )
}
