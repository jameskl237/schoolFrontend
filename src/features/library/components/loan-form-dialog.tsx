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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useStudentsQuery } from '@/features/students/api/students-api'
import { useTeachersQuery } from '@/features/teachers/api/teachers-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useBooksQuery, useCreateLoanMutation } from '../api/library-api'

interface LoanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inTwoWeeks = () => {
  const date = new Date()
  date.setDate(date.getDate() + 14)

  return date.toISOString().slice(0, 10)
}

export function LoanFormDialog({ open, onOpenChange }: LoanFormDialogProps) {
  const { hasPermission } = usePermissions()
  const { data: books } = useBooksQuery(undefined, { skip: !open })
  const { data: students } = useStudentsQuery(undefined, { skip: !open })
  // Le bibliothécaire ne gère pas les enseignants : la liste peut lui être refusée.
  const canReadTeachers = hasPermission('teachers.manage', 'class-subjects.manage')
  const { data: teachers } = useTeachersQuery(undefined, { skip: !open || !canReadTeachers })
  const [createLoan, { isLoading }] = useCreateLoanMutation()

  const [borrowerKind, setBorrowerKind] = useState<'student' | 'teacher'>('student')
  const [borrowerId, setBorrowerId] = useState('')
  const [copyId, setCopyId] = useState('')
  const [dueDate, setDueDate] = useState(inTwoWeeks)

  useEffect(() => {
    if (!open) return

    setBorrowerKind('student')
    setBorrowerId('')
    setCopyId('')
    setDueDate(inTwoWeeks())
  }, [open])

  /** Seuls les exemplaires disponibles peuvent partir en prêt. */
  const availableCopies = useMemo(
    () =>
      (books ?? []).flatMap((book) =>
        book.copies
          .filter((copy) => copy.status === 'AVAILABLE')
          .map((copy) => ({ id: copy.id, label: `${book.title} — ${copy.inventoryCode}` })),
      ),
    [books],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await createLoan({
        bookCopyId: Number(copyId),
        dueDate,
        ...(borrowerKind === 'student'
          ? { studentId: Number(borrowerId) }
          : { teacherId: Number(borrowerId) }),
      }).unwrap()
      toast.success('Emprunt enregistré')
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
          <DialogTitle>Nouvel emprunt</DialogTitle>
          <DialogDescription>
            Seuls les exemplaires disponibles sont proposés. L&rsquo;exemplaire prêté passe
            automatiquement en « emprunté ».
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="copyId">Exemplaire</Label>
            <Select value={copyId} onValueChange={(value) => setCopyId(value ?? '')}>
              <SelectTrigger id="copyId" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value
                      ? (availableCopies.find((c) => String(c.id) === value)?.label ?? value)
                      : 'Choisir un exemplaire'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableCopies.map((copy) => (
                  <SelectItem key={copy.id} value={String(copy.id)}>
                    {copy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCopies.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun exemplaire disponible.</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="borrowerKind">Emprunteur</Label>
            <Select
              value={borrowerKind}
              onValueChange={(value) => {
                setBorrowerKind((value ?? 'student') as 'student' | 'teacher')
                setBorrowerId('')
              }}
            >
              <SelectTrigger id="borrowerKind" className="w-full">
                <SelectValue>
                  {(value: string) => (value === 'teacher' ? 'Un enseignant' : 'Un élève')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Un élève</SelectItem>
                {canReadTeachers && <SelectItem value="teacher">Un enseignant</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="borrowerId">{borrowerKind === 'teacher' ? 'Enseignant' : 'Élève'}</Label>
            <Select value={borrowerId} onValueChange={(value) => setBorrowerId(value ?? '')}>
              <SelectTrigger id="borrowerId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir'
                    if (borrowerKind === 'teacher') {
                      const teacher = teachers?.find((t) => String(t.id) === value)
                      return teacher ? `${teacher.firstName} ${teacher.lastName}` : value
                    }
                    const student = students?.find((s) => String(s.id) === value)
                    return student ? `${student.firstName} ${student.lastName}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {borrowerKind === 'teacher'
                  ? teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))
                  : students?.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.firstName} {student.lastName} ({student.studentNumber})
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dueDate">Retour prévu</Label>
            <Input
              id="dueDate"
              type="date"
              required
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !copyId || !borrowerId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
