import { useEffect, useState, type FormEvent } from 'react'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Building2, GraduationCap, School, Users } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePermissions } from '@/features/auth/hooks/use-permission'
import {
  useMyEstablishmentQuery,
  useUpdateMyEstablishmentMutation,
} from '@/features/establishment/api/establishment-api'
import type { SchoolType } from '@/features/establishment/types'
import { getErrorMessage } from '@/lib/get-error-message'

const schoolTypeLabels: Record<SchoolType, string> = {
  PRIMARY: 'Primaire',
  SECONDARY: 'Secondaire',
  BOTH: 'Primaire et secondaire',
}

export function EstablishmentPage() {
  const { data: establishment, isLoading } = useMyEstablishmentQuery()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('establishments.manage')
  const [updateEstablishment, { isLoading: isSaving }] = useUpdateMyEstablishmentMutation()

  const [name, setName] = useState('')
  const [type, setType] = useState<SchoolType>('PRIMARY')

  useEffect(() => {
    if (establishment) {
      setName(establishment.name)
      setType(establishment.type)
    }
  }, [establishment])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await updateEstablishment({ name, type }).unwrap()
      toast.success('Établissement mis à jour')
    } catch (error) {
      toast.error(getErrorMessage(error as FetchBaseQueryError | SerializedError) ?? 'Échec de la mise à jour.')
    }
  }

  const counts = [
    { label: 'Utilisateurs', value: establishment?.counts.users, icon: Users },
    { label: 'Élèves', value: establishment?.counts.students, icon: GraduationCap },
    { label: 'Enseignants', value: establishment?.counts.teachers, icon: School },
    { label: 'Salles de classe', value: establishment?.counts.classrooms, icon: Building2 },
  ]

  return (
    <>
      <PageHeader title="Établissement" description="Informations générales et effectifs." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 60}>
            <Card className="lift">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
                <div>
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

      <Reveal delay={240} className="mt-4">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Le code établissement sert d&rsquo;identifiant de connexion — il ne peut pas être modifié ici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-1.5">
                  <Label htmlFor="code">Code établissement</Label>
                  <Input id="code" value={establishment?.code ?? ''} disabled />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    required
                    disabled={!canManage}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="type">Type d&rsquo;établissement</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as SchoolType)}
                    disabled={!canManage}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue>{(value: SchoolType) => schoolTypeLabels[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(schoolTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {canManage && (
                  <Button type="submit" disabled={isSaving} className="justify-self-start">
                    {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </>
  )
}
