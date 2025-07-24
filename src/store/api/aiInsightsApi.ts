import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface SentimentAnalysis {
  id: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'review' | 'mention';
  
  // Overall sentiment
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  score: number; // -1 to 1
  
  // Detailed analysis
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  
  // Content analysis
  keywords: {
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    weight: number;
    frequency: number;
  }[];
  
  // Context analysis
  context: {
    topics: string[];
    intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
    urgency: 'low' | 'medium' | 'high';
    language: string;
    tone: 'formal' | 'casual' | 'professional' | 'friendly' | 'urgent';
  };
  
  // Audience insights
  audienceReaction: {
    platform: string;
    positiveReactions: number;
    negativeReactions: number;
    neutralReactions: number;
    engagementSentiment: number;
  }[];
  
  // Recommendations
  recommendations: {
    type: 'content_adjustment' | 'response_strategy' | 'escalation' | 'opportunity';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    reasoning: string;
  }[];
  
  // Metadata
  analyzedAt: string;
  modelVersion: string;
  processingTime: number; // milliseconds
}

export interface TrendAnalysis {
  id: string;
  
  // Trend identification
  trend: {
    name: string;
    description: string;
    category: 'content' | 'hashtag' | 'topic' | 'behavior' | 'platform';
    strength: number; // 0-100
    velocity: number; // rate of change
    lifecycle: 'emerging' | 'growing' | 'peak' | 'declining' | 'stable';
  };
  
  // Trend metrics
  metrics: {
    volume: number;
    engagement: number;
    reach: number;
    mentions: number;
    sentiment: number;
    
    // Growth metrics
    volumeGrowth: number;
    engagementGrowth: number;
    reachGrowth: number;
    
    // Time series data
    timeSeries: {
      date: string;
      volume: number;
      engagement: number;
      sentiment: number;
    }[];
  };
  
  // Geographic distribution
  geography: {
    region: string;
    country: string;
    volume: number;
    engagement: number;
    sentiment: number;
  }[];
  
  // Platform analysis
  platforms: {
    platform: string;
    volume: number;
    engagement: number;
    sentiment: number;
    topContent: {
      contentId: string;
      title: string;
      performance: number;
    }[];
  }[];
  
  // Influencer analysis
  influencers: {
    username: string;
    platform: string;
    followers: number;
    engagement: number;
    sentiment: number;
    influence: number;
  }[];
  
  // Related trends
  relatedTrends: {
    trendId: string;
    name: string;
    correlation: number;
    relationship: 'causal' | 'correlative' | 'competitive' | 'complementary';
  }[];
  
  // Predictions
  predictions: {
    timeframe: '1d' | '7d' | '30d' | '90d';
    volumePrediction: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    peakPrediction?: {
      expectedDate: string;
      expectedVolume: number;
      confidence: number;
    };
  }[];
  
  // Opportunities
  opportunities: {
    type: 'content_creation' | 'audience_targeting' | 'partnership' | 'campaign';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: number;
    timeWindow: string;
    actionItems: string[];
  }[];
  
  // Metadata
  analyzedAt: string;
  dataSource: string[];
  period: {
    start: string;
    end: string;
  };
}

export interface AIInsight {
  id: string;
  type: 'sentiment' | 'trend' | 'anomaly' | 'opportunity' | 'risk';
  category: 'content' | 'audience' | 'performance' | 'competitive' | 'market';
  
  // Insight details
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'short_term' | 'long_term';
  
  // Supporting data
  data: {
    primary: Record<string, any>;
    supporting: Record<string, any>[];
    visualizations: {
      type: 'chart' | 'graph' | 'heatmap' | 'timeline';
      data: any;
      config: any;
    }[];
  };
  
