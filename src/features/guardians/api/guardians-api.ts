import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateGuardianRequest,
  CreateGuardianResponse,
  Guardian,
  UpdateGuardianRequest,
} from '../types'

export const guardiansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    guardians: builder.query<Guardian[], void>({
      query: () => '/guardians',
      transformResponse: (response: ApiSuccess<Guardian[]>) => response.data,
      providesTags: (result) => [
        { type: 'Guardians' as const, id: 'LIST' },
        ...(result?.map((guardian) => ({ type: 'Guardians' as const, id: guardian.id })) ?? []),
      ],
    }),
    createGuardian: builder.mutation<CreateGuardianResponse, CreateGuardianRequest>({
      query: (body) => ({ url: '/guardians', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<CreateGuardianResponse>) => response.data,
      invalidatesTags: [{ type: 'Guardians', id: 'LIST' }, { type: 'Users', id: 'LIST' }],
    }),
    updateGuardian: builder.mutation<Guardian, UpdateGuardianRequest>({
      query: ({ id, ...body }) => ({ url: `/guardians/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Guardian>) => response.data,
      invalidatesTags: [{ type: 'Guardians', id: 'LIST' }],
    }),
    deleteGuardian: builder.mutation<void, number>({
      query: (id) => ({ url: `/guardians/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Guardians', id: 'LIST' }],
    }),
  }),
})

export const {
  useGuardiansQuery,
  useCreateGuardianMutation,
  useUpdateGuardianMutation,
  useDeleteGuardianMutation,
} = guardiansApi
