import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateReportCardRequest,
  ReportCard,
  ReportCardFilters,
  UpdateReportCardRequest,
} from '../types'

export const reportCardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    reportCards: builder.query<ReportCard[], ReportCardFilters | void>({
      query: (filters) => ({
        url: '/report-cards',
        params: filters
          ? {
              studentId: filters.studentId,
              periodId: filters.periodId,
              classId: filters.classId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<ReportCard[]>) => response.data,
      providesTags: (result) => [
        { type: 'ReportCards' as const, id: 'LIST' },
        ...(result?.map((reportCard) => ({
          type: 'ReportCards' as const,
          id: reportCard.id,
        })) ?? []),
      ],
    }),
    createReportCard: builder.mutation<ReportCard, CreateReportCardRequest>({
      query: (body) => ({ url: '/report-cards', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<ReportCard>) => response.data,
      invalidatesTags: [{ type: 'ReportCards', id: 'LIST' }],
    }),
    updateReportCard: builder.mutation<ReportCard, UpdateReportCardRequest>({
      query: ({ id, ...body }) => ({ url: `/report-cards/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<ReportCard>) => response.data,
      invalidatesTags: [{ type: 'ReportCards', id: 'LIST' }],
    }),
    deleteReportCard: builder.mutation<void, number>({
      query: (id) => ({ url: `/report-cards/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'ReportCards', id: 'LIST' }],
    }),
  }),
})

export const {
  useReportCardsQuery,
  useCreateReportCardMutation,
  useUpdateReportCardMutation,
  useDeleteReportCardMutation,
} = reportCardsApi