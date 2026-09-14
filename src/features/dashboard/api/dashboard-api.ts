import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { DashboardStats } from '../types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (response: ApiSuccess<DashboardStats>) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useDashboardStatsQuery } = dashboardApi
