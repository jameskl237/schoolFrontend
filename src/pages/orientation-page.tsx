import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Compass, MessageSquare, MoreHorizontal, Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import {
  useAddCounselingSessionMutation,
  useDeleteOrientationMutation,
  useOrientationsQuery,
} from '@/features/orientation/api/orientation-api'
import { OrientationFormDialog } from '@/features/orientation/components/orientation-form-dialog'
import { orientationStatusLabels } from '@/features/orientation/labels'
import type { OrientationRecord, OrientationStatus } from '@/features/orientation/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const statusVariant: Record<OrientationStatus, 'default' | 'secondary' | 'outline'> = {
  PENDING: 'outline',
  VALIDATED: 'default',
  REJECTED: 'secondary',
}

export function OrientationPage() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('orientations.manage')
  const canCounsel = hasPermission('counseling.manage', 'orientations.manage')

  const [statusFilter, setStatusFilter] = useState(ALL)
  const { data: records, isLoading } = useOrientationsQuery(
    statusFilter === ALL ? undefined : { status: statusFilter as OrientationStatus },
  )
  const [deleteOrientation] = useDeleteOrientationMutation()
  const [addSession] = useAddCounselingSessionMutation()

  const [editing, setEditing] = useState<OrientationRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [noteFor, setNoteFor] = useState<number | null>(null)
  const [note, setNote] = useState('')

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

  const submitSession = (recordId: number) => {
    if (!note.trim()) {
      toast.error('Saisissez le compte rendu de la séance.')
      return
    }

    void run(
      addSession({ orientationRecordId: recordId, notes: note.trim() })
        .unwrap()
        .then(() => {
          setNote('')
          setNoteFor(null)
        }),
      'Séance enregistrée',
    )
  }

  return (
    <>
      <PageHeader
        title="Orientation"
        description="Les dossiers d'orientation et les séances de conseil."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus />
              Nouveau dossier
            </Button>
          )
        }
      />

      <div className="mb-4 max-w-xs">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL ? 'Tous les statuts' : orientationStatusLabels[value as OrientationStatus]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les statuts</SelectItem>
            {Object.entries(orientationStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : !records?.length ? (
        <Card className="gap-0 overflow-hidden p-0">
          <EmptyState
            icon={Compass}
            title="Aucun dossier d'orientation"
            description="Ouvrez le dossier d'un élève pour suivre son orientation."
          />
        </Card>
      ) : (
        <Reveal>
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="gap-0 overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {record.student.firstName} {record.student.lastName}
                    </p>
                    <span className="font-mono text-xs text-muted-foreground">
                      {record.student.studentNumber}
                    </span>
                    <Badge variant="secondary">{record.academicYear.name}</Badge>
                    <Badge variant={statusVariant[record.status]}>
                      {orientationStatusLabels[record.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCounsel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNoteFor(noteFor === record.id ? null : record.id)}
                      >
                        <MessageSquare />
                        Séance
                      </Button>
                    )}
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(record)
                              setDialogOpen(true)
                            }}
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              if (!window.confirm('Supprimer ce dossier et ses séances ?')) return
                              void run(deleteOrientation(record.id).unwrap(), 'Dossier supprimé')
                            }}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Filière recommandée : </span>
                    {record.recommendedTrack ?? '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Décision finale : </span>
                    {record.finalDecision ?? '—'}
                  </p>
                </div>

                {record.sessions.length > 0 && (
                  <div className="border-t px-4 py-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
                      Séances de conseil
                    </p>
                    <ul className="grid gap-1.5">
                      {record.sessions.map((session) => (
                        <li key={session.id} className="text-sm">
                          <span className="text-muted-foreground">
                            {dateFormatter.format(new Date(session.date))} —{' '}
                            {session.counselor.firstName} {session.counselor.lastName} :{' '}
                          </span>
                          {session.notes ?? '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {noteFor === record.id && (
                  <div className="flex items-end gap-2 border-t px-4 py-3">
                    <Input
                      placeholder="Compte rendu de la séance…"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      aria-label="Compte rendu de la séance"
                    />
                    <Button onClick={() => submitSession(record.id)}>Enregistrer</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Reveal>
      )}

      <OrientationFormDialog open={dialogOpen} onOpenChange={setDialogOpen} record={editing} />
    </>
  )
}
