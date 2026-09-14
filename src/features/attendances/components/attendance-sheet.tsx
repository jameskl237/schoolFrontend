import { useEffect, useMemo, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CalendarCheck, Save } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useAttendancesQuery, useSaveAttendancesMutation } from '../api/attendances-api'
import { attendanceStatusLabels } from '../labels'
import type { AttendanceStatus } from '../types'

interface AttendanceSheetProps {
  classId: number
  className: string
  date: string
}

interface RowState {
  studentId: number
  firstName: string
  lastName: string
  studentNumber: string
  status: AttendanceStatus
  justification: string
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function AttendanceSheet({ classId, className, date }: AttendanceSheetProps) {
  // L'effectif de la classe est demandé au backend plutôt que filtré côté client.
  const { data: students, isLoading: studentsLoading } = useStudentsQuery({ classId })
  const { data: attendances, isLoading: attendancesLoading } = useAttendancesQuery({
    classId,
    from: date,
    to: date,
  })
  const [saveAttendances, { isLoading: isSaving }] = useSaveAttendancesMutation()

  const [rows, setRows] = useState<RowState[]>([])

  /** L'effectif de la classe, pré-rempli avec l'appel déjà enregistré ce jour-là. */
  const roster = useMemo(() => {
    const byStudentId = new Map(attendances?.map((attendance) => [attendance.studentId, attendance]))

    return (students ?? []).map((student) => {
      const attendance = byStudentId.get(student.id)

      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        status: attendance?.status ?? ('PRESENT' as AttendanceStatus),
        justification: attendance?.justification ?? '',
      }
    })
  }, [students, attendances])

  useEffect(() => {
    setRows(roster)
  }, [roster])

  const updateRow = (studentId: number, patch: Partial<RowState>) => {
    setRows((current) =>
      current.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)),
    )
  }

  const markAllPresent = () => {
    setRows((current) => current.map((row) => ({ ...row, status: 'PRESENT', justification: '' })))
  }

  const handleSave = async () => {
    try {
      await saveAttendances({
        classId,
        date,
        entries: rows.map((row) => ({
          studentId: row.studentId,
          status: row.status,
          ...(row.justification ? { justification: row.justification } : {}),
        })),
      }).unwrap()
      toast.success('Appel enregistré')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const absentCount = rows.filter((row) => row.status !== 'PRESENT').length
  const isLoading = studentsLoading || attendancesLoading

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="gap-1 border-b p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{className}</CardTitle>
            <CardDescription>
              {dateFormatter.format(new Date(date))} — {rows.length} élève(s), {absentCount} non présent(s)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAllPresent} disabled={rows.length === 0}>
              Tous présents
            </Button>
            <Button onClick={handleSave} disabled={isSaving || rows.length === 0}>
              <Save />
              {isSaving ? 'Enregistrement…' : "Enregistrer l'appel"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Aucun élève dans cette classe"
            description="Inscrivez des élèves dans la classe pour pouvoir faire l'appel."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead className="w-44">Statut</TableHead>
                  <TableHead>Justification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell className="font-medium">
                      {row.firstName} {row.lastName}
                      <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
                        {row.studentNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          updateRow(row.studentId, { status: (value ?? 'PRESENT') as AttendanceStatus })
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Statut de ${row.firstName} ${row.lastName}`}
                        >
                          <SelectValue>
                            {(value: AttendanceStatus) => attendanceStatusLabels[value]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(attendanceStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.justification}
                        placeholder={row.status === 'PRESENT' ? '—' : 'Optionnel'}
                        disabled={row.status === 'PRESENT'}
                        onChange={(event) =>
                          updateRow(row.studentId, { justification: event.target.value })
                        }
                        aria-label={`Justification de ${row.firstName} ${row.lastName}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
