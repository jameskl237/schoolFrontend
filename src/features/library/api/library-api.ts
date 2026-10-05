import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { Book, CreateBookRequest, CreateLoanRequest, Loan, LoanFilters, UpdateBookRequest } from '../types'

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    books: builder.query<Book[], string | void>({
      query: (search) => ({ url: '/books', params: search ? { search } : undefined }),
      transformResponse: (response: ApiSuccess<Book[]>) => response.data,
      providesTags: (result) => [
        { type: 'Books' as const, id: 'LIST' },
        ...(result?.map((book) => ({ type: 'Books' as const, id: book.id })) ?? []),
      ],
    }),
    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (body) => ({ url: '/books', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Book>) => response.data,
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),
    updateBook: builder.mutation<Book, UpdateBookRequest>({
      query: ({ id, ...body }) => ({ url: `/books/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Book>) => response.data,
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),
    deleteBook: builder.mutation<void, number>({
      query: (id) => ({ url: `/books/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),
    addBookCopies: builder.mutation<Book, { id: number; count: number }>({
      query: ({ id, count }) => ({ url: `/books/${id}/copies`, method: 'POST', body: { count } }),
      transformResponse: (response: ApiSuccess<Book>) => response.data,
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),
    deleteBookCopy: builder.mutation<void, number>({
      query: (id) => ({ url: `/book-copies/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    loans: builder.query<Loan[], LoanFilters | void>({
      query: (filters) => ({
        url: '/loans',
        params: filters
          ? { status: filters.status, studentId: filters.studentId, teacherId: filters.teacherId }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Loan[]>) => response.data,
      providesTags: [{ type: 'Loans', id: 'LIST' }],
    }),
    createLoan: builder.mutation<Loan, CreateLoanRequest>({
      query: (body) => ({ url: '/loans', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Loan>) => response.data,
      invalidatesTags: [{ type: 'Loans', id: 'LIST' }, { type: 'Books', id: 'LIST' }],
    }),
    returnLoan: builder.mutation<Loan, number>({
      query: (id) => ({ url: `/loans/${id}/return`, method: 'POST' }),
      transformResponse: (response: ApiSuccess<Loan>) => response.data,
      invalidatesTags: [{ type: 'Loans', id: 'LIST' }, { type: 'Books', id: 'LIST' }],
    }),
    deleteLoan: builder.mutation<void, number>({
      query: (id) => ({ url: `/loans/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Loans', id: 'LIST' }, { type: 'Books', id: 'LIST' }],
    }),
  }),
})

export const {
  useBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useAddBookCopiesMutation,
  useDeleteBookCopyMutation,
  useLoansQuery,
  useCreateLoanMutation,
  useReturnLoanMutation,
  useDeleteLoanMutation,
} = libraryApi
