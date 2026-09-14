import { CalendarX, ClipboardCheck, FileText, GraduationCap, PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyChildren } from '@/features/children/hooks/use-my-children'

const sections = [
  {
    to: 'grades',
    label: 'Notes',
    description: 'Notes et moyennes sur les évaluations publiées.',
    icon: PenLine,
  },
  {
    to: 'report-cards',
    label: 'Bulletins',
    description: 'Bulletins disponibles, par période.',
    icon: FileText,
  },
  {
    to: 'discipline',
    label: 'Discipline',
    description: 'Mesures disciplinaires enregistrées.',
    icon: ClipboardCheck,
  },
  {
    to: 'attendances',
    label: 'Absences',
    description: 'Appels, retards et justificatifs.',
    icon: CalendarX,
  },
]

export function MyChildrenPage() {
  const { children, isLoading } = useMyChildren()

  return (
    <>
      <PageHeader
        title="Mon enfant"
        description="Suivez la scolarité de vos enfants : notes, bulletins, discipline et présences."
      />

      <Reveal>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : !children?.length ? (
          <Card className="gap-0 overflow-hidden p-0">
            <EmptyState
              icon={GraduationCap}
              title="Aucun enfant rattaché"
              description="Aucun élève n'est rattaché à votre compte. Contactez la scolarité de l'établissement."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {children.map((child) => {
              const klass = child.currentEnrollment?.class

              return (
                <Card key={child.id} className="gap-0 overflow-hidden p-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      <p className="font-medium">
                        {child.firstName} {child.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground">{child.studentNumber}</span>
                      {klass ? (
                        <Badge variant="secondary">{klass.name}</Badge>
                      ) : (
                        <Badge variant="outline">Non inscrit</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    {sections.map(({ to, label, description, icon: Icon }) => (
                      <Link
                        key={to}
                        to={`/my-children/${to}?child=${child.id}`}
                        className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                      >
                        <Icon className="mt-0.5 size-4 text-muted-foreground" />
                        <span>
                          <span className="block text-sm font-medium">{label}</span>
                          <span className="block text-xs text-muted-foreground">{description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Reveal>
    </>
  )
}