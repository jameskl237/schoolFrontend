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
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import {
  useCreateTransportSubscriptionMutation,
  useTransportRoutesQuery,
  useUpdateTransportSubscriptionMutation,
} from '../api/transport-api'
import { transportStatusLabels } from '../labels'
import type { TransportSubscription, TransportSubscriptionStatus } from '../types'

interface TransportSubscriptionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: TransportSubscription | null
}

export function TransportSubscriptionFormDialog({
  open,
  onOpenChange,
  subscription,
}: TransportSubscriptionFormDialogProps) {
  const isEditing = Boolean(subscription)
  const { data: students } = useStudentsQuery()
  const { data: routes } = useTransportRoutesQuery()
  const [createSubscription, { isLoading: isCreating }] = useCreateTransportSubscriptionMutation()
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateTransportSubscriptionMutation()

  const [studentId, setStudentId] = useState('')
  const [routeId, setRouteId] = useState('')
  const [status, setStatus] = useState<TransportSubscriptionStatus>('PENDING')
  const [pickupPoint, setPickupPoint] = useState('')

  useEffect(() => {
    if (!open) return

    setStudentId(subscription ? String(subscription.studentId) : '')
    setRouteId(subscription ? String(subscription.routeId) : '')
    setStatus(subscription?.status ?? 'PENDING')
    setPickupPoint(subscription?.pickupPoint ?? '')
  }, [open, subscription])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && subscription) {
        await updateSubscription({
          id: subscription.id,
          routeId: Number(routeId),
          status,
          pickupPoint: pickupPoint || null,
        }).unwrap()
        toast.success('Abonnement mis à jour')
      } else {
        await createSubscription({
          studentId: Number(studentId),
          routeId: Number(routeId),
          status,
          ...(pickupPoint ? { pickupPoint } : {}),
        }).unwrap()
        toast.success('Abonnement créé')
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
          <DialogTitle>{isEditing ? "Modifier l'abonnement" : 'Nouvel abonnement'}</DialogTitle>
          <DialogDescription>
            L&rsquo;abonnement porte sur l&rsquo;année scolaire courante. Il démarre « en attente » tant
            qu&rsquo;il n&rsquo;est pas activé.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="studentId">Élève</Label>
            <Select
              value={studentId}
              onValueChange={(value) => setStudentId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="studentId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un élève'
                    const student = students?.find((s) => String(s.id) === value)
                    return student ? `${student.firstName} ${student.lastName}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.firstName} {student.lastName} ({student.studentNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="routeId">Circuit</Label>
            <Select value={routeId} onValueChange={(value) => setRouteId(value ?? '')}>
              <SelectTrigger id="routeId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un circuit'
                    return routes?.find((route) => String(route.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {routes?.map((route) => (
                  <SelectItem key={route.id} value={String(route.id)}>
                    {route.name} ({route.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TransportSubscriptionStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: TransportSubscriptionStatus) => transportStatusLabels[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(transportStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="pickupPoint">
              Point de ramassage <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="pickupPoint"
              placeholder="Carrefour Nlongkak"
              value={pickupPoint}
              onChange={(event) => setPickupPoint(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !routeId || (!isEditing && !studentId)}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
