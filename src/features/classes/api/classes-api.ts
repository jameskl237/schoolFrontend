import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateClassRequest, SchoolClass, UpdateClassRequest } from '../types'

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    classes: builder.query<SchoolClass[], number | undefined>({
      query: (gradeLevelId) => ({ url: '/classes', params: gradeLevelId ? { gradeLevelId } : undefined }),
      transformResponse: (response: ApiSuccess<SchoolClass[]>) => response.data,
      providesTags: (result) => [
        { type: 'Classes' as const, id: 'LIST' },
        ...(result?.map((klass) => ({ type: 'Classes' as const, id: klass.id })) ?? []),
      ],
    }),
    createClass: builder.mutation<SchoolClass, CreateClassRequest>({
      query: (body) => ({ url: '/classes', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<SchoolClass>) => response.data,
      invalidatesTags: [{ type: 'Classes', id: 'LIST' }, { type: 'Classrooms', id: 'LIST' }],
    }),
    updateClass: builder.mutation<SchoolClass, UpdateClassRequest>({
      query: ({ id, ...body }) => ({ url: `/classes/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<SchoolClass>) => response.data,
      invalidatesTags: [{ type: 'Classes', id: 'LIST' }, { type: 'Classrooms', id: 'LIST' }],
    }),
    deleteClass: builder.mutation<void, number>({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Classes', id: 'LIST' }, { type: 'Classrooms', id: 'LIST' }],
    }),
  }),
})

export const {
  useClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classesApi
