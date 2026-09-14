import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import { AuthBootstrap } from '@/app/providers/auth-bootstrap'
import { ThemeProvider } from '@/app/providers/theme-provider'
import { router } from '@/app/router'
import { store } from '@/app/store'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthBootstrap>
            <RouterProvider router={router} />
          </AuthBootstrap>
          <Toaster position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
