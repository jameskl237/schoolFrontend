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
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { genderLabels } from '@/features/students/labels'
import type { Gender } from '@/features/students/types'
import { useUsersQuery } from '@/features/users/api/users-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateTeacherMutation, useUpdateTeacherMutation } from '../api/teachers-api'
import type { Teacher } from '../types'

interface TeacherFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
}

const NONE = 'none'

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function TeacherFormDialog({ open, onOpenChange, teacher }: TeacherFormDialogProps) {
  const isEditing = Boolean(teacher)
  const { hasPermission } = usePermissions()
  // Le rattachement à un compte n'est proposé qu'à qui peut lire les utilisateurs.
  const canLinkUser = hasPermission('users.view', 'users.manage')
  const { data: users } = useUsersQuery(undefined, { skip: !canLinkUser || !open })
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation()
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation()

  const [employeeNumber, setEmployeeNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<Gender>('FEMALE')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [userId, setUserId] = useState(NONE)

  useEffect(() => {
    if (!open) return

    setEmployeeNumber(teacher?.employeeNumber ?? '')
    setFirstName(teacher?.firstName ?? '')
    setLastName(teacher?.lastName ?? '')
    setGender(teacher?.gender ?? 'FEMALE')
    setPhone(teacher?.phone ?? '')
    setEmail(teacher?.email ?? '')
    setHireDate(teacher?.hireDate ? toDateInputValue(teacher.hireDate) : '')
    setSpecialty(teacher?.specialty ?? '')
    setUserId(teacher?.userId ? String(teacher.userId) : NONE)
  }, [open, teacher])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const linkedUserId = userId === NONE ? null : Number(userId)

    try {
      if (isEditing && teacher) {
        await updateTeacher({
          id: teacher.id,
          employeeNumber,
          firstName,
          lastName,
          gender,
          phone: phone || null,
          email: email || null,
          hireDate: hireDate || null,
          specialty: specialty || null,
          ...(canLinkUser ? { userId: linkedUserId } : {}),
        }).unwrap()
        toast.success('Enseignant mis à jour')
      } else {
        await createTeacher({
          employeeNumber,
          firstName,
          lastName,
          gender,
          phone: phone || undefined,
          email: email || undefined,
          hireDate: hireDate || undefined,
          specialty: specialty || undefined,
          ...(linkedUserId !== null ? { userId: linkedUserId } : {}),
        }).unwrap()
        toast.success('Enseignant créé')
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
          <DialogTitle>{isEditing ? "Modifier l'enseignant" : 'Nouvel enseignant'}</DialogTitle>
          <DialogDescription>
            Le compte rattaché détermine les classes que l&rsquo;enseignant verra dans l&rsquo;application.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="employeeNumber">Matricule</Label>
            <Input
              id="employeeNumber"
              placeholder="ENS-0001"
              required
              value={employeeNumber}
              onChange={(event) => setEmployeeNumber(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="gender">Genre</Label>
              <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue>{(value: Gender) => genderLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hireDate">
                Embauche <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="hireDate"
                type="date"
                value={hireDate}
                onChange={(event) => setHireDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">
                Téléphone <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">
                Email <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="specialty">
              Spécialité <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="specialty"
              placeholder="Sciences physiques"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            />
          </div>

          {canLinkUser && (
            <div className="grid gap-1.5">
              <Label htmlFor="userId">
                Compte utilisateur{' '}
                <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Select value={userId} onValueChange={(value) => setUserId(value ?? NONE)}>
                <SelectTrigger id="userId" className="w-full">
                  <SelectValue>
                    {(value: string) => {
                      if (value === NONE) return 'Aucun compte'
                      const user = users?.find((u) => String(u.id) === value)
                      return user ? `${user.firstName} ${user.lastName} — ${user.email}` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun compte</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.firstName} {user.lastName} — {user.email}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
