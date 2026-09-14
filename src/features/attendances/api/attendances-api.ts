import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  Attendance,
  AttendanceFilters,
  SaveAttendancesRequest,
  UpdateAttendanceRequest,
} from '../types'

export const attendancesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    attendances: builder.query<Attendance[], AttendanceFilters | void>({
      query: (filters) => ({
        url: '/attendances',
        params: filters
          ? {
              classId: filters.classId,
              studentId: filters.studentId,
              from: filters.from,
              to: filters.to,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Attendance[]>) => response.data,
      providesTags: (result) => [
        { type: 'Attendances' as const, id: 'LIST' },
        ...(result?.map((attendance) => ({ type: 'Attendances' as const, id: attendance.id })) ?? []),
      ],
    }),
    saveAttendances: builder.mutation<Attendance[], SaveAttendancesRequest>({
      query: (body) => ({ url: '/attendances', method: 'PUT', body }),
      transformResponse: (response: ApiSuccess<Attendance[]>) => response.data,
      invalidatesTags: [{ type: 'Attendances', id: 'LIST' }],
    }),
    updateAttendance: builder.mutation<Attendance, UpdateAttendanceRequest>({
      query: ({ id, ...body }) => ({ url: `/attendances/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Attendance>) => response.data,
      invalidatesTags: [{ type: 'Attendances', id: 'LIST' }],
    }),
    deleteAttendance: builder.mutation<void, number>({
      query: (id) => ({ url: `/attendances/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Attendances', id: 'LIST' }],
    }),
  }),
})

export const {
  useAttendancesQuery,
  useSaveAttendancesMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendancesApi
