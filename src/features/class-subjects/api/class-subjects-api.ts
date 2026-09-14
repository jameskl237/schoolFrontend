import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  ClassSubject,
  ClassSubjectFilters,
  CreateClassSubjectRequest,
  UpdateClassSubjectRequest,
} from '../types'

export const classSubjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    classSubjects: builder.query<ClassSubject[], ClassSubjectFilters | void>({
      query: (filters) => ({
        url: '/class-subjects',
        params: filters
          ? {
              classId: filters.classId,
              teacherId: filters.teacherId,
              academicYearId: filters.academicYearId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<ClassSubject[]>) => response.data,
      providesTags: (result) => [
        { type: 'ClassSubjects' as const, id: 'LIST' },
        ...(result?.map((item) => ({ type: 'ClassSubjects' as const, id: item.id })) ?? []),
      ],
    }),
    createClassSubject: builder.mutation<ClassSubject, CreateClassSubjectRequest>({
      query: (body) => ({ url: '/class-subjects', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<ClassSubject>) => response.data,
      invalidatesTags: [{ type: 'ClassSubjects', id: 'LIST' }, { type: 'Teachers', id: 'LIST' }],
    }),
    updateClassSubject: builder.mutation<ClassSubject, UpdateClassSubjectRequest>({
      query: ({ id, ...body }) => ({ url: `/class-subjects/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<ClassSubject>) => response.data,
      invalidatesTags: [
        { type: 'ClassSubjects', id: 'LIST' },
        { type: 'Teachers', id: 'LIST' },
        { type: 'Timetables', id: 'LIST' },
      ],
    }),
    deleteClassSubject: builder.mutation<void, number>({
      query: (id) => ({ url: `/class-subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'ClassSubjects', id: 'LIST' },
        { type: 'Teachers', id: 'LIST' },
        { type: 'Timetables', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useClassSubjectsQuery,
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
  useDeleteClassSubjectMutation,
} = classSubjectsApi
