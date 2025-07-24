import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  client: {
    companyName: string;
    industry?: string;
    website?: string;
    logo?: string;
    description?: string;
  };
  branding: {
    brandVoice: string;
    toneOfVoice: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
    targetAudience: string;
    keyMessages: string[];
    brandColors: {
      primary: string;
      secondary: string;
      accent?: string;
    };
  };
  contentSettings: {
    defaultVoice: string;
    contentPillars: string[];
    defaultPlatforms: string[];
    approvalRequired: boolean;
    autoPublish: boolean;
  };
  status: 'active' | 'paused' | 'archived';
  totalContent: number;
  totalPublished: number;
}

interface CreateWorkspaceRequest {
  name: string;
  client: {
    companyName: string;
    industry?: string;
    website?: string;
  };
  branding: {
    brandVoice: string;
    toneOfVoice?: string;
    targetAudience: string;
    brandColors?: {
      primary: string;
      secondary?: string;
    };
  };
}

export const workspaceApi = createApi({
  reducerPath: 'workspaceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/workspaces',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth.accessToken;
      const currentOrganization = state.tenant.currentOrganization;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      if (currentOrganization?.id) {
        headers.set('x-organization-id', currentOrganization.id);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Workspace'],
  endpoints: (builder) => ({
    getWorkspaces: builder.query<{ workspaces: Workspace[] }, void>({
      query: () => '/',
      providesTags: ['Workspace'],
    }),
    
    createWorkspace: builder.mutation<{ workspace: Workspace }, CreateWorkspaceRequest>({
      query: (workspaceData) => ({
        url: '/',
        method: 'POST',
        body: workspaceData,
      }),
      invalidatesTags: ['Workspace'],
    }),
    
    getWorkspace: builder.query<{ workspace: Workspace }, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'Workspace', id }],
    }),
    
    updateWorkspace: builder.mutation<{ workspace: Workspace }, { id: string; data: Partial<CreateWorkspaceRequest> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Workspace', id }],
    }),
    
    deleteWorkspace: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} = workspaceApi;