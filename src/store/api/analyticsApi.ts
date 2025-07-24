import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface AnalyticsMetrics {
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    impressions: number;
    reach: number;
    engagementRate: number;
  };
  growth: {
    followers: number;
    followersGrowth: number;
    unfollows: number;
    netGrowth: number;
    growthRate: number;
  };
  content: {
    postsPublished: number;
    postsScheduled: number;
    postsFailed: number;
    averagePostsPerDay: number;
    topPerformingType: string;
  };
  audience: {
    totalAudience: number;
    activeAudience: number;
    demographics: {
      ageGroups: Record<string, number>;
      genders: Record<string, number>;
      locations: Record<string, number>;
      interests: Record<string, number>;
    };
    bestPostingTimes: {
      hourly: Record<string, number>;
      daily: Record<string, number>;
    };
  };
}

export interface ContentPerformance {
  id: string;
  contentId: string;
  platform: string;
  title: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'thread';
  publishedAt: string;
  
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    impressions: number;
    reach: number;
    engagementRate: number;
    ctr: number;
    cpm: number;
    cpc: number;
  };
  
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    score: number;
  };
  
  tags: string[];
  score: number;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: 'performance' | 'audience' | 'competitor' | 'roi' | 'custom';
  organizationId: string;
  workspaceId?: string;
  
  config: {
    dateRange: {
      start: string;
      end: string;
      preset?: 'last7days' | 'last30days' | 'last90days' | 'lastYear' | 'custom';
    };
    platforms: string[];
    metrics: string[];
    contentTypes?: string[];
    filters?: Record<string, any>;
  };
  
  data: Record<string, any>;
  insights: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
  };
  
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  generatedAt: string;
}

export interface ROIAnalysis {
  period: {
    start: string;
    end: string;
  };
  
  investment: {
    contentCreation: number;
    advertising: number;
    tools: number;
    personnel: number;
    total: number;
  };
  
  returns: {
    leads: number;
    conversions: number;
    revenue: number;
    brandAwareness: number;
    customerAcquisition: number;
  };
  
  metrics: {
    roi: number;
    roas: number;
    cac: number;
    ltv: number;
    conversionRate: number;
    costPerLead: number;
    costPerAcquisition: number;
  };
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/analytics',
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
  tagTypes: ['Analytics', 'Report', 'Performance'],
  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query<{
      metrics: AnalyticsMetrics;
      performance: ContentPerformance[];
      insights: string[];
    }, {
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      platforms?: string[];
      workspaceId?: string;
    }>({
      query: (params) => ({
        url: '/overview',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getContentPerformance: builder.query<{
      content: ContentPerformance[];
      total: number;
      averageScore: number;
      topPerforming: ContentPerformance[];
      underPerforming: ContentPerformance[];
    }, {
      period?: string;
      platforms?: string[];
      contentTypes?: string[];
      sortBy?: 'engagement' | 'reach' | 'score' | 'publishedAt';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/content-performance',
        params,
      }),
      providesTags: ['Performance'],
    }),

    getROIAnalysis: builder.query<ROIAnalysis, {
      period?: string;
      campaigns?: string[];
      platforms?: string[];
    }>({
      query: (params) => ({
        url: '/roi',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getReports: builder.query<{
      reports: AnalyticsReport[];
      templates: { id: string; name: string; type: string }[];
    }, {
      type?: AnalyticsReport['type'];
      workspaceId?: string;
    }>({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      providesTags: ['Report'],
    }),

    createReport: builder.mutation<{ report: AnalyticsReport }, {
      name: string;
      description?: string;
      type: AnalyticsReport['type'];
      config: AnalyticsReport['config'];
      isPublic?: boolean;
    }>({
      query: (data) => ({
        url: '/reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    generateReport: builder.mutation<{ report: AnalyticsReport }, {
      id?: string;
      config?: AnalyticsReport['config'];
    }>({
      query: (data) => ({
        url: '/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    exportReport: builder.mutation<{ downloadUrl: string }, {
      reportId: string;
      format: 'pdf' | 'excel' | 'csv' | 'powerpoint';
    }>({
      query: (data) => ({
        url: '/reports/export',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAnalyticsOverviewQuery,
  useGetContentPerformanceQuery,
  useGetROIAnalysisQuery,
  useGetReportsQuery,
  useCreateReportMutation,
  useGenerateReportMutation,
  useExportReportMutation,
} = analyticsApi;