import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface UsageMetrics {
  id: string;
  organizationId: string;
  workspaceId?: string;
  
  period: {
    start: string;
    end: string;
    type: 'hour' | 'day' | 'month';
  };
  
  api: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    endpointUsage: Record<string, {
      requests: number;
      errors: number;
      averageResponseTime: number;
    }>;
  };
  
  features: {
    contentScheduled: number;
    contentPublished: number;
    templatesUsed: number;
    analysisRuns: number;
    mediaUploaded: number;
    membersActive: number;
    workspacesCreated: number;
  };
  
  storage: {
    mediaStorage: number; // bytes
    documentStorage: number; // bytes
    databaseSize: number; // bytes
    totalStorage: number; // bytes
  };
  
  bandwidth: {
    incoming: number; // bytes
    outgoing: number; // bytes
    total: number; // bytes
  };
  
  rateLimits: {
    endpoint: string;
    limit: number;
    remaining: number;
    resetTime: string;
    violations: number;
  }[];
  
  costs: {
    api: number;
    storage: number;
    bandwidth: number;
    features: number;
    total: number;
  };
}

export interface RateLimitRule {
  id: string;
  organizationId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | '*';
  
  limits: {
    requests: number;
    window: number; // seconds
    burstLimit?: number;
  };
  
  tiers: {
    plan: string;
    requests: number;
    window: number;
    burstLimit?: number;
  }[];
  
  whitelist: string[]; // IP addresses or user IDs
  blacklist: string[]; // IP addresses or user IDs
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageAlert {
  id: string;
  organizationId: string;
  
  type: 'quota' | 'rate_limit' | 'cost' | 'storage' | 'bandwidth';
  metric: string;
  threshold: {
    value: number;
    unit: string;
    operator: '>' | '<' | '>=' | '<=' | '==';
  };
  
  notifications: {
    email: boolean;
    inApp: boolean;
    webhook?: string;
    slackWebhook?: string;
  };
  
  actions: {
    throttle?: boolean;
    block?: boolean;
    notify?: boolean;
    escalate?: boolean;
  };
  
  status: 'active' | 'triggered' | 'resolved' | 'disabled';
  lastTriggered?: string;
  triggerCount: number;
  
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotaLimit {
  id: string;
  organizationId: string;
  plan: string;
  
  limits: {
    feature: string;
    quota: number;
    period: 'hour' | 'day' | 'month' | 'year';
    hardLimit: boolean;
    resetDay?: number; // for monthly/yearly
  }[];
  
  usage: {
    feature: string;
    used: number;
    remaining: number;
    resetAt: string;
  }[];
  
  overages: {
    feature: string;
    amount: number;
    cost: number;
    timestamp: string;
  }[];
  
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export const usageApi = createApi({
  reducerPath: 'usageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/usage',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      const currentOrganization = state.tenant.currentOrganization;
      const currentWorkspace = state.tenant.currentWorkspace;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      if (currentOrganization?.id) {
        headers.set('x-organization-id', currentOrganization.id);
      }
      
      if (currentWorkspace?.id) {
        headers.set('x-workspace-id', currentWorkspace.id);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Usage', 'RateLimit', 'Alert', 'Quota'],
  endpoints: (builder) => ({
    // Usage Metrics
    getUsageMetrics: builder.query<{
      current: UsageMetrics;
      historical: UsageMetrics[];
      projections: {
        nextPeriod: Partial<UsageMetrics>;
        endOfMonth: Partial<UsageMetrics>;
      };
    }, {
      period?: 'hour' | 'day' | 'month';
      startDate?: string;
      endDate?: string;
      workspaceId?: string;
    }>({
      query: (params) => ({
        url: '/metrics',
        params,
      }),
      providesTags: ['Usage'],
    }),

    getUsageBreakdown: builder.query<{
      byFeature: Record<string, number>;
      byWorkspace: Record<string, number>;
      byUser: Record<string, number>;
      byTime: { timestamp: string; usage: number }[];
    }, {
      feature?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: (params) => ({
        url: '/breakdown',
        params,
      }),
      providesTags: ['Usage'],
    }),

    // Rate Limiting
    getRateLimits: builder.query<{
      rules: RateLimitRule[];
      currentLimits: {
        endpoint: string;
        remaining: number;
        resetTime: string;
        violations: number;
      }[];
    }, { endpoint?: string }>({
      query: (params) => ({
        url: '/rate-limits',
        params,
      }),
      providesTags: ['RateLimit'],
    }),

    createRateLimitRule: builder.mutation<{ rule: RateLimitRule }, {
      endpoint: string;
      method: RateLimitRule['method'];
      limits: RateLimitRule['limits'];
      tiers?: RateLimitRule['tiers'];
      whitelist?: string[];
      blacklist?: string[];
    }>({
      query: (data) => ({
        url: '/rate-limits',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RateLimit'],
    }),

    updateRateLimitRule: builder.mutation<{ rule: RateLimitRule }, {
      id: string;
      limits?: RateLimitRule['limits'];
      tiers?: RateLimitRule['tiers'];
      whitelist?: string[];
      blacklist?: string[];
      isActive?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/rate-limits/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['RateLimit'],
    }),

    deleteRateLimitRule: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/rate-limits/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RateLimit'],
    }),

    // Usage Alerts
    getUsageAlerts: builder.query<{
      alerts: UsageAlert[];
      activeAlerts: UsageAlert[];
      recentTriggers: {
        alert: UsageAlert;
        triggeredAt: string;
        value: number;
        resolved: boolean;
      }[];
    }, { status?: UsageAlert['status'] }>({
      query: (params) => ({
        url: '/alerts',
        params,
      }),
      providesTags: ['Alert'],
    }),

    createUsageAlert: builder.mutation<{ alert: UsageAlert }, {
      type: UsageAlert['type'];
      metric: string;
      threshold: UsageAlert['threshold'];
      notifications: UsageAlert['notifications'];
      actions?: UsageAlert['actions'];
    }>({
      query: (data) => ({
        url: '/alerts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Alert'],
    }),

    updateUsageAlert: builder.mutation<{ alert: UsageAlert }, {
      id: string;
      threshold?: UsageAlert['threshold'];
      notifications?: UsageAlert['notifications'];
      actions?: UsageAlert['actions'];
      isActive?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/alerts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Alert'],
    }),

    resolveAlert: builder.mutation<{ success: boolean }, {
      id: string;
      note?: string;
    }>({
      query: (data) => ({
        url: `/alerts/${data.id}/resolve`,
        method: 'POST',
        body: { note: data.note },
      }),
      invalidatesTags: ['Alert'],
    }),

    // Quota Management
    getQuotaLimits: builder.query<{
      quotas: QuotaLimit;
      usage: QuotaLimit['usage'];
      overages: QuotaLimit['overages'];
      recommendations: {
        feature: string;
        currentUsage: number;
        projectedUsage: number;
        recommendation: string;
      }[];
    }, { plan?: string }>({
      query: (params) => ({
        url: '/quotas',
        params,
      }),
      providesTags: ['Quota'],
    }),

    updateQuotaLimits: builder.mutation<{ quota: QuotaLimit }, {
      limits: QuotaLimit['limits'];
      effectiveFrom?: string;
      effectiveUntil?: string;
    }>({
      query: (data) => ({
        url: '/quotas',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Quota'],
    }),

    // Real-time Usage
    getCurrentUsage: builder.query<{
      realtime: {
        activeConnections: number;
        requestsPerSecond: number;
        errorRate: number;
        averageResponseTime: number;
      };
      quotaStatus: {
        feature: string;
        used: number;
        limit: number;
        percentage: number;
        status: 'normal' | 'warning' | 'critical' | 'exceeded';
      }[];
    }, void>({
      query: () => '/realtime',
    }),

    // Usage Reports
    generateUsageReport: builder.mutation<{ reportId: string; downloadUrl: string }, {
      type: 'summary' | 'detailed' | 'billing' | 'compliance';
      startDate: string;
      endDate: string;
      format: 'pdf' | 'excel' | 'csv';
      includeBreakdown?: boolean;
      includeProjections?: boolean;
    }>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
    }),

    // Cost Analysis
    getCostAnalysis: builder.query<{
      current: {
        total: number;
        breakdown: Record<string, number>;
        comparison: {
          lastPeriod: number;
          change: number;
          changePercent: number;
        };
      };
      projections: {
        nextMonth: number;
        yearEnd: number;
        potential: number;
      };
      optimization: {
        feature: string;
        currentCost: number;
        potentialSaving: number;
        recommendation: string;
      }[];
    }, {
      period?: 'month' | 'quarter' | 'year';
      currency?: string;
    }>({
      query: (params) => ({
        url: '/cost-analysis',
        params,
      }),
      providesTags: ['Usage'],
    }),
  }),
});

export const {
  useGetUsageMetricsQuery,
  useGetUsageBreakdownQuery,
  useGetRateLimitsQuery,
  useCreateRateLimitRuleMutation,
  useUpdateRateLimitRuleMutation,
  useDeleteRateLimitRuleMutation,
  useGetUsageAlertsQuery,
  useCreateUsageAlertMutation,
  useUpdateUsageAlertMutation,
  useResolveAlertMutation,
  useGetQuotaLimitsQuery,
  useUpdateQuotaLimitsMutation,
  useGetCurrentUsageQuery,
  useGenerateUsageReportMutation,
  useGetCostAnalysisQuery,
} = usageApi;