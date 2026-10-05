import { Building2, CalendarX, ClipboardCheck, FileText, GraduationCap, PenLine, School, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/features/auth/hooks/use-profile'
import { useMyChildren } from '@/features/children/hooks/use-my-children'
import { useDashboardStatsQuery } from '@/features/dashboard/api/dashboard-api'
import { formatRoleName } from '@/lib/format-role-name'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const parentSections = [
  { to: 'grades', label: 'Notes', icon: PenLine },
  { to: 'report-cards', label: 'Bulletins', icon: FileText },
  { to: 'discipline', label: 'Discipline', icon: ClipboardCheck },
  { to: 'attendances', label: 'Absences', icon: CalendarX },
]

function ParentDashboard() {
  const { children, isLoading } = useMyChildren()

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Le suivi de la scolarité de vos enfants, en un coup d’œil."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : !children?.length ? (
        <Card className="gap-0 overflow-hidden p-0">
          <CardContent className="flex items-center gap-4 py-8">
            <GraduationCap className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Aucun enfant rattaché</p>
              <p className="text-sm text-muted-foreground">
                Contactez la scolarité de l'établissement pour rattacher un élève à votre compte.
              </p>
            </div>
          </CardContent>
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

                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {parentSections.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={`/my-children/${to}?child=${child.id}`}
                      className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStatsQuery()

  const statCards = [
    { label: 'Utilisateurs', value: stats?.userCount, icon: Users },
    { label: 'Élèves', value: stats?.studentCount, icon: GraduationCap },
    { label: 'Enseignants', value: stats?.teacherCount, icon: School },
    { label: 'Salles de classe', value: stats?.classroomCount, icon: Building2 },
  ]

  const maxRoleCount = Math.max(1, ...(stats?.usersByRole.map((r) => r.count) ?? [1]))

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description={
          stats?.establishment
            ? `${stats.establishment.name} — code ${stats.establishment.code}`
            : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 60}>
            <Card className="lift">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal delay={240}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Année scolaire en cours</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : stats?.currentYear ? (
                <div>
                  <p className="text-lg font-semibold">{stats.currentYear.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Du {dateFormatter.format(new Date(stats.currentYear.startDate))} au{' '}
                    {dateFormatter.format(new Date(stats.currentYear.endDate))}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune année scolaire n&rsquo;est définie comme actuelle.
                </p>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={300}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Répartition par rôle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                stats?.usersByRole
                  .filter((role) => role.count > 0)
                  .map((role) => (
                    <div key={role.role} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span>{formatRoleName(role.role)}</span>
                          <span className="tabular-nums text-muted-foreground">{role.count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${(role.count / maxRoleCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </>
  )
}

export function DashboardPage() {
  const { isParent } = useProfile()

  return isParent ? <ParentDashboard /> : <AdminDashboard />
}
