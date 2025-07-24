import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  ContentOptimizationRequest,
  ContentOptimizationResponse,
  PlatformMetrics,
  OptimizationSuggestion,
  ContentTemplate,
} from '../../types/content';

export interface HashtagSuggestion {
  hashtag: string;
  relevanceScore: number;
  trendingScore: number;
  engagementPotential: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

export interface OptimalTimingData {
  platform: string;
  timezone: string;
  bestTimes: Array<{
    dayOfWeek: string;
    time: string;
    engagementRate: number;
    confidenceScore: number;
  }>;
  nextOptimalTime: string;
}

export interface ContentAnalysis {
  readabilityScore: number;
  sentimentScore: number;
  toneAnalysis: {
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous';
    confidence: number;
  };
  keywordsExtracted: string[];
  languageLevel: 'elementary' | 'intermediate' | 'advanced';
  potentialReach: number;
  viralPotential: number;
}

export interface AIContentEnhancement {
  originalContent: string;
  enhancedContent: string;
  improvements: Array<{
    type: 'hook' | 'cta' | 'emoji' | 'hashtags' | 'structure' | 'engagement';
    description: string;
    before: string;
    after: string;
    impactScore: number;
  }>;
  overallImprovementScore: number;
}

export const contentOptimizationApi = createApi({
  reducerPath: 'contentOptimizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/content-creation',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth.accessToken;
      const currentWorkspace = state.tenant.currentWorkspace;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      if (currentWorkspace?.id) {
        headers.set('x-workspace-id', currentWorkspace.id);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Optimization', 'Templates', 'Analysis'],
  endpoints: (builder) => ({
    // Optimize content for multiple platforms
    optimizeContent: builder.mutation<ContentOptimizationResponse, ContentOptimizationRequest>({
      query: (data) => ({
        url: '/optimize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Optimization'],
    }),

    // Get platform-specific metrics and analysis
    analyzePlatformMetrics: builder.query<{
      metrics: PlatformMetrics[];
      suggestions: OptimizationSuggestion[];
      overallScore: number;
    }, { content: string; platforms: string[] }>({
      query: ({ content, platforms }) => ({
        url: '/analyze',
        method: 'POST',
        body: { content, platforms },
      }),
      providesTags: ['Analysis'],
    }),

    // Get hashtag suggestions
    getHashtagSuggestions: builder.query<{
      suggested: HashtagSuggestion[];
      trending: HashtagSuggestion[];
      brandSpecific: HashtagSuggestion[];
    }, { content: string; platforms: string[]; industry?: string }>({
      query: (params) => ({
        url: '/hashtags/suggest',
        method: 'POST',
        body: params,
      }),
    }),

    // Get optimal posting times
    getOptimalTiming: builder.query<{
      timingData: OptimalTimingData[];
      recommendations: Array<{
        platform: string;
        nextBestTime: string;
        reason: string;
        expectedEngagement: number;
      }>;
    }, { platforms: string[]; timezone?: string; contentType?: string }>({
      query: (params) => ({
        url: '/timing/optimal',
        params,
      }),
    }),

    // Analyze content quality and readability
    analyzeContent: builder.mutation<ContentAnalysis, { content: string; targetAudience?: string }>({
      query: (data) => ({
        url: '/analyze/content',
        method: 'POST',
        body: data,
      }),
    }),

    // AI-enhance content
    enhanceWithAI: builder.mutation<AIContentEnhancement, {
      content: string;
      platforms: string[];
      style?: 'professional' | 'casual' | 'engaging' | 'authoritative';
      includeHashtags?: boolean;
      includeEmojis?: boolean;
      includeCallToAction?: boolean;
    }>({
      query: (data) => ({
        url: '/enhance',
        method: 'POST',
        body: data,
      }),
    }),

    // Get content templates with filtering
    getTemplates: builder.query<{
      templates: ContentTemplate[];
      total: number;
      categories: string[];
      industries: string[];
      platforms: string[];
    }, {
      category?: string;
      industry?: string;
      platform?: string;
      search?: string;
      difficulty?: string;
      sortBy?: 'popularity' | 'rating' | 'recent';
      page?: number;
      limit?: number;
    }>({
      query: (params = {}) => ({
        url: '/templates',
        params,
      }),
      providesTags: ['Templates'],
    }),

    // Get template by ID
    getTemplateById: builder.query<{ template: ContentTemplate }, string>({
      query: (id) => `/templates/${id}`,
      providesTags: (_, __, id) => [{ type: 'Templates', id }],
    }),

    // Use template (track usage)
    useTemplate: builder.mutation<{ success: boolean }, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/templates/${templateId}/use`,
        method: 'POST',
      }),
      invalidatesTags: ['Templates'],
    }),

    // Favorite/unfavorite template
    toggleTemplateFavorite: builder.mutation<{ success: boolean; isFavorite: boolean }, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/templates/${templateId}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['Templates'],
    }),

    // Generate content variations
    generateVariations: builder.mutation<{
      variations: Array<{
        content: string;
        style: string;
        targetPlatform: string;
        optimizationScore: number;
      }>;
    }, { content: string; platforms: string[]; variationCount?: number }>({
      query: (data) => ({
        url: '/generate/variations',
        method: 'POST',
        body: data,
      }),
    }),

    // Get content performance prediction
    predictPerformance: builder.query<{
      predictions: Array<{
        platform: string;
        expectedEngagement: number;
        confidenceScore: number;
        factors: Array<{
          factor: string;
          impact: 'positive' | 'negative' | 'neutral';
          weight: number;
          description: string;
        }>;
      }>;
      overallScore: number;
      recommendations: string[];
    }, { content: string; platforms: string[]; scheduledAt?: string }>({
      query: (params) => ({
        url: '/predict/performance',
        method: 'POST',
        body: params,
      }),
    }),

    // Validate content for compliance/brand guidelines
    validateContent: builder.mutation<{
      isValid: boolean;
      issues: Array<{
        type: 'compliance' | 'brand' | 'platform' | 'accessibility';
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        suggestion?: string;
        autoFix?: boolean;
      }>;
      score: number;
    }, { content: string; platforms: string[]; checkBrandGuidelines?: boolean }>({
      query: (data) => ({
        url: '/validate',
        method: 'POST',
        body: data,
      }),
    }),

    // Get trending topics and content ideas
    getTrendingTopics: builder.query<{
      topics: Array<{
        topic: string;
        trendScore: number;
        platforms: string[];
        suggestedContent: string[];
        hashtags: string[];
        estimatedReach: number;
      }>;
      contentIdeas: Array<{
        idea: string;
        platforms: string[];
        estimatedEngagement: number;
        difficulty: 'easy' | 'medium' | 'hard';
      }>;
    }, { industry?: string; platforms?: string[]; region?: string }>({
      query: (params) => ({
        url: '/trending',
        params,
      }),
    }),

    // Generate content from brief
    generateFromBrief: builder.mutation<{
      generatedContent: string;
      alternatives: string[];
      optimizationSuggestions: OptimizationSuggestion[];
    }, {
      brief: string;
      platforms: string[];
      tone?: string;
      length?: 'short' | 'medium' | 'long';
      includeHashtags?: boolean;
      includeCallToAction?: boolean;
    }>({
      query: (data) => ({
        url: '/generate/brief',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useOptimizeContentMutation,
  useAnalyzePlatformMetricsQuery,
  useGetHashtagSuggestionsQuery,
  useGetOptimalTimingQuery,
  useAnalyzeContentMutation,
  useEnhanceWithAIMutation,
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useUseTemplateMutation,
  useToggleTemplateFavoriteMutation,
  useGenerateVariationsMutation,
  usePredictPerformanceQuery,
  useValidateContentMutation,
  useGetTrendingTopicsQuery,
  useGenerateFromBriefMutation,
} = contentOptimizationApi;