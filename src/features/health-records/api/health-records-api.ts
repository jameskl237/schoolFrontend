import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateVaccinationRequest,
  CreateVisitRequest,
  InfirmaryVisit,
  MedicalRecord,
  SaveMedicalRecordRequest,
  Vaccination,
} from '../types'

export const healthRecordsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    medicalRecords: builder.query<MedicalRecord[], void>({
      query: () => '/medical-records',
      transformResponse: (response: ApiSuccess<MedicalRecord[]>) => response.data,
      providesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),
    saveMedicalRecord: builder.mutation<MedicalRecord, SaveMedicalRecordRequest>({
      query: ({ studentId, ...body }) => ({
        url: `/medical-records/${studentId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiSuccess<MedicalRecord>) => response.data,
      invalidatesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),
    addVaccination: builder.mutation<Vaccination, CreateVaccinationRequest>({
      query: (body) => ({ url: '/vaccinations', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Vaccination>) => response.data,
      invalidatesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),
    deleteVaccination: builder.mutation<void, number>({
      query: (id) => ({ url: `/vaccinations/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),

    infirmaryVisits: builder.query<InfirmaryVisit[], number | void>({
      query: (studentId) => ({
        url: '/infirmary-visits',
        params: studentId ? { studentId } : undefined,
      }),
      transformResponse: (response: ApiSuccess<InfirmaryVisit[]>) => response.data,
      providesTags: [{ type: 'InfirmaryVisits', id: 'LIST' }],
    }),
    createVisit: builder.mutation<InfirmaryVisit, CreateVisitRequest>({
      query: (body) => ({ url: '/infirmary-visits', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<InfirmaryVisit>) => response.data,
      invalidatesTags: [{ type: 'InfirmaryVisits', id: 'LIST' }],
    }),
    deleteVisit: builder.mutation<void, number>({
      query: (id) => ({ url: `/infirmary-visits/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'InfirmaryVisits', id: 'LIST' }],
    }),
  }),
})

export const {
  useMedicalRecordsQuery,
  useSaveMedicalRecordMutation,
  useAddVaccinationMutation,
  useDeleteVaccinationMutation,
  useInfirmaryVisitsQuery,
  useCreateVisitMutation,
  useDeleteVisitMutation,
} = healthRecordsApi
