import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface Notification {
  id: string;
  type: 'content_published' | 'content_failed' | 'team_invitation' | 'content_approved' | 'content_rejected' | 'mention' | 'comment' | 'system' | 'billing';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  organizationId: string;
  workspaceId?: string;
  userId: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  email: {
    contentPublished: boolean;
    contentFailed: boolean;
    teamInvitations: boolean;
    contentApproval: boolean;
    mentions: boolean;
    comments: boolean;
    systemUpdates: boolean;
    billing: boolean;
    weeklyDigest: boolean;
  };
  push: {
    contentPublished: boolean;
    contentFailed: boolean;
    teamInvitations: boolean;
    contentApproval: boolean;
    mentions: boolean;
    comments: boolean;
    urgent: boolean;
  };
  inApp: {
    all: boolean;
    sound: boolean;
    desktop: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
  };
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'webhook' | 'slack' | 'teams';
  config: Record<string, any>;
  enabled: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  subject: string;
  emailTemplate: string;
  pushTemplate: string;
  variables: string[];
  organizationId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<Notification['type'], number>;
  byPriority: Record<Notification['priority'], number>;
  recent: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  delivery: {
    emailsSent: number;
    pushsSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/notifications',
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
  tagTypes: ['Notification', 'NotificationPreferences', 'NotificationChannel', 'NotificationTemplate', 'NotificationStats'],
  endpoints: (builder) => ({
    // Get notifications with filtering and pagination
    getNotifications: builder.query<{
      notifications: Notification[];
      total: number;
      unread: number;
      hasMore: boolean;
    }, {
      page?: number;
      limit?: number;
      type?: Notification['type'];
      priority?: Notification['priority'];
      read?: boolean;
      workspaceId?: string;
    }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ notification: Notification }, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Mark multiple notifications as read
    markMultipleAsRead: builder.mutation<{ count: number }, string[]>({
      query: (ids) => ({
        url: '/bulk/read',
        method: 'PATCH',
        body: { ids },
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ count: number }, { workspaceId?: string }>({
      query: (params) => ({
        url: '/read-all',
        method: 'PATCH',
        body: params,
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Delete multiple notifications
    deleteMultipleNotifications: builder.mutation<{ count: number }, string[]>({
      query: (ids) => ({
        url: '/bulk/delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Create notification (for testing/admin)
    createNotification: builder.mutation<{ notification: Notification }, {
      type: Notification['type'];
      title: string;
      message: string;
      priority?: Notification['priority'];
      data?: Record<string, any>;
      targetUsers?: string[];
      workspaceId?: string;
      actionUrl?: string;
      actionText?: string;
      expiresAt?: string;
    }>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<{ preferences: NotificationPreferences }, void>({
      query: () => '/preferences',
      providesTags: ['NotificationPreferences'],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<{ preferences: NotificationPreferences }, Partial<NotificationPreferences>>({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // Get notification channels
    getNotificationChannels: builder.query<{ channels: NotificationChannel[] }, void>({
      query: () => '/channels',
      providesTags: ['NotificationChannel'],
    }),

    // Create notification channel
    createNotificationChannel: builder.mutation<{ channel: NotificationChannel }, {
      name: string;
      type: NotificationChannel['type'];
      config: Record<string, any>;
    }>({
      query: (data) => ({
        url: '/channels',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationChannel'],
    }),

    // Update notification channel
    updateNotificationChannel: builder.mutation<{ channel: NotificationChannel }, {
      id: string;
      name?: string;
      config?: Record<string, any>;
      enabled?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/channels/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationChannel'],
    }),

    // Delete notification channel
    deleteNotificationChannel: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotificationChannel'],
    }),

    // Test notification channel
    testNotificationChannel: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/channels/${id}/test`,
        method: 'POST',
      }),
    }),

    // Get notification templates
    getNotificationTemplates: builder.query<{ templates: NotificationTemplate[] }, void>({
      query: () => '/templates',
      providesTags: ['NotificationTemplate'],
    }),

    // Create notification template
    createNotificationTemplate: builder.mutation<{ template: NotificationTemplate }, {
      name: string;
      type: Notification['type'];
      subject: string;
      emailTemplate: string;
      pushTemplate: string;
      variables?: string[];
    }>({
      query: (data) => ({
        url: '/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationTemplate'],
    }),

    // Update notification template
    updateNotificationTemplate: builder.mutation<{ template: NotificationTemplate }, {
      id: string;
      name?: string;
      subject?: string;
      emailTemplate?: string;
      pushTemplate?: string;
      variables?: string[];
    }>({
      query: ({ id, ...data }) => ({
        url: `/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationTemplate'],
    }),

    // Delete notification template
    deleteNotificationTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotificationTemplate'],
    }),

    // Get notification statistics
    getNotificationStats: builder.query<NotificationStats, { 
      period?: 'day' | 'week' | 'month' | 'year';
      workspaceId?: string;
    }>({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['NotificationStats'],
    }),

    // Subscribe to push notifications
    subscribeToPush: builder.mutation<{ success: boolean }, {
      subscription: PushSubscription;
      deviceInfo: {
        userAgent: string;
        deviceType: 'desktop' | 'mobile' | 'tablet';
      };
    }>({
      query: (data) => ({
        url: '/push/subscribe',
        method: 'POST',
        body: data,
      }),
    }),

    // Unsubscribe from push notifications
    unsubscribeFromPush: builder.mutation<{ success: boolean }, string>({
      query: (endpoint) => ({
        url: '/push/unsubscribe',
        method: 'POST',
        body: { endpoint },
      }),
    }),

    // Send test notification
    sendTestNotification: builder.mutation<{ success: boolean }, {
      type: Notification['type'];
      channels: ('email' | 'push' | 'inApp')[];
    }>({
      query: (data) => ({
        url: '/test',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkMultipleAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteMultipleNotificationsMutation,
  useCreateNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetNotificationChannelsQuery,
  useCreateNotificationChannelMutation,
  useUpdateNotificationChannelMutation,
  useDeleteNotificationChannelMutation,
  useTestNotificationChannelMutation,
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useGetNotificationStatsQuery,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useSendTestNotificationMutation,
} = notificationsApi;