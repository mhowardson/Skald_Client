/**
 * AI Content Optimization API
 * 
 * RTK Query API for AI-powered content optimization, A/B testing,
 * and performance analysis functionality.
 * 
 * @api aiContentOptimizationApi
 * @version 1.0.0
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ContentOptimizationRequest {
  contentId?: string;
  content?: {
    title: string;
    body: string;
    contentType: 'post' | 'story' | 'reel' | 'carousel' | 'article';
    platform: string;
    targetAudience?: AudienceSegment;
    goals?: ContentGoal[];
  };
  optimizationType: 'performance' | 'engagement' | 'reach' | 'conversions' | 'comprehensive';
  includeCompetitorAnalysis?: boolean;
  generateVariants?: boolean;
}

export interface AudienceSegment {
  demographics: {
    ageRange: string;
    gender: string[];
    location: string[];
    interests: string[];
  };
  behaviorPatterns: {
    activeHours: number[];
    engagementPreferences: string[];
    contentPreferences: string[];
  };
  size: number;
  engagementRate: number;
}

export interface ContentGoal {
  type: 'awareness' | 'engagement' | 'traffic' | 'conversions' | 'growth';
  priority: 'high' | 'medium' | 'low';
  targetMetric?: string;
  targetValue?: number;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'content_structure' | 'timing' | 'hashtags' | 'visuals' | 'cta' | 'audience_targeting';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: {
    metric: string;
    improvementRange: string;
    confidence: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
    steps: string[];
    resources?: string[];
  };
  category: string;
  aiInsight: string;
}

export interface ContentVariant {
  id: string;
  title: string;
  body: string;
  optimizationType: string;
  changes: ContentChange[];
  expectedPerformance: {
    engagementRate: number;
    reach: number;
    conversions: number;
    confidence: number;
  };
  reasoning: string;
}

export interface ContentChange {
  type: 'title' | 'body' | 'hashtags' | 'cta' | 'structure' | 'tone';
  original: string;
  optimized: string;
  reason: string;
}

export interface OptimizationAnalysis {
  contentScore: number;
  performancePrediction: {
    engagementRate: number;
    reach: number;
    clicks: number;
    conversions: number;
    confidence: number;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: OptimizationRecommendation[];
  variants?: ContentVariant[];
  competitorComparison?: {
    similarContent: any[];
    performanceGap: number;
    winningElements: string[];
  };
}

export interface ABTestExperiment {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: {
    id: string;
    name: string;
    content: any;
    allocation: number;
    performance?: {
      views: number;
      engagement: number;
      conversions: number;
      engagementRate: number;
    };
  }[];
  testConfig: {
    duration: number;
    sampleSize: number;
    successMetric: string;
    confidenceLevel: number;
  };
  results?: {
    winner: string;
    confidence: number;
    improvementRate: number;
    insights: string[];
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  variants: {
    name: string;
    content: any;
    allocation: number;
  }[];
  testConfig: {
    duration: number;
    sampleSize: number;
    successMetric: string;
    confidenceLevel: number;
  };
}

export interface ContentInsights {
  performance: {
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    benchmarkComparison: number;
  };
  engagement: {
    rate: number;
    quality: 'high' | 'medium' | 'low';
    patterns: string[];
  };
  audience: {
    reach: number;
    demographics: any;
    behavior: any;
  };
  recommendations: OptimizationRecommendation[];
  opportunities: string[];
}

export interface OptimizationTrends {
  trends: {
    period: string;
    improvements: number;
    topCategories: string[];
    successRate: number;
  }[];
  topRecommendations: {
    category: string;
    frequency: number;
    successRate: number;
    avgImprovement: number;
  }[];
  improvementMetrics: {
    totalOptimizations: number;
    avgImprovement: number;
    bestCategory: string;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

export interface GetABTestsRequest {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ABTestsResponse {
  experiments: ABTestExperiment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const aiContentOptimizationApi = createApi({
  reducerPath: 'aiContentOptimizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/optimization',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Optimization', 'ABTest', 'ContentInsights', 'Trends'],
  endpoints: (builder) => ({
    // Content Optimization
    optimizeContent: builder.mutation<{ analysis: OptimizationAnalysis }, ContentOptimizationRequest>({
      query: (data) => ({
        url: '/content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Optimization'],
    }),

    // Content Insights
    getContentInsights: builder.query<{ insights: ContentInsights }, { contentId: string; timeframe?: string }>({
      query: ({ contentId, timeframe = '30d' }) => ({
        url: `/content/${contentId}/insights`,
        params: { timeframe },
      }),
      providesTags: (result, error, { contentId }) => [
        { type: 'ContentInsights', id: contentId },
      ],
    }),

    // Optimization Trends
    getOptimizationTrends: builder.query<{ trends: OptimizationTrends }, { timeframe?: string }>({
      query: ({ timeframe = '30d' }) => ({
        url: '/trends',
        params: { timeframe },
      }),
      providesTags: ['Trends'],
    }),

    // A/B Testing
    createABTest: builder.mutation<{ experiment: ABTestExperiment }, CreateABTestRequest>({
      query: (data) => ({
        url: '/ab-tests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ABTest'],
    }),

    getABTests: builder.query<ABTestsResponse, GetABTestsRequest>({
      query: (params) => ({
        url: '/ab-tests',
        params,
      }),
      providesTags: ['ABTest'],
    }),

    getABTest: builder.query<{ experiment: ABTestExperiment }, string>({
      query: (experimentId) => `/ab-tests/${experimentId}`,
      providesTags: (result, error, experimentId) => [
        { type: 'ABTest', id: experimentId },
      ],
    }),

    updateABTest: builder.mutation<
      { experiment: ABTestExperiment },
      { experimentId: string; data: Partial<CreateABTestRequest> }
    >({
      query: ({ experimentId, data }) => ({
        url: `/ab-tests/${experimentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { experimentId }) => [
        { type: 'ABTest', id: experimentId },
        'ABTest',
      ],
    }),

    deleteABTest: builder.mutation<{ message: string }, string>({
      query: (experimentId) => ({
        url: `/ab-tests/${experimentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, experimentId) => [
        { type: 'ABTest', id: experimentId },
        'ABTest',
      ],
    }),

    startABTest: builder.mutation<{ experiment: ABTestExperiment }, string>({
      query: (experimentId) => ({
        url: `/ab-tests/${experimentId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, experimentId) => [
        { type: 'ABTest', id: experimentId },
        'ABTest',
      ],
    }),

    analyzeABTest: builder.mutation<{ results: ABTestExperiment }, string>({
      query: (experimentId) => ({
        url: `/ab-tests/${experimentId}/analyze`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, experimentId) => [
        { type: 'ABTest', id: experimentId },
        'ABTest',
      ],
    }),
  }),
});

export const {
  // Content Optimization
  useOptimizeContentMutation,
  useGetContentInsightsQuery,
  useGetOptimizationTrendsQuery,

  // A/B Testing
  useCreateABTestMutation,
  useGetABTestsQuery,
  useGetABTestQuery,
  useUpdateABTestMutation,
  useDeleteABTestMutation,
  useStartABTestMutation,
  useAnalyzeABTestMutation,
} = aiContentOptimizationApi;