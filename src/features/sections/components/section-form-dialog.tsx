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
import { useSchoolLevelsQuery } from '@/features/school-levels/api/school-levels-api'
import { getErrorMessage } from '@/lib/get-error-message'

import { useCreateSectionMutation, useUpdateSectionMutation } from '../api/sections-api'
import { sectionLanguageLabels } from '../labels'
import type { Section, SectionLanguage } from '../types'

interface SectionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: Section | null
  defaultSchoolLevelId?: number
}

export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  defaultSchoolLevelId,
}: SectionFormDialogProps) {
  const isEditing = Boolean(section)
  const { data: schoolLevels } = useSchoolLevelsQuery()
  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation()
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation()

  const [schoolLevelId, setSchoolLevelId] = useState('')
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<SectionLanguage>('FRANCOPHONE')

  useEffect(() => {
    if (!open) return

    setSchoolLevelId(String(section?.schoolLevelId ?? defaultSchoolLevelId ?? ''))
    setName(section?.name ?? '')
    setLanguage(section?.language ?? 'FRANCOPHONE')
  }, [open, section, defaultSchoolLevelId])

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      if (isEditing && section) {
        await updateSection({ id: section.id, schoolLevelId: Number(schoolLevelId), name, language }).unwrap()
        toast.success('Section mise à jour')
      } else {
        await createSection({ schoolLevelId: Number(schoolLevelId), name, language }).unwrap()
        toast.success('Section créée')
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
          <DialogTitle>{isEditing ? 'Modifier la section' : 'Nouvelle section'}</DialogTitle>
          <DialogDescription>
            Le sous-système linguistique (francophone/anglophone) au sein d&rsquo;un niveau scolaire.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="schoolLevelId">Niveau scolaire</Label>
            <Select value={schoolLevelId} onValueChange={(value) => setSchoolLevelId(value ?? '')}>
              <SelectTrigger id="schoolLevelId" className="w-full">
                <SelectValue>
                  {(value: string) => {
                    if (!value) return 'Choisir un niveau'
                    return schoolLevels?.find((level) => String(level.id) === value)?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {schoolLevels?.map((level) => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Section Francophone"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="language">Langue</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as SectionLanguage)}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue>{(value: SectionLanguage) => sectionLanguageLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sectionLanguageLabels).map(([value, label]) => (
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
            <Button type="submit" disabled={isLoading || !schoolLevelId}>
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
