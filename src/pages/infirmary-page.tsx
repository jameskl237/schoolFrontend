import { useState } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { HeartPulse, MoreHorizontal, Plus, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import {
  useDeleteVisitMutation,
  useInfirmaryVisitsQuery,
  useMedicalRecordsQuery,
} from '@/features/health-records/api/health-records-api'
import { MedicalRecordDialog } from '@/features/health-records/components/medical-record-dialog'
import { VisitFormDialog } from '@/features/health-records/components/visit-form-dialog'
import type { MedicalRecord } from '@/features/health-records/types'
import { getErrorMessage } from '@/lib/get-error-message'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function InfirmaryPage() {
  const { hasPermission } = usePermissions()
  const canHandleVisits = hasPermission('infirmary.manage')
  const canManageRecords = hasPermission('medical-records.manage')

  const { data: visits, isLoading: visitsLoading } = useInfirmaryVisitsQuery(undefined, {
    skip: !canHandleVisits,
  })
  const { data: records, isLoading: recordsLoading } = useMedicalRecordsQuery(undefined, {
    skip: !canManageRecords,
  })
  const [deleteVisit] = useDeleteVisitMutation()

  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action
      toast.success(message)
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Une erreur est survenue.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Infirmerie"
        description="Les passages du jour et les dossiers médicaux des élèves."
        actions={
          <>
            {canManageRecords && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRecord(null)
                  setRecordDialogOpen(true)
                }}
              >
                <Plus />
                Dossier médical
              </Button>
            )}
            {canHandleVisits && (
              <Button onClick={() => setVisitDialogOpen(true)}>
                <Plus />
                Passage
              </Button>
            )}
          </>
        }
      />

      <div className="space-y-6">
        {canHandleVisits && (
          <Reveal>
            <Card className="gap-0 overflow-hidden p-0">
              <p className="border-b px-4 py-3 font-medium">Passages à l&rsquo;infirmerie</p>
              {visitsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : !visits?.length ? (
                <EmptyState
                  icon={Stethoscope}
                  title="Aucun passage"
                  description="Les passages à l'infirmerie apparaîtront ici."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Soins</TableHead>
                        <TableHead className="text-right">T°</TableHead>
                        <TableHead>Parents</TableHead>
                        <TableHead>Traité par</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="text-muted-foreground">
                            {dateFormatter.format(new Date(visit.date))}
                          </TableCell>
                          <TableCell className="font-medium">
                            {visit.student.firstName} {visit.student.lastName}
                          </TableCell>
                          <TableCell>{visit.reason}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {visit.treatment ?? '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {visit.temperature !== null ? `${visit.temperature}°` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={visit.notifiedParent ? 'default' : 'outline'}>
                              {visit.notifiedParent ? 'Prévenus' : 'Non prévenus'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {visit.handledBy.firstName} {visit.handledBy.lastName}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    if (!window.confirm('Supprimer ce passage ?')) return
                                    void run(deleteVisit(visit.id).unwrap(), 'Passage supprimé')
                                  }}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </Reveal>
        )}

        {canManageRecords && (
          <Reveal>
            <Card className="gap-0 overflow-hidden p-0">
              <p className="border-b px-4 py-3 font-medium">Dossiers médicaux</p>
              {recordsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : !records?.length ? (
                <EmptyState
                  icon={HeartPulse}
                  title="Aucun dossier"
                  description="Créez le dossier médical d'un élève pour y consigner allergies et vaccins."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élève</TableHead>
                        <TableHead>Groupe</TableHead>
                        <TableHead>Allergies</TableHead>
                        <TableHead>Affections</TableHead>
                        <TableHead className="text-right">Vaccins</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.student.firstName} {record.student.lastName}
                            <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
                              {record.student.studentNumber}
                            </span>
                          </TableCell>
                          <TableCell>{record.bloodGroup ?? '—'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.allergies ?? '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.chronicConditions ?? '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {record.vaccinations.length}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRecord(record)
                                setRecordDialogOpen(true)
                              }}
                            >
                              Ouvrir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </Reveal>
        )}
      </div>

      <VisitFormDialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen} />
      <MedicalRecordDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        record={editingRecord}
      />
    </>
  )
}
