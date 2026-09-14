import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateCycleRequest, Cycle, UpdateCycleRequest } from '../types'

export const cyclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    cycles: builder.query<Cycle[], number | undefined>({
      query: (sectionId) => ({ url: '/cycles', params: sectionId ? { sectionId } : undefined }),
      transformResponse: (response: ApiSuccess<Cycle[]>) => response.data,
      providesTags: (result) => [
        { type: 'Cycles' as const, id: 'LIST' },
        ...(result?.map((cycle) => ({ type: 'Cycles' as const, id: cycle.id })) ?? []),
      ],
    }),
    createCycle: builder.mutation<Cycle, CreateCycleRequest>({
      query: (body) => ({ url: '/cycles', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Cycle>) => response.data,
      invalidatesTags: [{ type: 'Cycles', id: 'LIST' }],
    }),
    updateCycle: builder.mutation<Cycle, UpdateCycleRequest>({
      query: ({ id, ...body }) => ({ url: `/cycles/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Cycle>) => response.data,
      invalidatesTags: [{ type: 'Cycles', id: 'LIST' }],
    }),
    deleteCycle: builder.mutation<void, number>({
      query: (id) => ({ url: `/cycles/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Cycles', id: 'LIST' },
        { type: 'GradeLevels', id: 'LIST' },
        { type: 'Classes', id: 'LIST' },
      ],
    }),
  }),
})

export const { useCyclesQuery, useCreateCycleMutation, useUpdateCycleMutation, useDeleteCycleMutation } =
  cyclesApi
