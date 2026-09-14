import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Plus, ShieldCheck } from 'lucide-react'
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
import { useDeleteGuardianMutation, useGuardiansQuery } from '@/features/guardians/api/guardians-api'
import { GuardianFormDialog } from '@/features/guardians/components/guardian-form-dialog'
import type { Guardian } from '@/features/guardians/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function GuardiansPage() {
  const { data: guardians, isLoading } = useGuardiansQuery()
  const [deleteGuardian] = useDeleteGuardianMutation()

  const [editing, setEditing] = useState<Guardian | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (guardian: Guardian) => {
    setEditing(guardian)
    setDialogOpen(true)
  }

  const handleDelete = async (guardian: Guardian) => {
    if (!window.confirm(`Supprimer "${guardian.firstName} ${guardian.lastName}" ?`)) return

    try {
      await deleteGuardian(guardian.id).unwrap()
      toast.success('Tuteur supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Tuteurs"
        description="Les tuteurs légaux et leurs élèves à charge."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau tuteur
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
          ) : !guardians?.length ? (
            <EmptyState
              icon={ShieldCheck}
              title="Aucun tuteur"
              description="Créez le premier tuteur et rattachez-le à un élève."
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
                {guardians.map((guardian) => (
                  <TableRow key={guardian.id}>
                    <TableCell className="font-medium">
                      {guardian.firstName} {guardian.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {guardian.phone ?? guardian.email ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guardian.studentGuardians.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Aucun</span>
                        ) : (
                          guardian.studentGuardians.map((link) => (
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
                          <DropdownMenuItem onClick={() => handleEdit(guardian)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(guardian)}>
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

      <GuardianFormDialog open={dialogOpen} onOpenChange={setDialogOpen} guardian={editing} />
    </>
  )
}
