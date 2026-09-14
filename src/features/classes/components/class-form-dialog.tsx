import { useEffect, useMemo, useState, type FormEvent } from 'react'
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
import { useClassroomsQuery } from '@/features/classrooms/api/classrooms-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useTeachersQuery } from '@/features/teachers/api/teachers-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateClassMutation, useUpdateClassMutation } from '../api/classes-api'
import type { SchoolClass } from '../types'

interface ClassFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolClass: SchoolClass | null
  defaultGradeLevelId?: number
}

const NONE = 'none'

export function ClassFormDialog({ open, onOpenChange, schoolClass, defaultGradeLevelId }: ClassFormDialogProps) {
  const isEditing = Boolean(schoolClass)
  const { hasPermission } = usePermissions()
  const canPickTeacher = hasPermission('teachers.manage', 'class-subjects.manage')
  const { data: teachers } = useTeachersQuery(undefined, { skip: !canPickTeacher || !open })
  const { gradeLevels, gradeLevelPath } = useSchoolStructure()
  // Only rooms with no class yet — plus, when editing, the room this class already occupies.
  const { data: availableClassrooms } = useClassroomsQuery({ onlyAvailable: true })
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation()
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation()

  const [gradeLevelId, setGradeLevelId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [classroomId, setClassroomId] = useState(NONE)
  const [mainTeacherId, setMainTeacherId] = useState(NONE)

  useEffect(() => {
    if (!open) return

    setGradeLevelId(String(schoolClass?.gradeLevelId ?? defaultGradeLevelId ?? ''))
    setName(schoolClass?.name ?? '')
    setCode(schoolClass?.code ?? '')
    setClassroomId(schoolClass?.classroomId ? String(schoolClass.classroomId) : NONE)
    setMainTeacherId(schoolClass?.mainTeacherId ? String(schoolClass.mainTeacherId) : NONE)
  }, [open, schoolClass, defaultGradeLevelId])

  const classroomOptions = useMemo(() => {
    const options = [...(availableClassrooms ?? [])]
    if (schoolClass?.classroom && !options.some((room) => room.id === schoolClass.classroom!.id)) {
      options.unshift({ ...schoolClass.classroom, establishmentId: 0, capacity: null, createdAt: '', updatedAt: '', class: null })
    }
    return options
  }, [availableClassrooms, schoolClass])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && schoolClass) {
        await updateClass({
          id: schoolClass.id,
          gradeLevelId: Number(gradeLevelId),
          name,
          code,
          classroomId: classroomId === NONE ? null : Number(classroomId),
          ...(canPickTeacher
            ? { mainTeacherId: mainTeacherId === NONE ? null : Number(mainTeacherId) }
            : {}),
        }).unwrap()
        toast.success('Classe mise à jour')
      } else {
        await createClass({
          gradeLevelId: Number(gradeLevelId),
          name,
          code,
          ...(classroomId !== NONE ? { classroomId: Number(classroomId) } : {}),
          ...(mainTeacherId !== NONE ? { mainTeacherId: Number(mainTeacherId) } : {}),
        }).unwrap()
        toast.success('Classe créée')
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
          <DialogTitle>{isEditing ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
          <DialogDescription>Une classe accueille les élèves inscrits dans un niveau.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="gradeLevelId">Niveau</Label>
            <Select value={gradeLevelId} onValueChange={(value) => setGradeLevelId(value ?? '')}>
              <SelectTrigger id="gradeLevelId" className="w-full">
                <SelectValue>
                  {(value: string) => (value ? gradeLevelPath(Number(value)) : 'Choisir un niveau')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {gradeLevels?.map((gradeLevel) => (
                  <SelectItem key={gradeLevel.id} value={String(gradeLevel.id)}>
                    {gradeLevelPath(gradeLevel.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="CP1"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="CP1"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="classroomId">
              Salle <span className="font-normal text-muted-foreground">(seules les salles libres sont proposées)</span>
            </Label>
            <Select value={classroomId} onValueChange={(value) => setClassroomId(value ?? NONE)}>
              <SelectTrigger id="classroomId" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NONE
                      ? 'Aucune salle'
                      : (classroomOptions.find((room) => String(room.id) === value)?.name ?? value)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Aucune salle</SelectItem>
                {classroomOptions.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)}>
                    {room.name} ({room.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canPickTeacher && (
            <div className="grid gap-1.5">
              <Label htmlFor="mainTeacherId">
                Professeur principal{' '}
                <span className="font-normal text-muted-foreground">
                  (vise les notes de toute la classe)
                </span>
              </Label>
              <Select
                value={mainTeacherId}
                onValueChange={(value) => setMainTeacherId(value ?? NONE)}
              >
                <SelectTrigger id="mainTeacherId" className="w-full">
                  <SelectValue>
                    {(value: string) => {
                      if (value === NONE) return 'Aucun'
                      const teacher = teachers?.find((t) => String(t.id) === value)
                      return teacher ? `${teacher.firstName} ${teacher.lastName}` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun</SelectItem>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.firstName} {teacher.lastName} ({teacher.employeeNumber})
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
            <Button type="submit" disabled={isLoading || !gradeLevelId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
