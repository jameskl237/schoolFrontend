export type SectionLanguage = 'FRANCOPHONE' | 'ANGLOPHONE'

export interface Section {
  id: number
  schoolLevelId: number
  name: string
  language: SectionLanguage
  createdAt: string
  updatedAt: string
}

export interface CreateSectionRequest {
  schoolLevelId: number
  name: string
  language: SectionLanguage
}

export interface UpdateSectionRequest {
  id: number
  schoolLevelId?: number
  name?: string
  language?: SectionLanguage
}
