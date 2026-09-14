export type NotificationType = 'GENERAL' | 'EVALUATION_REVIEW'

export interface AppNotification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface NotificationsResponse {
  notifications: AppNotification[]
  unreadCount: number
}
