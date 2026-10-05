import { baseApi } from '@/app/api/base-api'
import type { ApiSuccess } from '@/types/api'

import type {
  CreateRoleRequest,
  Permission,
  Role,
  SetRolePermissionsRequest,
  UpdateRoleRequest,
} from '../types'

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    roles: builder.query<Role[], void>({
      query: () => '/roles',
      transformResponse: (response: ApiSuccess<Role[]>) => response.data,
      providesTags: [{ type: 'Roles', id: 'LIST' }],
    }),
    permissions: builder.query<Permission[], void>({
      query: () => '/permissions',
      transformResponse: (response: ApiSuccess<Permission[]>) => response.data,
      providesTags: [{ type: 'Permissions', id: 'LIST' }],
    }),
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      transformResponse: (response: ApiSuccess<Role>) => response.data,
      invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
    }),
    updateRole: builder.mutation<Role, UpdateRoleRequest>({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      transformResponse: (response: ApiSuccess<Role>) => response.data,
      invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
    }),
    setRolePermissions: builder.mutation<Role, SetRolePermissionsRequest>({
      query: ({ id, permissions }) => ({
        url: `/roles/${id}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      transformResponse: (response: ApiSuccess<Role>) => response.data,
      // Les permissions du compte connecté peuvent changer : on rafraîchit l'identité.
      invalidatesTags: [{ type: 'Roles', id: 'LIST' }, 'User'],
    }),
    deleteRole: builder.mutation<void, number>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
    }),
  }),
})

export const {
  useRolesQuery,
  usePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useSetRolePermissionsMutation,
  useDeleteRoleMutation,
} = rolesApi
