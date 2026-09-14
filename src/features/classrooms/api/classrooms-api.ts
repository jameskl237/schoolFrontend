import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { Classroom, CreateClassroomRequest, UpdateClassroomRequest } from '../types'

export const classroomsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    classrooms: builder.query<Classroom[], { onlyAvailable?: boolean } | void>({
      query: (args) => ({
        url: '/classrooms',
        params: args?.onlyAvailable ? { available: 'true' } : undefined,
      }),
      transformResponse: (response: ApiSuccess<Classroom[]>) => response.data,
      providesTags: (result) => [
        { type: 'Classrooms' as const, id: 'LIST' },
        ...(result?.map((room) => ({ type: 'Classrooms' as const, id: room.id })) ?? []),
      ],
    }),
    createClassroom: builder.mutation<Classroom, CreateClassroomRequest>({
      query: (body) => ({ url: '/classrooms', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Classroom>) => response.data,
      invalidatesTags: [{ type: 'Classrooms', id: 'LIST' }],
    }),
    updateClassroom: builder.mutation<Classroom, UpdateClassroomRequest>({
      query: ({ id, ...body }) => ({ url: `/classrooms/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Classroom>) => response.data,
      invalidatesTags: [{ type: 'Classrooms', id: 'LIST' }],
    }),
    deleteClassroom: builder.mutation<void, number>({
      query: (id) => ({ url: `/classrooms/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Classrooms', id: 'LIST' }],
    }),
  }),
})

export const {
  useClassroomsQuery,
  useCreateClassroomMutation,
  useUpdateClassroomMutation,
  useDeleteClassroomMutation,
} = classroomsApi
