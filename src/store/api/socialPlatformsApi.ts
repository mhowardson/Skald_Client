import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface SocialPlatformConnection {
  id: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  accountId: string;
  accountName: string;
  accountHandle: string;
  profileImageUrl?: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncAt?: string;
  accessToken: string; // Encrypted on backend
  refreshToken?: string; // Encrypted on backend
  tokenExpiresAt?: string;
  permissions: string[];
  metadata: {
    followerCount?: number;
    followingCount?: number;
    postCount?: number;
    verified?: boolean;
    businessAccount?: boolean;
  };
}

export interface PlatformOAuthUrl {
  platform: string;
  authUrl: string;
  state: string;
}

export interface ConnectPlatformRequest {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  code: string;
  state: string;
}

export interface PlatformStats {
  platform: string;
  isConnected: boolean;
  accountCount: number;
  lastPostAt?: string;
  totalPosts: number;
  totalEngagement: number;
}

export interface PlatformCapabilities {
  platform: string;
  features: {
    textPosts: boolean;
    imagePosts: boolean;
    videoPosts: boolean;
    stories: boolean;
    reels: boolean;
    threads: boolean;
    scheduling: boolean;
    analytics: boolean;
    directMessaging: boolean;
  };
  limits: {
    maxTextLength: number;
    maxImages: number;
    maxVideos: number;
    videoMaxSize: number; // in MB
    imageMaxSize: number; // in MB
    schedulingAdvanceDays: number;
  };
}

export interface PublishContentRequest {
  connectionId: string;
  content: {
    text: string;
    mediaUrls?: string[];
    mediaType?: 'image' | 'video' | 'gif';
    hashtags?: string[];
    mentions?: string[];
    location?: string;
  };
  publishOptions: {
    publishNow: boolean;
    scheduledAt?: string;
    threadMode?: boolean; // For Twitter threads
    carouselMode?: boolean; // For Instagram carousels
    storyMode?: boolean; // For Instagram/Facebook stories
  };
  // TikTok-specific fields
  platform?: string;
  videoData?: string; // Base64 encoded video data for TikTok
  videoInfo?: {
    title: string;
    description: string;
    privacyLevel: 'PUBLIC_TO_EVERYONE' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
    commentDisabled: boolean;
    duetDisabled: boolean;
    stitchDisabled: boolean;
    autoAddMusic: boolean;
    hashtags: string[];
  };
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: string;
  scheduledFor?: string;
}

export const socialPlatformsApi = createApi({
  reducerPath: 'socialPlatformsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/social-platforms',
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
  tagTypes: ['SocialConnection', 'PlatformStats'],
  endpoints: (builder) => ({
    // Get all platform connections
    getPlatformConnections: builder.query<{ connections: SocialPlatformConnection[] }, void>({
      query: () => '/connections',
      providesTags: ['SocialConnection'],
    }),

    // Get OAuth URL for platform connection
    getOAuthUrl: builder.mutation<PlatformOAuthUrl, string>({
      query: (platform) => ({
        url: `/auth/${platform}/url`,
        method: 'POST',
      }),
    }),

    // Connect platform with OAuth code
    connectPlatform: builder.mutation<{ connection: SocialPlatformConnection }, ConnectPlatformRequest>({
      query: (data) => ({
        url: `/auth/${data.platform}/callback`,
        method: 'POST',
        body: { code: data.code, state: data.state },
      }),
      invalidatesTags: ['SocialConnection', 'PlatformStats'],
    }),

    // Disconnect platform
    disconnectPlatform: builder.mutation<{ message: string }, string>({
      query: (connectionId) => ({
        url: `/connections/${connectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialConnection', 'PlatformStats'],
    }),

    // Refresh platform connection
    refreshConnection: builder.mutation<{ connection: SocialPlatformConnection }, string>({
      query: (connectionId) => ({
        url: `/connections/${connectionId}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: ['SocialConnection'],
    }),

    // Get platform capabilities
    getPlatformCapabilities: builder.query<{ capabilities: PlatformCapabilities[] }, void>({
      query: () => '/capabilities',
    }),

    // Get platform statistics
    getPlatformStats: builder.query<{ stats: PlatformStats[] }, void>({
      query: () => '/stats',
      providesTags: ['PlatformStats'],
    }),

    // Publish content to platform
    publishContent: builder.mutation<PublishResult, PublishContentRequest>({
      query: (data) => ({
        url: '/publish',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlatformStats'],
    }),

    // Bulk publish to multiple platforms
    bulkPublishContent: builder.mutation<{ results: PublishResult[] }, {
      connectionIds: string[];
      content: PublishContentRequest['content'];
      publishOptions: PublishContentRequest['publishOptions'];
    }>({
      query: (data) => ({
        url: '/publish/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlatformStats'],
    }),

    // Get post analytics from platform
    getPostAnalytics: builder.query<{
      analytics: {
        postId: string;
        platform: string;
        impressions: number;
        engagements: number;
        clicks: number;
        shares: number;
        comments: number;
        likes: number;
        engagementRate: number;
        reachRate: number;
      }[];
    }, { postIds: string[] }>({
      query: ({ postIds }) => ({
        url: '/analytics',
        params: { postIds: postIds.join(',') },
      }),
    }),

    // Test platform connection
    testConnection: builder.mutation<{ success: boolean; message: string }, string>({
      query: (connectionId) => ({
        url: `/connections/${connectionId}/test`,
        method: 'POST',
      }),
    }),

    // Get platform-specific content guidelines
    getContentGuidelines: builder.query<{
      guidelines: {
        platform: string;
        textLimits: { min: number; max: number };
        hashtagLimits: { max: number };
        imageLimits: { maxCount: number; maxSize: number; formats: string[] };
        videoLimits: { maxSize: number; maxDuration: number; formats: string[] };
        bestPractices: string[];
        prohibited: string[];
      }[];
    }, void>({
      query: () => '/guidelines',
    }),
  }),
});

export const {
  useGetPlatformConnectionsQuery,
  useGetOAuthUrlMutation,
  useConnectPlatformMutation,
  useDisconnectPlatformMutation,
  useRefreshConnectionMutation,
  useGetPlatformCapabilitiesQuery,
  useGetPlatformStatsQuery,
  usePublishContentMutation,
  useBulkPublishContentMutation,
  useGetPostAnalyticsQuery,
  useTestConnectionMutation,
  useGetContentGuidelinesQuery,
} = socialPlatformsApi;