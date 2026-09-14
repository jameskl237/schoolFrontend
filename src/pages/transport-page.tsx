import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Bus, MoreHorizontal, Plus, Route } from 'lucide-react'
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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import {
  useDeleteTransportRouteMutation,
  useDeleteTransportSubscriptionMutation,
  useTransportRoutesQuery,
  useTransportSubscriptionsQuery,
  useUpdateTransportSubscriptionMutation,
} from '@/features/transport/api/transport-api'
import { TransportRouteFormDialog } from '@/features/transport/components/transport-route-form-dialog'
import { TransportSubscriptionFormDialog } from '@/features/transport/components/transport-subscription-form-dialog'
import { transportStatusLabels } from '@/features/transport/labels'
import type {
  TransportRoute,
  TransportSubscription,
  TransportSubscriptionStatus,
} from '@/features/transport/types'
import { getErrorMessage } from '@/lib/get-error-message'

const amountFormatter = new Intl.NumberFormat('fr-FR')

const statusVariant: Record<TransportSubscriptionStatus, 'default' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  ACTIVE: 'default',
  SUSPENDED: 'secondary',
  CANCELLED: 'outline',
}

export function TransportPage() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('transport.manage')

  const { data: routes, isLoading: routesLoading } = useTransportRoutesQuery()
  const { data: subscriptions, isLoading: subscriptionsLoading } = useTransportSubscriptionsQuery()
  const [updateSubscription] = useUpdateTransportSubscriptionMutation()
  const [deleteRoute] = useDeleteTransportRouteMutation()
  const [deleteSubscription] = useDeleteTransportSubscriptionMutation()

  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null)
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<TransportSubscription | null>(null)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)

  const run = async (action: Promise<unknown>, successMessage: string) => {
    try {
      await action
      toast.success(successMessage)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const handleDeleteRoute = (route: TransportRoute) => {
    if (!window.confirm(`Supprimer le circuit "${route.name}" et ses abonnements ?`)) return

    void run(deleteRoute(route.id).unwrap(), 'Circuit supprimé')
  }

  const handleDeleteSubscription = (subscription: TransportSubscription) => {
    if (
      !window.confirm(
        `Supprimer l'abonnement de "${subscription.student.firstName} ${subscription.student.lastName}" ?`,
      )
    )
      return

    void run(deleteSubscription(subscription.id).unwrap(), 'Abonnement supprimé')
  }

  return (
    <>
      <PageHeader
        title="Transport scolaire"
        description="Les circuits de ramassage et l'abonnement de chaque élève."
        actions={
          canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRoute(null)
                  setRouteDialogOpen(true)
                }}
              >
                <Plus />
                Circuit
              </Button>
              <Button
                onClick={() => {
                  setEditingSubscription(null)
                  setSubscriptionDialogOpen(true)
                }}
              >
                <Plus />
                Abonnement
              </Button>
            </>
          )
        }
      />

      <div className="space-y-6">
        <Reveal>
          <Card className="gap-0 overflow-hidden p-0">
            <p className="border-b px-4 py-3 font-medium">Circuits</p>
            {routesLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : !routes?.length ? (
              <EmptyState
                icon={Route}
                title="Aucun circuit"
                description="Créez un circuit de ramassage et son tarif annuel."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Itinéraire</TableHead>
                      <TableHead className="text-right">Tarif annuel</TableHead>
                      <TableHead className="text-right">Abonnés</TableHead>
                      <TableHead>Facturation</TableHead>
                      {canManage && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {route.code}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {route.description ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {amountFormatter.format(Number(route.fee))} FCFA
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {route._count.subscriptions}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {route.feeType ? (
                            <Badge variant="secondary">{route.feeType.name}</Badge>
                          ) : (
                            <Badge variant="outline">Non facturé</Badge>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingRoute(route)
                                    setRouteDialogOpen(true)
                                  }}
                                >
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteRoute(route)}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal>
          <Card className="gap-0 overflow-hidden p-0">
            <p className="border-b px-4 py-3 font-medium">Abonnements</p>
            {subscriptionsLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : !subscriptions?.length ? (
              <EmptyState
                icon={Bus}
                title="Aucun abonnement"
                description="Abonnez un élève à l'un des circuits de ramassage."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead>Circuit</TableHead>
                      <TableHead>Point de ramassage</TableHead>
                      <TableHead>Année</TableHead>
                      <TableHead className="text-right">Tarif</TableHead>
                      <TableHead>Statut</TableHead>
                      {canManage && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">
                          {subscription.student.firstName} {subscription.student.lastName}
                          <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
                            {subscription.student.studentNumber}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subscription.route.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subscription.pickupPoint ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subscription.academicYear.name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {amountFormatter.format(Number(subscription.route.fee))} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[subscription.status]}>
                            {transportStatusLabels[subscription.status]}
                          </Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {subscription.status !== 'ACTIVE' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void run(
                                        updateSubscription({
                                          id: subscription.id,
                                          status: 'ACTIVE',
                                        }).unwrap(),
                                        'Abonnement activé',
                                      )
                                    }
                                  >
                                    Activer
                                  </DropdownMenuItem>
                                )}
                                {subscription.status === 'ACTIVE' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void run(
                                        updateSubscription({
                                          id: subscription.id,
                                          status: 'SUSPENDED',
                                        }).unwrap(),
                                        'Abonnement suspendu',
                                      )
                                    }
                                  >
                                    Suspendre
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingSubscription(subscription)
                                    setSubscriptionDialogOpen(true)
                                  }}
                                >
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteSubscription(subscription)}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </Reveal>
      </div>

      <TransportRouteFormDialog
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
        route={editingRoute}
      />
      <TransportSubscriptionFormDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        subscription={editingSubscription}
      />
    </>
  )
}
