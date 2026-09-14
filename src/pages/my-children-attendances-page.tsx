import { useMemo } from 'react'
import { CalendarX, GraduationCap } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAttendancesQuery } from '@/features/attendances/api/attendances-api'
import { attendanceStatusLabels } from '@/features/attendances/labels'
import type { Attendance, AttendanceStatus } from '@/features/attendances/types'
import { ChildSelect } from '@/features/children/components/child-select'
import { useMyChildren } from '@/features/children/hooks/use-my-children'

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const statusTone: Record<AttendanceStatus, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  PRESENT: 'secondary',
  ABSENT: 'destructive',
  LATE: 'outline',
  EXCUSED: 'default',
}

const childLabel = (student: { firstName: string; lastName: string }) =>
  `${student.firstName} ${student.lastName}`

export function MyChildrenAttendancesPage() {
  const { children, isLoading: isLoadingChildren, selectedChild, selectedChildId, selectChild } =
    useMyChildren()

  const { data: attendances, isLoading: isLoadingAttendances } = useAttendancesQuery(
    selectedChild ? { studentId: selectedChild.id } : undefined,
    { skip: !selectedChild },
  )

  const byDay = useMemo(() => {
    const groups = new Map<string, Attendance[]>()

    for (const attendance of attendances ?? []) {
      const key = attendance.date
      const group = groups.get(key)

      if (group) {
        group.push(attendance)
      } else {
        groups.set(key, [attendance])
      }
    }

    return [...groups.entries()].sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
  }, [attendances])

  const absences = useMemo(
    () => (attendances ?? []).filter((attendance) => attendance.status === 'ABSENT').length,
    [attendances],
  )
  const lateness = useMemo(
    () => (attendances ?? []).filter((attendance) => attendance.status === 'LATE').length,
    [attendances],
  )

  return (
    <>
      <PageHeader
        title="Absences de mon enfant"
        description="Appels, retards et justificatifs de présence."
      />

      <div className="mb-4">
        <ChildSelect
          students={children}
          value={selectedChildId}
          onValueChange={selectChild}
          label={childLabel}
        />
      </div>

      <Reveal>
        {isLoadingChildren || isLoadingAttendances ? (
          <Card className="gap-0 p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : !selectedChild ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Sélectionnez un enfant"
              description="Le relevé de présence de l'enfant choisi s'affichera ici."
            />
          </Card>
        ) : !attendances?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={CalendarX}
              title="Aucun appel enregistré"
              description="Les appels de présence de cet enfant apparaîtront ici."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {(absences > 0 || lateness > 0) && (
              <div className="flex flex-wrap gap-2">
                {absences > 0 && <Badge variant="destructive">{absences} absence(s)</Badge>}
                {lateness > 0 && <Badge variant="outline">{lateness} retard(s)</Badge>}
              </div>
            )}

            {byDay.map(([date, items]) => (
              <Card key={date} className="gap-0 overflow-hidden p-0">
                <div className="border-b px-4 py-3">
                  <p className="font-medium capitalize">{dayFormatter.format(new Date(date))}</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Statut</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Justification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((attendance) => (
                        <TableRow key={attendance.id}>
                          <TableCell>
                            <Badge variant={statusTone[attendance.status]}>
                              {attendanceStatusLabels[attendance.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {attendance.timetable?.classSubject.subject.name ?? attendance.class.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {attendance.timetable
                              ? `${attendance.timetable.startTime} – ${attendance.timetable.endTime}`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {attendance.justification ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Reveal>
    </>
  )
}