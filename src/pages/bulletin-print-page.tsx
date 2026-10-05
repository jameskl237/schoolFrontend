import { useEffect } from 'react'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBulletinQuery } from '@/features/report-cards/api/report-cards-api'
import { BulletinSheet } from '@/features/report-cards/components/bulletin-sheet'
import '@/features/report-cards/components/bulletin.css'
import { getErrorMessage } from '@/lib/get-error-message'

/**
 * Page dédiée au bulletin : elle n'affiche que le document, pour que
 * l'impression — et donc l'enregistrement en PDF — ne reprenne que lui.
 */
export function BulletinPrintPage() {
  const { reportCardId } = useParams()
  const [searchParams] = useSearchParams()
  const id = Number(reportCardId)

  const { data: bulletin, isLoading, error } = useBulletinQuery(id, { skip: !Number.isInteger(id) })

  // Ouvert depuis le bouton « Télécharger », on enchaîne directement sur la
  // boîte d'impression : l'utilisateur n'a plus qu'à choisir « Enregistrer en PDF ».
  const autoPrint = searchParams.get('print') === '1'

  useEffect(() => {
    if (!autoPrint || !bulletin) return

    const timer = window.setTimeout(() => window.print(), 600)

    return () => window.clearTimeout(timer)
  }, [autoPrint, bulletin])

  useEffect(() => {
    if (!bulletin) return

    const previous = document.title
    document.title = `Bulletin ${bulletin.student.lastName} ${bulletin.student.firstName} — ${bulletin.period.name}`

    return () => {
      document.title = previous
    }
  }, [bulletin])

  if (isLoading) {
    return <Skeleton className="mx-auto h-[297mm] w-[210mm] max-w-full" />
  }

  if (error || !bulletin) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <EmptyState
          icon={Printer}
          title="Bulletin indisponible"
          description={
            getErrorMessage(error) ?? "Ce bulletin n'existe pas ou n'est pas encore publié."
          }
        />
      </Card>
    )
  }

  return (
    <div className="bulletin-page">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="outline" nativeButton={false} render={<Link to="/my-children-report-cards" />}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={() => window.print()}>
          <Download />
          Télécharger le PDF
        </Button>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <BulletinSheet bulletin={bulletin} />
      </div>
    </div>
  )
}
