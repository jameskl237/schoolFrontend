import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateEvaluationRequest,
  Evaluation,
  EvaluationFilters,
  UpdateEvaluationRequest,
} from '../types'

export const evaluationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    evaluations: builder.query<Evaluation[], EvaluationFilters | void>({
      query: (filters) => ({
        url: '/evaluations',
        params: filters
          ? {
              classSubjectId: filters.classSubjectId,
              periodId: filters.periodId,
              sequenceId: filters.sequenceId,
              classId: filters.classId,
              academicYearId: filters.academicYearId,
            }
          : undefined,
      }),
      transformResponse: (response: ApiSuccess<Evaluation[]>) => response.data,
      providesTags: (result) => [
        { type: 'Evaluations' as const, id: 'LIST' },
        ...(result?.map((evaluation) => ({ type: 'Evaluations' as const, id: evaluation.id })) ?? []),
      ],
    }),
    createEvaluation: builder.mutation<Evaluation, CreateEvaluationRequest>({
      query: (body) => ({ url: '/evaluations', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [{ type: 'Evaluations', id: 'LIST' }],
    }),
    updateEvaluation: builder.mutation<Evaluation, UpdateEvaluationRequest>({
      query: ({ id, ...body }) => ({ url: `/evaluations/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [{ type: 'Evaluations', id: 'LIST' }],
    }),
    // La validation fige les notes de l'évaluation ; la réouverture les rend modifiables.
    validateEvaluation: builder.mutation<Evaluation, number>({
      query: (id) => ({ url: `/evaluations/${id}/validate`, method: 'POST' }),
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [
        { type: 'Evaluations', id: 'LIST' },
        { type: 'Grades', id: 'LIST' },
      ],
    }),
    reopenEvaluation: builder.mutation<Evaluation, number>({
      query: (id) => ({ url: `/evaluations/${id}/reopen`, method: 'POST' }),
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [
        { type: 'Evaluations', id: 'LIST' },
        { type: 'Grades', id: 'LIST' },
      ],
    }),
    deleteEvaluation: builder.mutation<void, number>({
      query: (id) => ({ url: `/evaluations/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Evaluations', id: 'LIST' },
        { type: 'Grades', id: 'LIST' },
      ],
    }),
    uploadExamPaper: builder.mutation<Evaluation, { id: number; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData()
        body.append('file', file)
        return { url: `/evaluations/${id}/exam-paper`, method: 'POST', body }
      },
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [
        { type: 'Evaluations', id: 'LIST' },
        { type: 'Grades', id: 'LIST' },
      ],
    }),
    removeExamPaper: builder.mutation<Evaluation, number>({
      query: (id) => ({ url: `/evaluations/${id}/exam-paper`, method: 'DELETE' }),
      transformResponse: (response: ApiSuccess<Evaluation>) => response.data,
      invalidatesTags: [
        { type: 'Evaluations', id: 'LIST' },
        { type: 'Grades', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useEvaluationsQuery,
  useCreateEvaluationMutation,
  useUpdateEvaluationMutation,
  useValidateEvaluationMutation,
  useReopenEvaluationMutation,
  useDeleteEvaluationMutation,
  useUploadExamPaperMutation,
  useRemoveExamPaperMutation,
} = evaluationsApi
