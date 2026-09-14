import { useEffect, useRef, type ReactNode } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Spinner } from '@/components/spinner'
import { useRefreshMutation } from '@/features/auth/api/auth-api'
import { loggedOut } from '@/features/auth/auth-slice'

/**
 * Runs once on app load: tries to exchange the httpOnly refresh cookie for a fresh
 * access token, so a page reload doesn't bounce an already-logged-in user to /login.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrapped = useAppSelector((state) => state.auth.bootstrapped)
  const dispatch = useAppDispatch()
  const [refresh] = useRefreshMutation()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    refresh()
      .unwrap()
      .catch(() => dispatch(loggedOut()))
  }, [refresh, dispatch])

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  return children
}
