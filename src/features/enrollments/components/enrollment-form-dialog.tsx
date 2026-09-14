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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { useClassesQuery } from '@/features/classes/api/classes-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateEnrollmentMutation, useUpdateEnrollmentMutation } from '../api/enrollments-api'
import { enrollmentStatusLabels } from '../labels'
import type { Enrollment, EnrollmentStatus } from '../types'

interface EnrollmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: Enrollment | null
  defaultAcademicYearId?: number
}

export function EnrollmentFormDialog({
  open,
  onOpenChange,
  enrollment,
  defaultAcademicYearId,
}: EnrollmentFormDialogProps) {
  const isEditing = Boolean(enrollment)
  const { data: students } = useStudentsQuery()
  const { data: classes } = useClassesQuery(undefined)
  const { gradeLevelPath } = useSchoolStructure()
  const { data: academicYears } = useAcademicYearsQuery()
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation()
  const [updateEnrollment, { isLoading: isUpdating }] = useUpdateEnrollmentMutation()

  const [studentId, setStudentId] = useState('')
  const [classId, setClassId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [status, setStatus] = useState<EnrollmentStatus>('ACTIVE')

  useEffect(() => {
    if (!open) return

    setStudentId(enrollment ? String(enrollment.studentId) : '')
    setClassId(enrollment ? String(enrollment.classId) : '')
    setAcademicYearId(
      enrollment ? String(enrollment.academicYearId) : defaultAcademicYearId ? String(defaultAcademicYearId) : '',
    )
    setStatus(enrollment?.status ?? 'ACTIVE')
  }, [open, enrollment, defaultAcademicYearId])

  const classLabel = (targetClassId: number) => {
    const klass = classes?.find((c) => c.id === targetClassId)
    if (!klass) return String(targetClassId)
    const room = klass.classroom ? ` (${klass.classroom.name})` : ''
    return `${gradeLevelPath(klass.gradeLevelId)} · ${klass.name}${room}`
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && enrollment) {
        await updateEnrollment({
          id: enrollment.id,
          classId: Number(classId),
          academicYearId: Number(academicYearId),
          status,
        }).unwrap()
        toast.success('Inscription mise à jour')
      } else {
        await createEnrollment({
          studentId: Number(studentId),
          classId: Number(classId),
          academicYearId: Number(academicYearId),
        }).unwrap()
        toast.success('Élève inscrit')
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
          <DialogTitle>{isEditing ? "Modifier l'inscription" : 'Nouvelle inscription'}</DialogTitle>
          <DialogDescription>
            Associe un élève à une classe pour une année scolaire donnée.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="studentId">Élève</Label>
            <Select value={studentId} onValueChange={(value) => setStudentId(value ?? '')} disabled={isEditing}>
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
            <Label htmlFor="classId">Classe</Label>
            <Select value={classId} onValueChange={(value) => setClassId(value ?? '')}>
              <SelectTrigger id="classId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? classLabel(Number(value)) : 'Choisir une classe')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classes?.map((klass) => (
                  <SelectItem key={klass.id} value={String(klass.id)}>
                    {classLabel(klass.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="academicYearId">Année scolaire</Label>
            <Select value={academicYearId} onValueChange={(value) => setAcademicYearId(value ?? '')}>
              <SelectTrigger id="academicYearId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une année'
                    return academicYears?.find((y) => String(y.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div className="grid gap-1.5">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as EnrollmentStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue>{(value: EnrollmentStatus) => enrollmentStatusLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(enrollmentStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !classId || !academicYearId || (!isEditing && !studentId)}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
