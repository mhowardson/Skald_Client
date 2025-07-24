import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ContentPlatform {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  platformSpecific?: {
    hashtags?: string[];
    mentions?: string[];
    location?: string;
    threadMode?: boolean; // For Twitter threads
    carouselMode?: boolean; // For Instagram carousels
  };
  publishingResult?: {
    postId?: string;
    url?: string;
    error?: string;
  };
}

export interface ContentMedia {
  id: string;
  type: 'image' | 'video' | 'gif' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  alt?: string;
  thumbnail?: string;
}

export interface Content {
  id: string;
  workspaceId: string;
  title: string;
  body: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'thread';
  status: 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'published' | 'failed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Media attachments
  media: ContentMedia[];
  
  // Platform-specific publishing info
  platforms: ContentPlatform[];
  
  // Scheduling
  scheduledAt?: string;
  publishedAt?: string;
  
  // Content metadata
  tags: string[];
  category?: string;
  contentPillar?: string;
  
  // AI-generated metadata
  aiGenerated: boolean;
  generatedPrompt?: string;
  sentimentScore?: number;
  keyTopics?: string[];
  
  // Approval workflow
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Performance tracking
  analytics?: {
    impressions: number;
    engagements: number;
    clicks: number;
    shares: number;
    comments: number;
    likes: number;
  };
  
  // Audit trail
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateContentRequest {
  title: string;
  body: string;
  type: Content['type'];
  platforms: Omit<ContentPlatform, 'status' | 'publishingResult'>[];
  scheduledAt?: string;
  tags?: string[];
  category?: string;
  contentPillar?: string;
  priority?: Content['priority'];
  media?: string[]; // Media IDs
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  id: string;
}

export interface ContentCalendarParams {
  startDate: string;
  endDate: string;
  platforms?: string[];
  status?: string[];
  workspaceId?: string;
}

export interface ContentAnalyticsParams {
  contentId?: string;
  startDate: string;
  endDate: string;
  platforms?: string[];
}

export interface BulkActionRequest {
  contentIds: string[];
  action: 'approve' | 'reject' | 'publish' | 'delete' | 'archive' | 'duplicate';
  reason?: string;
  scheduledAt?: string;
}

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/content',
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
  tagTypes: ['Content', 'ContentCalendar', 'ContentAnalytics'],
  endpoints: (builder) => ({
    // Get content list with filters
    getContent: builder.query<{ content: Content[]; total: number; page: number; limit: number }, {
      page?: number;
      limit?: number;
      status?: string[];
      platforms?: string[];
      search?: string;
      tags?: string[];
      priority?: string[];
      createdBy?: string;
      dateRange?: { start: string; end: string };
    }>({
      query: (params = {}) => ({
        url: '/',
        params: {
          ...params,
          status: params.status?.join(','),
          platforms: params.platforms?.join(','),
          tags: params.tags?.join(','),
          priority: params.priority?.join(','),
        },
      }),
      providesTags: ['Content'],
    }),
    
    // Get single content item
    getContentById: builder.query<{ content: Content }, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'Content', id }],
    }),
    
    // Create new content
    createContent: builder.mutation<{ content: Content }, CreateContentRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content', 'ContentCalendar'],
    }),
    
    // Update content
    updateContent: builder.mutation<{ content: Content }, UpdateContentRequest>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Content', id },
        'Content',
        'ContentCalendar',
      ],
    }),
    
    // Delete content
    deleteContent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content', 'ContentCalendar'],
    }),
    
    // Duplicate content
    duplicateContent: builder.mutation<{ content: Content }, string>({
      query: (id) => ({
        url: `/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Content'],
    }),
    
    // Approve content
    approveContent: builder.mutation<{ content: Content }, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/${id}/approve`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Content', id }, 'Content'],
    }),
    
    // Reject content
    rejectContent: builder.mutation<{ content: Content }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Content', id }, 'Content'],
    }),
    
    // Schedule content for publishing
    scheduleContent: builder.mutation<{ content: Content }, { id: string; scheduledAt: string; platforms?: string[] }>({
      query: ({ id, scheduledAt, platforms }) => ({
        url: `/${id}/schedule`,
        method: 'POST',
        body: { scheduledAt, platforms },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Content', id },
        'Content',
        'ContentCalendar',
      ],
    }),
    
    // Publish content immediately
    publishContent: builder.mutation<{ content: Content }, { id: string; platforms?: string[] }>({
      query: ({ id, platforms }) => ({
        url: `/${id}/publish`,
        method: 'POST',
        body: { platforms },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Content', id }, 'Content'],
    }),
    
    // Get content calendar
    getContentCalendar: builder.query<{ calendar: Content[] }, ContentCalendarParams>({
      query: (params) => ({
        url: '/calendar',
        params,
      }),
      providesTags: ['ContentCalendar'],
    }),
    
    // Get content analytics
    getContentAnalytics: builder.query<{
      content?: Content;
      analytics: {
        totalImpressions: number;
        totalEngagements: number;
        totalClicks: number;
        totalShares: number;
        engagementRate: number;
        platformBreakdown: Record<string, any>;
        timeSeriesData: Array<{ date: string; impressions: number; engagements: number }>;
      };
    }, ContentAnalyticsParams>({
      query: (params) => ({
        url: '/analytics',
        params,
      }),
      providesTags: ['ContentAnalytics'],
    }),
    
    // Bulk actions
    bulkAction: builder.mutation<{ success: boolean; results: any[] }, BulkActionRequest>({
      query: (data) => ({
        url: '/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content', 'ContentCalendar'],
    }),
    
    // Get content templates
    getContentTemplates: builder.query<{ templates: any[] }, void>({
      query: () => '/templates',
    }),
    
    // Upload media
    uploadMedia: builder.mutation<{ media: ContentMedia }, FormData>({
      query: (formData) => ({
        url: '/media',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetContentQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useDuplicateContentMutation,
  useApproveContentMutation,
  useRejectContentMutation,
  useScheduleContentMutation,
  usePublishContentMutation,
  useGetContentCalendarQuery,
  useGetContentAnalyticsQuery,
  useBulkActionMutation,
  useGetContentTemplatesQuery,
  useUploadMediaMutation,
} = contentApi;