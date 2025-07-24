/**
 * Research API Service
 * 
 * RTK Query service for AI-powered content research, competitive analysis,
 * and trend detection functionality.
 * 
 * @service ResearchApi
 * @version 1.0.0
 * 
 * @features
 * - Competitor content analysis
 * - Topic/Problem/Solution framework extraction
 * - Hook pattern analysis with chart data
 * - Content performance prediction
 * - Industry trend identification
 * - Competitive intelligence reports
 * 
 * @endpoints
 * - analyzeCompetitors: POST /research/analyze
 * - getTrendingHooks: GET /research/hooks/trending
 * - getTopicFrameworks: GET /research/topics/{category}
 * - predictPerformance: POST /research/predict
 * - getCompetitors: GET /research/competitors
 * - getIndustryTrends: GET /research/trends
 * - getContentGaps: GET /research/content-gaps
 * - getViralPatterns: GET /research/viral-patterns
 */

import { baseApi } from './baseApi';

// Types and Interfaces
export interface ContentAnalysis {
  id: string;
  platform: string;
  creatorId: string;
  creatorName: string;
  creatorFollowers: number;
  content: {
    text: string;
    type: 'post' | 'story' | 'reel' | 'article' | 'video';
    mediaType: 'text' | 'image' | 'video' | 'carousel';
    hashtags: string[];
    mentions: string[];
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    engagementRate: number;
    viralityScore: number;
  };
  timestamp: Date;
  analysis: {
    topic: string;
    category: string;
    problem: string;
    solution: string;
    hook: {
      pattern: string;
      type: HookType;
      effectiveness: number;
    };
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    keywords: string[];
    trends: string[];
  };
}

