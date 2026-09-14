import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateFeeStructureRequest, FeeStructure, UpdateFeeStructureRequest } from '../types'

export const feeStructuresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    feeStructures: builder.query<FeeStructure[], number | undefined>({
      query: (academicYearId) => ({
        url: '/fee-structures',
        params: academicYearId ? { academicYearId } : undefined,
      }),
      transformResponse: (response: ApiSuccess<FeeStructure[]>) => response.data,
      providesTags: (result) => [
        { type: 'FeeStructures' as const, id: 'LIST' },
        ...(result?.map((fs) => ({ type: 'FeeStructures' as const, id: fs.id })) ?? []),
      ],
    }),
    createFeeStructure: builder.mutation<FeeStructure, CreateFeeStructureRequest>({
      query: (body) => ({ url: '/fee-structures', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<FeeStructure>) => response.data,
      invalidatesTags: [{ type: 'FeeStructures', id: 'LIST' }],
    }),
    updateFeeStructure: builder.mutation<FeeStructure, UpdateFeeStructureRequest>({
      query: ({ id, ...body }) => ({ url: `/fee-structures/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<FeeStructure>) => response.data,
      invalidatesTags: [{ type: 'FeeStructures', id: 'LIST' }],
    }),
    deleteFeeStructure: builder.mutation<void, number>({
      query: (id) => ({ url: `/fee-structures/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'FeeStructures', id: 'LIST' }],
    }),
  }),
})

export const {
  useFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useDeleteFeeStructureMutation,
} = feeStructuresApi
