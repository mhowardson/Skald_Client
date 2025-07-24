import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { Organization } from '../slices/tenantSlice';

interface CreateOrganizationRequest {
  name: string;
  type: 'agency' | 'enterprise' | 'freelancer';
  plan?: 'creator' | 'agency' | 'studio' | 'enterprise';
}

interface UpdateOrganizationRequest {
  name?: string;
  settings?: {
    whiteLabel?: {
      enabled?: boolean;
      logoUrl?: string;
      brandColors?: {
        primary?: string;
        secondary?: string;
      };
      customDomain?: string;
    };
    defaultTimezone?: string;
    features?: Record<string, boolean>;
  };
}

interface OrganizationMember {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    title?: string;
  };
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions: Record<string, boolean>;
  joinedAt: string;
  lastActiveAt: string;
}

interface InviteUserRequest {
  email: string;
  role: 'admin' | 'manager' | 'member';
  message?: string;
}

interface UpdateMemberRequest {
  role?: 'admin' | 'manager' | 'member';
  permissions?: Record<string, boolean>;
}

interface OrganizationInvite {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
}

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/organizations',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Organization', 'OrganizationMember'],
  endpoints: (builder) => ({
    getOrganizations: builder.query<{ organizations: Organization[] }, void>({
      query: () => '',
      providesTags: ['Organization'],
    }),
    
    getOrganization: builder.query<{ organization: Organization }, string>({
      query: (id) => ({
        url: `/${id}`,
        headers: {
          'x-organization-id': id,
        },
      }),
      providesTags: (_, __, id) => [{ type: 'Organization', id }],
    }),
    
    createOrganization: builder.mutation<{ organization: Organization }, CreateOrganizationRequest>({
      query: (orgData) => ({
        url: '',
        method: 'POST',
        body: orgData,
      }),
      invalidatesTags: ['Organization'],
    }),
    
    updateOrganization: builder.mutation<{ organization: Organization }, { id: string } & UpdateOrganizationRequest>({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updates,
        headers: {
          'x-organization-id': id,
        },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Organization', id }],
    }),
    
    getOrganizationMembers: builder.query<{ members: OrganizationMember[] }, string>({
      query: (id) => ({
        url: `/${id}/members`,
        headers: {
          'x-organization-id': id,
        },
      }),
      providesTags: (_, __, id) => [{ type: 'OrganizationMember', id }],
    }),
    
    inviteUser: builder.mutation<{ message: string; invite: OrganizationInvite }, { organizationId: string } & InviteUserRequest>({
      query: ({ organizationId, ...inviteData }) => ({
        url: `/${organizationId}/invite`,
        method: 'POST',
        body: inviteData,
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: (_, __, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId }
      ],
    }),

    // Get pending invites
    getOrganizationInvites: builder.query<{ invites: OrganizationInvite[] }, string>({
      query: (organizationId) => ({
        url: `/${organizationId}/invites`,
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      providesTags: (_, __, organizationId) => [{ type: 'OrganizationMember', id: `${organizationId}-invites` }],
    }),

    // Cancel invitation
    cancelInvite: builder.mutation<{ message: string }, { organizationId: string; inviteId: string }>({
      query: ({ organizationId, inviteId }) => ({
        url: `/${organizationId}/invites/${inviteId}`,
        method: 'DELETE',
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: (_, __, { organizationId }) => [
        { type: 'OrganizationMember', id: `${organizationId}-invites` }
      ],
    }),

    // Resend invitation
    resendInvite: builder.mutation<{ message: string }, { organizationId: string; inviteId: string }>({
      query: ({ organizationId, inviteId }) => ({
        url: `/${organizationId}/invites/${inviteId}/resend`,
        method: 'POST',
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: (_, __, { organizationId }) => [
        { type: 'OrganizationMember', id: `${organizationId}-invites` }
      ],
    }),

    // Update member role/permissions
    updateMember: builder.mutation<{ member: OrganizationMember }, { organizationId: string; memberId: string } & UpdateMemberRequest>({
      query: ({ organizationId, memberId, ...updates }) => ({
        url: `/${organizationId}/members/${memberId}`,
        method: 'PUT',
        body: updates,
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: (_, __, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId }
      ],
    }),

    // Remove member
    removeMember: builder.mutation<{ message: string }, { organizationId: string; memberId: string }>({
      query: ({ organizationId, memberId }) => ({
        url: `/${organizationId}/members/${memberId}`,
        method: 'DELETE',
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: (_, __, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId }
      ],
    }),

    // Leave organization
    leaveOrganization: builder.mutation<{ message: string }, string>({
      query: (organizationId) => ({
        url: `/${organizationId}/leave`,
        method: 'POST',
        headers: {
          'x-organization-id': organizationId,
        },
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetOrganizationMembersQuery,
  useInviteUserMutation,
  useGetOrganizationInvitesQuery,
  useCancelInviteMutation,
  useResendInviteMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useLeaveOrganizationMutation,
} = organizationApi;

export type { OrganizationMember, OrganizationInvite, InviteUserRequest, UpdateMemberRequest };