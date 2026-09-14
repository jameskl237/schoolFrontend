import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { Establishment, UpdateEstablishmentRequest } from '../types'

export const establishmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myEstablishment: builder.query<Establishment, void>({
      query: () => '/establishments/me',
      transformResponse: (response: ApiSuccess<Establishment>) => response.data,
      providesTags: ['Establishment'],
    }),
    updateMyEstablishment: builder.mutation<Establishment, UpdateEstablishmentRequest>({
      query: (body) => ({ url: '/establishments/me', method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Establishment>) => response.data,
      invalidatesTags: ['Establishment', 'Dashboard'],
    }),
  }),
})

export const { useMyEstablishmentQuery, useUpdateMyEstablishmentMutation } = establishmentApi
