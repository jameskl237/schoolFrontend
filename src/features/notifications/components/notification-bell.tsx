import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../api/notifications-api'
import type { AppNotification } from '../types'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function NotificationBell() {
  const navigate = useNavigate()
  // Un rafraîchissement périodique suffit : rien ici ne justifie une connexion permanente.
  const { data } = useNotificationsQuery(undefined, { pollingInterval: 60_000 })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const open = async (notification: AppNotification) => {
    if (!notification.readAt) {
      await markRead(notification.id).unwrap().catch(() => undefined)
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => void markAllRead().unwrap().catch(() => undefined)}
            >
              <CheckCheck className="size-3.5" />
              Tout lire
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Aucune notification.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start gap-0.5"
                onClick={() => void open(notification)}
              >
                <span
                  className={cn(
                    'text-sm',
                    notification.readAt ? 'text-muted-foreground' : 'font-medium',
                  )}
                >
                  {notification.title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </span>
                <span className="text-[11px] text-muted-foreground/70">
                  {dateFormatter.format(new Date(notification.createdAt))}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
