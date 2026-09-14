import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateFeeTypeRequest, FeeType, UpdateFeeTypeRequest } from '../types'

export const feeTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    feeTypes: builder.query<FeeType[], void>({
      query: () => '/fee-types',
      transformResponse: (response: ApiSuccess<FeeType[]>) => response.data,
      providesTags: (result) => [
        { type: 'FeeTypes' as const, id: 'LIST' },
        ...(result?.map((feeType) => ({ type: 'FeeTypes' as const, id: feeType.id })) ?? []),
      ],
    }),
    createFeeType: builder.mutation<FeeType, CreateFeeTypeRequest>({
      query: (body) => ({ url: '/fee-types', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<FeeType>) => response.data,
      invalidatesTags: [{ type: 'FeeTypes', id: 'LIST' }],
    }),
    updateFeeType: builder.mutation<FeeType, UpdateFeeTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/fee-types/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<FeeType>) => response.data,
      invalidatesTags: [{ type: 'FeeTypes', id: 'LIST' }],
    }),
    deleteFeeType: builder.mutation<void, number>({
      query: (id) => ({ url: `/fee-types/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'FeeTypes', id: 'LIST' }],
    }),
  }),
})

export const {
  useFeeTypesQuery,
  useCreateFeeTypeMutation,
  useUpdateFeeTypeMutation,
  useDeleteFeeTypeMutation,
} = feeTypesApi
