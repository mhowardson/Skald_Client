import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface PerformanceMetrics {
  id: string;
  contentId: string;
  contentType: 'post' | 'story' | 'video' | 'image' | 'carousel';
  
  // Core metrics
  views: number;
  impressions: number;
  engagements: number;
  reach: number;
  clicks: number;
  
  // Engagement metrics
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  reactions: Record<string, number>;
  
  // Performance scores
  engagementRate: number;
  clickThroughRate: number;
  conversionRate: number;
  viralityScore: number;
  
  // Time-based metrics
  averageWatchTime?: number; // for videos
  peakEngagementTime: string;
  
  // Demographic breakdowns
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
    interests: Record<string, number>;
  };
  
  // Platform-specific metrics
  platform: string;
  platformMetrics: Record<string, any>;
  
  // Optimization suggestions
  optimizationSuggestions: {
    type: 'timing' | 'content' | 'hashtags' | 'format' | 'targeting';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    expectedImpact: number; // percentage improvement
  }[];
  
  // Comparison data
  benchmark: {
    industryAverage: number;
    accountAverage: number;
    previousPeriod: number;
    topPerforming: number;
  };
  
  lastUpdated: string;
  createdAt: string;
}

export interface ContentOptimization {
  id: string;
  contentId: string;
  
  // Current performance
  currentMetrics: PerformanceMetrics;
  
  // Optimization recommendations
  recommendations: {
    category: 'content' | 'timing' | 'audience' | 'format' | 'distribution';
    title: string;
    description: string;
    implementation: string;
    confidence: number; // 0-100
    expectedLift: number; // percentage
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }[];
  
  // A/B test suggestions
  testSuggestions: {
    element: 'headline' | 'image' | 'cta' | 'timing' | 'audience';
    variants: string[];
    hypothesis: string;
    successMetric: string;
    estimatedDuration: number; // days
  }[];
  
  // Competitive analysis
  competitiveInsights: {
    competitor: string;
    performance: number;
    strategy: string;
    differentiator: string;
  }[];
  
  // Trend analysis
  trendAnalysis: {
    trend: string;
    relevance: number;
    opportunity: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  
  optimizationScore: number; // 0-100
  lastAnalyzed: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'performance_drop' | 'high_performing' | 'anomaly' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  title: string;
  description: string;
  
  // Trigger data
  trigger: {
    metric: string;
    threshold: number;
    currentValue: number;
    timeframe: string;
  };
  
  // Related content
  affectedContent: {
    contentId: string;
    contentType: string;
    title: string;
    performance: number;
  }[];
  
  // Recommended actions
  recommendations: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedImpact: string;
  }[];
  
  // Context
  context: {
    platformsAffected: string[];
    audienceSegment?: string;
    timeOfDay?: string;
    comparison: {
      previous: number;
      benchmark: number;
      target: number;
    };
  };
  
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReport {
  id: string;
  organizationId: string;
  period: {
    start: string;
    end: string;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  };
  
  // Summary metrics
  summary: {
    totalContent: number;
    totalViews: number;
    totalEngagements: number;
    avgEngagementRate: number;
    topPerformingPlatform: string;
    
    // Period comparison
    growth: {
      views: number;
      engagements: number;
      reach: number;
      followers: number;
    };
  };
  
  // Content performance
  contentPerformance: {
    topPerforming: PerformanceMetrics[];
    underperforming: PerformanceMetrics[];
    trending: PerformanceMetrics[];
  };
  
  // Platform breakdown
  platformBreakdown: {
    platform: string;
    metrics: PerformanceMetrics;
    growth: number;
    share: number;
  }[];
  
  // Audience insights
  audienceInsights: {
    demographics: Record<string, number>;
    interests: Record<string, number>;
    behavior: {
      mostActiveTime: string;
      averageSessionDuration: number;
      contentPreferences: Record<string, number>;
    };
    growth: {
      newFollowers: number;
      engagement: number;
      retention: number;
    };
  };
  
  // Optimization opportunities
  opportunities: {
    category: string;
    title: string;
    description: string;
    potentialImpact: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }[];
  
  // Key insights
  insights: {
    type: 'positive' | 'negative' | 'neutral' | 'opportunity';
    title: string;
    description: string;
    data: Record<string, any>;
    actionable: boolean;
  }[];
  
  generatedAt: string;
  generatedBy: string;
}

export const performanceApi = createApi({
  reducerPath: 'performanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/performance',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
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
  tagTypes: ['PerformanceMetrics', 'ContentOptimization', 'PerformanceAlert', 'PerformanceReport'],
  endpoints: (builder) => ({
    // Performance Metrics
    getPerformanceMetrics: builder.query<{
      metrics: PerformanceMetrics[];
      total: number;
    }, {
      contentId?: string;
      platform?: string;
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      contentType?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/metrics',
        params,
      }),
      providesTags: ['PerformanceMetrics'],
    }),

    getContentPerformance: builder.query<PerformanceMetrics, {
      contentId: string;
      platform?: string;
      period?: string;
    }>({
      query: ({ contentId, ...params }) => ({
        url: `/metrics/${contentId}`,
        params,
      }),
      providesTags: (_, __, { contentId }) => [{ type: 'PerformanceMetrics', id: contentId }],
    }),

    // Content Optimization
    getContentOptimization: builder.query<ContentOptimization, string>({
      query: (contentId) => `/optimization/${contentId}`,
      providesTags: (_, __, contentId) => [{ type: 'ContentOptimization', id: contentId }],
    }),

    generateOptimizationReport: builder.mutation<{ optimization: ContentOptimization }, {
      contentId: string;
      includeCompetitive?: boolean;
      includeTrends?: boolean;
    }>({
      query: ({ contentId, ...params }) => ({
        url: `/optimization/${contentId}/generate`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (_, __, { contentId }) => [{ type: 'ContentOptimization', id: contentId }],
    }),

    // Performance Alerts
    getPerformanceAlerts: builder.query<{
      alerts: PerformanceAlert[];
      total: number;
      unread: number;
    }, {
      severity?: string;
      type?: string;
      isRead?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/alerts',
        params,
      }),
      providesTags: ['PerformanceAlert'],
    }),

