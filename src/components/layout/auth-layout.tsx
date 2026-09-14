import type { ReactNode } from 'react'

import schoolLogo from '@/assets/school-logo.png'
import { ThemeToggle } from '@/components/theme-toggle'
import { SchoolIllustration } from '@/features/auth/components/school-illustration'

const patternStyle = {
  backgroundImage:
    'linear-gradient(135deg, transparent 48%, var(--highlight) 49% 51%, transparent 52%)',
  backgroundSize: '26px 26px',
}

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <div className="relative flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <img src={schoolLogo} alt="School Manager" className="mx-auto mb-10 h-20 w-auto md:mx-0" />

          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-brand-panel md:flex md:flex-col">
        <div className="absolute inset-0 opacity-[0.07]" style={patternStyle} aria-hidden="true" />

        <div className="relative flex flex-1 items-center justify-center p-12">
          <SchoolIllustration />
        </div>

        <div className="relative px-12 pb-14">
          <p className="font-heading text-2xl font-semibold text-brand-panel-foreground">
            La réussite de chaque élève, suivie au quotidien.
          </p>
          <p className="mt-2 max-w-sm text-brand-panel-foreground/75">
            Notes, présences, emplois du temps et communication avec les familles, réunis dans un
            seul espace pensé pour votre établissement.
          </p>
        </div>
      </div>
    </div>
  )
}
