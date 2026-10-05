import { Menu } from 'lucide-react'
import { useState } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserMenu } from '@/components/user-menu'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

import { AppSidebar } from './app-sidebar'

export function AppHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-14 print:hidden shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu" />}
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