    markAlertAsRead: builder.mutation<{ success: boolean }, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['PerformanceAlert'],
    }),

    resolveAlert: builder.mutation<{ success: boolean }, {
      alertId: string;
      resolution: string;
    }>({
      query: ({ alertId, resolution }) => ({
        url: `/alerts/${alertId}/resolve`,
        method: 'POST',
        body: { resolution },
      }),
      invalidatesTags: ['PerformanceAlert'],
    }),

    // Performance Reports
    getPerformanceReports: builder.query<{
      reports: PerformanceReport[];
      total: number;
    }, {
      period?: string;
      type?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      providesTags: ['PerformanceReport'],
    }),

    getPerformanceReport: builder.query<PerformanceReport, string>({
      query: (id) => `/reports/${id}`,
      providesTags: (_, __, id) => [{ type: 'PerformanceReport', id }],
    }),

    generatePerformanceReport: builder.mutation<{ report: PerformanceReport }, {
      period: {
        start: string;
        end: string;
        type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      };
      platforms?: string[];
      contentTypes?: string[];
      includeOptimization?: boolean;
    }>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PerformanceReport'],
    }),

    // Real-time Performance
    getRealTimeMetrics: builder.query<{
      currentViews: number;
      currentEngagements: number;
      recentContent: {
        id: string;
        title: string;
        performance: number;
        trend: 'up' | 'down' | 'stable';
      }[];
      alerts: PerformanceAlert[];
    }, void>({
      query: () => '/realtime',
    }),

    // Benchmarking
    getBenchmarks: builder.query<{
      industry: Record<string, number>;
      competitors: Record<string, number>;
      historical: Record<string, number>;
    }, {
      industry?: string;
      contentType?: string;
      period?: string;
    }>({
      query: (params) => ({
        url: '/benchmarks',
        params,
      }),
    }),

    // A/B Testing
    createPerformanceTest: builder.mutation<{ test: any }, {
      contentId: string;
      element: string;
      variants: string[];
      hypothesis: string;
      successMetric: string;
      duration: number;
    }>({
      query: (data) => ({
        url: '/tests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentOptimization'],
    }),

    // Performance Insights
    getPerformanceInsights: builder.query<{
      insights: {
        type: 'opportunity' | 'warning' | 'success';
        title: string;
        description: string;
        impact: number;
        actionable: boolean;
      }[];
    }, {
      period?: string;
      contentType?: string;
      platform?: string;
    }>({
      query: (params) => ({
        url: '/insights',
        params,
      }),
    }),
  }),
});

export const {
  useGetPerformanceMetricsQuery,
  useGetContentPerformanceQuery,
  useGetContentOptimizationQuery,
  useGenerateOptimizationReportMutation,
  useGetPerformanceAlertsQuery,
  useMarkAlertAsReadMutation,
  useResolveAlertMutation,
  useGetPerformanceReportsQuery,
  useGetPerformanceReportQuery,
  useGeneratePerformanceReportMutation,
  useGetRealTimeMetricsQuery,
  useGetBenchmarksQuery,
  useCreatePerformanceTestMutation,
  useGetPerformanceInsightsQuery,
} = performanceApi;