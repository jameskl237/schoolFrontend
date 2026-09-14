import { ChevronRight, LibraryBig, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyClassesQuery } from '@/features/teaching/api/teaching-api'

export function MyClassesPage() {
  const { data, isLoading } = useMyClassesQuery(undefined)

  const academicYear = data?.academicYear
  const classes = data?.classes ?? []

  return (
    <>
      <PageHeader
        title="Mes classes"
        description={
          academicYear
            ? `Les classes que vous tenez en ${academicYear.name}. Choisissez-en une pour saisir vos notes.`
            : 'Les classes que vous tenez cette année scolaire.'
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="gap-0 overflow-hidden p-0">
          <EmptyState
            icon={LibraryBig}
            title="Aucune classe cette année"
            description="Vous n'êtes affecté à aucune matière pour l'année scolaire en cours."
          />
        </Card>
      ) : (
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {classes.map((klass) => (
              <Link
                key={klass.id}
                to={`/my-classes/${klass.id}`}
                className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="h-full gap-3 p-4 transition-colors group-hover:border-primary/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{klass.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{klass.code}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {klass.isMainTeacher && (
                    <Badge className="w-fit gap-1 bg-success/15 text-success">
                      <Star className="size-3" />
                      Professeur principal
                    </Badge>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" />
                      {klass.studentCount} élève{klass.studentCount > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LibraryBig className="size-4" />
                      {klass.mySubjects.length} matière{klass.mySubjects.length > 1 ? 's' : ''}
                      {klass.isMainTeacher && klass.allSubjects.length > 0 && (
                        <span className="text-xs">· {klass.allSubjects.length} en visa</span>
                      )}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </>
  )
}
