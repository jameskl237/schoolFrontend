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
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import { useClassroomsQuery } from '@/features/classrooms/api/classrooms-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateTimetableMutation, useUpdateTimetableMutation } from '../api/timetables-api'
import { dayOfWeekLabels, formatTime, orderedDays } from '../labels'
import type { DayOfWeek, Timetable } from '../types'

interface TimetableFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timetable: Timetable | null
}

export function TimetableFormDialog({ open, onOpenChange, timetable }: TimetableFormDialogProps) {
  const isEditing = Boolean(timetable)
  const { data: classSubjects } = useClassSubjectsQuery()
  const { data: classrooms } = useClassroomsQuery(undefined)
  const [createTimetable, { isLoading: isCreating }] = useCreateTimetableMutation()
  const [updateTimetable, { isLoading: isUpdating }] = useUpdateTimetableMutation()

  const [classSubjectId, setClassSubjectId] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:00')

  useEffect(() => {
    if (!open) return

    setClassSubjectId(timetable ? String(timetable.classSubjectId) : '')
    setClassroomId(timetable ? String(timetable.classroomId) : '')
    setDayOfWeek(timetable?.dayOfWeek ?? 'MONDAY')
    setStartTime(timetable ? formatTime(timetable.startTime) : '08:00')
    setEndTime(timetable ? formatTime(timetable.endTime) : '09:00')
  }, [open, timetable])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (startTime >= endTime) {
      toast.error("L'heure de début doit précéder l'heure de fin.")
      return
    }

    try {
      if (isEditing && timetable) {
        await updateTimetable({
          id: timetable.id,
          classroomId: Number(classroomId),
          dayOfWeek,
          startTime,
          endTime,
        }).unwrap()
        toast.success('Créneau mis à jour')
      } else {
        await createTimetable({
          classSubjectId: Number(classSubjectId),
          classroomId: Number(classroomId),
          dayOfWeek,
          startTime,
          endTime,
        }).unwrap()
        toast.success('Créneau créé')
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
          <DialogTitle>{isEditing ? 'Modifier le créneau' : 'Nouveau créneau'}</DialogTitle>
          <DialogDescription>
            Un créneau hebdomadaire. Les conflits de salle, d&rsquo;enseignant ou de classe sont refusés.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="classSubjectId">Classe et matière</Label>
            <Select
              value={classSubjectId}
              onValueChange={(value) => setClassSubjectId(value ?? '')}
              disabled={isEditing}
            >
              <SelectTrigger id="classSubjectId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une matière'
                    const item = classSubjects?.find((cs) => String(cs.id) === value)
                    return item
                      ? `${item.class.name} · ${item.subject.name} — ${item.teacher.lastName}`
                      : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classSubjects?.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.class.name} · {item.subject.name} — {item.teacher.firstName}{' '}
                    {item.teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="classroomId">Salle</Label>
            <Select value={classroomId} onValueChange={(value) => setClassroomId(value ?? '')}>
              <SelectTrigger id="classroomId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir une salle'
                    return classrooms?.find((room) => String(room.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classrooms?.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)}>
                    {room.name} ({room.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dayOfWeek">Jour</Label>
            <Select value={dayOfWeek} onValueChange={(value) => setDayOfWeek(value as DayOfWeek)}>
              <SelectTrigger id="dayOfWeek" className="w-full">
                <SelectValue>{(value: DayOfWeek) => dayOfWeekLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {orderedDays.map((day) => (
                  <SelectItem key={day} value={day}>
                    {dayOfWeekLabels[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startTime">Début</Label>
              <Input
                id="startTime"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endTime">Fin</Label>
              <Input
                id="endTime"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !classroomId || (!isEditing && !classSubjectId)}
            >
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
