import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useStudentsQuery } from '@/features/students/api/students-api'
import type { Student } from '@/features/students/types'

/**
 * Les enfants du parent connecté, avec l'enfant sélectionné porté par
 * la querystring pour rester stable (et partageable) entre les pages.
 */
export function useMyChildren() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: children, isLoading } = useStudentsQuery(undefined)

  const paramId = searchParams.get('child')
  const [fallbackId, setFallbackId] = useState('')
  const selectedChildId = paramId ?? fallbackId

  const selectedChild: Student | null =
    children?.find((student) => String(student.id) === selectedChildId) ?? null

  const selectChild = (value: string) => {
    setFallbackId(value)
    setSearchParams(value ? { child: value } : {}, { replace: true })
  }

  return { children, isLoading, selectedChild, selectedChildId, selectChild }
}