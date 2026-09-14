import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateEnrollmentRequest,
  Enrollment,
  EnrollmentFilters,
  UpdateEnrollmentRequest,
} from '../types'

export const enrollmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    enrollments: builder.query<Enrollment[], EnrollmentFilters | void>({
      query: (filters) => ({
        url: '/enrollments',
        params: filters ? { classId: filters.classId, academicYearId: filters.academicYearId } : undefined,
      }),
      transformResponse: (response: ApiSuccess<Enrollment[]>) => response.data,
      providesTags: (result) => [
        { type: 'Enrollments' as const, id: 'LIST' },
        ...(result?.map((enrollment) => ({ type: 'Enrollments' as const, id: enrollment.id })) ?? []),
      ],
    }),
    createEnrollment: builder.mutation<Enrollment, CreateEnrollmentRequest>({
      query: (body) => ({ url: '/enrollments', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Enrollment>) => response.data,
      invalidatesTags: [{ type: 'Enrollments', id: 'LIST' }, 'Dashboard'],
    }),
    updateEnrollment: builder.mutation<Enrollment, UpdateEnrollmentRequest>({
      query: ({ id, ...body }) => ({ url: `/enrollments/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Enrollment>) => response.data,
      invalidatesTags: [{ type: 'Enrollments', id: 'LIST' }],
    }),
    deleteEnrollment: builder.mutation<void, number>({
      query: (id) => ({ url: `/enrollments/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Enrollments', id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const {
  useEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
} = enrollmentsApi
