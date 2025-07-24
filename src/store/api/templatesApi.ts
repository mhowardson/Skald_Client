import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'social_post' | 'story' | 'carousel' | 'video' | 'email' | 'blog' | 'ad';
  organizationId: string;
  workspaceId?: string;
  
  content: {
    title?: string;
    body: string;
    callToAction?: string;
    hashtags?: string[];
    mentions?: string[];
    mediaPlaceholders?: {
      type: 'image' | 'video';
      position: number;
      requirements?: string;
    }[];
  };
  
  variables: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean' | 'url' | 'media';
    label: string;
    placeholder?: string;
    required: boolean;
    defaultValue?: any;
    options?: string[]; // for select types
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }[];
  
  platforms: {
    platform: string;
    enabled: boolean;
    customizations?: {
      characterLimit?: number;
      hashtagLimit?: number;
      mentionLimit?: number;
      mediaLimit?: number;
      aspectRatio?: string;
    };
  }[];
  
  brandGuidelines: {
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'inspirational';
    voice: string[];
    doNotUse: string[];
    requiredElements?: string[];
    colorScheme?: string[];
    fonts?: string[];
  };
  
  usage: {
    useCount: number;
    lastUsedAt?: string;
    averagePerformance?: number;
  };
  
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  version: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandGuidelines {
  id: string;
  organizationId: string;
  workspaceId?: string;
  
  brand: {
    name: string;
    tagline?: string;
    description: string;
    values: string[];
    personality: string[];
    targetAudience: {
      demographics: string[];
      interests: string[];
      painPoints: string[];
    };
  };
  
  visual: {
    logo: {
      primary: string;
      secondary?: string;
      variants: { name: string; url: string; usage: string }[];
    };
    colors: {
      primary: { name: string; hex: string; usage: string }[];
      secondary: { name: string; hex: string; usage: string }[];
      accent: { name: string; hex: string; usage: string }[];
      neutral: { name: string; hex: string; usage: string }[];
    };
    typography: {
      primary: { name: string; family: string; weights: string[]; usage: string };
      secondary?: { name: string; family: string; weights: string[]; usage: string };
      display?: { name: string; family: string; weights: string[]; usage: string };
    };
    imagery: {
      style: string[];
      subjects: string[];
      composition: string[];
      lighting: string[];
      filters?: string[];
      avoid: string[];
    };
  };
  
  voice: {
    tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'inspirational';
    personality: string[];
    doUse: string[];
    doNotUse: string[];
    examples: {
      good: string[];
      bad: string[];
    };
    grammarRules: string[];
  };
  
  content: {
    messaging: {
      keyMessages: string[];
      valuePropositions: string[];
      taglines: string[];
      boilerplate: string;
    };
    guidelines: {
      postFrequency: Record<string, string>;
      hashtagStrategy: {
        recommended: string[];
        avoid: string[];
        maxPerPost: number;
      };
      contentTypes: {
        type: string;
        percentage: number;
        guidelines: string[];
      }[];
      approvalRequired: boolean;
    };
  };
  
  platformSpecific: {
    platform: string;
    profileSetup: {
      bio: string;
      profileImage: string;
      coverImage?: string;
      highlights?: string[];
    };
    contentGuidelines: {
      idealPostTime: string[];
      contentMix: Record<string, number>;
      hashtagCount: { min: number; max: number };
      characterLimits: Record<string, number>;
      imageSpecs: Record<string, string>;
    };
    brandElements: {
      requiredElements: string[];
      watermark?: boolean;
      logo?: 'always' | 'sometimes' | 'never';
    };
  }[];
  
  compliance: {
    legal: {
      disclaimers: string[];
      requiredDisclosures: string[];
      copyrightNotice: string;
      termsOfUse?: string;
    };
    industry: {
      regulations: string[];
      certifications: string[];
      standards: string[];
    };
  };
  
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  templateCount: number;
  organizationId: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'image' | 'video' | 'audio' | 'document' | 'font';
  category: string;
  url: string;
  thumbnailUrl?: string;
  
  metadata: {
    size?: number;
    dimensions?: { width: number; height: number };
    format: string;
    colorProfile?: string;
    resolution?: string;
  };
  
  usage: {
    primary: boolean;
    platforms: string[];
    contexts: string[];
    restrictions?: string[];
  };
  
  versions: {
    id: string;
    name: string;
    url: string;
    format: string;
    notes?: string;
  }[];
  
  organizationId: string;
  workspaceId?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  lastUsedAt?: string;
}

