import { useEffect, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms — pass `index * 60` when revealing a list */
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShown(true), delay)
    return () => clearTimeout(id)
  }, [delay])

  return <div className={cn('rv', shown && 'in', className)}>{children}</div>
}
