export interface TeachingSubject {
  classSubjectId: number
  subjectId: number
  name: string
  code: string
  coefficient: number
  teacher: { id: number; firstName: string; lastName: string }
}

export interface MyClass {
  id: number
  name: string
  code: string
  gradeLevelId: number
  /** Professeur principal : accès en lecture et visa sur toutes les matières de la classe. */
  isMainTeacher: boolean
  studentCount: number
  mySubjects: TeachingSubject[]
  /** Renseigné uniquement pour le professeur principal. */
  allSubjects: TeachingSubject[]
}

export interface MyClassesResponse {
  academicYear: { id: number; name: string; isCurrent: boolean } | null
  classes: MyClass[]
}
