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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useFeeTypesQuery } from '@/features/fee-types/api/fee-types-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateTransportRouteMutation, useUpdateTransportRouteMutation } from '../api/transport-api'
import type { TransportRoute } from '../types'

interface TransportRouteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: TransportRoute | null
}

const NONE = 'none'

export function TransportRouteFormDialog({
  open,
  onOpenChange,
  route,
}: TransportRouteFormDialogProps) {
  const isEditing = Boolean(route)
  const { hasPermission } = usePermissions()
  const canReadFeeTypes = hasPermission('fees.manage')
  const { data: feeTypes } = useFeeTypesQuery(undefined, { skip: !canReadFeeTypes || !open })
  const [createRoute, { isLoading: isCreating }] = useCreateTransportRouteMutation()
  const [updateRoute, { isLoading: isUpdating }] = useUpdateTransportRouteMutation()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [fee, setFee] = useState('')
  const [feeTypeId, setFeeTypeId] = useState(NONE)

  useEffect(() => {
    if (!open) return

    setName(route?.name ?? '')
    setCode(route?.code ?? '')
    setDescription(route?.description ?? '')
    setFee(route ? String(Number(route.fee)) : '')
    setFeeTypeId(route?.feeTypeId ? String(route.feeTypeId) : NONE)
  }, [open, route])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const linkedFeeTypeId = feeTypeId === NONE ? null : Number(feeTypeId)

    try {
      if (isEditing && route) {
        await updateRoute({
          id: route.id,
          name,
          code,
          description: description || null,
          fee: Number(fee),
          ...(canReadFeeTypes ? { feeTypeId: linkedFeeTypeId } : {}),
        }).unwrap()
        toast.success('Circuit mis à jour')
      } else {
        await createRoute({
          name,
          code,
          description: description || undefined,
          fee: Number(fee),
          ...(linkedFeeTypeId !== null ? { feeTypeId: linkedFeeTypeId } : {}),
        }).unwrap()
        toast.success('Circuit créé')
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le circuit' : 'Nouveau circuit'}</DialogTitle>
          <DialogDescription>
            Un circuit de ramassage et son tarif annuel. Le type de frais permet de le facturer comme
            le reste de la scolarité.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Circuit Bastos"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid w-28 gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="C-BAS"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">
              Description <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="description"
              placeholder="Bastos — Nlongkak — École"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="fee">Tarif annuel (FCFA)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              step="500"
              required
              value={fee}
              onChange={(event) => setFee(event.target.value)}
            />
          </div>

          {canReadFeeTypes && (
            <div className="grid gap-1.5">
              <Label htmlFor="feeTypeId">
                Type de frais <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Select value={feeTypeId} onValueChange={(value) => setFeeTypeId(value ?? NONE)}>
                <SelectTrigger id="feeTypeId" className="w-full">
                  <SelectValue>
                    {(value: string) => {
                      if (value === NONE) return 'Non facturé'
                      return feeTypes?.find((type) => String(type.id) === value)?.name ?? value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Non facturé</SelectItem>
                  {feeTypes?.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
