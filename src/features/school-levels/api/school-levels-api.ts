import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateSchoolLevelRequest, SchoolLevel, UpdateSchoolLevelRequest } from '../types'

export const schoolLevelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    schoolLevels: builder.query<SchoolLevel[], void>({
      query: () => '/school-levels',
      transformResponse: (response: ApiSuccess<SchoolLevel[]>) => response.data,
      providesTags: (result) => [
        { type: 'SchoolLevels' as const, id: 'LIST' },
        ...(result?.map((level) => ({ type: 'SchoolLevels' as const, id: level.id })) ?? []),
      ],
    }),
    createSchoolLevel: builder.mutation<SchoolLevel, CreateSchoolLevelRequest>({
      query: (body) => ({ url: '/school-levels', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<SchoolLevel>) => response.data,
      invalidatesTags: [{ type: 'SchoolLevels', id: 'LIST' }],
    }),
    updateSchoolLevel: builder.mutation<SchoolLevel, UpdateSchoolLevelRequest>({
      query: ({ id, ...body }) => ({ url: `/school-levels/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<SchoolLevel>) => response.data,
      invalidatesTags: [{ type: 'SchoolLevels', id: 'LIST' }],
    }),
    deleteSchoolLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/school-levels/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'SchoolLevels', id: 'LIST' }, { type: 'Cycles', id: 'LIST' }],
    }),
  }),
})

export const {
  useSchoolLevelsQuery,
  useCreateSchoolLevelMutation,
  useUpdateSchoolLevelMutation,
  useDeleteSchoolLevelMutation,
} = schoolLevelsApi
