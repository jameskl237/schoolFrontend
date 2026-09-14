import { useMemo, useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { GraduationCap, MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAcademicYearsQuery } from '@/features/academic-years/api/academic-years-api'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { enrollmentStatusLabels } from '@/features/enrollments/labels'
import { useClassSubjectsQuery } from '@/features/class-subjects/api/class-subjects-api'
import { useSchoolStructure } from '@/features/school-structure/use-school-structure'
import {
  useDeleteStudentMutation,
  useStudentsQuery,
  useUpdateStudentEnrollmentMutation,
} from '@/features/students/api/students-api'
import { StudentFormDialog } from '@/features/students/components/student-form-dialog'
import { genderLabels } from '@/features/students/labels'
import type { EnrollmentStatus } from '@/features/enrollments/types'
import type { Student } from '@/features/students/types'
import { getErrorMessage } from '@/lib/get-error-message'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const ALL = 'all'

export function StudentsPage() {
  const { data: academicYears } = useAcademicYearsQuery()
  const currentYear = academicYears?.find((year) => year.isCurrent)

  const [yearFilter, setYearFilter] = useState(ALL)
  const [classFilter, setClassFilter] = useState(ALL)

  const yearId = yearFilter === ALL ? undefined : Number(yearFilter)
  const classId = classFilter === ALL ? undefined : Number(classFilter)

  const { data: classSubjects } = useClassSubjectsQuery(
    yearId ? { academicYearId: yearId } : undefined,
  )

  /** Les classes que l'utilisateur tient — pour un enseignant, uniquement les siennes. */
  const classes = useMemo(() => {
    const unique = new Map<number, string>()

    for (const item of classSubjects ?? []) {
      unique.set(item.class.id, item.class.name)
    }

    return [...unique.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [classSubjects])

  const { data: students, isLoading } = useStudentsQuery({
    ...(yearId ? { academicYearId: yearId } : {}),
    ...(classId ? { classId } : {}),
  })
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('students.manage')
  const canEnroll = hasPermission('enrollments.manage')
  const { gradeLevelPath } = useSchoolStructure()
  const [deleteStudent] = useDeleteStudentMutation()
  const [updateStudentEnrollment] = useUpdateStudentEnrollmentMutation()

  const [editing, setEditing] = useState<Student | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  /**
   * Le chemin de niveau vient de référentiels réservés à l'administration :
   * pour un enseignant ou un élève, on se contente du nom de la classe.
   */
  const classLabel = (klass: { name: string; gradeLevelId: number }) => {
    const path = gradeLevelPath(klass.gradeLevelId)

    return path === '—' ? klass.name : `${path} · ${klass.name}`
  }

  const handleCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (student: Student) => {
    setEditing(student)
    setDialogOpen(true)
  }

  // L'inscription est validée (ou annulée) par la scolarité depuis le registre.
  const handleEnrollmentChange = async (student: Student, status: EnrollmentStatus) => {
    try {
      await updateStudentEnrollment({ id: student.id, status }).unwrap()
      toast.success(status === 'ACTIVE' ? 'Élève inscrit' : 'Inscription mise à jour')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ??
          "Mise à jour de l'inscription impossible.",
      )
    }
  }

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Supprimer l'élève "${student.firstName} ${student.lastName}" ?`)) return

    try {
      await deleteStudent(student.id).unwrap()
      toast.success('Élève supprimé')
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Suppression impossible.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Élèves"
        description="Le registre des élèves de votre établissement."
        actions={
          canManage && (
            <Button onClick={handleCreate}>
              <Plus />
              Nouvel élève
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:max-w-2xl">
        <Select
          value={yearFilter}
          onValueChange={(value) => {
            setYearFilter(value ?? ALL)
            setClassFilter(ALL)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? 'Toutes les années'
                  : (academicYears?.find((y) => String(y.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les années</SelectItem>
            {academicYears?.map((year) => (
              <SelectItem key={year.id} value={String(year.id)}>
                {year.name}
                {currentYear?.id === year.id ? ' (en cours)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={(value) => setClassFilter(value ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) =>
                value === ALL
                  ? 'Toutes les classes'
                  : (classes.find((klass) => String(klass.id) === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les classes</SelectItem>
            {classes.map((klass) => (
              <SelectItem key={klass.id} value={String(klass.id)}>
                {klass.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Reveal>
        <Card className="gap-0 overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !students?.length ? (
            <EmptyState
              icon={GraduationCap}
              title="Aucun élève"
              description="Enregistrez le premier élève de votre établissement."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Naissance</TableHead>
                  <TableHead>Genre</TableHead>
                  {(canManage || canEnroll) && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {student.studentNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.currentEnrollment ? classLabel(student.currentEnrollment.class) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.isEnrolled ? 'default' : 'outline'}>
                        {student.isEnrolled
                          ? 'Inscrit'
                          : student.currentEnrollment
                            ? enrollmentStatusLabels[student.currentEnrollment.status]
                            : 'Non inscrit'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(new Date(student.dateOfBirth))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{genderLabels[student.gender]}</Badge>
                    </TableCell>
                    {(canManage || canEnroll) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEnroll && student.currentEnrollment && !student.isEnrolled && (
                              <DropdownMenuItem onClick={() => handleEnrollmentChange(student, 'ACTIVE')}>
                                Inscrire
                              </DropdownMenuItem>
                            )}
                            {canEnroll && student.isEnrolled && (
                              <DropdownMenuItem onClick={() => handleEnrollmentChange(student, 'PENDING')}>
                                Annuler l&rsquo;inscription
                              </DropdownMenuItem>
                            )}
                            {canManage && (
                              <DropdownMenuItem onClick={() => handleEdit(student)}>
                                Modifier
                              </DropdownMenuItem>
                            )}
                            {canManage && (
                              <DropdownMenuItem variant="destructive" onClick={() => handleDelete(student)}>
                                Supprimer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Reveal>

      <StudentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} student={editing} />
    </>
  )
}
