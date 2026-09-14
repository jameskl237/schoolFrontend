import { useMemo, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CalendarDays, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import {
  useDeleteTimetableMutation,
  useTimetablesQuery,
} from '@/features/timetables/api/timetables-api'
import { TimetableFormDialog } from '@/features/timetables/components/timetable-form-dialog'
import { dayOfWeekLabels, formatTime, orderedDays } from '@/features/timetables/labels'
import type { Timetable } from '@/features/timetables/types'
import { getErrorMessage } from '@/lib/get-error-message'

const ALL = 'all'

export function TimetablesPage() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('timetables.manage')

  const [classFilter, setClassFilter] = useState(ALL)
  const filterId = classFilter === ALL ? undefined : Number(classFilter)

  const { data: timetables, isLoading } = useTimetablesQuery({ classId: filterId })
  const { data: classSubjects } = useClassSubjectsQuery(undefined, { skip: !canManage })
  const [deleteTimetable] = useDeleteTimetableMutation()

  const [editing, setEditing] = useState<Timetable | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  /** Les classes proposées au filtre : celles présentes dans l'emploi du temps affiché. */
  const classes = useMemo(() => {
    const unique = new Map<number, string>()

    for (const slot of timetables ?? []) {
      unique.set(slot.classSubject.class.id, slot.classSubject.class.name)
    }

    for (const item of classSubjects ?? []) {
      unique.set(item.class.id, item.class.name)
    }

    return [...unique.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [timetables, classSubjects])

  /** Les créneaux regroupés par jour, chaque jour trié par heure de début. */
  const byDay = useMemo(() => {
    return orderedDays
      .map((day) => ({
        day,
        slots: (timetables ?? [])
          .filter((slot) => slot.dayOfWeek === day)
          .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime))),
      }))
      .filter((group) => group.slots.length > 0)
  }, [timetables])

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (slot: Timetable) => {
    setEditing(slot)
    setDialogOpen(true)
  }

  const handleDelete = async (slot: Timetable) => {
    if (
      !window.confirm(
        `Supprimer le créneau ${dayOfWeekLabels[slot.dayOfWeek]} ${formatTime(slot.startTime)} — ${slot.classSubject.subject.name} ?`,
      )
    )
      return

    try {
      await deleteTimetable(slot.id).unwrap()
      toast.success('Créneau supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Emplois du temps"
        description="Les créneaux hebdomadaires, par jour et par classe."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouveau créneau
            </Button>
          )
        }
      />

      {classes.length > 0 && (
        <div className="mb-4 max-w-xs">
          <Select value={classFilter} onValueChange={(value) => setClassFilter(value ?? ALL)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? 'Toutes les classes'
                    : (classes.find((klass) => String(klass.id) === value)?.name ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les classes</SelectItem>
              {classes.map((klass) => (
                <SelectItem key={klass.id} value={String(klass.id)}>
                  {klass.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Reveal>
        {isLoading ? (
          <Card className="gap-0 p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : byDay.length === 0 ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={CalendarDays}
              title="Aucun créneau"
              description="L'emploi du temps de cette sélection est vide."
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {byDay.map((group) => (
              <Card key={group.day} className="gap-0 overflow-hidden p-0">
                <p className="border-b px-4 py-3 font-medium">{dayOfWeekLabels[group.day]}</p>
                <ul className="divide-y">
                  {group.slots.map((slot) => (
                    <li key={slot.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="w-24 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{slot.classSubject.subject.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {slot.classSubject.class.name} · {slot.classroom.name} ·{' '}
                          {slot.classSubject.teacher.firstName} {slot.classSubject.teacher.lastName}
                        </p>
                      </div>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(slot)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(slot)}>
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Reveal>

      <TimetableFormDialog open={dialogOpen} onOpenChange={setDialogOpen} timetable={editing} />
    </>
  )
}
