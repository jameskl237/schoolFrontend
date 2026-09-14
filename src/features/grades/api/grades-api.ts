import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { Grade, GradeFilters, SaveGradesRequest, UpdateGradeRequest } from '../types'

export const gradesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    grades: builder.query<Grade[], GradeFilters | void>({
      query: (filters) => ({
        url: '/grades',
        params: filters
          ? {
              evaluationId: filters.evaluationId,
              studentId: filters.studentId,
              periodId: filters.periodId,
              sequenceId: filters.sequenceId,
              classId: filters.classId,
              academicYearId: filters.academicYearId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Grade[]>) => response.data,
      providesTags: (result) => [
        { type: 'Grades' as const, id: 'LIST' },
        ...(result?.map((grade) => ({ type: 'Grades' as const, id: grade.id })) ?? []),
      ],
    }),
    saveGrades: builder.mutation<Grade[], SaveGradesRequest>({
      query: (body) => ({ url: '/grades', method: 'PUT', body }),
      transformResponse: (response: ApiSuccess<Grade[]>) => response.data,
      invalidatesTags: [
        { type: 'Grades', id: 'LIST' },
        { type: 'Evaluations', id: 'LIST' },
      ],
    }),
    updateGrade: builder.mutation<Grade, UpdateGradeRequest>({
      query: ({ id, ...body }) => ({ url: `/grades/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Grade>) => response.data,
      invalidatesTags: [{ type: 'Grades', id: 'LIST' }],
    }),
    deleteGrade: builder.mutation<void, number>({
      query: (id) => ({ url: `/grades/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Grades', id: 'LIST' },
        { type: 'Evaluations', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGradesQuery,
  useSaveGradesMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
} = gradesApi
