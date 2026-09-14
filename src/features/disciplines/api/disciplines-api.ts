import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateDisciplineRecordRequest,
  DisciplineFilters,
  DisciplineRecord,
  UpdateDisciplineRecordRequest,
} from '../types'

export const disciplinesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    disciplines: builder.query<DisciplineRecord[], DisciplineFilters | void>({
      query: (filters) => ({
        url: '/disciplines',
        params: filters
          ? {
              studentId: filters.studentId,
              classId: filters.classId,
              type: filters.type,
              from: filters.from,
              to: filters.to,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<DisciplineRecord[]>) => response.data,
      providesTags: (result) => [
        { type: 'Disciplines' as const, id: 'LIST' },
        ...(result?.map((record) => ({
          type: 'Disciplines' as const,
          id: record.id,
        })) ?? []),
      ],
    }),
    createDisciplineRecord: builder.mutation<DisciplineRecord, CreateDisciplineRecordRequest>({
      query: (body) => ({ url: '/disciplines', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<DisciplineRecord>) => response.data,
      invalidatesTags: [{ type: 'Disciplines', id: 'LIST' }],
    }),
    updateDisciplineRecord: builder.mutation<DisciplineRecord, UpdateDisciplineRecordRequest>({
      query: ({ id, ...body }) => ({ url: `/disciplines/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<DisciplineRecord>) => response.data,
      invalidatesTags: [{ type: 'Disciplines', id: 'LIST' }],
    }),
    deleteDisciplineRecord: builder.mutation<void, number>({
      query: (id) => ({ url: `/disciplines/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Disciplines', id: 'LIST' }],
    }),
  }),
})

export const {
  useDisciplinesQuery,
  useCreateDisciplineRecordMutation,
  useUpdateDisciplineRecordMutation,
  useDeleteDisciplineRecordMutation,
} = disciplinesApi