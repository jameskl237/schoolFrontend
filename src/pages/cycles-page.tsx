import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { GitBranch, MoreHorizontal, Plus } from 'lucide-react'
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
import { useCyclesQuery, useDeleteCycleMutation } from '@/features/cycles/api/cycles-api'
import { CycleFormDialog } from '@/features/cycles/components/cycle-form-dialog'
import type { Cycle } from '@/features/cycles/types'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

export function CyclesPage() {
  const { sections, sectionPath } = useSchoolStructure()
  const [sectionFilter, setSectionFilter] = useState(ALL)
  const filterId = sectionFilter === ALL ? undefined : Number(sectionFilter)

  const { data: cycles, isLoading } = useCyclesQuery(filterId)
  const [deleteCycle] = useDeleteCycleMutation()

  const [editing, setEditing] = useState<Cycle | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (cycle: Cycle) => {
    setEditing(cycle)
    setDialogOpen(true)
  }

  const handleDelete = async (cycle: Cycle) => {
    if (!window.confirm(`Supprimer le cycle "${cycle.name}" ? Les niveaux et classes associés seront aussi supprimés.`))
      return

    try {
      await deleteCycle(cycle.id).unwrap()
      toast.success('Cycle supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Cycles"
        description="Le regroupement pédagogique officiel (ex. Cycle 1 = SIL + CP) au sein d'une section."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau cycle
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={sectionFilter} onValueChange={(value) => setSectionFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => (value === ALL ? 'Toutes les sections' : sectionPath(Number(value)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les sections</SelectItem>
            {sections?.map((section) => (
              <SelectItem key={section.id} value={String(section.id)}>
                {sectionPath(section.id)}
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
          ) : !cycles?.length ? (
            <EmptyState
              icon={GitBranch}
              title="Aucun cycle"
              description="Créez un cycle au sein d'une section, par exemple Cycle 1."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">{cycle.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cycle.code}</TableCell>
                    <TableCell className="text-muted-foreground">{sectionPath(cycle.sectionId)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(cycle)}>Modifier</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(cycle)}>
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

      <CycleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cycle={editing}
        defaultSectionId={filterId}
      />
    </>
  )
}
