import { useAppSelector } from '@/app/hooks'

export function usePermissions() {
  const permissions = useAppSelector((state) => state.auth.user?.permissions) ?? []

  const hasPermission = (...anyOf: string[]) => anyOf.some((code) => permissions.includes(code))

  return { permissions, hasPermission }
}
