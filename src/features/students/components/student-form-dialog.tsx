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
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { useClassesQuery } from '@/features/classes/api/classes-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import { parentRelationLabels } from '@/features/parents/labels'
import type { ParentRelationType } from '@/features/parents/types'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateStudentMutation, useUpdateStudentMutation } from '../api/students-api'
import { genderLabels } from '../labels'
import type { CreatedAccountCredentials, CreatedParentCredentials, Gender, Student } from '../types'

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
}

const toDateInputValue = (iso: string) => iso.slice(0, 10)

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEditing = Boolean(student)
  const { data: classes } = useClassesQuery(undefined)
  const { gradeLevelPath } = useSchoolStructure()
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation()
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation()
  const [createdParent, setCreatedParent] = useState<CreatedParentCredentials | null>(null)
  const [createdAccount, setCreatedAccount] = useState<CreatedAccountCredentials | null>(null)

  const [studentNumber, setStudentNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<Gender>('MALE')
  const [placeOfBirth, setPlaceOfBirth] = useState('')
  const [nationality, setNationality] = useState('')
  const [address, setAddress] = useState('')
  const [classId, setClassId] = useState('')

  const [withParent, setWithParent] = useState(false)
  const [parentFirstName, setParentFirstName] = useState('')
  const [parentLastName, setParentLastName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentOccupation, setParentOccupation] = useState('')
  const [parentAddress, setParentAddress] = useState('')
  const [parentRelation, setParentRelation] = useState<ParentRelationType>('OTHER')

  useEffect(() => {
    if (!open) return

    setStudentNumber(student?.studentNumber ?? '')
    setFirstName(student?.firstName ?? '')
    setLastName(student?.lastName ?? '')
    setDateOfBirth(student ? toDateInputValue(student.dateOfBirth) : '')
    setGender(student?.gender ?? 'MALE')
    setPlaceOfBirth(student?.placeOfBirth ?? '')
    setNationality(student?.nationality ?? '')
    setAddress(student?.address ?? '')
    setClassId(student?.currentEnrollment ? String(student.currentEnrollment.classId) : '')
    setWithParent(false)
    setParentFirstName('')
    setParentLastName('')
    setParentPhone('')
    setParentEmail('')
    setParentOccupation('')
    setParentAddress('')
    setParentRelation('OTHER')
  }, [open, student])

  const classLabel = (targetClassId: number) => {
    const klass = classes?.find((c) => c.id === targetClassId)
    if (!klass) return String(targetClassId)
    const room = klass.classroom ? ` (${klass.classroom.name})` : ''
    return `${gradeLevelPath(klass.gradeLevelId)} · ${klass.name}${room}`
  }

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      studentNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      placeOfBirth: placeOfBirth || undefined,
      nationality: nationality || undefined,
      address: address || undefined,
      classId: Number(classId),
      ...(!isEditing &&
      withParent && {
        parent: {
          firstName: parentFirstName,
          lastName: parentLastName,
          phone: parentPhone || undefined,
          email: parentEmail || undefined,
          occupation: parentOccupation || undefined,
          address: parentAddress || undefined,
          relationType: parentRelation,
        },
      }),
    }

    try {
      if (isEditing && student) {
        await updateStudent({ id: student.id, ...payload }).unwrap()
        toast.success('Élève mis à jour')
      } else {
        const result = await createStudent(payload).unwrap()
        toast.success('Élève créé')
        if (result.account) {
          setCreatedAccount(result.account)
        }

        if (result.createdParent?.loginEmail) {
          setCreatedParent(result.createdParent)
        }
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
          <DialogTitle>{isEditing ? "Modifier l'élève" : 'Nouvel élève'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Le matricule identifie l\u2019élève de façon unique.'
              : `L\u2019élève est rattaché à une classe dès sa création, avec le statut « non inscrit » jusqu\u2019à sa validation par la scolarité${currentYear ? ` (${currentYear.name})` : ''}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="studentNumber">Matricule</Label>
            <Input
              id="studentNumber"
              placeholder="E-0001"
              required
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
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
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </div>
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
            <Label htmlFor="placeOfBirth">
              Lieu de naissance <span className="font-normal text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="placeOfBirth"
              value={placeOfBirth}
              onChange={(event) => setPlaceOfBirth(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nationality">
                Nationalité <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="nationality"
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">
                Adresse <span className="font-normal text-muted-foreground">(optionnel)</span>
              </Label>
              <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
          </div>

          {!isEditing && (
            <div className="bg-muted/40 rounded-lg border p-4">
              <Label htmlFor="with-parent" className="flex items-center justify-between gap-3">
                <span>
                  Ajouter un parent
                  <span className="block text-sm font-normal text-muted-foreground">
                    Un compte de connexion est créé (mot de passe par défaut remis à la secrétaire).
                  </span>
                </span>
                <Switch
                  id="with-parent"
                  checked={withParent}
                  onCheckedChange={setWithParent}
                  aria-label="Ajouter un parent"
                />
              </Label>

              {withParent && (
                <div className="mt-4 grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentFirstName">Prénom du parent</Label>
                      <Input
                        id="parentFirstName"
                        required
                        value={parentFirstName}
                        onChange={(event) => setParentFirstName(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentLastName">Nom du parent</Label>
                      <Input
                        id="parentLastName"
                        required
                        value={parentLastName}
                        onChange={(event) => setParentLastName(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="parentRelation">Lien de parenté</Label>
                    <Select value={parentRelation} onValueChange={(value) => setParentRelation(value as ParentRelationType)}>
                      <SelectTrigger id="parentRelation" className="w-full">
                        <SelectValue>
                          {(value: ParentRelationType) => parentRelationLabels[value]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(parentRelationLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentPhone">
                        Téléphone <span className="font-normal text-muted-foreground">(optionnel)</span>
                      </Label>
                      <Input
                        id="parentPhone"
                        value={parentPhone}
                        onChange={(event) => setParentPhone(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentEmail">
                        Email <span className="font-normal text-muted-foreground">(optionnel)</span>
                      </Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={parentEmail}
                        onChange={(event) => setParentEmail(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentOccupation">
                        Profession <span className="font-normal text-muted-foreground">(optionnel)</span>
                      </Label>
                      <Input
                        id="parentOccupation"
                        value={parentOccupation}
                        onChange={(event) => setParentOccupation(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="parentAddress">
                        Adresse <span className="font-normal text-muted-foreground">(optionnel)</span>
                      </Label>
                      <Input
                        id="parentAddress"
                        value={parentAddress}
                        onChange={(event) => setParentAddress(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !classId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog
        open={Boolean(createdAccount ?? createdParent)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedAccount(null)
            setCreatedParent(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Identifiants à transmettre</DialogTitle>
            <DialogDescription>
              Ces mots de passe ne sont affichés qu&rsquo;une fois : notez-les avant de fermer.
            </DialogDescription>
          </DialogHeader>

          {createdAccount && (
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">
                Compte de {firstName} {lastName}
              </p>
              <div className="bg-muted/40 rounded-lg border p-4 font-mono text-sm">
                <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
                  <span className="font-sans text-muted-foreground">Identifiant</span>
                  <span className="text-right font-medium">{createdAccount.loginEmail}</span>
                  <span className="font-sans text-muted-foreground">Mot de passe</span>
                  <span className="text-right font-medium">{createdAccount.password}</span>
                </div>
              </div>
            </div>
          )}

          {createdParent?.isSelf && (
            <p className="text-sm text-muted-foreground">
              Aucun parent n&rsquo;ayant été renseigné, l&rsquo;élève est déclaré son propre
              responsable : ce compte sert aussi de contact principal.
            </p>
          )}

          {createdParent?.loginEmail && (
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">
                Compte de {createdParent.firstName} {createdParent.lastName} (responsable)
              </p>
              <div className="bg-muted/40 rounded-lg border p-4 font-mono text-sm">
                <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
                  <span className="font-sans text-muted-foreground">Identifiant</span>
                  <span className="text-right font-medium">{createdParent.loginEmail}</span>
                  <span className="font-sans text-muted-foreground">Mot de passe</span>
                  <span className="text-right font-medium">{createdParent.password}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setCreatedAccount(null)
                setCreatedParent(null)
              }}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
