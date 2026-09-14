import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Plus, Tag } from 'lucide-react'
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
import { useDeleteFeeTypeMutation, useFeeTypesQuery } from '@/features/fee-types/api/fee-types-api'
import { FeeTypeFormDialog } from '@/features/fee-types/components/fee-type-form-dialog'
import type { FeeType } from '@/features/fee-types/types'
import { getErrorMessage } from '@/lib/get-error-message'

export function FeeTypesPage() {
  const { data: feeTypes, isLoading } = useFeeTypesQuery()
  const [deleteFeeType] = useDeleteFeeTypeMutation()

  const [editing, setEditing] = useState<FeeType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (feeType: FeeType) => {
    setEditing(feeType)
    setDialogOpen(true)
  }

  const handleDelete = async (feeType: FeeType) => {
    if (!window.confirm(`Supprimer le type de frais "${feeType.name}" ?`)) return

    try {
      await deleteFeeType(feeType.id).unwrap()
      toast.success('Type de frais supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Types de frais"
        description="Le catalogue des catégories de frais de votre établissement."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau type
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
          ) : !feeTypes?.length ? (
            <EmptyState
              icon={Tag}
              title="Aucun type de frais"
              description="Créez un type de frais, par exemple Frais de scolarité."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeTypes.map((feeType) => (
                  <TableRow key={feeType.id}>
                    <TableCell className="font-medium">{feeType.name}</TableCell>
                    <TableCell className="text-muted-foreground">{feeType.description ?? '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(feeType)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(feeType)}>
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

      <FeeTypeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} feeType={editing} />
    </>
  )
}