export const templatesApi = createApi({
  reducerPath: 'templatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/templates',
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
  tagTypes: ['Template', 'BrandGuidelines', 'Category', 'BrandAsset'],
  endpoints: (builder) => ({
    // Content Templates
    getTemplates: builder.query<{
      templates: ContentTemplate[];
      total: number;
      categories: TemplateCategory[];
    }, {
      category?: string;
      platform?: string;
      search?: string;
      tags?: string[];
      isPublic?: boolean;
      sortBy?: 'name' | 'usage' | 'performance' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/',
        params: {
          ...params,
          tags: params.tags ? JSON.stringify(params.tags) : undefined,
        },
      }),
      providesTags: ['Template'],
    }),

    getTemplate: builder.query<ContentTemplate, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'Template', id }],
    }),

    createTemplate: builder.mutation<{ template: ContentTemplate }, {
      name: string;
      description?: string;
      category: ContentTemplate['category'];
      content: ContentTemplate['content'];
      variables?: ContentTemplate['variables'];
      platforms: ContentTemplate['platforms'];
      brandGuidelines?: ContentTemplate['brandGuidelines'];
      tags?: string[];
      isPublic?: boolean;
      workspaceId?: string;
    }>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),

    updateTemplate: builder.mutation<{ template: ContentTemplate }, {
      id: string;
      name?: string;
      description?: string;
      content?: ContentTemplate['content'];
      variables?: ContentTemplate['variables'];
      platforms?: ContentTemplate['platforms'];
      brandGuidelines?: ContentTemplate['brandGuidelines'];
      tags?: string[];
      isPublic?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Template', id }],
    }),

    deleteTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),

    duplicateTemplate: builder.mutation<{ template: ContentTemplate }, {
      id: string;
      name?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/${id}/duplicate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),

    useTemplate: builder.mutation<{ content: any }, {
      templateId: string;
      variables: Record<string, any>;
      platform?: string;
    }>({
      query: ({ templateId, ...data }) => ({
        url: `/${templateId}/use`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { templateId }) => [{ type: 'Template', id: templateId }],
    }),

    // Template Categories
    getTemplateCategories: builder.query<{ categories: TemplateCategory[] }, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    createTemplateCategory: builder.mutation<{ category: TemplateCategory }, {
      name: string;
      description?: string;
      icon?: string;
    }>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    updateTemplateCategory: builder.mutation<{ category: TemplateCategory }, {
      id: string;
      name?: string;
      description?: string;
      icon?: string;
      sortOrder?: number;
    }>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteTemplateCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Template'],
    }),

    // Brand Guidelines
    getBrandGuidelines: builder.query<BrandGuidelines, { workspaceId?: string }>({
      query: (params) => ({
        url: '/brand-guidelines',
        params,
      }),
      providesTags: ['BrandGuidelines'],
    }),

    createBrandGuidelines: builder.mutation<{ guidelines: BrandGuidelines }, {
      brand: BrandGuidelines['brand'];
      visual: BrandGuidelines['visual'];
      voice: BrandGuidelines['voice'];
      content: BrandGuidelines['content'];
      platformSpecific?: BrandGuidelines['platformSpecific'];
      compliance?: BrandGuidelines['compliance'];
      workspaceId?: string;
    }>({
      query: (data) => ({
        url: '/brand-guidelines',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BrandGuidelines'],
    }),

    updateBrandGuidelines: builder.mutation<{ guidelines: BrandGuidelines }, {
      id: string;
      brand?: Partial<BrandGuidelines['brand']>;
      visual?: Partial<BrandGuidelines['visual']>;
      voice?: Partial<BrandGuidelines['voice']>;
      content?: Partial<BrandGuidelines['content']>;
      platformSpecific?: BrandGuidelines['platformSpecific'];
      compliance?: Partial<BrandGuidelines['compliance']>;
    }>({
      query: ({ id, ...data }) => ({
        url: `/brand-guidelines/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BrandGuidelines'],
    }),

    // Brand Assets
    getBrandAssets: builder.query<{
      assets: BrandAsset[];
      total: number;
    }, {
      type?: BrandAsset['type'];
      category?: string;
      search?: string;
      tags?: string[];
      sortBy?: 'name' | 'uploadedAt' | 'lastUsedAt' | 'size';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/brand-assets',
        params: {
          ...params,
          tags: params.tags ? JSON.stringify(params.tags) : undefined,
        },
      }),
      providesTags: ['BrandAsset'],
    }),

    uploadBrandAsset: builder.mutation<{ asset: BrandAsset }, {
      file: File;
      name?: string;
      type: BrandAsset['type'];
      category: string;
      usage: BrandAsset['usage'];
      tags?: string[];
    }>({
      query: ({ file, ...data }) => {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });
        
        return {
          url: '/brand-assets',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['BrandAsset'],
    }),

    updateBrandAsset: builder.mutation<{ asset: BrandAsset }, {
      id: string;
      name?: string;
      category?: string;
      usage?: BrandAsset['usage'];
      tags?: string[];
    }>({
      query: ({ id, ...data }) => ({
        url: `/brand-assets/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'BrandAsset', id }],
    }),

    deleteBrandAsset: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/brand-assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BrandAsset'],
    }),

    // Template Analytics
    getTemplateAnalytics: builder.query<{
      usage: {
        templateId: string;
        name: string;
        useCount: number;
        averagePerformance: number;
        lastUsedAt: string;
      }[];
      performance: {
        templateId: string;
        averageEngagement: number;
        averageReach: number;
        conversionRate: number;
      }[];
      trends: {
        period: string;
        templateUsage: Record<string, number>;
        platformDistribution: Record<string, number>;
      };
    }, {
      period?: 'week' | 'month' | 'quarter';
      templateIds?: string[];
    }>({
      query: (params) => ({
        url: '/analytics',
        params: {
          ...params,
          templateIds: params.templateIds ? JSON.stringify(params.templateIds) : undefined,
        },
      }),
    }),

    // Brand Compliance
    checkBrandCompliance: builder.mutation<{
      compliant: boolean;
      issues: {
        type: 'visual' | 'voice' | 'content' | 'platform';
        severity: 'error' | 'warning' | 'info';
        message: string;
        suggestions: string[];
      }[];
      score: number;
    }, {
      content: {
        title?: string;
        body: string;
        hashtags?: string[];
        media?: string[];
      };
      platform: string;
    }>({
      query: (data) => ({
        url: '/brand-guidelines/check-compliance',
        method: 'POST',
        body: data,
      }),
    }),

    // Template Suggestions
    getTemplateSuggestions: builder.query<{
      suggestions: {
        template: ContentTemplate;
        relevanceScore: number;
        reason: string;
      }[];
    }, {
      content?: string;
      platform?: string;
      category?: string;
      mood?: string;
      audience?: string;
    }>({
      query: (params) => ({
        url: '/suggestions',
        params,
      }),
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
  useUseTemplateMutation,
  useGetTemplateCategoriesQuery,
  useCreateTemplateCategoryMutation,
  useUpdateTemplateCategoryMutation,
  useDeleteTemplateCategoryMutation,
  useGetBrandGuidelinesQuery,
  useCreateBrandGuidelinesMutation,
  useUpdateBrandGuidelinesMutation,
  useGetBrandAssetsQuery,
  useUploadBrandAssetMutation,
  useUpdateBrandAssetMutation,
  useDeleteBrandAssetMutation,
  useGetTemplateAnalyticsQuery,
  useCheckBrandComplianceMutation,
  useGetTemplateSuggestionsQuery,
} = templatesApi;