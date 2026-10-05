import { Outlet } from 'react-router-dom'

import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground print:min-h-0 print:bg-white">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block print:hidden">
        <div className="fixed h-screen w-64">
          <AppSidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        {/* À l'impression, seul le contenu sort : ni barre latérale, ni en-tête, ni marge. */}
        <main className="flex-1 p-6 print:flex-none print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
