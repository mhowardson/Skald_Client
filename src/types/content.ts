// Content Creation Types
export interface ContentPlatform {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  publishingResult?: {
    id?: string;
    url?: string;
    error?: string;
    metrics?: {
      reach?: number;
      engagement?: number;
      clicks?: number;
    };
  };
  platformSpecific?: {
    hashtags?: string[];
    mentions?: string[];
    threadMode?: boolean;
    carouselMode?: boolean;
    storyMode?: boolean;
    customSettings?: Record<string, any>;
  };
  scheduledAt?: string;
}

export interface MediaFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    format?: string;
    fileSize?: number;
    createdAt?: string;
  };
}

export interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  industry: string;
  platform: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  popularity: number;
  rating: number;
  usageCount: number;
  isFavorite: boolean;
  isPremium: boolean;
  previewImage?: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
  metrics?: {
    avgEngagement: number;
    bestPerformingPlatform: string;
    successRate: number;
  };
}

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  platforms: ContentPlatform[];
  media: string[]; // Media file IDs
  tags?: string[];
  category?: string;
  contentPillar?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  workspaceId: string;
  organizationId: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  category: 'length' | 'hashtags' | 'timing' | 'engagement' | 'accessibility';
  action?: () => void;
  applied?: boolean;
}

export interface PlatformMetrics {
  platform: string;
  characterLimit: number;
  currentLength: number;
  optimizationScore: number;
  engagement: {
    predicted: number;
    historical: number;
    benchmark: number;
  };
  bestTimeToPost: string;
  hashtags: {
    suggested: string[];
    trending: string[];
    performance: Record<string, number>;
  };
  readabilityScore: number;
  sentimentScore: number;
  aiSuggestions: string[];
}

export interface ContentAnalytics {
  contentId: string;
  platform: string;
  metrics: {
    reach: number;
    impressions: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    saves?: number;
  };
  demographics?: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
    interests: string[];
  };
  performanceScore: number;
  comparisonToPrevious?: {
    reach: number;
    engagement: number;
    performanceScore: number;
  };
  updatedAt: string;
}

// API Request/Response Types
export interface CreateContentRequest {
  title: string;
  body: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'thread';
  platforms: ContentPlatform[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
  contentPillar?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  media?: string[];
}

export interface ContentResponse {
  success: boolean;
  data?: ContentDraft;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface MediaUploadRequest {
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  optimization?: {
    compress?: boolean;
    resize?: { width: number; height: number };
    format?: string;
  };
}

export interface MediaUploadResponse {
  success: boolean;
  data?: {
    media: {
      id: string;
      url: string;
      thumbnailUrl?: string;
      filename: string;
      size: number;
      type: string;
      metadata: MediaFile['metadata'];
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ContentOptimizationRequest {
  content: string;
  platforms: string[];
  options?: {
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    optimizeLength?: boolean;
    improveTone?: 'professional' | 'casual' | 'friendly' | 'authoritative';
  };
}

export interface ContentOptimizationResponse {
  success: boolean;
  data?: {
    optimizedContent: string;
    suggestions: OptimizationSuggestion[];
    metrics: PlatformMetrics[];
    score: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Utility Types
export type PlatformType = ContentPlatform['platform'];
export type ContentStatus = ContentDraft['status'];
export type MediaType = MediaFile['type'];
export type OptimizationType = OptimizationSuggestion['type'];
export type OptimizationCategory = OptimizationSuggestion['category'];