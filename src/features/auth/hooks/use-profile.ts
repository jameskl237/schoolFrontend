import { useAppSelector } from '@/app/hooks'

/**
 * L'identité applicative du compte connecté : elle dit si l'utilisateur agit
 * en tant qu'enseignant, élève, parent ou tuteur. Le backend refait la même
 * vérification — ceci ne sert qu'à ne pas proposer une action vouée au 403.
 */
export function useProfile() {
  const user = useAppSelector((state) => state.auth.user)

  return {
    teacherId: user?.teacherId ?? null,
    studentId: user?.studentId ?? null,
    parentId: user?.parentId ?? null,
    guardianId: user?.guardianId ?? null,
    isTeacher: user?.teacherId != null,
    isStudent: user?.studentId != null,
    isParent: user?.parentId != null,
  }
}
