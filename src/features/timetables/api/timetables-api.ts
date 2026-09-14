import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateTimetableRequest,
  Timetable,
  TimetableFilters,
  UpdateTimetableRequest,
} from '../types'

export const timetablesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    timetables: builder.query<Timetable[], TimetableFilters | void>({
      query: (filters) => ({
        url: '/timetables',
        params: filters
          ? {
              classId: filters.classId,
              teacherId: filters.teacherId,
              classroomId: filters.classroomId,
              academicYearId: filters.academicYearId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Timetable[]>) => response.data,
      providesTags: (result) => [
        { type: 'Timetables' as const, id: 'LIST' },
        ...(result?.map((slot) => ({ type: 'Timetables' as const, id: slot.id })) ?? []),
      ],
    }),
    createTimetable: builder.mutation<Timetable, CreateTimetableRequest>({
      query: (body) => ({ url: '/timetables', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Timetable>) => response.data,
      invalidatesTags: [{ type: 'Timetables', id: 'LIST' }],
    }),
    updateTimetable: builder.mutation<Timetable, UpdateTimetableRequest>({
      query: ({ id, ...body }) => ({ url: `/timetables/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Timetable>) => response.data,
      invalidatesTags: [{ type: 'Timetables', id: 'LIST' }],
    }),
    deleteTimetable: builder.mutation<void, number>({
      query: (id) => ({ url: `/timetables/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Timetables', id: 'LIST' }],
    }),
  }),
})

export const {
  useTimetablesQuery,
  useCreateTimetableMutation,
  useUpdateTimetableMutation,
  useDeleteTimetableMutation,
} = timetablesApi
