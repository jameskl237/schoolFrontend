import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CreditCard, FileText, MoreHorizontal, Plus } from 'lucide-react'
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
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { useDeleteInvoiceMutation, useInvoicesQuery } from '@/features/invoices/api/invoices-api'
import { InvoiceFormDialog } from '@/features/invoices/components/invoice-form-dialog'
import { invoiceStatusLabels } from '@/features/invoices/labels'
import type { Invoice, InvoiceStatus } from '@/features/invoices/types'
import { PaymentFormDialog } from '@/features/payments/components/payment-form-dialog'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'
const amountFormatter = new Intl.NumberFormat('fr-FR')
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const statusVariant: Record<InvoiceStatus, 'default' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  PARTIALLY_PAID: 'secondary',
  PAID: 'default',
  OVERDUE: 'outline',
  CANCELLED: 'outline',
}

export function InvoicesPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const filterId = yearFilter === ALL ? undefined : Number(yearFilter)

  const { data: invoices, isLoading } = useInvoicesQuery({ academicYearId: filterId })
  const [deleteInvoice] = useDeleteInvoiceMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)

  const handleDelete = async (invoice: Invoice) => {
    if (!window.confirm(`Supprimer la facture de "${invoice.student.firstName} ${invoice.student.lastName}" ?`))
      return

    try {
      await deleteInvoice(invoice.id).unwrap()
      toast.success('Facture supprimée')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Factures"
        description="Les factures émises et leur état de paiement."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nouvelle facture
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={yearFilter} onValueChange={(value) => setYearFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL ? 'Toutes les années' : academicYears?.find((y) => String(y.id) === value)?.name
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les années</SelectItem>
            {academicYears?.map((year) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !invoices?.length ? (
            <EmptyState
              icon={FileText}
              title="Aucune facture"
              description="Créez la première facture pour un élève."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Année scolaire</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Payé / Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
                  const total = Number(invoice.totalAmount)

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.student.firstName} {invoice.student.lastName}
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                          {invoice.student.studentNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.academicYear.name}
                        {currentYear?.id === invoice.academicYearId && (
                          <Badge className="ml-2 bg-success/15 text-success">actuelle</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dateFormatter.format(new Date(invoice.dueDate))}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {amountFormatter.format(paid)} / {amountFormatter.format(total)} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[invoice.status]}>{invoiceStatusLabels[invoice.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                              <DropdownMenuItem onClick={() => setPayingInvoice(invoice)}>
                                <CreditCard />
                                Enregistrer un paiement
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(invoice)}>
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </Reveal>

      <InvoiceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultAcademicYearId={filterId ?? currentYear?.id}
      />
      <PaymentFormDialog
        open={payingInvoice !== null}
        onOpenChange={(open) => !open && setPayingInvoice(null)}
        invoice={payingInvoice}
      />
    </>
  )
}
