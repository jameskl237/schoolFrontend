import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Coins, MoreHorizontal, Plus } from 'lucide-react'
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
import {
  useDeleteFeeStructureMutation,
  useFeeStructuresQuery,
} from '@/features/fee-structures/api/fee-structures-api'
import { FeeStructureFormDialog } from '@/features/fee-structures/components/fee-structure-form-dialog'
import type { FeeStructure } from '@/features/fee-structures/types'
import { getErrorMessage } from '@/lib/get-error-message'

const amountFormatter = new Intl.NumberFormat('fr-FR')

export function FeeStructuresPage() {
  const { data: feeStructures, isLoading } = useFeeStructuresQuery(undefined)
  const [deleteFeeStructure] = useDeleteFeeStructureMutation()

  const [editing, setEditing] = useState<FeeStructure | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (feeStructure: FeeStructure) => {
    setEditing(feeStructure)
    setDialogOpen(true)
  }

  const handleDelete = async (feeStructure: FeeStructure) => {
    if (!window.confirm(`Supprimer ce frais "${feeStructure.feeType.name}" ?`)) return

    try {
      await deleteFeeStructure(feeStructure.id).unwrap()
      toast.success('Frais supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Frais"
        description="Les montants à facturer par type de frais et année scolaire."
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Nouveau frais
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
          ) : !feeStructures?.length ? (
            <EmptyState
              icon={Coins}
              title="Aucun frais défini"
              description="Créez un frais, par exemple Frais de scolarité pour l'année en cours."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Année scolaire</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructures.map((feeStructure) => (
                  <TableRow key={feeStructure.id}>
                    <TableCell className="font-medium">{feeStructure.feeType.name}</TableCell>
                    <TableCell className="text-muted-foreground">{feeStructure.academicYear.name}</TableCell>
                    <TableCell>
                      {feeStructure.class ? (
                        <Badge variant="secondary">{feeStructure.class.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Toutes</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {amountFormatter.format(Number(feeStructure.amount))} FCFA
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(feeStructure)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(feeStructure)}>
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

      <FeeStructureFormDialog open={dialogOpen} onOpenChange={setDialogOpen} feeStructure={editing} />
    </>
  )
}
