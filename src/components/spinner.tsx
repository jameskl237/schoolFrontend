import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground',
        className,
      )}
    />
  )
}
