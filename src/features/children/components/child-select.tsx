import { GraduationCap } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Student } from '@/features/students/types'

interface ChildSelectProps {
  students: Student[] | undefined
  value: string
  onValueChange: (value: string) => void
  label: (student: Student) => string
}

export function ChildSelect({ students, value, onValueChange, label }: ChildSelectProps) {
  const selected = students?.find((student) => String(student.id) === value) ?? null

  return (
    <Select value={value} onValueChange={(next) => onValueChange(next ?? '')}>
      <SelectTrigger className="w-full sm:w-80">
        <SelectValue>
          {(selectedValue: string) =>
            selectedValue ? (selected ? label(selected) : selectedValue) : 'Choisir un enfant'
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {students?.map((student) => (
          <SelectItem key={student.id} value={String(student.id)}>
            {label(student)}
          </SelectItem>
        ))}
        {!students?.length && (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <GraduationCap className="size-4" />
            Aucun enfant rattaché à votre compte.
          </div>
        )}
      </SelectContent>
    </Select>
  )
}