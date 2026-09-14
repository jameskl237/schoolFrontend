import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type { CreateReviewRequest, EvaluationReview } from '../types'

export const evaluationReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    evaluationReviews: builder.query<EvaluationReview[], number>({
      query: (evaluationId) => `/evaluations/${evaluationId}/reviews`,
      transformResponse: (response: ApiSuccess<EvaluationReview[]>) => response.data,
      providesTags: (_result, _error, evaluationId) => [
        { type: 'EvaluationReviews' as const, id: evaluationId },
      ],
    }),
    createEvaluationReview: builder.mutation<EvaluationReview, CreateReviewRequest>({
      query: ({ evaluationId, ...body }) => ({
        url: `/evaluations/${evaluationId}/reviews`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccess<EvaluationReview>) => response.data,
      invalidatesTags: (_result, _error, { evaluationId }) => [
        { type: 'EvaluationReviews' as const, id: evaluationId },
        { type: 'Evaluations' as const, id: 'LIST' },
      ],
    }),
    resolveEvaluationReview: builder.mutation<EvaluationReview, { id: number; evaluationId: number }>({
      query: ({ id }) => ({ url: `/evaluation-reviews/${id}/resolve`, method: 'POST' }),
      transformResponse: (response: ApiSuccess<EvaluationReview>) => response.data,
      invalidatesTags: (_result, _error, { evaluationId }) => [
        { type: 'EvaluationReviews' as const, id: evaluationId },
        { type: 'Evaluations' as const, id: 'LIST' },
        { type: 'Notifications' as const, id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useEvaluationReviewsQuery,
  useCreateEvaluationReviewMutation,
  useResolveEvaluationReviewMutation,
} = evaluationReviewsApi
