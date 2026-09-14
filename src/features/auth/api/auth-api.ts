import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import { credentialsUpdated, loggedOut } from '../auth-slice'
import type { AuthPayload, LoginRequest, User } from '../types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<AuthPayload>) => response.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(credentialsUpdated(data))
        } catch {
          // the caller reads the mutation's own `error` state — nothing to do here
        }
      },
    }),
    refresh: builder.mutation<AuthPayload, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response: ApiSuccess<AuthPayload>) => response.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled
          dispatch(credentialsUpdated(data))
        } catch {
          // no valid session to restore — AuthBootstrap's own .catch() dispatches loggedOut
        }
      },
    }),
    me: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiSuccess<User>) => response.data,
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
        } finally {
          dispatch(loggedOut())
        }
      },
    }),
  }),
})

export const { useLoginMutation, useRefreshMutation, useMeQuery, useLogoutMutation } = authApi
