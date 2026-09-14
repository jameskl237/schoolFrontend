import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Languages, MoreHorizontal, Plus } from 'lucide-react'
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
import { useSchoolLevelsQuery } from '@/features/school-levels/api/school-levels-api'
import { useDeleteSectionMutation, useSectionsQuery } from '@/features/sections/api/sections-api'
import { SectionFormDialog } from '@/features/sections/components/section-form-dialog'
import { sectionLanguageLabels } from '@/features/sections/labels'
import type { Section } from '@/features/sections/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function SectionsPage() {
  const { data: schoolLevels } = useSchoolLevelsQuery()
  const { data: sections, isLoading } = useSectionsQuery(undefined)
  const [deleteSection] = useDeleteSectionMutation()

  const [editing, setEditing] = useState<Section | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const levelNameById = new Map(schoolLevels?.map((level) => [level.id, level.name]))

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (section: Section) => {
    setEditing(section)
    setDialogOpen(true)
  }

  const handleDelete = async (section: Section) => {
    if (!window.confirm(`Supprimer la section "${section.name}" ? Les cycles et classes associés seront aussi supprimés.`))
      return

    try {
      await deleteSection(section.id).unwrap()
      toast.success('Section supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Sections"
        description="Les sous-systèmes francophone et anglophone de votre établissement."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouvelle section
          </Button>
        }
      />

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !sections?.length ? (
            <EmptyState
              icon={Languages}
              title="Aucune section"
              description="Créez une section (francophone ou anglophone) au sein d'un niveau scolaire."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Niveau scolaire</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sectionLanguageLabels[section.language]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {levelNameById.get(section.schoolLevelId) ?? '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(section)}>Modifier</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(section)}>
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

      <SectionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} section={editing} />
    </>
  )
}
