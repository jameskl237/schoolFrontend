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
import { Switch } from '@/components/ui/switch'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateVisitMutation } from '../api/health-records-api'

interface VisitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisitFormDialog({ open, onOpenChange }: VisitFormDialogProps) {
  const { data: students } = useStudentsQuery(undefined, { skip: !open })
  const [createVisit, { isLoading }] = useCreateVisitMutation()

  const [studentId, setStudentId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [treatment, setTreatment] = useState('')
  const [temperature, setTemperature] = useState('')
  const [notifiedParent, setNotifiedParent] = useState(false)

  useEffect(() => {
    if (!open) return

    setStudentId('')
    setDate(new Date().toISOString().slice(0, 10))
    setReason('')
    setTreatment('')
    setTemperature('')
    setNotifiedParent(false)
  }, [open])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createVisit({
        studentId: Number(studentId),
        date,
        reason,
        treatment: treatment || null,
        temperature: temperature ? Number(temperature) : null,
        notifiedParent,
      }).unwrap()
      toast.success('Passage enregistré')
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
          <DialogTitle>Nouveau passage à l&rsquo;infirmerie</DialogTitle>
          <DialogDescription>
            Le passage est consigné à votre nom, avec la date et le motif.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="temperature">
                Température <span className="font-normal text-muted-foreground">(°C)</span>
              </Label>
              <Input
                id="temperature"
                type="number"
                min="30"
                max="45"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reason">Motif</Label>
            <Input
              id="reason"
              required
              placeholder="Maux de tête, chute…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="treatment">
              Soins apportés <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="treatment"
              value={treatment}
              onChange={(event) => setTreatment(event.target.value)}
            />
          </div>

          <label className="flex items-center justify-between gap-2 text-sm">
            <span>Parents prévenus</span>
            <Switch checked={notifiedParent} onCheckedChange={setNotifiedParent} />
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !studentId || !reason}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
