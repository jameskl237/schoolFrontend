import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateSubjectRequest, Subject, UpdateSubjectRequest } from '../types'

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subjects: builder.query<Subject[], void>({
      query: () => '/subjects',
      transformResponse: (response: ApiSuccess<Subject[]>) => response.data,
      providesTags: (result) => [
        { type: 'Subjects' as const, id: 'LIST' },
        ...(result?.map((subject) => ({ type: 'Subjects' as const, id: subject.id })) ?? []),
      ],
    }),
    createSubject: builder.mutation<Subject, CreateSubjectRequest>({
      query: (body) => ({ url: '/subjects', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Subject>) => response.data,
      invalidatesTags: [{ type: 'Subjects', id: 'LIST' }],
    }),
    updateSubject: builder.mutation<Subject, UpdateSubjectRequest>({
      query: ({ id, ...body }) => ({ url: `/subjects/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Subject>) => response.data,
      invalidatesTags: [{ type: 'Subjects', id: 'LIST' }, { type: 'ClassSubjects', id: 'LIST' }],
    }),
    deleteSubject: builder.mutation<void, number>({
      query: (id) => ({ url: `/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Subjects', id: 'LIST' }, { type: 'ClassSubjects', id: 'LIST' }],
    }),
  }),
})

export const {
  useSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi
