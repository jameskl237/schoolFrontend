import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateSequenceRequest,
  Sequence,
  SequenceFilters,
  UpdateSequenceRequest,
} from '../types'

export const sequencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sequences: builder.query<Sequence[], SequenceFilters | void>({
      query: (filters) => ({
        url: '/sequences',
        params: filters
          ? { periodId: filters.periodId, academicYearId: filters.academicYearId }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Sequence[]>) => response.data,
      providesTags: (result) => [
        { type: 'Sequences' as const, id: 'LIST' },
        ...(result?.map((sequence) => ({ type: 'Sequences' as const, id: sequence.id })) ?? []),
      ],
    }),
    createSequence: builder.mutation<Sequence, CreateSequenceRequest>({
      query: (body) => ({ url: '/sequences', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Sequence>) => response.data,
      invalidatesTags: [{ type: 'Sequences', id: 'LIST' }],
    }),
    updateSequence: builder.mutation<Sequence, UpdateSequenceRequest>({
      query: ({ id, ...body }) => ({ url: `/sequences/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Sequence>) => response.data,
      invalidatesTags: [
        { type: 'Sequences', id: 'LIST' },
        { type: 'Evaluations', id: 'LIST' },
      ],
    }),
    deleteSequence: builder.mutation<void, number>({
      query: (id) => ({ url: `/sequences/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Sequences', id: 'LIST' }],
    }),
  }),
})

export const {
  useSequencesQuery,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} = sequencesApi
