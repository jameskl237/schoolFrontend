import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateStudentRequest,
  CreateStudentResponse,
  Student,
  StudentFilters,
  UpdateStudentEnrollmentRequest,
  UpdateStudentRequest,
} from '../types'

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    students: builder.query<Student[], StudentFilters | void>({
      query: (filters) => ({
        url: '/students',
        params: filters
          ? { classId: filters.classId, academicYearId: filters.academicYearId }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Student[]>) => response.data,
      providesTags: (result) => [
        { type: 'Students' as const, id: 'LIST' },
        ...(result?.map((student) => ({ type: 'Students' as const, id: student.id })) ?? []),
      ],
    }),
    createStudent: builder.mutation<CreateStudentResponse, CreateStudentRequest>({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<CreateStudentResponse>) => response.data,
      invalidatesTags: [
        { type: 'Students', id: 'LIST' },
        { type: 'Enrollments', id: 'LIST' },
        { type: 'Parents', id: 'LIST' },
        'Dashboard',
      ],
    }),
    updateStudent: builder.mutation<Student, UpdateStudentRequest>({
      query: ({ id, ...body }) => ({ url: `/students/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Student>) => response.data,
      invalidatesTags: [
        { type: 'Students', id: 'LIST' },
        { type: 'Enrollments', id: 'LIST' },
      ],
    }),
    updateStudentEnrollment: builder.mutation<Student, UpdateStudentEnrollmentRequest>({
      query: ({ id, ...body }) => ({ url: `/students/${id}/enrollment`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Student>) => response.data,
      invalidatesTags: [
        { type: 'Students', id: 'LIST' },
        { type: 'Enrollments', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteStudent: builder.mutation<void, number>({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }, { type: 'Enrollments', id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const {
  useStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useUpdateStudentEnrollmentMutation,
  useDeleteStudentMutation,
} = studentsApi
