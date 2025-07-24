/**
 * Advanced Analytics API
 * 
 * RTK Query API for advanced analytics functionality including
 * cross-platform metrics, audience insights, and performance reporting.
 * 
 * @api advancedAnalyticsApi
 * @version 1.0.0
 * 
 * @features
 * - Cross-platform performance metrics
 * - Comprehensive audience insights
 * - Automated report generation
 * - Content performance analysis
 * - AI-powered recommendations
 * - Data export capabilities
 * - Trending insights and benchmarking
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// Analytics Interfaces
export interface CrossPlatformMetrics {
  timeframe: string;
  totalReach: number;
  totalEngagement: number;
  totalImpressions: number;
  averageEngagementRate: number;
  contentCount: number;
  platformBreakdown: PlatformMetrics[];
  trendsData: TrendData[];
  topPerformingContent: ContentPerformance[];
}

export interface PlatformMetrics {
  platform: string;
  reach: number;
  engagement: number;
  impressions: number;
  engagementRate: number;
  contentCount: number;
  followerGrowth: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  bestPostingTimes: PostingTimeAnalysis[];
}

export interface TrendData {
  date: string;
  reach: number;
  engagement: number;
  impressions: number;
  engagementRate: number;
  platformBreakdown: Record<string, number>;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  platform: string;
  publishedAt: string;
  reach: number;
  engagement: number;
  engagementRate: number;
  contentType: string;
  hashtags: string[];
  performanceScore: number;
}

export interface AudienceInsights {
  totalAudience: number;
  audienceGrowth: number;
  demographics: {
    ageGroups: AgeGroupData[];
    genderDistribution: GenderData;
    topLocations: LocationData[];
    interests: InterestData[];
  };
  engagementPatterns: {
    bestPostingTimes: PostingTimeAnalysis[];
    mostActiveHours: HourlyActivity[];
    dayOfWeekPerformance: DayPerformance[];
  };
  crossPlatformOverlap: PlatformOverlap[];
}

export interface AgeGroupData {
  ageRange: string;
  percentage: number;
  engagement: number;
}

export interface GenderData {
  male: number;
  female: number;
  other: number;
}

export interface LocationData {
  country: string;
  percentage: number;
  engagement: number;
}

export interface InterestData {
  category: string;
  percentage: number;
  affinity: number;
}

export interface PostingTimeAnalysis {
  hour: number;
  dayOfWeek: number;
  avgEngagementRate: number;
  contentCount: number;
  platform?: string;
}

export interface HourlyActivity {
  hour: number;
  activeUsers: number;
  engagementRate: number;
}

export interface DayPerformance {
  dayOfWeek: string;
  avgEngagementRate: number;
  contentCount: number;
  reach: number;
}

export interface PlatformOverlap {
  platforms: string[];
  overlapPercentage: number;
  audienceSize: number;
}

export interface PerformanceReport {
  id: string;
  title: string;
  timeframe: {
    start: string;
    end: string;
  };
  summary: {
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    contentCount: number;
    audienceGrowth: number;
  };
  crossPlatformMetrics: CrossPlatformMetrics;
  audienceInsights: AudienceInsights;
  contentAnalysis: ContentAnalysisReport;
  recommendations: PerformanceRecommendation[];
  generatedAt: string;
}

export interface ContentAnalysisReport {
  topPerformingContent: ContentPerformance[];
  contentTypePerformance: ContentTypeAnalysis[];
  hashtagEffectiveness: HashtagAnalysis[];
  optimalContentLength: ContentLengthAnalysis;
  visualContentImpact: VisualContentAnalysis;
}

export interface ContentTypeAnalysis {
  type: string;
  count: number;
  avgEngagementRate: number;
  avgReach: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface HashtagAnalysis {
  hashtag: string;
  usageCount: number;
  avgEngagementRate: number;
  reachImpact: number;
  trendingScore: number;
}

export interface ContentLengthAnalysis {
  platform: string;
  optimalCharacterRange: {
    min: number;
    max: number;
  };
  avgEngagementByLength: Array<{
    lengthRange: string;
    engagementRate: number;
  }>;
}

export interface VisualContentAnalysis {
  imagePostsPerformance: number;
  videoPostsPerformance: number;
  carouselPostsPerformance: number;
  optimalImageDimensions: string;
  optimalVideoLength: number;
}

export interface PerformanceRecommendation {
  type: 'posting_time' | 'content_type' | 'hashtag' | 'audience' | 'frequency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  expectedImprovement: string;
}

export interface PerformanceSummary {
  totalReach: number;
  totalEngagement: number;
  averageEngagementRate: number;
  contentCount: number;
  totalAudience: number;
  audienceGrowth: number;
  platformCount: number;
  topPlatform: PlatformMetrics;
  timeframe: string;
  lastUpdated: string;
}

export interface TrendingInsights {
  trendingHashtags: HashtagAnalysis[];
  risingContentTypes: ContentTypeAnalysis[];
  viralContent: ContentPerformance[];
  optimalPostingTimes: PostingTimeAnalysis[];
}

export interface AnalyticsFilters {
  timeframe?: string;
  platforms?: string[];
  contentTypes?: string[];
  includeArchived?: boolean;
}

export interface GenerateReportRequest {
  title?: string;
  timeframe?: string;
  platforms?: string[];
  contentTypes?: string[];
  includeArchived?: boolean;
}

export interface ExportRequest {
  format?: 'csv' | 'xlsx' | 'pdf' | 'json';
  timeframe?: string;
  platforms?: string[];
  dataTypes?: ('metrics' | 'insights' | 'recommendations' | 'content')[];
}

export const advancedAnalyticsApi = createApi({
  reducerPath: 'advancedAnalyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/analytics/advanced',
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
  tagTypes: [
    'CrossPlatformMetrics',
    'AudienceInsights', 
    'PerformanceReport',
    'ContentAnalysis',
    'Recommendations',
    'TrendingInsights',
    'PerformanceSummary'
  ],
  endpoints: (builder) => ({
    // Get cross-platform metrics
    getCrossPlatformMetrics: builder.query<
      { metrics: CrossPlatformMetrics; filters: AnalyticsFilters; generatedAt: string },
      AnalyticsFilters
    >({
      query: (filters = {}) => ({
        url: '/cross-platform-metrics',
        params: {
          timeframe: filters.timeframe || '30d',
          platforms: filters.platforms,
          contentTypes: filters.contentTypes,
          includeArchived: filters.includeArchived,
        },
      }),
      providesTags: ['CrossPlatformMetrics'],
    }),

    // Get audience insights
    getAudienceInsights: builder.query<
      { insights: AudienceInsights; filters: AnalyticsFilters; generatedAt: string },
      AnalyticsFilters
    >({
      query: (filters = {}) => ({
        url: '/audience-insights',
        params: {
          timeframe: filters.timeframe || '30d',
          platforms: filters.platforms,
        },
      }),
      providesTags: ['AudienceInsights'],
    }),

    // Generate performance report
    generatePerformanceReport: builder.mutation<
      { report: PerformanceReport; message: string },
      GenerateReportRequest
    >({
      query: (request) => ({
        url: '/generate-report',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['PerformanceReport'],
    }),

    // Get performance summary
    getPerformanceSummary: builder.query<PerformanceSummary, { timeframe?: string }>({
      query: ({ timeframe = '30d' } = {}) => ({
        url: '/performance-summary',
        params: { timeframe },
      }),
      providesTags: ['PerformanceSummary'],
    }),

    // Get content analysis
    getContentAnalysis: builder.query<
      { contentAnalysis: ContentAnalysisReport; filters: AnalyticsFilters; generatedAt: string },
      AnalyticsFilters
    >({
      query: (filters = {}) => ({
        url: '/content-analysis',
        params: {
          timeframe: filters.timeframe || '30d',
          platforms: filters.platforms,
          contentTypes: filters.contentTypes,
        },
      }),
      providesTags: ['ContentAnalysis'],
    }),

    // Get recommendations
    getRecommendations: builder.query<
      {
        recommendations: PerformanceRecommendation[];
        summary: {
          totalRecommendations: number;
          highImpact: number;
          mediumImpact: number;
          lowImpact: number;
        };
        filters: AnalyticsFilters;
        generatedAt: string;
      },
      AnalyticsFilters
    >({
      query: (filters = {}) => ({
        url: '/recommendations',
        params: {
          timeframe: filters.timeframe || '30d',
          platforms: filters.platforms,
        },
      }),
      providesTags: ['Recommendations'],
    }),

    // Get trending insights
    getTrendingInsights: builder.query<
      TrendingInsights & { filters: AnalyticsFilters; generatedAt: string },
      AnalyticsFilters
    >({
      query: (filters = {}) => ({
        url: '/trending-insights',
        params: {
          timeframe: filters.timeframe || '7d',
          platforms: filters.platforms,
        },
      }),
      providesTags: ['TrendingInsights'],
    }),

    // Export analytics data
    exportAnalyticsData: builder.mutation<
      {
        exportData: any;
        format: string;
        generatedAt: string;
        reportInfo: {
          id: string;
          title: string;
          timeframe: { start: string; end: string };
          summary: PerformanceReport['summary'];
        };
      },
      ExportRequest
    >({
      query: (request) => ({
        url: '/export',
        method: 'POST',
        body: request,
      }),
    }),

    // Platform comparison
    getPlatformComparison: builder.query<
      { metrics: CrossPlatformMetrics; filters: AnalyticsFilters; generatedAt: string },
      { platforms: string[]; timeframe?: string; metrics?: string[] }
    >({
      query: ({ platforms, timeframe = '30d', metrics }) => ({
        url: '/platform-comparison',
        params: {
          platforms,
          timeframe,
          metrics,
        },
      }),
      providesTags: ['CrossPlatformMetrics'],
    }),

    // Growth tracking
    getGrowthTracking: builder.query<
      { insights: AudienceInsights; filters: AnalyticsFilters; generatedAt: string },
      { timeframe?: string; metric?: string }
    >({
      query: ({ timeframe = '30d', metric }) => ({
        url: '/growth-tracking',
        params: {
          timeframe,
          metric,
        },
      }),
      providesTags: ['AudienceInsights'],
    }),

    // Competitor benchmarking
    getCompetitorBenchmarking: builder.query<
      {
        message: string;
        redirectTo: string;
      },
      { timeframe?: string; competitors?: string[]; metrics?: string[] }
    >({
      query: ({ timeframe = '30d', competitors, metrics }) => ({
        url: '/competitor-benchmarking',
        params: {
          timeframe,
          competitors,
          metrics,
        },
      }),
    }),
  }),
});

export const {
  useGetCrossPlatformMetricsQuery,
  useGetAudienceInsightsQuery,
  useGeneratePerformanceReportMutation,
  useGetPerformanceSummaryQuery,
  useGetContentAnalysisQuery,
  useGetRecommendationsQuery,
  useGetTrendingInsightsQuery,
  useExportAnalyticsDataMutation,
  useGetPlatformComparisonQuery,
  useGetGrowthTrackingQuery,
  useGetCompetitorBenchmarkingQuery,
} = advancedAnalyticsApi;