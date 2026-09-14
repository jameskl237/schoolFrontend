import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateInvoiceRequest, Invoice, UpdateInvoiceRequest } from '../types'

export interface InvoiceFilters {
  studentId?: number
  academicYearId?: number
}

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    invoices: builder.query<Invoice[], InvoiceFilters | void>({
      query: (filters) => ({
        url: '/invoices',
        params: filters
          ? { studentId: filters.studentId, academicYearId: filters.academicYearId }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Invoice[]>) => response.data,
      providesTags: (result) => [
        { type: 'Invoices' as const, id: 'LIST' },
        ...(result?.map((invoice) => ({ type: 'Invoices' as const, id: invoice.id })) ?? []),
      ],
    }),
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (body) => ({ url: '/invoices', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Invoice>) => response.data,
      invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
    }),
    updateInvoice: builder.mutation<Invoice, UpdateInvoiceRequest>({
      query: ({ id, ...body }) => ({ url: `/invoices/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Invoice>) => response.data,
      invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
    }),
    deleteInvoice: builder.mutation<void, number>({
      query: (id) => ({ url: `/invoices/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
    }),
  }),
})

export const {
  useInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoicesApi
