export type TransportSubscriptionStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export interface TransportRoute {
  id: number
  establishmentId: number
  name: string
  code: string
  description: string | null
  fee: string
  feeTypeId: number | null
  createdAt: string
  updatedAt: string
  feeType: { id: number; name: string } | null
  _count: { subscriptions: number }
}

export interface TransportSubscription {
  id: number
  studentId: number
  routeId: number
  academicYearId: number
  status: TransportSubscriptionStatus
  startDate: string
  endDate: string | null
  pickupPoint: string | null
  createdAt: string
  updatedAt: string
  student: { id: number; firstName: string; lastName: string; studentNumber: string }
  route: { id: number; name: string; code: string; fee: string }
  academicYear: { id: number; name: string; isCurrent: boolean }
}

export interface SubscriptionFilters {
  studentId?: number
  routeId?: number
  academicYearId?: number
}

export interface CreateRouteRequest {
  name: string
  code: string
  description?: string
  fee: number
  feeTypeId?: number
}

export interface UpdateRouteRequest {
  id: number
  name?: string
  code?: string
  description?: string | null
  fee?: number
  feeTypeId?: number | null
}

export interface CreateSubscriptionRequest {
  studentId: number
  routeId: number
  academicYearId?: number
  status?: TransportSubscriptionStatus
  startDate?: string
  pickupPoint?: string
}

export interface UpdateSubscriptionRequest {
  id: number
  routeId?: number
  status?: TransportSubscriptionStatus
  endDate?: string | null
  pickupPoint?: string | null
}
