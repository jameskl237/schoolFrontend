import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { AcademicYearsPage } from '@/pages/academic-years-page'
import { AttendancesPage } from '@/pages/attendances-page'
import { ClassesPage } from '@/pages/classes-page'
import { ClassroomsPage } from '@/pages/classrooms-page'
import { ClassSubjectsPage } from '@/pages/class-subjects-page'
import { CyclesPage } from '@/pages/cycles-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { EnrollmentsPage } from '@/pages/enrollments-page'
import { EstablishmentPage } from '@/pages/establishment-page'
import { EvaluationsPage } from '@/pages/evaluations-page'
import { FeeStructuresPage } from '@/pages/fee-structures-page'
import { FeeTypesPage } from '@/pages/fee-types-page'
import { GradeLevelsPage } from '@/pages/grade-levels-page'
import { GradesPage } from '@/pages/grades-page'
import { GuardiansPage } from '@/pages/guardians-page'
import { InvoicesPage } from '@/pages/invoices-page'
import { BulletinPrintPage } from '@/pages/bulletin-print-page'
import { InfirmaryPage } from '@/pages/infirmary-page'
import { LibraryPage } from '@/pages/library-page'
import { LoansPage } from '@/pages/loans-page'
import { LoginPage } from '@/pages/login-page'
import { MyClassPage } from '@/pages/my-class-page'
import { MyChildrenAttendancesPage } from '@/pages/my-children-attendances-page'
import { MyChildrenDisciplinePage } from '@/pages/my-children-discipline-page'
import { MyChildrenGradesPage } from '@/pages/my-children-grades-page'
import { MyChildrenPage } from '@/pages/my-children-page'
import { MyChildrenReportCardsPage } from '@/pages/my-children-report-cards-page'
import { MyClassesPage } from '@/pages/my-classes-page'
import { OrientationPage } from '@/pages/orientation-page'
import { ParentsPage } from '@/pages/parents-page'
import { PeriodsPage } from '@/pages/periods-page'
import { RolesPage } from '@/pages/roles-page'
import { SchoolLevelsPage } from '@/pages/school-levels-page'
import { SectionsPage } from '@/pages/sections-page'
import { SequencesPage } from '@/pages/sequences-page'
import { StudentsPage } from '@/pages/students-page'
import { SubjectsPage } from '@/pages/subjects-page'
import { TeachersPage } from '@/pages/teachers-page'
import { TimetablesPage } from '@/pages/timetables-page'
import { TransportPage } from '@/pages/transport-page'
import { UsersPage } from '@/pages/users-page'
import { ProtectedRoute, PublicOnlyRoute, RequireParent, RequirePermission } from '@/routes/guards'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/establishment', element: <EstablishmentPage /> },
          {
            element: <RequirePermission anyOf={['users.view', 'users.manage']} />,
            children: [{ path: '/users', element: <UsersPage /> }],
          },
          {
            element: <RequirePermission anyOf={['academic-years.manage']} />,
            children: [{ path: '/academic-years', element: <AcademicYearsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['school-levels.manage']} />,
            children: [{ path: '/school-levels', element: <SchoolLevelsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['sections.manage']} />,
            children: [{ path: '/sections', element: <SectionsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['cycles.manage']} />,
            children: [{ path: '/cycles', element: <CyclesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['grade-levels.manage']} />,
            children: [{ path: '/grade-levels', element: <GradeLevelsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['classes.manage']} />,
            children: [{ path: '/classes', element: <ClassesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['classrooms.manage']} />,
            children: [{ path: '/classrooms', element: <ClassroomsPage /> }],
          },
          {
            element: (
              <RequirePermission anyOf={['students.view', 'students.view.all', 'students.manage']} />
            ),
            children: [{ path: '/students', element: <StudentsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['enrollments.manage']} />,
            children: [{ path: '/enrollments', element: <EnrollmentsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['parents.manage']} />,
            children: [{ path: '/parents', element: <ParentsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['guardians.manage']} />,
            children: [{ path: '/guardians', element: <GuardiansPage /> }],
          },
          {
            element: <RequirePermission anyOf={['roles.manage']} />,
            children: [{ path: '/roles', element: <RolesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['books.manage', 'loans.manage']} />,
            children: [{ path: '/library', element: <LibraryPage /> }],
          },
          {
            element: <RequirePermission anyOf={['loans.manage']} />,
            children: [{ path: '/loans', element: <LoansPage /> }],
          },
          {
            element: (
              <RequirePermission anyOf={['medical-records.manage', 'infirmary.manage']} />
            ),
            children: [{ path: '/infirmary', element: <InfirmaryPage /> }],
          },
          {
            element: <RequirePermission anyOf={['orientations.manage', 'counseling.manage']} />,
            children: [{ path: '/orientation', element: <OrientationPage /> }],
          },
          {
            element: <RequirePermission anyOf={['report-cards.view', 'report-cards.manage']} />,
            children: [
              { path: '/report-cards/:reportCardId/bulletin', element: <BulletinPrintPage /> },
            ],
          },
          {
            element: (
              <RequirePermission
                anyOf={['evaluations.manage', 'grades.manage', 'attendances.manage']}
              />
            ),
            children: [
              { path: '/my-classes', element: <MyClassesPage /> },
              { path: '/my-classes/:classId', element: <MyClassPage /> },
            ],
          },
          {
            element: <RequirePermission anyOf={['subjects.manage', 'class-subjects.manage']} />,
            children: [{ path: '/subjects', element: <SubjectsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['teachers.manage']} />,
            children: [{ path: '/teachers', element: <TeachersPage /> }],
          },
          {
            element: (
              <RequirePermission
                anyOf={['class-subjects.manage', 'timetables.manage', 'evaluations.manage']}
              />
            ),
            children: [{ path: '/class-subjects', element: <ClassSubjectsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['periods.manage']} />,
            children: [
              { path: '/periods', element: <PeriodsPage /> },
              { path: '/sequences', element: <SequencesPage /> },
            ],
          },
          {
            element: <RequirePermission anyOf={['evaluations.manage', 'grades.view']} />,
            children: [{ path: '/evaluations', element: <EvaluationsPage /> }],
          },
          {
            element: <RequirePermission anyOf={['grades.view', 'grades.manage']} />,
            children: [{ path: '/grades', element: <GradesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['attendances.view', 'attendances.manage']} />,
            children: [{ path: '/attendances', element: <AttendancesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['timetables.view', 'timetables.manage']} />,
            children: [{ path: '/timetables', element: <TimetablesPage /> }],
          },
          {
            element: <RequirePermission anyOf={['transport.view', 'transport.manage']} />,
            children: [{ path: '/transport', element: <TransportPage /> }],
          },
          {
            element: <RequirePermission anyOf={['fees.manage']} />,
            children: [
              { path: '/fee-types', element: <FeeTypesPage /> },
              { path: '/fee-structures', element: <FeeStructuresPage /> },
            ],
          },
          {
            element: <RequirePermission anyOf={['invoices.manage']} />,
            children: [{ path: '/invoices', element: <InvoicesPage /> }],
          },
          {
            element: <RequireParent />,
            children: [
              { path: '/my-children', element: <MyChildrenPage /> },
              {
                element: <RequirePermission anyOf={['grades.view', 'grades.manage']} />,
                children: [
                  { path: '/my-children/grades', element: <MyChildrenGradesPage /> },
                ],
              },
              {
                element: (
                  <RequirePermission anyOf={['report-cards.view', 'report-cards.manage']} />
                ),
                children: [
                  { path: '/my-children/report-cards', element: <MyChildrenReportCardsPage /> },
                ],
              },
              {
                element: <RequirePermission anyOf={['disciplines.view', 'disciplines.manage']} />,
                children: [
                  { path: '/my-children/discipline', element: <MyChildrenDisciplinePage /> },
                ],
              },
              {
                element: <RequirePermission anyOf={['attendances.view', 'attendances.manage']} />,
                children: [
                  { path: '/my-children/attendances', element: <MyChildrenAttendancesPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
