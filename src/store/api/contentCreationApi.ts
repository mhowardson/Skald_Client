import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ContentDraft {
  id: string;
  title: string;
  workspaceId: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'article' | 'carousel';
  platforms: string[];
  content: {
    text: string;
    hashtags: string[];
    mentions: string[];
    media: MediaFile[];
  };
  settings: Record<string, any>;
  tags: string[];
  organizationId: string;
  createdBy: string;
  status: 'draft';
  metadata: {
    characterCount: number;
    wordCount: number;
    hashtagCount: number;
    mentionCount: number;
    estimatedReadTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface OptimizedContent {
  platform: string;
  text: string;
  hashtags: string[];
  mentions: string[];
  characterLimit: number;
  recommendations: string[];
}

export interface ContentPreview {
  platform: string;
  formattedContent: {
    text: string;
    hashtags: string[];
    mentions: string[];
    media: any[];
  };
  platformFeatures: {
    characterLimit: number;
    maxHashtags: number;
    supportsMedia: boolean;
    supportsCarousel: boolean;
    supportsStories: boolean;
  };
  preview: {
    renderedText: string;
    hasMedia: boolean;
    estimatedEngagement: string;
    publishingTime: string;
    displayFormat: string;
  };
}

export interface ValidationResult {
  platform: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
  recommendations: string[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  industry: string;
  platforms: string[];
  template: string;
  variables: string[];
  usage: string;
  engagement: string;
}

export interface CreateDraftRequest {
  title: string;
  workspaceId: string;
  type: ContentDraft['type'];
  platforms: string[];
  content: {
    text: string;
    hashtags?: string[];
    mentions?: string[];
    media?: any[];
  };
  settings?: Record<string, any>;
  tags?: string[];
}

export interface UpdateDraftRequest extends Partial<CreateDraftRequest> {
  id: string;
}

export interface OptimizeContentRequest {
  content: {
    text: string;
    hashtags?: string[];
    mentions?: string[];
  };
  platforms: string[];
  options?: Record<string, any>;
}

export interface PreviewContentRequest {
  content: {
    text: string;
    hashtags?: string[];
    mentions?: string[];
    media?: any[];
  };
  platforms: string[];
}

export interface ValidateContentRequest {
  content: {
    text: string;
    hashtags?: string[];
    mentions?: string[];
    media?: any[];
  };
  platforms: string[];
  type: ContentDraft['type'];
}

export const contentCreationApi = createApi({
  reducerPath: 'contentCreationApi',
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
  tagTypes: ['Draft', 'Template', 'Media'],
  endpoints: (builder) => ({
    // Create content draft
    createDraft: builder.mutation<{ success: boolean; data: ContentDraft }, CreateDraftRequest>({
      query: (data) => ({
        url: '/draft',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Draft'],
    }),

    // Update content draft
    updateDraft: builder.mutation<{ success: boolean; data: ContentDraft }, UpdateDraftRequest>({
      query: ({ id, ...data }) => ({
        url: `/draft/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Draft', id }],
    }),

    // Optimize content for platforms
    optimizeContent: builder.mutation<{
      success: boolean;
      data: {
        original: any;
        optimized: Record<string, OptimizedContent>;
        platforms: string[];
      };
    }, OptimizeContentRequest>({
      query: (data) => ({
        url: '/optimize',
        method: 'POST',
        body: data,
      }),
    }),

    // Generate content preview
    previewContent: builder.mutation<{
      success: boolean;
      data: {
        previews: Record<string, ContentPreview>;
        generated: string[];
        generatedAt: string;
      };
    }, PreviewContentRequest>({
      query: (data) => ({
        url: '/preview',
        method: 'POST',
        body: data,
      }),
    }),

    // Upload media files
    uploadMedia: builder.mutation<{
      success: boolean;
      data: {
        uploads: MediaFile[];
        totalFiles: number;
        successCount: number;
        failureCount: number;
      };
    }, FormData>({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    // Validate content structure
    validateContent: builder.mutation<{
      success: boolean;
      data: {
        isValid: boolean;
        results: ValidationResult[];
        overall: {
          errors: number;
          warnings: number;
          validPlatforms: number;
          totalPlatforms: number;
        };
      };
    }, ValidateContentRequest>({
      query: (data) => ({
        url: '/validate',
        method: 'POST',
        body: data,
      }),
    }),

    // Get content templates
    getTemplates: builder.query<{
      success: boolean;
      data: {
        templates: ContentTemplate[];
        filters: {
          type?: string;
          industry?: string;
          platform?: string;
        };
        total: number;
        available: {
          types: string[];
          industries: string[];
          platforms: string[];
        };
      };
    }, {
      type?: string;
      industry?: string;
      platform?: string;
    }>({
      query: (params = {}) => ({
        url: '/templates',
        params,
      }),
      providesTags: ['Template'],
    }),
  }),
});

export const {
  useCreateDraftMutation,
  useUpdateDraftMutation,
  useOptimizeContentMutation,
  usePreviewContentMutation,
  useUploadMediaMutation,
  useValidateContentMutation,
  useGetTemplatesQuery,
} = contentCreationApi;