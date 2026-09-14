import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Layers3, MoreHorizontal, Plus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDeleteGradeLevelMutation, useGradeLevelsQuery } from '@/features/grade-levels/api/grade-levels-api'
import { GradeLevelFormDialog } from '@/features/grade-levels/components/grade-level-form-dialog'
import type { GradeLevel } from '@/features/grade-levels/types'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

export function GradeLevelsPage() {
  const { cycles, cyclePath } = useSchoolStructure()
  const [cycleFilter, setCycleFilter] = useState(ALL)
  const filterId = cycleFilter === ALL ? undefined : Number(cycleFilter)

  const { data: gradeLevels, isLoading } = useGradeLevelsQuery(filterId)
  const [deleteGradeLevel] = useDeleteGradeLevelMutation()

  const [editing, setEditing] = useState<GradeLevel | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (gradeLevel: GradeLevel) => {
    setEditing(gradeLevel)
    setDialogOpen(true)
  }

  const handleDelete = async (gradeLevel: GradeLevel) => {
    if (!window.confirm(`Supprimer le niveau "${gradeLevel.name}" ? Les classes associées seront aussi supprimées.`))
      return

    try {
      await deleteGradeLevel(gradeLevel.id).unwrap()
      toast.success('Niveau supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Niveaux (CP, CE1...)"
        description="Les années scolaires au sein d'un cycle."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau niveau
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={cycleFilter} onValueChange={(value) => setCycleFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => (value === ALL ? 'Tous les cycles' : cyclePath(Number(value)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les cycles</SelectItem>
            {cycles?.map((cycle) => (
              <SelectItem key={cycle.id} value={String(cycle.id)}>
                {cyclePath(cycle.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !gradeLevels?.length ? (
            <EmptyState
              icon={Layers3}
              title="Aucun niveau"
              description="Créez un niveau au sein d'un cycle, par exemple CP."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeLevels.map((gradeLevel) => (
                  <TableRow key={gradeLevel.id}>
                    <TableCell className="font-medium">{gradeLevel.name}</TableCell>
                    <TableCell className="text-muted-foreground">{gradeLevel.code}</TableCell>
                    <TableCell className="text-muted-foreground">{cyclePath(gradeLevel.cycleId)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(gradeLevel)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(gradeLevel)}>
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

      <GradeLevelFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        gradeLevel={editing}
        defaultCycleId={filterId}
      />
    </>
  )
}