export interface TopicProblemSolution {
  id: string;
  topic: string;
  category: string;
  industry: string;
  problem: {
    description: string;
    painPoints: string[];
    targetAudience: string[];
    urgency: 'low' | 'medium' | 'high';
  };
  solution: {
    description: string;
    benefits: string[];
    approach: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  message: {
    coreMessage: string;
    valueProposition: string;
    callToAction: string;
    tone: string;
  };
  performance: {
    averageEngagementRate: number;
    averageViews: number;
    successfulPosts: number;
    totalPosts: number;
    trendingScore: number;
  };
  examples: {
    topPerforming: ContentAnalysis[];
    hooks: string[];
    variations: string[];
  };
  lastUpdated: Date;
}

export interface HookAnalysis {
  id: string;
  pattern: string;
  type: HookType;
  category: string;
  description: string;
  effectiveness: {
    score: number;
    confidence: number;
    sampleSize: number;
  };
  performance: {
    averageEngagementRate: number;
    averageViews: number;
    averageShares: number;
    viralityPotential: number;
  };
  usage: {
    frequency: number;
    trending: boolean;
    peakPeriods: Array<{
      start: Date;
      end: Date;
      intensity: number;
    }>;
  };
  examples: string[];
  variations: string[];
  platforms: Array<{
    platform: string;
    effectiveness: number;
    usage: number;
  }>;
  demographics: {
    ageGroups: Array<{ range: string; effectiveness: number }>;
    interests: Array<{ interest: string; resonance: number }>;
  };
  lastAnalyzed: Date;
}

export type HookType = 
  | 'question' 
  | 'statistic' 
  | 'story' 
  | 'controversy' 
  | 'curiosity' 
  | 'emotion' 
  | 'urgency' 
  | 'social_proof' 
  | 'problem_statement' 
  | 'benefit_promise';

export interface CompetitorProfile {
  id: string;
  name: string;
  platform: string;
  handle: string;
  followers: number;
  category: string;
  industry: string;
  verified: boolean;
  metrics: {
    avgEngagementRate: number;
    avgViews: number;
    postFrequency: number;
    topPerformingContentTypes: string[];
  };
  contentStrategy: {
    primaryTopics: string[];
    postingPattern: {
      frequency: number;
      bestTimes: Array<{
        day: string;
        hour: number;
        performance: number;
      }>;
    };
    contentMix: Array<{
      type: string;
      percentage: number;
    }>;
  };
  strengths: string[];
  opportunities: string[];
  topContent: ContentAnalysis[];
  lastAnalyzed: Date;
}

export interface TrendAnalysis {
  id: string;
  trend: string;
  category: string;
  industry: string;
  momentum: number;
  direction: 'rising' | 'stable' | 'declining';
  confidence: number;
  timeframe: {
    start: Date;
    end: Date;
    peak?: Date;
  };
  keywords: string[];
  relatedTopics: string[];
  platforms: Array<{
    platform: string;
    adoption: number;
    growth: number;
  }>;
  demographics: {
    primaryAgeGroup: string;
    genderSplit: { male: number; female: number; other: number };
    topRegions: string[];
  };
  metrics: {
    totalMentions: number;
    avgEngagement: number;
    viralPotential: number;
    competitorAdoption: number;
  };
  predictions: {
    expectedLifespan: string;
    peakPeriod: string;
    recommendedAction: string;
  };
  lastUpdated: Date;
}

export interface ContentGap {
  id: string;
  category: string;
  opportunity: string;
  competitorCoverage: 'low' | 'medium' | 'high';
  searchVolume: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedFormats: string[];
  estimatedReach: number;
  confidenceScore: number;
}

export interface ViralPattern {
  commonElements: Array<{
    element: string;
    frequency: number;
    examples: string[];
    impact: 'low' | 'medium' | 'high';
  }>;
  optimalTiming: {
    bestDays: string[];
    bestHours: number[];
    timezone: string;
  };
  contentFormats: Array<{
    format: string;
    viralityScore: number;
    engagement: string;
  }>;
  hashtagStrategies: Array<{
    strategy: string;
    effectiveness: number;
    example: string;
  }>;
}

// Request/Response Interfaces
export interface CompetitorAnalysisRequest {
  category: string;
  industry: string;
  platforms: string[];
  timeframe?: '7d' | '30d' | '90d';
  limit?: number;
  keywords?: string[];
  competitors?: string[];
  includeMetrics?: boolean;
  language?: string;
}

export interface CompetitorAnalysisResponse {
  content: ContentAnalysis[];
  insights: {
    topTopics: TopicProblemSolution[];
    trendingHooks: HookAnalysis[];
    competitorProfiles: CompetitorProfile[];
    trends: TrendAnalysis[];
  };
  recommendations: string[];
}

export interface TrendingHooksResponse {
  hooks: HookAnalysis[];
  charts: {
    hookTypeDistribution: Array<{
      type: HookType;
      count: number;
      effectiveness: number;
    }>;
    performanceOverTime: Array<{
      date: Date;
      engagement: number;
      virality: number;
    }>;
    platformComparison: Array<{
      platform: string;
      topHooks: Array<{
        hook: string;
        score: number;
      }>;
    }>;
  };
}

export interface PerformancePredictionRequest {
  content: string;
  platforms: string[];
  contentType?: 'post' | 'story' | 'reel' | 'article';
  hashtags?: string[];
  category?: string;
  industry?: string;
  scheduledTime?: string;
}

export interface PerformancePredictionResponse {
  overallScore: number;
  platformPredictions: Record<string, {
    engagementRate: number;
    estimatedReach: number;
    viralityPotential: number;
    confidence: number;
  }>;
  analysis: {
    detectedHooks: string[];
    sentiment: {
      score: number;
      label: string;
    };
    topicMatch: string;
    improvements: string[];
  };
  recommendations: string[];
}

// API Service Definition
export const researchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Competitor Analysis
    analyzeCompetitors: builder.mutation<CompetitorAnalysisResponse, CompetitorAnalysisRequest>({
      query: (data) => ({
        url: '/research/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Research'],
    }),

    // Trending Hooks
    getTrendingHooks: builder.query<TrendingHooksResponse, {
      platforms?: string[];
      timeframe?: '7d' | '30d' | '90d';
      industry?: string;
      limit?: number;
      includeCharts?: boolean;
    }>({
      query: (params) => ({
        url: '/research/hooks/trending',
        params,
      }),
      providesTags: ['Research', 'Hooks'],
    }),

    // Topic Frameworks
    getTopicFrameworks: builder.query<TopicProblemSolution[], {
      category: string;
      industry: string;
      limit?: number;
      sortBy?: 'popularity' | 'effectiveness' | 'recent';
      tags?: string[];
    }>({
      query: ({ category, ...params }) => ({
        url: `/research/topics/${category}`,
        params,
      }),
      providesTags: ['Research', 'Topics'],
    }),

    // Performance Prediction
    predictPerformance: builder.mutation<PerformancePredictionResponse, PerformancePredictionRequest>({
      query: (data) => ({
        url: '/research/predict',
        method: 'POST',
        body: data,
      }),
    }),

    // Competitor Profiles
    getCompetitors: builder.query<CompetitorProfile[], {
      industry: string;
      platforms?: string[];
      limit?: number;
      sortBy?: 'followers' | 'engagement' | 'content_volume';
      includeMetrics?: boolean;
    }>({
      query: (params) => ({
        url: '/research/competitors',
        params,
      }),
      providesTags: ['Research', 'Competitors'],
    }),

    // Industry Trends
    getIndustryTrends: builder.query<TrendAnalysis[], {
      industry: string;
      timeframe?: '7d' | '30d' | '90d';
      platforms?: string[];
      region?: string;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/research/trends',
        params,
      }),
      providesTags: ['Research', 'Trends'],
    }),

    // Content Gaps
    getContentGaps: builder.query<{
      gaps: ContentGap[];
      totalOpportunities: number;
      analysis: {
        industry: string;
        platforms: string[];
        timeframe: string;
      };
    }, {
      industry: string;
      platforms?: string[];
      timeframe?: string;
      competitors?: string[];
    }>({
      query: (params) => ({
        url: '/research/content-gaps',
        params,
      }),
      providesTags: ['Research', 'ContentGaps'],
    }),

    // Viral Patterns
    getViralPatterns: builder.query<ViralPattern, {
      industry: string;
      platforms?: string[];
      timeframe?: '7d' | '30d' | '90d';
      minViews?: number;
    }>({
      query: (params) => ({
        url: '/research/viral-patterns',
        params,
      }),
      providesTags: ['Research', 'ViralPatterns'],
    }),

    // Competitive Insights
    getCompetitiveInsights: builder.query<{
      competitorProfiles: CompetitorProfile[];
      contentGaps: ContentGap[];
      opportunities: string[];
      trends: TrendAnalysis[];
      recommendations: string[];
    }, {
      organizationId: string;
      timeframe?: string;
      competitors?: string[];
      includeRecommendations?: boolean;
    }>({
      query: ({ organizationId, ...params }) => ({
        url: `/research/insights/${organizationId}`,
        params,
      }),
      providesTags: ['Research', 'Insights'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useAnalyzeCompetitorsMutation,
  useGetTrendingHooksQuery,
  useGetTopicFrameworksQuery,
  usePredictPerformanceMutation,
  useGetCompetitorsQuery,
  useGetIndustryTrendsQuery,
  useGetContentGapsQuery,
  useGetViralPatternsQuery,
  useGetCompetitiveInsightsQuery,
} = researchApi;