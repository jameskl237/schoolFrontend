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
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateFeeTypeMutation, useUpdateFeeTypeMutation } from '../api/fee-types-api'
import type { FeeType } from '../types'

interface FeeTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeType: FeeType | null
}

export function FeeTypeFormDialog({ open, onOpenChange, feeType }: FeeTypeFormDialogProps) {
  const isEditing = Boolean(feeType)
  const [createFeeType, { isLoading: isCreating }] = useCreateFeeTypeMutation()
  const [updateFeeType, { isLoading: isUpdating }] = useUpdateFeeTypeMutation()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return

    setName(feeType?.name ?? '')
    setDescription(feeType?.description ?? '')
  }, [open, feeType])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && feeType) {
        await updateFeeType({ id: feeType.id, name, description: description || undefined }).unwrap()
        toast.success('Type de frais mis à jour')
      } else {
        await createFeeType({ name, description: description || undefined }).unwrap()
        toast.success('Type de frais créé')
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
          <DialogTitle>{isEditing ? 'Modifier le type de frais' : 'Nouveau type de frais'}</DialogTitle>
          <DialogDescription>Une catégorie de frais, ex. Frais de scolarité, Inscription.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Frais de scolarité"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">
              Description <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

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
