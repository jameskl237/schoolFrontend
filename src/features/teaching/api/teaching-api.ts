import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { MyClassesResponse } from '../types'

export const teachingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myClasses: builder.query<MyClassesResponse, number | undefined>({
      query: (academicYearId) => ({
        url: '/my-classes',
        params: academicYearId ? { academicYearId } : undefined,
      }),
      transformResponse: (response: ApiSuccess<MyClassesResponse>) => response.data,
      providesTags: [{ type: 'MyClasses', id: 'LIST' }],
    }),
  }),
})

export const { useMyClassesQuery } = teachingApi
