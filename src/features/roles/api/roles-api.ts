import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { Role } from '../types'

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    roles: builder.query<Role[], void>({
      query: () => '/roles',
      transformResponse: (response: ApiSuccess<Role[]>) => response.data,
      providesTags: ['Roles'],
    }),
  }),
})

export const { useRolesQuery } = rolesApi
