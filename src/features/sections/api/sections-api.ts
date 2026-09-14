import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateSectionRequest, Section, UpdateSectionRequest } from '../types'

export const sectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sections: builder.query<Section[], number | undefined>({
      query: (schoolLevelId) => ({ url: '/sections', params: schoolLevelId ? { schoolLevelId } : undefined }),
      transformResponse: (response: ApiSuccess<Section[]>) => response.data,
      providesTags: (result) => [
        { type: 'Sections' as const, id: 'LIST' },
        ...(result?.map((section) => ({ type: 'Sections' as const, id: section.id })) ?? []),
      ],
    }),
    createSection: builder.mutation<Section, CreateSectionRequest>({
      query: (body) => ({ url: '/sections', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Section>) => response.data,
      invalidatesTags: [{ type: 'Sections', id: 'LIST' }],
    }),
    updateSection: builder.mutation<Section, UpdateSectionRequest>({
      query: ({ id, ...body }) => ({ url: `/sections/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Section>) => response.data,
      invalidatesTags: [{ type: 'Sections', id: 'LIST' }],
    }),
    deleteSection: builder.mutation<void, number>({
      query: (id) => ({ url: `/sections/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Sections', id: 'LIST' },
        { type: 'Cycles', id: 'LIST' },
        { type: 'GradeLevels', id: 'LIST' },
        { type: 'Classes', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionsApi
