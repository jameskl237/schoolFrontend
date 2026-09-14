import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateRouteRequest,
  CreateSubscriptionRequest,
  SubscriptionFilters,
  TransportRoute,
  TransportSubscription,
  UpdateRouteRequest,
  UpdateSubscriptionRequest,
} from '../types'

export const transportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    transportRoutes: builder.query<TransportRoute[], void>({
      query: () => '/transport/routes',
      transformResponse: (response: ApiSuccess<TransportRoute[]>) => response.data,
      providesTags: (result) => [
        { type: 'TransportRoutes' as const, id: 'LIST' },
        ...(result?.map((route) => ({ type: 'TransportRoutes' as const, id: route.id })) ?? []),
      ],
    }),
    createTransportRoute: builder.mutation<TransportRoute, CreateRouteRequest>({
      query: (body) => ({ url: '/transport/routes', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<TransportRoute>) => response.data,
      invalidatesTags: [{ type: 'TransportRoutes', id: 'LIST' }],
    }),
    updateTransportRoute: builder.mutation<TransportRoute, UpdateRouteRequest>({
      query: ({ id, ...body }) => ({ url: `/transport/routes/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<TransportRoute>) => response.data,
      invalidatesTags: [
        { type: 'TransportRoutes', id: 'LIST' },
        { type: 'TransportSubscriptions', id: 'LIST' },
      ],
    }),
    deleteTransportRoute: builder.mutation<void, number>({
      query: (id) => ({ url: `/transport/routes/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'TransportRoutes', id: 'LIST' },
        { type: 'TransportSubscriptions', id: 'LIST' },
      ],
    }),

    transportSubscriptions: builder.query<TransportSubscription[], SubscriptionFilters | void>({
      query: (filters) => ({
        url: '/transport/subscriptions',
        params: filters
          ? {
              studentId: filters.studentId,
              routeId: filters.routeId,
              academicYearId: filters.academicYearId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<TransportSubscription[]>) => response.data,
      providesTags: (result) => [
        { type: 'TransportSubscriptions' as const, id: 'LIST' },
        ...(result?.map((item) => ({ type: 'TransportSubscriptions' as const, id: item.id })) ?? []),
      ],
    }),
    createTransportSubscription: builder.mutation<TransportSubscription, CreateSubscriptionRequest>({
      query: (body) => ({ url: '/transport/subscriptions', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<TransportSubscription>) => response.data,
      invalidatesTags: [
        { type: 'TransportSubscriptions', id: 'LIST' },
        { type: 'TransportRoutes', id: 'LIST' },
      ],
    }),
    updateTransportSubscription: builder.mutation<TransportSubscription, UpdateSubscriptionRequest>({
      query: ({ id, ...body }) => ({ url: `/transport/subscriptions/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<TransportSubscription>) => response.data,
      invalidatesTags: [{ type: 'TransportSubscriptions', id: 'LIST' }],
    }),
    deleteTransportSubscription: builder.mutation<void, number>({
      query: (id) => ({ url: `/transport/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'TransportSubscriptions', id: 'LIST' },
        { type: 'TransportRoutes', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useTransportRoutesQuery,
  useCreateTransportRouteMutation,
  useUpdateTransportRouteMutation,
  useDeleteTransportRouteMutation,
  useTransportSubscriptionsQuery,
  useCreateTransportSubscriptionMutation,
  useUpdateTransportSubscriptionMutation,
  useDeleteTransportSubscriptionMutation,
} = transportApi
