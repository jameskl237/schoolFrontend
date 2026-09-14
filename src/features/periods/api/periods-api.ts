import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreatePeriodRequest, Period, UpdatePeriodRequest } from '../types'

export const periodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    periods: builder.query<Period[], number | undefined>({
      query: (academicYearId) => ({
        url: '/periods',
        params: academicYearId ? { academicYearId } : undefined,
      }),
      transformResponse: (response: ApiSuccess<Period[]>) => response.data,
      providesTags: (result) => [
        { type: 'Periods' as const, id: 'LIST' },
        ...(result?.map((period) => ({ type: 'Periods' as const, id: period.id })) ?? []),
      ],
    }),
    createPeriod: builder.mutation<Period, CreatePeriodRequest>({
      query: (body) => ({ url: '/periods', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Period>) => response.data,
      invalidatesTags: [{ type: 'Periods', id: 'LIST' }],
    }),
    updatePeriod: builder.mutation<Period, UpdatePeriodRequest>({
      query: ({ id, ...body }) => ({ url: `/periods/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Period>) => response.data,
      invalidatesTags: [{ type: 'Periods', id: 'LIST' }],
    }),
    deletePeriod: builder.mutation<void, number>({
      query: (id) => ({ url: `/periods/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Periods', id: 'LIST' }],
    }),
  }),
})

export const {
  usePeriodsQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
} = periodsApi
