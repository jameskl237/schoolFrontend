import { useMemo, useState } from 'react'
import { CalendarX } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAttendancesQuery } from '@/features/attendances/api/attendances-api'
import { AttendanceSheet } from '@/features/attendances/components/attendance-sheet'
import { attendanceStatusLabels } from '@/features/attendances/labels'
import type { AttendanceStatus } from '@/features/attendances/types'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useProfile } from '@/features/auth/hooks/use-profile'
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const statusVariant: Record<AttendanceStatus, 'default' | 'secondary' | 'outline'> = {
  PRESENT: 'default',
  ABSENT: 'outline',
  LATE: 'secondary',
  EXCUSED: 'secondary',
}

/** Vue élève : le relevé de ses propres absences. */
function StudentAttendances() {
  const { data: attendances, isLoading } = useAttendancesQuery()

  if (isLoading) {
    return (
      <Card className="gap-0 p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  const notable = (attendances ?? []).filter((attendance) => attendance.status !== 'PRESENT')

  if (notable.length === 0) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <EmptyState
          icon={CalendarX}
          title="Aucune absence"
          description="Votre assiduité est sans faute sur la période enregistrée."
        />
      </Card>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Justification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notable.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell className="font-medium">
                  {dateFormatter.format(new Date(attendance.date))}
                </TableCell>
                <TableCell className="text-muted-foreground">{attendance.class.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {attendance.timetable?.classSubject.subject.name ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[attendance.status]}>
                    {attendanceStatusLabels[attendance.status]}
                  </Badge>
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
  )
}

export function AttendancesPage() {
  const { hasPermission } = usePermissions()
  const { isStudent } = useProfile()
  const canManage = hasPermission('attendances.manage')
  const showsOwnRecord = isStudent && !canManage

  const { data: classSubjects } = useClassSubjectsQuery(undefined, { skip: showsOwnRecord })

  /** Les classes où l'utilisateur intervient — dédupliquées depuis ses affectations. */
  const classes = useMemo(() => {
    const unique = new Map<number, { id: number; name: string }>()

    for (const item of classSubjects ?? []) {
      unique.set(item.class.id, { id: item.class.id, name: item.class.name })
    }

    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [classSubjects])

  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  if (showsOwnRecord) {
    return (
      <>
        <PageHeader title="Mes absences" description="Le relevé de votre assiduité." />
        <Reveal>
          <StudentAttendances />
        </Reveal>
      </>
    )
  }

  const selectedClass = classes.find((klass) => String(klass.id) === classId)

  return (
    <>
      <PageHeader
        title="Appel"
        description="Enregistrez la présence des élèves, classe par classe et jour par jour."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid w-full max-w-xs gap-1.5">
          <Label htmlFor="classId">Classe</Label>
          <Select value={classId} onValueChange={(value) => setClassId(value ?? '')}>
            <SelectTrigger id="classId" className="w-full">
              <SelectValue>
                {(value: string) => {
                  if (!value) return 'Choisir une classe'
                  return classes.find((klass) => String(klass.id) === value)?.name ?? value
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {classes.map((klass) => (
                <SelectItem key={klass.id} value={String(klass.id)}>
                  {klass.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full max-w-[12rem] gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </div>

      <Reveal>
        {classes.length === 0 ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={CalendarX}
              title="Aucune classe"
              description="Vous devez être affecté à une classe pour pouvoir y faire l'appel."
            />
          </Card>
        ) : !selectedClass ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={CalendarX}
              title="Sélectionnez une classe"
              description="La liste des élèves à appeler s'affichera ici."
            />
          </Card>
        ) : (
          <AttendanceSheet
            key={`${selectedClass.id}-${date}`}
            classId={selectedClass.id}
            className={selectedClass.name}
            date={date}
          />
        )}
      </Reveal>
    </>
  )
}
