import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateUserRequest, StaffUser, UpdateUserRequest } from '../types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    users: builder.query<StaffUser[], void>({
      query: () => '/users',
      transformResponse: (response: ApiSuccess<StaffUser[]>) => response.data,
      providesTags: (result) => [
        { type: 'Users' as const, id: 'LIST' },
        ...(result?.map((user) => ({ type: 'Users' as const, id: user.id })) ?? []),
      ],
    }),
    createUser: builder.mutation<StaffUser, CreateUserRequest>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<StaffUser>) => response.data,
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),
    updateUser: builder.mutation<StaffUser, UpdateUserRequest>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<StaffUser>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id: 'LIST' },
        { type: 'Users', id },
      ],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const { useUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } =
  usersApi
