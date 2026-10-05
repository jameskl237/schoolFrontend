import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { BookMarked, MoreHorizontal, Plus, Undo2 } from 'lucide-react'
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
import {
  useDeleteLoanMutation,
  useLoansQuery,
  useReturnLoanMutation,
} from '@/features/library/api/library-api'
import { LoanFormDialog } from '@/features/library/components/loan-form-dialog'
import { loanStatusLabels } from '@/features/library/labels'
import type { Loan, LoanStatus } from '@/features/library/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const statusVariant: Record<LoanStatus, 'default' | 'secondary' | 'outline'> = {
  ONGOING: 'default',
  RETURNED: 'secondary',
  OVERDUE: 'outline',
  LOST: 'outline',
}

export function LoansPage() {
  const [statusFilter, setStatusFilter] = useState(ALL)
  const { data: loans, isLoading } = useLoansQuery(
    statusFilter === ALL ? undefined : { status: statusFilter as LoanStatus },
  )
  const [returnLoan] = useReturnLoanMutation()
  const [deleteLoan] = useDeleteLoanMutation()
  const [dialogOpen, setDialogOpen] = useState(false)

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action
      toast.success(message)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const borrower = (loan: Loan) => {
    if (loan.student) return `${loan.student.firstName} ${loan.student.lastName}`
    if (loan.teacher) return `${loan.teacher.firstName} ${loan.teacher.lastName}`

    return '—'
  }

  /** Un prêt non rendu dont l'échéance est passée se signale de lui-même. */
  const isLate = (loan: Loan) =>
    loan.status === 'ONGOING' && new Date(loan.dueDate).getTime() < Date.now()

  return (
    <>
      <PageHeader
        title="Emprunts"
        description="Les prêts en cours et l'historique des retours."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus />
            Nouvel emprunt
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL ? 'Tous les statuts' : loanStatusLabels[value as LoanStatus]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les statuts</SelectItem>
            {Object.entries(loanStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !loans?.length ? (
            <EmptyState
              icon={BookMarked}
              title="Aucun emprunt"
              description="Enregistrez le premier prêt d'un exemplaire."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ouvrage</TableHead>
                    <TableHead>Exemplaire</TableHead>
                    <TableHead>Emprunteur</TableHead>
                    <TableHead>Prêté le</TableHead>
                    <TableHead>Retour prévu</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.bookCopy.book.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {loan.bookCopy.inventoryCode}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{borrower(loan)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {dateFormatter.format(new Date(loan.loanDate))}
                      </TableCell>
                      <TableCell className={isLate(loan) ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                        {dateFormatter.format(new Date(loan.dueDate))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[loan.status]}>
                          {isLate(loan) ? 'En retard' : loanStatusLabels[loan.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {loan.status !== 'RETURNED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  void run(returnLoan(loan.id).unwrap(), 'Retour enregistré')
                                }
                              >
                                <Undo2 />
                                Enregistrer le retour
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                if (!window.confirm('Supprimer cet emprunt ?')) return
                                void run(deleteLoan(loan.id).unwrap(), 'Emprunt supprimé')
                              }}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </Reveal>

      <LoanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