  // Recommendations
  recommendations: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    expectedOutcome: string;
  }[];
  
  // Related entities
  relatedContent: string[];
  relatedTrends: string[];
  relatedSentiments: string[];
  
  // Metadata
  generatedAt: string;
  expiresAt?: string;
  source: 'ai_analysis' | 'user_feedback' | 'automated_detection';
  modelVersion: string;
}

export interface CompetitorAnalysis {
  id: string;
  competitorId: string;
  
  // Competitor info
  competitor: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    platforms: string[];
  };
  
  // Performance comparison
  performance: {
    platform: string;
    metrics: {
      followers: number;
      engagement: number;
      postFrequency: number;
      avgEngagementRate: number;
      growthRate: number;
    };
    comparison: {
      followersRatio: number;
      engagementRatio: number;
      frequencyRatio: number;
      performanceScore: number;
    };
  }[];
  
  // Content analysis
  contentStrategy: {
    platform: string;
    contentTypes: Record<string, number>;
    postingTimes: Record<string, number>;
    topHashtags: string[];
    averagePostLength: number;
    mediaUsage: Record<string, number>;
    
    // Sentiment analysis
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    
    // Topic analysis
    topTopics: {
      topic: string;
      frequency: number;
      engagement: number;
      sentiment: number;
    }[];
  }[];
  
  // Competitive gaps
  gaps: {
    type: 'content' | 'audience' | 'timing' | 'platform' | 'engagement';
    description: string;
    opportunity: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }[];
  
  // Winning strategies
  strategies: {
    strategy: string;
    description: string;
    platforms: string[];
    effectiveness: number;
    adoptionDifficulty: 'easy' | 'moderate' | 'difficult';
  }[];
  
  // Recommendations
  recommendations: {
    category: 'content' | 'engagement' | 'timing' | 'platform' | 'audience';
    action: string;
    reasoning: string;
    expectedImpact: number;
    timeframe: string;
  }[];
  
  analyzedAt: string;
  period: {
    start: string;
    end: string;
  };
}

