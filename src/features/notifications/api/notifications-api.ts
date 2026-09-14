import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { NotificationsResponse } from '../types'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<NotificationsResponse, boolean | void>({
      query: (onlyUnread) => ({
        url: '/notifications',
        params: onlyUnread ? { unread: 'true' } : undefined,
      }),
      transformResponse: (response: ApiSuccess<NotificationsResponse>) => response.data,
      providesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
})

export const {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
