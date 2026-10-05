import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateTeacherRequest,
  CreateTeacherResponse,
  Teacher,
  UpdateTeacherRequest,
} from '../types'

export const teachersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    teachers: builder.query<Teacher[], void>({
      query: () => '/teachers',
      transformResponse: (response: ApiSuccess<Teacher[]>) => response.data,
      providesTags: (result) => [
        { type: 'Teachers' as const, id: 'LIST' },
        ...(result?.map((teacher) => ({ type: 'Teachers' as const, id: teacher.id })) ?? []),
      ],
    }),
    createTeacher: builder.mutation<CreateTeacherResponse, CreateTeacherRequest>({
      query: (body) => ({ url: '/teachers', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<CreateTeacherResponse>) => response.data,
      invalidatesTags: [{ type: 'Teachers', id: 'LIST' }, { type: 'Users', id: 'LIST' }],
    }),
    updateTeacher: builder.mutation<Teacher, UpdateTeacherRequest>({
      query: ({ id, ...body }) => ({ url: `/teachers/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Teacher>) => response.data,
      invalidatesTags: [{ type: 'Teachers', id: 'LIST' }, { type: 'ClassSubjects', id: 'LIST' }],
    }),
    deleteTeacher: builder.mutation<void, number>({
      query: (id) => ({ url: `/teachers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Teachers', id: 'LIST' }, { type: 'ClassSubjects', id: 'LIST' }],
    }),
  }),
})

export const {
  useTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teachersApi
