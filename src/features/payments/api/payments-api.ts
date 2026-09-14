import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreatePaymentRequest } from '../types'

interface Payment {
  id: number
  invoiceId: number
  amount: string
  paymentDate: string
  method: string
  reference: string | null
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<Payment, CreatePaymentRequest>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Payment>) => response.data,
      invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
    }),
    deletePayment: builder.mutation<void, number>({
      query: (id) => ({ url: `/payments/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
    }),
  }),
})

export const { useCreatePaymentMutation, useDeletePaymentMutation } = paymentsApi
