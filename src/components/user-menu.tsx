import { LogOut } from 'lucide-react'

import { useAppSelector } from '@/app/hooks'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation } from '@/features/auth/api/auth-api'

function getInitials(firstName?: string, lastName?: string) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  return initials || '?'
}

export function UserMenu() {
  const user = useAppSelector((state) => state.auth.user)
  const [logout, { isLoading }] = useLogoutMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 gap-2 px-1.5" />}>
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{user?.firstName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid gap-0.5">
            <span className="font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isLoading} onClick={() => logout()}>
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
