import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { credentialsUpdated, loggedOut } from '@/features/auth/auth-slice'
import type { AuthPayload } from '@/features/auth/types'
import type { ApiSuccess } from '@/types/api'
import type { RootState } from '../store'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * The refresh token lives in an httpOnly cookie scoped to /auth/refresh — the backend
 * rejects the access token silently (401) once it expires, so every query retries once
 * through /auth/refresh before giving up and logging the user out.
 */
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions)

    if (refreshResult.data) {
      const { data } = refreshResult.data as ApiSuccess<AuthPayload>
      api.dispatch(credentialsUpdated(data))
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(loggedOut())
    }
  }

  return result
}
