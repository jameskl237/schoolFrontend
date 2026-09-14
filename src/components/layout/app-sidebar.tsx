import {
  BookMarked,
  BookOpen,
  Building2,
  Bus,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CalendarX,
  ClipboardCheck,
  ClipboardList,
  Coins,
  DoorOpen,
  FileText,
  GitBranch,
  GraduationCap,
  Languages,
  LayoutDashboard,
  LibraryBig,
  Layers,
  Layers3,
  ListOrdered,
  Network,
  PenLine,
  Presentation,
  ShieldCheck,
  Tag,
  Users,
  Users2,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import schoolIcon from '@/assets/school-icon.png'
import { useAppSelector } from '@/app/hooks'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  anyOf: string[] | null
}

interface NavSection {
  label: string | null
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    label: null,
    items: [{ to: '/', label: 'Tableau de bord', icon: LayoutDashboard, anyOf: null }],
  },
  {
    label: 'Structure scolaire',
    items: [
      { to: '/school-levels', label: 'Niveaux scolaires', icon: Layers, anyOf: ['school-levels.manage'] },
      { to: '/sections', label: 'Sections', icon: Languages, anyOf: ['sections.manage'] },
      { to: '/cycles', label: 'Cycles', icon: GitBranch, anyOf: ['cycles.manage'] },
      { to: '/grade-levels', label: 'Niveaux (CP, CE1...)', icon: Layers3, anyOf: ['grade-levels.manage'] },
      { to: '/classes', label: 'Classes', icon: BookOpen, anyOf: ['classes.manage'] },
      { to: '/classrooms', label: 'Salles de classe', icon: DoorOpen, anyOf: ['classrooms.manage'] },
    ],
  },
  {
    label: 'Mon espace',
    items: [
      {
        to: '/my-classes',
        label: 'Mes classes',
        icon: LibraryBig,
        anyOf: ['evaluations.manage', 'grades.manage', 'attendances.manage'],
      },
    ],
  },
  {
    label: 'Enseignement',
    items: [
      { to: '/subjects', label: 'Matières', icon: BookMarked, anyOf: ['subjects.manage', 'class-subjects.manage'] },
      { to: '/teachers', label: 'Enseignants', icon: Presentation, anyOf: ['teachers.manage'] },
      {
        to: '/class-subjects',
        label: 'Affectations',
        icon: Network,
        anyOf: ['class-subjects.manage', 'timetables.manage', 'evaluations.manage'],
      },
      { to: '/timetables', label: 'Emplois du temps', icon: CalendarDays, anyOf: ['timetables.view', 'timetables.manage'] },
    ],
  },
  {
    label: 'Suivi pédagogique',
    items: [
      { to: '/evaluations', label: 'Évaluations', icon: ClipboardCheck, anyOf: ['evaluations.manage', 'grades.view'] },
      { to: '/grades', label: 'Notes', icon: PenLine, anyOf: ['grades.view', 'grades.manage'] },
      { to: '/attendances', label: 'Absences', icon: CalendarX, anyOf: ['attendances.view', 'attendances.manage'] },
    ],
  },
  {
    label: 'Élèves',
    items: [
      {
        to: '/students',
        label: 'Élèves',
        icon: GraduationCap,
        anyOf: ['students.view', 'students.view.all', 'students.manage'],
      },
      { to: '/enrollments', label: 'Inscriptions', icon: ClipboardList, anyOf: ['enrollments.manage'] },
      { to: '/parents', label: 'Parents', icon: Users2, anyOf: ['parents.manage'] },
      { to: '/guardians', label: 'Tuteurs', icon: ShieldCheck, anyOf: ['guardians.manage'] },
    ],
  },
  {
    label: 'Finances',
    items: [
      { to: '/fee-types', label: 'Types de frais', icon: Tag, anyOf: ['fees.manage'] },
      { to: '/fee-structures', label: 'Frais scolaires', icon: Coins, anyOf: ['fees.manage'] },
      { to: '/invoices', label: 'Factures', icon: FileText, anyOf: ['invoices.manage'] },
      { to: '/transport', label: 'Transport', icon: Bus, anyOf: ['transport.view', 'transport.manage'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', label: 'Utilisateurs', icon: Users, anyOf: ['users.view', 'users.manage'] },
      { to: '/academic-years', label: 'Années scolaires', icon: CalendarRange, anyOf: ['academic-years.manage'] },
      { to: '/periods', label: 'Trimestres', icon: CalendarClock, anyOf: ['periods.manage'] },
      { to: '/sequences', label: 'Séquences', icon: ListOrdered, anyOf: ['periods.manage'] },
      { to: '/establishment', label: 'Établissement', icon: Building2, anyOf: null },
    ],
  },
]

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { hasPermission } = usePermissions()
  const user = useAppSelector((state) => state.auth.user)
  const isParent = user?.parentId != null

  const parentSection: NavSection | null = isParent
    ? {
        label: 'Mon enfant',
        items: [
          { to: '/my-children', label: 'Mes enfants', icon: GraduationCap, anyOf: null },
          {
            to: '/my-children/grades',
            label: 'Notes',
            icon: PenLine,
            anyOf: ['grades.view', 'grades.manage'],
          },
          {
            to: '/my-children/report-cards',
            label: 'Bulletins',
            icon: FileText,
            anyOf: ['report-cards.view', 'report-cards.manage'],
          },
          {
            to: '/my-children/discipline',
            label: 'Discipline',
            icon: ClipboardCheck,
            anyOf: ['disciplines.view', 'disciplines.manage'],
          },
          {
            to: '/my-children/attendances',
            label: 'Absences',
            icon: CalendarX,
            anyOf: ['attendances.view', 'attendances.manage'],
          },
        ],
      }
    : null

  const baseSections = [
    ...sections.slice(0, 2),
    ...(parentSection ? [parentSection] : []),
    ...sections.slice(2),
  ]

  const visibleSections = baseSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.anyOf || hasPermission(...item.anyOf)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={schoolIcon} alt="" className="h-8 w-8 object-contain" />
        <span className="font-heading text-base font-semibold">École</span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {visibleSections.map((section, index) => (
          <div key={section.label ?? `section-${index}`} className="space-y-1">
            {section.label && (
              <p className="px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                {section.label}
              </p>
            )}
            {section.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </div>
  )
}
