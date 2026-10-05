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
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateOrientationMutation, useUpdateOrientationMutation } from '../api/orientation-api'
import { orientationStatusLabels } from '../labels'
import type { OrientationRecord, OrientationStatus } from '../types'

interface OrientationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: OrientationRecord | null
}

export function OrientationFormDialog({ open, onOpenChange, record }: OrientationFormDialogProps) {
  const isEditing = record !== null
  const { data: students } = useStudentsQuery(undefined, { skip: !open || isEditing })
  const [createOrientation, { isLoading: isCreating }] = useCreateOrientationMutation()
  const [updateOrientation, { isLoading: isUpdating }] = useUpdateOrientationMutation()

  const [studentId, setStudentId] = useState('')
  const [recommendedTrack, setRecommendedTrack] = useState('')
  const [finalDecision, setFinalDecision] = useState('')
  const [status, setStatus] = useState<OrientationStatus>('PENDING')

  useEffect(() => {
    if (!open) return

    setStudentId(record ? String(record.studentId) : '')
    setRecommendedTrack(record?.recommendedTrack ?? '')
    setFinalDecision(record?.finalDecision ?? '')
    setStatus(record?.status ?? 'PENDING')
  }, [open, record])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing) {
        await updateOrientation({
          id: record.id,
          recommendedTrack: recommendedTrack || null,
          finalDecision: finalDecision || null,
          status,
        }).unwrap()
        toast.success('Dossier mis à jour')
      } else {
        await createOrientation({
          studentId: Number(studentId),
          recommendedTrack: recommendedTrack || null,
          finalDecision: finalDecision || null,
          status,
        }).unwrap()
        toast.success("Dossier d'orientation créé")
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
          <DialogTitle>
            {isEditing ? "Modifier le dossier d'orientation" : "Nouveau dossier d'orientation"}
          </DialogTitle>
          <DialogDescription>
            Un dossier par élève et par année scolaire, ouvert sur l&rsquo;année en cours.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {!isEditing && (
            <div className="grid gap-1.5">
              <Label htmlFor="studentId">Élève</Label>
              <Select value={studentId} onValueChange={(value) => setStudentId(value ?? '')}>
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
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="recommendedTrack">Filière recommandée</Label>
            <Input
              id="recommendedTrack"
              placeholder="Série C, Série D, Enseignement technique…"
              value={recommendedTrack}
              onChange={(event) => setRecommendedTrack(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="finalDecision">Décision finale</Label>
            <Input
              id="finalDecision"
              value={finalDecision}
              onChange={(event) => setFinalDecision(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrientationStatus)}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: OrientationStatus) => orientationStatusLabels[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orientationStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || (!isEditing && !studentId)}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
