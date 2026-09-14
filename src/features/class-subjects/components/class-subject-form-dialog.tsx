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
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { useClassesQuery } from '@/features/classes/api/classes-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { useSubjectsQuery } from '@/features/subjects/api/subjects-api'
import { useTeachersQuery } from '@/features/teachers/api/teachers-api'
import { getErrorMessage } from '@/lib/get-error-message'

import {
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
} from '../api/class-subjects-api'
import type { ClassSubject } from '../types'

interface ClassSubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classSubject: ClassSubject | null
  defaultAcademicYearId?: number
}

export function ClassSubjectFormDialog({
  open,
  onOpenChange,
  classSubject,
  defaultAcademicYearId,
}: ClassSubjectFormDialogProps) {
  const isEditing = Boolean(classSubject)
  const { data: classes } = useClassesQuery(undefined)
  const { data: subjects } = useSubjectsQuery()
  const { data: teachers } = useTeachersQuery()
  const { data: academicYears } = useAcademicYearsQuery()
  const { gradeLevelPath } = useSchoolStructure()
  const [createClassSubject, { isLoading: isCreating }] = useCreateClassSubjectMutation()
  const [updateClassSubject, { isLoading: isUpdating }] = useUpdateClassSubjectMutation()

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [coefficient, setCoefficient] = useState('1')
  const [hoursPerWeek, setHoursPerWeek] = useState('')

  useEffect(() => {
    if (!open) return

    setClassId(classSubject ? String(classSubject.classId) : '')
    setSubjectId(classSubject ? String(classSubject.subjectId) : '')
    setTeacherId(classSubject ? String(classSubject.teacherId) : '')
    setAcademicYearId(
      classSubject
        ? String(classSubject.academicYearId)
        : defaultAcademicYearId
          ? String(defaultAcademicYearId)
          : '',
    )
    setCoefficient(classSubject ? String(classSubject.coefficient) : '1')
    setHoursPerWeek(classSubject?.hoursPerWeek != null ? String(classSubject.hoursPerWeek) : '')
  }, [open, classSubject, defaultAcademicYearId])

  const classLabel = (targetClassId: number) => {
    const klass = classes?.find((c) => c.id === targetClassId)
    if (!klass) return String(targetClassId)
    return `${gradeLevelPath(klass.gradeLevelId)} · ${klass.name}`
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && classSubject) {
        await updateClassSubject({
          id: classSubject.id,
          teacherId: Number(teacherId),
          coefficient: Number(coefficient),
          hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
        }).unwrap()
        toast.success('Affectation mise à jour')
      } else {
        await createClassSubject({
          classId: Number(classId),
          subjectId: Number(subjectId),
          teacherId: Number(teacherId),
          academicYearId: Number(academicYearId),
          coefficient: Number(coefficient),
          ...(hoursPerWeek ? { hoursPerWeek: Number(hoursPerWeek) } : {}),
        }).unwrap()
        toast.success('Affectation créée')
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
          <DialogTitle>{isEditing ? "Modifier l'affectation" : 'Nouvelle affectation'}</DialogTitle>
          <DialogDescription>
            Confie une matière d&rsquo;une classe à un enseignant : c&rsquo;est ce lien qui l&rsquo;autorise
            à noter et à faire l&rsquo;appel.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="classId">Classe</Label>
            <Select
              value={classId}
              onValueChange={(value) => setClassId(value ?? '')}
              disabled={isEditing}
            >
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
            <Label htmlFor="subjectId">Matière</Label>
            <Select
              value={subjectId}
              onValueChange={(value) => setSubjectId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="subjectId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une matière'
                    return subjects?.find((s) => String(s.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="teacherId">Enseignant</Label>
            <Select value={teacherId} onValueChange={(value) => setTeacherId(value ?? '')}>
              <SelectTrigger id="teacherId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un enseignant'
                    const teacher = teachers?.find((t) => String(t.id) === value)
                    return teacher ? `${teacher.firstName} ${teacher.lastName}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.firstName} {teacher.lastName} ({teacher.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="academicYearId">Année scolaire</Label>
            <Select
              value={academicYearId}
              onValueChange={(value) => setAcademicYearId(value ?? '')}
              disabled={isEditing}
            >
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                min="0.5"
                step="0.5"
                required
                value={coefficient}
                onChange={(event) => setCoefficient(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hoursPerWeek">
                Heures/semaine <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="hoursPerWeek"
                type="number"
                min="0.5"
                step="0.5"
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !teacherId || (!isEditing && (!classId || !subjectId || !academicYearId))}
            >
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
