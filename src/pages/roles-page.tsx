import { useMemo, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { KeyRound, MoreHorizontal, Plus, Save } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  usePermissionsQuery,
  useRolesQuery,
  useSetRolePermissionsMutation,
} from '@/features/roles/api/roles-api'
import type { Role } from '@/features/roles/types'
import { formatRoleName } from '@/lib/format-role-name'
import { getErrorMessage } from '@/lib/get-error-message'

/** Les permissions sont regroupées par domaine, deviné depuis leur code. */
const domainOf = (code: string) => code.split('.')[0] ?? code

export function RolesPage() {
  const { data: roles, isLoading } = useRolesQuery()
  const { data: permissions } = usePermissionsQuery()
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [setRolePermissions, { isLoading: isSaving }] = useSetRolePermissionsMutation()
  const [deleteRole] = useDeleteRoleMutation()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<string[] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const selected = roles?.find((role) => role.id === selectedId) ?? null
  const granted = draft ?? selected?.permissions ?? []

  const grouped = useMemo(() => {
    const byDomain = new Map<string, typeof permissions>()

    for (const permission of permissions ?? []) {
      const domain = domainOf(permission.code)
      byDomain.set(domain, [...(byDomain.get(domain) ?? []), permission])
    }

    return [...byDomain.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

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

  const select = (role: Role) => {
    setSelectedId(role.id)
    setDraft(null)
  }

  const toggle = (code: string, checked: boolean) => {
    const current = draft ?? selected?.permissions ?? []

    setDraft(checked ? [...current, code] : current.filter((item) => item !== code))
  }

  const save = () => {
    if (!selected || draft === null) return

    void run(
      setRolePermissions({ id: selected.id, permissions: draft })
        .unwrap()
        .then(() => setDraft(null)),
      'Permissions enregistrées',
    )
  }

  const handleCreate = () => {
    void run(
      createRole({ name: name.trim().toUpperCase(), description: description || null })
        .unwrap()
        .then(() => {
          setName('')
          setDescription('')
          setCreateOpen(false)
        }),
      'Rôle créé',
    )
  }

  return (
    <>
      <PageHeader
        title="Rôles et permissions"
        description="Ce qu'un rôle autorise, et combien de comptes le portent."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nouveau rôle
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !roles?.length ? (
        <Card className="gap-0 overflow-hidden p-0">
          <EmptyState icon={KeyRound} title="Aucun rôle" description="Créez le premier rôle." />
        </Card>
      ) : (
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
            <Card className="gap-0 overflow-hidden p-0">
              <p className="border-b px-4 py-3 font-medium">Rôles</p>
              <ul className="divide-y">
                {roles.map((role) => (
                  <li key={role.id}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => select(role)}
                        className={`flex-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          role.id === selectedId ? 'bg-accent font-medium' : 'hover:bg-accent/60'
                        }`}
                      >
                        {formatRoleName(role.name)}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {role.permissions.length} perms · {role.userCount} compte(s)
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              if (!window.confirm(`Supprimer le rôle ${formatRoleName(role.name)} ?`)) return
                              void run(deleteRole(role.id).unwrap(), 'Rôle supprimé')
                            }}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="gap-0 overflow-hidden p-0">
              {!selected ? (
                <EmptyState
                  icon={KeyRound}
                  title="Sélectionnez un rôle"
                  description="Ses permissions s'afficheront ici, domaine par domaine."
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                      <p className="font-medium">{formatRoleName(selected.name)}</p>
                      {selected.description && (
                        <p className="text-sm text-muted-foreground">{selected.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{granted.length} permissions</Badge>
                      <Button onClick={save} disabled={draft === null || isSaving}>
                        <Save />
                        {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 p-4 sm:grid-cols-2">
                    {grouped.map(([domain, items]) => (
                      <div key={domain} className="grid gap-1.5 rounded-lg border p-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{domain}</p>
                        {(items ?? []).map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span>{permission.name}</span>
                            <Switch
                              checked={granted.includes(permission.code)}
                              onCheckedChange={(checked) => toggle(permission.code, checked)}
                            />
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </Reveal>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau rôle</DialogTitle>
            <DialogDescription>
              Le nom s&rsquo;écrit en majuscules, ex. SURVEILLANT_GENERAL. Les permissions
              s&rsquo;attribuent ensuite.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="roleName">Nom</Label>
              <Input
                id="roleName"
                placeholder="CENSEUR"
                value={name}
                onChange={(event) => setName(event.target.value.toUpperCase())}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || name.trim().length < 2}>
              {isCreating ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
