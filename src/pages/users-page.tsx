import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { MoreHorizontal, Plus, Users as UsersIcon } from 'lucide-react'
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
import { useDeleteUserMutation, useUsersQuery } from '@/features/users/api/users-api'
import { UserFormDialog } from '@/features/users/components/user-form-dialog'
import type { StaffUser } from '@/features/users/types'
import { formatRoleName } from '@/lib/format-role-name'
import { getErrorMessage } from '@/lib/get-error-message'

export function UsersPage() {
  const { data: users, isLoading } = useUsersQuery()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('users.manage')
  const [deleteUser] = useDeleteUserMutation()

  const [editing, setEditing] = useState<StaffUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: StaffUser) => {
    setEditing(user)
    setDialogOpen(true)
  }

  const handleDelete = async (user: StaffUser) => {
    if (!window.confirm(`Supprimer le compte de ${user.firstName} ${user.lastName} ?`)) return

    try {
      await deleteUser(user.id).unwrap()
      toast.success('Utilisateur supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Les comptes de votre établissement et leurs rôles."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvel utilisateur
            </Button>
          )
        }
      />

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !users?.length ? (
            <EmptyState
              icon={UsersIcon}
              title="Aucun utilisateur"
              description="Créez le premier compte de votre établissement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Statut</TableHead>
                  {canManage && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">Aucun rôle</span>
                        )}
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {formatRoleName(role.name)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="bg-success/15 text-success">Actif</Badge>
                      ) : (
                        <Badge variant="outline">Désactivé</Badge>
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
                            <DropdownMenuItem onClick={() => handleEdit(user)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(user)}>
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
          )}
        </Card>
      </Reveal>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} />
    </>
  )
}
