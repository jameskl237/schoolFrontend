import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateParentRequest, Parent, UpdateParentRequest } from '../types'

export const parentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    parents: builder.query<Parent[], void>({
      query: () => '/parents',
      transformResponse: (response: ApiSuccess<Parent[]>) => response.data,
      providesTags: (result) => [
        { type: 'Parents' as const, id: 'LIST' },
        ...(result?.map((parent) => ({ type: 'Parents' as const, id: parent.id })) ?? []),
      ],
    }),
    createParent: builder.mutation<Parent, CreateParentRequest>({
      query: (body) => ({ url: '/parents', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Parent>) => response.data,
      invalidatesTags: [{ type: 'Parents', id: 'LIST' }],
    }),
    updateParent: builder.mutation<Parent, UpdateParentRequest>({
      query: ({ id, ...body }) => ({ url: `/parents/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Parent>) => response.data,
      invalidatesTags: [{ type: 'Parents', id: 'LIST' }],
    }),
    deleteParent: builder.mutation<void, number>({
      query: (id) => ({ url: `/parents/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Parents', id: 'LIST' }],
    }),
  }),
})

export const {
  useParentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
} = parentsApi
