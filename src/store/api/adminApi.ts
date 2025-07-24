import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'support' | 'user';
  
  profile: {
    avatar?: string;
    phone?: string;
    timezone: string;
    locale: string;
    lastLoginAt?: string;
    loginCount: number;
  };
  
  permissions: {
    canManageUsers: boolean;
    canManageOrganizations: boolean;
    canViewAnalytics: boolean;
    canManageBilling: boolean;
    canManageSystem: boolean;
    canAccessSupport: boolean;
  };
  
  organizations: {
    id: string;
    name: string;
    role: string;
    joinedAt: string;
  }[];
  
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  
  metadata: {
    source: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
  
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  type: 'individual' | 'team' | 'agency' | 'enterprise';
  plan: {
    id: string;
    name: string;
    tier: 'free' | 'starter' | 'professional' | 'enterprise';
    price: number;
    billingCycle: 'monthly' | 'yearly';
  };
  
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  
  members: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  
  usage: {
    contentPublished: number;
    storageUsed: number;
    apiRequests: number;
    monthlyActiveUsers: number;
  };
  
  billing: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  
  settings: {
    allowPublicWorkspaces: boolean;
    enforceSSO: boolean;
    allowExternalSharing: boolean;
    dataRetentionDays: number;
  };
  
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetrics {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
  };
  
  organizations: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
    byPlan: Record<string, number>;
    byType: Record<string, number>;
  };
  
  content: {
    totalPublished: number;
    publishedThisMonth: number;
    scheduledCount: number;
    templatesCreated: number;
    mediaUploaded: number;
  };
  
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageRevenuePerUser: number;
    growth: number;
    churnRate: number;
  };
  
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    storageUsed: number;
    bandwidthUsed: number;
  };
  
  support: {
    openTickets: number;
    avgResponseTime: number;
    satisfactionScore: number;
    escalations: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  organizationId?: string;
  
  action: string;
  resource: string;
  resourceId?: string;
  
  details: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  
  outcome: 'success' | 'failure' | 'partial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'data_breach' | 'system_compromise' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  title: string;
  description: string;
  
  affected: {
    users: string[];
    organizations: string[];
    systems: string[];
  };
  
  source: {
    ipAddress: string;
    userAgent?: string;
    location?: {
      country: string;
      region: string;
      city: string;
    };
  };
  
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  
  actions: {
    type: 'block_ip' | 'suspend_user' | 'force_password_reset' | 'enable_2fa' | 'notify_users';
    status: 'pending' | 'completed' | 'failed';
    timestamp: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/admin',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['AdminUser', 'AdminOrganization', 'SystemMetrics', 'AuditLog', 'SecurityAlert'],
  endpoints: (builder) => ({
    // System Overview
    getSystemMetrics: builder.query<SystemMetrics, {
      period?: 'day' | 'week' | 'month' | 'year';
    }>({
      query: (params) => ({
        url: '/metrics',
        params,
      }),
      providesTags: ['SystemMetrics'],
    }),

    // User Management
    getUsers: builder.query<{
      users: AdminUser[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
      };
    }, {
      search?: string;
      role?: string;
      status?: string;
      organization?: string;
      page?: number;
      limit?: number;
      sortBy?: 'name' | 'email' | 'createdAt' | 'lastActiveAt';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['AdminUser'],
    }),

    getUser: builder.query<AdminUser, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: 'AdminUser', id }],
    }),

    createUser: builder.mutation<{ user: AdminUser }, {
      email: string;
      firstName: string;
      lastName: string;
      role: AdminUser['role'];
      organizationId?: string;
      sendInvitation?: boolean;
    }>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    updateUser: builder.mutation<{ user: AdminUser }, {
      id: string;
      firstName?: string;
      lastName?: string;
      role?: AdminUser['role'];
      status?: AdminUser['status'];
      permissions?: Partial<AdminUser['permissions']>;
    }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'AdminUser', id }],
    }),

    suspendUser: builder.mutation<{ success: boolean }, {
      id: string;
      reason: string;
      duration?: number; // days
    }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/suspend`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'AdminUser', id }],
    }),

    activateUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'AdminUser', id }],
    }),

    deleteUser: builder.mutation<{ success: boolean }, {
      id: string;
      transferDataTo?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['AdminUser'],
    }),

    // Organization Management
    getOrganizations: builder.query<{
      organizations: AdminOrganization[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
      };
    }, {
      search?: string;
      plan?: string;
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
      sortBy?: 'name' | 'createdAt' | 'revenue' | 'members';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/organizations',
        params,
      }),
      providesTags: ['AdminOrganization'],
    }),

    getOrganization: builder.query<AdminOrganization, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (_, __, id) => [{ type: 'AdminOrganization', id }],
    }),

    updateOrganization: builder.mutation<{ organization: AdminOrganization }, {
      id: string;
      name?: string;
      plan?: string;
      status?: AdminOrganization['status'];
      settings?: Partial<AdminOrganization['settings']>;
    }>({
      query: ({ id, ...data }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'AdminOrganization', id }],
    }),

    suspendOrganization: builder.mutation<{ success: boolean }, {
      id: string;
      reason: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/organizations/${id}/suspend`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'AdminOrganization', id }],
    }),

    // Audit Logs
    getAuditLogs: builder.query<{
      logs: AuditLog[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
      };
    }, {
      userId?: string;
      organizationId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
      severity?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/audit-logs',
        params,
      }),
      providesTags: ['AuditLog'],
    }),

    // Security Alerts
    getSecurityAlerts: builder.query<{
      alerts: SecurityAlert[];
      total: number;
      summary: {
        open: number;
        high: number;
        critical: number;
      };
    }, {
      status?: string;
      severity?: string;
      type?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/security-alerts',
        params,
      }),
      providesTags: ['SecurityAlert'],
    }),

    updateSecurityAlert: builder.mutation<{ alert: SecurityAlert }, {
      id: string;
      status?: SecurityAlert['status'];
      assignedTo?: string;
      notes?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/security-alerts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'SecurityAlert', id }],
    }),

    resolveSecurityAlert: builder.mutation<{ success: boolean }, {
      id: string;
      resolution: string;
      preventiveMeasures?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/security-alerts/${id}/resolve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'SecurityAlert', id }],
    }),

    // System Actions
    performSystemAction: builder.mutation<{ success: boolean }, {
      action: 'backup_database' | 'clear_cache' | 'restart_services' | 'update_system';
      parameters?: Record<string, any>;
    }>({
      query: (data) => ({
        url: '/system/actions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemMetrics'],
    }),

    // Reports
    generateSystemReport: builder.mutation<{ reportId: string; downloadUrl: string }, {
      type: 'users' | 'organizations' | 'revenue' | 'security' | 'system_health';
      startDate?: string;
      endDate?: string;
      format: 'pdf' | 'excel' | 'csv';
      includeDetails?: boolean;
    }>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
    }),

    // Settings
    getSystemSettings: builder.query<{
      maintenance: {
        enabled: boolean;
        message: string;
        plannedStart?: string;
        plannedEnd?: string;
      };
      security: {
        enforceSSO: boolean;
        require2FA: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
      };
      features: {
        signupEnabled: boolean;
        invitationOnly: boolean;
        allowTrials: boolean;
        maxOrganizations: number;
      };
      notifications: {
        emailEnabled: boolean;
        slackWebhook?: string;
        alertThresholds: Record<string, number>;
      };
    }, void>({
      query: () => '/settings',
    }),

    updateSystemSettings: builder.mutation<{ success: boolean }, {
      maintenance?: any;
      security?: any;
      features?: any;
      notifications?: any;
    }>({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSystemMetricsQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useSuspendOrganizationMutation,
  useGetAuditLogsQuery,
  useGetSecurityAlertsQuery,
  useUpdateSecurityAlertMutation,
  useResolveSecurityAlertMutation,
  usePerformSystemActionMutation,
  useGenerateSystemReportMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} = adminApi;