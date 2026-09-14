import { useMemo } from 'react'

import { usePermissions } from '@/features/auth/hooks/use-permission'
import { useCyclesQuery } from '@/features/cycles/api/cycles-api'
import { useGradeLevelsQuery } from '@/features/grade-levels/api/grade-levels-api'
import { useSchoolLevelsQuery } from '@/features/school-levels/api/school-levels-api'
import { sectionLanguageLabels } from '@/features/sections/labels'
import { useSectionsQuery } from '@/features/sections/api/sections-api'

/**
 * Fetches the whole SchoolLevel > Section > Cycle > GradeLevel chain and exposes
 * lookup maps + "breadcrumb" path builders, so pages don't each re-join it by hand.
 */
export function useSchoolStructure() {
  const { hasPermission } = usePermissions()
  // Ces référentiels sont réservés à l'administration : un enseignant ou un élève
  // n'y a pas accès, et les interroger ne produirait que des 403. Les chemins de
  // niveau retombent alors sur « — », ce que les pages savent afficher.
  const canReadStructure = hasPermission(
    'school-levels.manage',
    'sections.manage',
    'cycles.manage',
    'grade-levels.manage',
  )
  const skip = !canReadStructure

  const { data: schoolLevels } = useSchoolLevelsQuery(undefined, { skip })
  const { data: sections } = useSectionsQuery(undefined, { skip })
  const { data: cycles } = useCyclesQuery(undefined, { skip })
  const { data: gradeLevels } = useGradeLevelsQuery(undefined, { skip })

  const schoolLevelById = useMemo(
    () => new Map(schoolLevels?.map((level) => [level.id, level])),
    [schoolLevels],
  )
  const sectionById = useMemo(() => new Map(sections?.map((section) => [section.id, section])), [sections])
  const cycleById = useMemo(() => new Map(cycles?.map((cycle) => [cycle.id, cycle])), [cycles])
  const gradeLevelById = useMemo(
    () => new Map(gradeLevels?.map((gradeLevel) => [gradeLevel.id, gradeLevel])),
    [gradeLevels],
  )

  const sectionPath = (sectionId: number): string => {
    const section = sectionById.get(sectionId)
    if (!section) return '—'
    const level = schoolLevelById.get(section.schoolLevelId)
    return `${level?.name ?? '—'} · ${sectionLanguageLabels[section.language]}`
  }

  const cyclePath = (cycleId: number): string => {
    const cycle = cycleById.get(cycleId)
    if (!cycle) return '—'
    return `${sectionPath(cycle.sectionId)} · ${cycle.name}`
  }

  const gradeLevelPath = (gradeLevelId: number): string => {
    const gradeLevel = gradeLevelById.get(gradeLevelId)
    if (!gradeLevel) return '—'
    return `${cyclePath(gradeLevel.cycleId)} · ${gradeLevel.name}`
  }

  return {
    schoolLevels,
    sections,
    cycles,
    gradeLevels,
    schoolLevelById,
    sectionById,
    cycleById,
    gradeLevelById,
    sectionPath,
    cyclePath,
    gradeLevelPath,
  }
}
