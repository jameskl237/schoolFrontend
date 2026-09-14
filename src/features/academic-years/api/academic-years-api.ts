import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { AcademicYear, CreateAcademicYearRequest, UpdateAcademicYearRequest } from '../types'

export const academicYearsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    academicYears: builder.query<AcademicYear[], void>({
      query: () => '/academic-years',
      transformResponse: (response: ApiSuccess<AcademicYear[]>) => response.data,
      providesTags: (result) => [
        { type: 'AcademicYears' as const, id: 'LIST' },
        ...(result?.map((year) => ({ type: 'AcademicYears' as const, id: year.id })) ?? []),
      ],
    }),
    createAcademicYear: builder.mutation<AcademicYear, CreateAcademicYearRequest>({
      query: (body) => ({ url: '/academic-years', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<AcademicYear>) => response.data,
      invalidatesTags: [{ type: 'AcademicYears', id: 'LIST' }, 'Dashboard'],
    }),
    updateAcademicYear: builder.mutation<AcademicYear, UpdateAcademicYearRequest>({
      query: ({ id, ...body }) => ({ url: `/academic-years/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<AcademicYear>) => response.data,
      invalidatesTags: [{ type: 'AcademicYears', id: 'LIST' }, 'Dashboard'],
    }),
    deleteAcademicYear: builder.mutation<void, number>({
      query: (id) => ({ url: `/academic-years/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AcademicYears', id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const {
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
} = academicYearsApi