export const aiInsightsApi = createApi({
  reducerPath: 'aiInsightsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/ai-insights',
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
  tagTypes: ['SentimentAnalysis', 'TrendAnalysis', 'AIInsight', 'CompetitorAnalysis'],
  endpoints: (builder) => ({
    // Sentiment Analysis
    getSentimentAnalysis: builder.query<{
      analyses: SentimentAnalysis[];
      total: number;
      summary: {
        positive: number;
        negative: number;
        neutral: number;
        averageScore: number;
      };
    }, {
      contentId?: string;
      contentType?: string;
      sentiment?: string;
      period?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/sentiment',
        params,
      }),
      providesTags: ['SentimentAnalysis'],
    }),

    analyzeSentiment: builder.mutation<{ analysis: SentimentAnalysis }, {
      contentId?: string;
      text?: string;
      contentType: string;
      includeEmotions?: boolean;
      includeKeywords?: boolean;
    }>({
      query: (data) => ({
        url: '/sentiment/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SentimentAnalysis'],
    }),

    // Trend Analysis
    getTrendAnalysis: builder.query<{
      trends: TrendAnalysis[];
      total: number;
      summary: {
        emerging: number;
        growing: number;
        peak: number;
        declining: number;
      };
    }, {
      category?: string;
      strength?: number;
      lifecycle?: string;
      period?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/trends',
        params,
      }),
      providesTags: ['TrendAnalysis'],
    }),

    detectTrends: builder.mutation<{ trends: TrendAnalysis[] }, {
      keywords?: string[];
      platforms?: string[];
      timeframe?: string;
      includeGeography?: boolean;
      includePredictions?: boolean;
    }>({
      query: (data) => ({
        url: '/trends/detect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TrendAnalysis'],
    }),

    // AI Insights
    getAIInsights: builder.query<{
      insights: AIInsight[];
      total: number;
      summary: {
        high: number;
        medium: number;
        low: number;
        urgent: number;
      };
    }, {
      type?: string;
      category?: string;
      impact?: string;
      urgency?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/insights',
        params,
      }),
      providesTags: ['AIInsight'],
    }),

    generateInsights: builder.mutation<{ insights: AIInsight[] }, {
      contentIds?: string[];
      analysisType?: string[];
      includeCompetitive?: boolean;
      includeTrends?: boolean;
      includeSentiment?: boolean;
    }>({
      query: (data) => ({
        url: '/insights/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AIInsight'],
    }),

    // Competitor Analysis
    getCompetitorAnalysis: builder.query<{
      analyses: CompetitorAnalysis[];
      total: number;
      summary: {
        totalCompetitors: number;
        averagePerformance: number;
        topPerformer: string;
        gaps: number;
      };
    }, {
      competitorId?: string;
      industry?: string;
      period?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/competitors',
        params,
      }),
      providesTags: ['CompetitorAnalysis'],
    }),

    analyzeCompetitor: builder.mutation<{ analysis: CompetitorAnalysis }, {
      competitorId?: string;
      competitorName?: string;
      platforms?: string[];
      period?: {
        start: string;
        end: string;
      };
      includeStrategy?: boolean;
      includeGaps?: boolean;
    }>({
      query: (data) => ({
        url: '/competitors/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CompetitorAnalysis'],
    }),

    // Batch Analysis
    batchAnalyze: builder.mutation<{
      sentiment: SentimentAnalysis[];
      trends: TrendAnalysis[];
      insights: AIInsight[];
    }, {
      contentIds: string[];
      analysisTypes: ('sentiment' | 'trends' | 'insights')[];
      options?: {
        includeEmotions?: boolean;
        includeKeywords?: boolean;
        includePredictions?: boolean;
        includeCompetitive?: boolean;
      };
    }>({
      query: (data) => ({
        url: '/batch-analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SentimentAnalysis', 'TrendAnalysis', 'AIInsight'],
    }),

    // Real-time Analysis
    getRealTimeInsights: builder.query<{
      sentiment: {
        current: number;
        trend: 'up' | 'down' | 'stable';
        change: number;
      };
      trends: {
        name: string;
        strength: number;
        velocity: number;
      }[];
      alerts: {
        type: string;
        message: string;
        priority: 'high' | 'medium' | 'low';
      }[];
    }, void>({
      query: () => '/realtime',
    }),

    // Model Management
    getModelStatus: builder.query<{
      models: {
        type: 'sentiment' | 'trend' | 'insight' | 'competitor';
        version: string;
        status: 'active' | 'training' | 'deprecated';
        accuracy: number;
        lastTrained: string;
      }[];
    }, void>({
      query: () => '/models/status',
    }),

    trainModel: builder.mutation<{ success: boolean }, {
      modelType: 'sentiment' | 'trend' | 'insight' | 'competitor';
      trainingData?: string[];
      parameters?: Record<string, any>;
    }>({
      query: (data) => ({
        url: '/models/train',
        method: 'POST',
        body: data,
      }),
    }),

    // Feedback
    provideFeedback: builder.mutation<{ success: boolean }, {
      analysisId: string;
      analysisType: 'sentiment' | 'trend' | 'insight' | 'competitor';
      feedback: 'accurate' | 'partially_accurate' | 'inaccurate';
      comments?: string;
      corrections?: Record<string, any>;
    }>({
      query: (data) => ({
        url: '/feedback',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSentimentAnalysisQuery,
  useAnalyzeSentimentMutation,
  useGetTrendAnalysisQuery,
  useDetectTrendsMutation,
  useGetAIInsightsQuery,
  useGenerateInsightsMutation,
  useGetCompetitorAnalysisQuery,
  useAnalyzeCompetitorMutation,
  useBatchAnalyzeMutation,
  useGetRealTimeInsightsQuery,
  useGetModelStatusQuery,
  useTrainModelMutation,
  useProvideFeedbackMutation,
} = aiInsightsApi;