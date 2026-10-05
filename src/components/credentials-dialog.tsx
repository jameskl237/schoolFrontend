import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface AccountCredentials {
  loginEmail: string
  password: string
}

interface CredentialsDialogProps {
  credentials: AccountCredentials | null
  onClose: () => void
  title: string
  /** Nom de la personne à qui remettre les identifiants. */
  personName: string
}

/**
 * Restitue une seule fois les identifiants d'un compte ouvert d'office : le mot
 * de passe n'est plus lisible ensuite, il doit être noté maintenant.
 */
export function CredentialsDialog({
  credentials,
  onClose,
  title,
  personName,
}: CredentialsDialogProps) {
  return (
    <Dialog open={Boolean(credentials)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Transmettez ces identifiants à {personName}. Le mot de passe n&rsquo;est affiché
            qu&rsquo;une fois : notez-le avant de fermer.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 rounded-lg border p-4 font-mono text-sm">
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
            <span className="font-sans text-muted-foreground">Identifiant</span>
            <span className="text-right font-medium break-all">{credentials?.loginEmail}</span>
            <span className="font-sans text-muted-foreground">Mot de passe</span>
            <span className="text-right font-medium">{credentials?.password}</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
