export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED'

export interface EvaluationReview {
  id: number
  evaluationId: number
  authorId: number
  decision: ReviewDecision
  comment: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  author: { id: number; firstName: string; lastName: string }
}

export interface CreateReviewRequest {
  evaluationId: number
  decision: ReviewDecision
  comment?: string
}
