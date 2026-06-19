import { baseApi } from './baseApi';
import type { RoleGroup } from '../slices/authSlice';

export interface RolePermission {
  permission: { resource: string; action: string };
}

export interface Role {
  id: string;
  name: string;
  group: RoleGroup;
  isSystem: boolean;
  parentRoleId: string | null;
  memberCount: number;
  rolePermissions: RolePermission[];
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => '/roles',
      providesTags: ['Role'],
    }),

    getRole: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Role', id }],
    }),

    createRole: builder.mutation<Role, { name: string; group: RoleGroup }>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: ['Role'],
    }),

    assignRole: builder.mutation<{ message: string }, { roleId: string; userId: string }>({
      query: ({ roleId, userId }) => ({
        url: `/roles/${roleId}/assign`,
        method: 'PATCH',
        body: { userId },
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useAssignRoleMutation,
} = rolesApi;
