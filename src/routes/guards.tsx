import { ShieldAlert } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/empty-state'
import { usePermissions } from '@/features/auth/hooks/use-permission'

export function ProtectedRoute() {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const user = useAppSelector((state) => state.auth.user)

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/** L'espace « Mon enfant » est réservé aux comptes qui ont une identité parent. */
export function RequireParent() {
  const user = useAppSelector((state) => state.auth.user)

  if (!user?.parentId) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Accès réservé"
        description="Cet espace est réservé aux parents disposant d'un compte."
      />
    )
  }

  return <Outlet />
}

interface RequirePermissionProps {
  anyOf: string[]
}

export function RequirePermission({ anyOf }: RequirePermissionProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(...anyOf)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Accès refusé"
        description="Vous n'avez pas la permission nécessaire pour accéder à cette page."
      />
    )
  }

  return <Outlet />
}
