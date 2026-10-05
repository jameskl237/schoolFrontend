import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Plus, Trash2 } from 'lucide-react'
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

import {
  useAddVaccinationMutation,
  useDeleteVaccinationMutation,
  useSaveMedicalRecordMutation,
} from '../api/health-records-api'
import type { MedicalRecord } from '../types'

interface MedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: MedicalRecord | null
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Le dossier médical est unique par élève : on choisit l'élève à la création,
 * puis le dossier s'édite en place, vaccins compris.
 */
export function MedicalRecordDialog({ open, onOpenChange, record }: MedicalRecordDialogProps) {
  const isEditing = record !== null
  const { data: students } = useStudentsQuery(undefined, { skip: !open || isEditing })
  const [saveRecord, { isLoading }] = useSaveMedicalRecordMutation()
  const [addVaccination] = useAddVaccinationMutation()
  const [deleteVaccination] = useDeleteVaccinationMutation()

  const [studentId, setStudentId] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [allergies, setAllergies] = useState('')
  const [chronicConditions, setChronicConditions] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [doctorPhone, setDoctorPhone] = useState('')
  const [vaccineName, setVaccineName] = useState('')
  const [vaccineDate, setVaccineDate] = useState('')

  useEffect(() => {
    if (!open) return

    setStudentId(record ? String(record.studentId) : '')
    setBloodGroup(record?.bloodGroup ?? '')
    setAllergies(record?.allergies ?? '')
    setChronicConditions(record?.chronicConditions ?? '')
    setEmergencyContact(record?.emergencyContact ?? '')
    setDoctorName(record?.doctorName ?? '')
    setDoctorPhone(record?.doctorPhone ?? '')
    setVaccineName('')
    setVaccineDate('')
  }, [open, record])

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action
      toast.success(message)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await saveRecord({
        studentId: Number(studentId),
        bloodGroup: bloodGroup || null,
        allergies: allergies || null,
        chronicConditions: chronicConditions || null,
        emergencyContact: emergencyContact || null,
        doctorName: doctorName || null,
        doctorPhone: doctorPhone || null,
      }).unwrap()
      toast.success('Dossier médical enregistré')
      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  const handleAddVaccine = () => {
    if (!vaccineName || !vaccineDate) {
      toast.error('Indiquez le nom du vaccin et sa date.')
      return
    }

    void run(
      addVaccination({ studentId: Number(studentId), name: vaccineName, date: vaccineDate })
        .unwrap()
        .then(() => {
          setVaccineName('')
          setVaccineDate('')
        }),
      'Vaccin ajouté',
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Dossier de ${record.student.firstName} ${record.student.lastName}`
              : 'Nouveau dossier médical'}
          </DialogTitle>
          <DialogDescription>
            Ces informations ne sont accessibles qu&rsquo;à l&rsquo;infirmerie.
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="bloodGroup">Groupe sanguin</Label>
              <Input
                id="bloodGroup"
                placeholder="O+"
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="emergencyContact">Contact d&rsquo;urgence</Label>
              <Input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(event) => setEmergencyContact(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={allergies}
              onChange={(event) => setAllergies(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="chronicConditions">Affections chroniques</Label>
            <Input
              id="chronicConditions"
              value={chronicConditions}
              onChange={(event) => setChronicConditions(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="doctorName">Médecin traitant</Label>
              <Input
                id="doctorName"
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="doctorPhone">Téléphone</Label>
              <Input
                id="doctorPhone"
                value={doctorPhone}
                onChange={(event) => setDoctorPhone(event.target.value)}
              />
            </div>
          </div>

          {isEditing && (
            <div className="grid gap-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Vaccinations</p>

              {record.vaccinations.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun vaccin enregistré.</p>
              ) : (
                <ul className="grid gap-1">
                  {record.vaccinations.map((vaccination) => (
                    <li key={vaccination.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>
                        {vaccination.name}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {dateFormatter.format(new Date(vaccination.date))}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Retirer ${vaccination.name}`}
                        onClick={() =>
                          void run(deleteVaccination(vaccination.id).unwrap(), 'Vaccin retiré')
                        }
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="vaccineName">Vaccin</Label>
                  <Input
                    id="vaccineName"
                    placeholder="BCG, DTC…"
                    value={vaccineName}
                    onChange={(event) => setVaccineName(event.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="vaccineDate">Date</Label>
                  <Input
                    id="vaccineDate"
                    type="date"
                    value={vaccineDate}
                    onChange={(event) => setVaccineDate(event.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" size="icon" aria-label="Ajouter le vaccin" onClick={handleAddVaccine}>
                  <Plus />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button type="submit" disabled={isLoading || !studentId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
