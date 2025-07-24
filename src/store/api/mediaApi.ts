import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface MediaFile {
  id: string;
  organizationId: string;
  workspaceId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for video/audio
    alt?: string;
    caption?: string;
    tags: string[];
    location?: string;
    camera?: string;
    dimensions?: string;
  };
  usage: {
    contentIds: string[];
    lastUsedAt?: string;
    usageCount: number;
  };
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  organizationId: string;
  workspaceId?: string;
  fileCount: number;
  totalSize: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface MediaFilters {
  type?: 'image' | 'video' | 'audio' | 'document';
  folderId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface BulkOperationRequest {
  fileIds: string[];
  operation: 'move' | 'delete' | 'tag' | 'download';
  targetFolderId?: string;
  tags?: string[];
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageLimit: number;
  filesByType: {
    images: number;
    videos: number;
    audio: number;
    documents: number;
  };
  recentActivity: {
    uploadsToday: number;
    uploadsThisWeek: number;
    uploadsThisMonth: number;
  };
}

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/media',
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
  tagTypes: ['MediaFile', 'MediaFolder', 'MediaStats'],
  endpoints: (builder) => ({
    // Get media files with filtering and pagination
    getMediaFiles: builder.query<{
      files: MediaFile[];
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    }, {
      page?: number;
      limit?: number;
      filters?: MediaFilters;
      sortBy?: 'uploadedAt' | 'filename' | 'size' | 'type';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/files',
        params: {
          ...params,
          filters: params.filters ? JSON.stringify(params.filters) : undefined,
        },
      }),
      providesTags: ['MediaFile'],
    }),

    // Get single media file
    getMediaFile: builder.query<{ file: MediaFile }, string>({
      query: (id) => `/files/${id}`,
      providesTags: (_, __, id) => [{ type: 'MediaFile', id }],
    }),

    // Upload media files
    uploadMediaFiles: builder.mutation<{
      files: MediaFile[];
      failed: { filename: string; error: string }[];
    }, {
      files: File[];
      folderId?: string;
      tags?: string[];
      onProgress?: (progress: UploadProgress[]) => void;
    }>({
      query: ({ files, folderId, tags }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        if (folderId) formData.append('folderId', folderId);
        if (tags) formData.append('tags', JSON.stringify(tags));
        
        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MediaFile', 'MediaStats'],
    }),

    // Update media file metadata
    updateMediaFile: builder.mutation<{ file: MediaFile }, {
      id: string;
      metadata: Partial<MediaFile['metadata']>;
      filename?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/files/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'MediaFile', id }],
    }),

    // Delete media file
    deleteMediaFile: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaFile', 'MediaStats'],
    }),

    // Bulk operations on media files
    bulkOperation: builder.mutation<{
      success: boolean;
      results: { fileId: string; success: boolean; error?: string }[];
    }, BulkOperationRequest>({
      query: (data) => ({
        url: '/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MediaFile', 'MediaStats'],
    }),

    // Get media folders
    getMediaFolders: builder.query<{ folders: MediaFolder[] }, { parentId?: string }>({
      query: (params) => ({
        url: '/folders',
        params,
      }),
      providesTags: ['MediaFolder'],
    }),

    // Create media folder
    createMediaFolder: builder.mutation<{ folder: MediaFolder }, {
      name: string;
      description?: string;
      parentId?: string;
    }>({
      query: (data) => ({
        url: '/folders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MediaFolder'],
    }),

    // Update media folder
    updateMediaFolder: builder.mutation<{ folder: MediaFolder }, {
      id: string;
      name?: string;
      description?: string;
      parentId?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/folders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MediaFolder'],
    }),

    // Delete media folder
    deleteMediaFolder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaFolder', 'MediaFile'],
    }),

    // Get media statistics
    getMediaStats: builder.query<MediaStats, void>({
      query: () => '/stats',
      providesTags: ['MediaStats'],
    }),

    // Search media files
    searchMediaFiles: builder.query<{
      files: MediaFile[];
      suggestions: string[];
    }, {
      query: string;
      filters?: Partial<MediaFilters>;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/search',
        params: {
          ...params,
          filters: params.filters ? JSON.stringify(params.filters) : undefined,
        },
      }),
    }),

    // Get recently used media
    getRecentMedia: builder.query<{ files: MediaFile[] }, { limit?: number }>({
      query: (params) => ({
        url: '/recent',
        params,
      }),
    }),

    // Get media usage analytics
    getMediaUsage: builder.query<{
      mostUsed: MediaFile[];
      leastUsed: MediaFile[];
      unusedFiles: MediaFile[];
      usageByType: Record<string, number>;
    }, { days?: number }>({
      query: (params) => ({
        url: '/usage',
        params,
      }),
    }),

    // Generate download URL for media file
    getDownloadUrl: builder.mutation<{ downloadUrl: string }, string>({
      query: (id) => ({
        url: `/files/${id}/download`,
        method: 'POST',
      }),
    }),

    // Generate shareable link for media file
    createShareLink: builder.mutation<{
      shareUrl: string;
      expiresAt: string;
    }, {
      fileId: string;
      expiresIn?: number; // hours
      password?: string;
    }>({
      query: (data) => ({
        url: '/share',
        method: 'POST',
        body: data,
      }),
    }),

    // Get available tags
    getMediaTags: builder.query<{ tags: string[] }, void>({
      query: () => '/tags',
    }),

    // Process media file (resize, compress, etc.)
    processMediaFile: builder.mutation<{ file: MediaFile }, {
      id: string;
      operations: {
        resize?: { width?: number; height?: number; quality?: number };
        crop?: { x: number; y: number; width: number; height: number };
        compress?: { quality: number };
        watermark?: { text: string; position: string; opacity: number };
      };
    }>({
      query: ({ id, operations }) => ({
        url: `/files/${id}/process`,
        method: 'POST',
        body: { operations },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'MediaFile', id }],
    }),
  }),
});

export const {
  useGetMediaFilesQuery,
  useGetMediaFileQuery,
  useUploadMediaFilesMutation,
  useUpdateMediaFileMutation,
  useDeleteMediaFileMutation,
  useBulkOperationMutation,
  useGetMediaFoldersQuery,
  useCreateMediaFolderMutation,
  useUpdateMediaFolderMutation,
  useDeleteMediaFolderMutation,
  useGetMediaStatsQuery,
  useSearchMediaFilesQuery,
  useGetRecentMediaQuery,
  useGetMediaUsageQuery,
  useGetDownloadUrlMutation,
  useCreateShareLinkMutation,
  useGetMediaTagsQuery,
  useProcessMediaFileMutation,
} = mediaApi;