import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Invoice, PaymentMethod } from '@/features/invoices/types'
import { paymentMethodLabels } from '@/features/invoices/labels'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreatePaymentMutation } from '../api/payments-api'

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

const amountFormatter = new Intl.NumberFormat('fr-FR')

export function PaymentFormDialog({ open, onOpenChange, invoice }: PaymentFormDialogProps) {
  const [createPayment, { isLoading }] = useCreatePaymentMutation()

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [reference, setReference] = useState('')

  const paid = invoice?.payments.reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0
  const remaining = invoice ? Number(invoice.totalAmount) - paid : 0

  useEffect(() => {
    if (!open) return

    setAmount(remaining > 0 ? String(remaining) : '')
    setMethod('CASH')
    setReference('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!invoice) return

    try {
      await createPayment({
        invoiceId: invoice.id,
        amount: Number(amount),
        method,
        reference: reference || undefined,
      }).unwrap()
      toast.success('Paiement enregistré')
      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            {invoice && (
              <>
                {invoice.student.firstName} {invoice.student.lastName} — reste à payer :{' '}
                <span className="font-medium text-foreground">{amountFormatter.format(remaining)} FCFA</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="method">Moyen de paiement</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger id="method" className="w-full">
                <SelectValue>{(value: PaymentMethod) => paymentMethodLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reference">
              Référence <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="reference"
              placeholder="N° de transaction"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer le paiement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
