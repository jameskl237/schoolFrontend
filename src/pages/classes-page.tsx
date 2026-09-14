import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { BookOpen, MoreHorizontal, Plus } from 'lucide-react'
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
import { useClassesQuery, useDeleteClassMutation } from '@/features/classes/api/classes-api'
import { ClassFormDialog } from '@/features/classes/components/class-form-dialog'
import type { SchoolClass } from '@/features/classes/types'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

export function ClassesPage() {
  const { gradeLevels, gradeLevelPath } = useSchoolStructure()
  const [gradeLevelFilter, setGradeLevelFilter] = useState(ALL)
  const filterId = gradeLevelFilter === ALL ? undefined : Number(gradeLevelFilter)

  const { data: classes, isLoading } = useClassesQuery(filterId)
  const [deleteClass] = useDeleteClassMutation()

  const [editing, setEditing] = useState<SchoolClass | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (schoolClass: SchoolClass) => {
    setEditing(schoolClass)
    setDialogOpen(true)
  }

  const handleDelete = async (schoolClass: SchoolClass) => {
    if (!window.confirm(`Supprimer la classe "${schoolClass.name}" ?`)) return

    try {
      await deleteClass(schoolClass.id).unwrap()
      toast.success('Classe supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Classes"
        description="Les classes accueillant les élèves, chacune avec sa salle."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouvelle classe
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={gradeLevelFilter} onValueChange={(value) => setGradeLevelFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => (value === ALL ? 'Tous les niveaux' : gradeLevelPath(Number(value)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les niveaux</SelectItem>
            {gradeLevels?.map((gradeLevel) => (
              <SelectItem key={gradeLevel.id} value={String(gradeLevel.id)}>
                {gradeLevelPath(gradeLevel.id)}
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
          ) : !classes?.length ? (
            <EmptyState
              icon={BookOpen}
              title="Aucune classe"
              description="Créez une classe au sein d'un niveau, par exemple CP1."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((schoolClass) => (
                  <TableRow key={schoolClass.id}>
                    <TableCell className="font-medium">{schoolClass.name}</TableCell>
                    <TableCell className="text-muted-foreground">{schoolClass.code}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {gradeLevelPath(schoolClass.gradeLevelId)}
                    </TableCell>
                    <TableCell>
                      {schoolClass.classroom ? (
                        <Badge variant="secondary">{schoolClass.classroom.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucune salle</span>
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
                          <DropdownMenuItem onClick={() => handleEdit(schoolClass)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(schoolClass)}>
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

      <ClassFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        schoolClass={editing}
        defaultGradeLevelId={filterId}
      />
    </>
  )
}
