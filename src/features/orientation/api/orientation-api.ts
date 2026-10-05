import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CounselingSession,
  CreateOrientationRequest,
  CreateSessionRequest,
  OrientationFilters,
  OrientationRecord,
  UpdateOrientationRequest,
} from '../types'

export const orientationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    orientations: builder.query<OrientationRecord[], OrientationFilters | void>({
      query: (filters) => ({
        url: '/orientations',
        params: filters
          ? {
              studentId: filters.studentId,
              academicYearId: filters.academicYearId,
              status: filters.status,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<OrientationRecord[]>) => response.data,
      providesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
    createOrientation: builder.mutation<OrientationRecord, CreateOrientationRequest>({
      query: (body) => ({ url: '/orientations', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<OrientationRecord>) => response.data,
      invalidatesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
    updateOrientation: builder.mutation<OrientationRecord, UpdateOrientationRequest>({
      query: ({ id, ...body }) => ({ url: `/orientations/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<OrientationRecord>) => response.data,
      invalidatesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
    deleteOrientation: builder.mutation<void, number>({
      query: (id) => ({ url: `/orientations/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
    addCounselingSession: builder.mutation<CounselingSession, CreateSessionRequest>({
      query: (body) => ({ url: '/counseling-sessions', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<CounselingSession>) => response.data,
      invalidatesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
    deleteCounselingSession: builder.mutation<void, number>({
      query: (id) => ({ url: `/counseling-sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Orientations', id: 'LIST' }],
    }),
  }),
})

export const {
  useOrientationsQuery,
  useCreateOrientationMutation,
  useUpdateOrientationMutation,
  useDeleteOrientationMutation,
  useAddCounselingSessionMutation,
  useDeleteCounselingSessionMutation,
} = orientationApi
