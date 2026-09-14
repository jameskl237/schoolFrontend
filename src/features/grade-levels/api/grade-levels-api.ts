import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateGradeLevelRequest, GradeLevel, UpdateGradeLevelRequest } from '../types'

export const gradeLevelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    gradeLevels: builder.query<GradeLevel[], number | undefined>({
      query: (cycleId) => ({ url: '/grade-levels', params: cycleId ? { cycleId } : undefined }),
      transformResponse: (response: ApiSuccess<GradeLevel[]>) => response.data,
      providesTags: (result) => [
        { type: 'GradeLevels' as const, id: 'LIST' },
        ...(result?.map((gradeLevel) => ({ type: 'GradeLevels' as const, id: gradeLevel.id })) ?? []),
      ],
    }),
    createGradeLevel: builder.mutation<GradeLevel, CreateGradeLevelRequest>({
      query: (body) => ({ url: '/grade-levels', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<GradeLevel>) => response.data,
      invalidatesTags: [{ type: 'GradeLevels', id: 'LIST' }],
    }),
    updateGradeLevel: builder.mutation<GradeLevel, UpdateGradeLevelRequest>({
      query: ({ id, ...body }) => ({ url: `/grade-levels/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<GradeLevel>) => response.data,
      invalidatesTags: [{ type: 'GradeLevels', id: 'LIST' }],
    }),
    deleteGradeLevel: builder.mutation<void, number>({
      query: (id) => ({ url: `/grade-levels/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'GradeLevels', id: 'LIST' }, { type: 'Classes', id: 'LIST' }],
    }),
  }),
})

export const {
  useGradeLevelsQuery,
  useCreateGradeLevelMutation,
  useUpdateGradeLevelMutation,
  useDeleteGradeLevelMutation,
} = gradeLevelsApi
