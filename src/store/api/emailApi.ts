import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'welcome' | 'invitation' | 'reset_password' | 'content_published' | 'content_approved' | 'content_rejected' | 'billing_reminder' | 'usage_alert' | 'security_alert' | 'digest' | 'custom';
  
  variables: {
    name: string;
    type: 'text' | 'number' | 'date' | 'url' | 'boolean';
    description: string;
    required: boolean;
    defaultValue?: any;
  }[];
  
  organizationId?: string;
  isSystem: boolean;
  isActive: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  organizationId: string;
  
  recipients: {
    type: 'all_users' | 'specific_users' | 'user_segments' | 'organizations' | 'custom_list';
    criteria?: {
      userRoles?: string[];
      organizationTypes?: string[];
      plans?: string[];
      lastActiveAfter?: string;
      lastActiveBefore?: string;
      customFilters?: Record<string, any>;
    };
    userIds?: string[];
    organizationIds?: string[];
    emailAddresses?: string[];
  };
  
  scheduling: {
    type: 'immediate' | 'scheduled' | 'recurring';
    scheduledAt?: string;
    timezone?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      daysOfWeek?: number[];
      dayOfMonth?: number;
      hour: number;
      minute: number;
    };
  };
  
  personalization: {
    enabled: boolean;
    variables: Record<string, any>;
  };
  
  tracking: {
    enabled: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
    trackUnsubscribes: boolean;
  };
  
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  
  stats: {
    recipientCount: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
    bouncedCount: number;
    failedCount: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

export interface EmailAlert {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  
  trigger: {
    type: 'user_signup' | 'content_published' | 'content_failed' | 'billing_issue' | 'usage_threshold' | 'security_event' | 'system_error' | 'custom';
    conditions: {
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
      value: any;
    }[];
    aggregation?: {
      field: string;
      function: 'count' | 'sum' | 'avg' | 'max' | 'min';
      timeWindow: number; // minutes
      threshold: number;
    };
  };
  
  actions: {
    type: 'send_email' | 'send_slack' | 'create_ticket' | 'webhook' | 'sms';
    config: {
      templateId?: string;
      recipients: string[];
      webhookUrl?: string;
      slackChannel?: string;
      message?: string;
      subject?: string;
    };
  }[];
  
  throttling: {
    enabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
    cooldownMinutes: number;
  };
  
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  templateId?: string;
  campaignId?: string;
  alertId?: string;
  
  recipient: {
    email: string;
    name?: string;
    userId?: string;
    organizationId?: string;
  };
  
  sender: {
    email: string;
    name?: string;
  };
  
  subject: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'spam' | 'unsubscribed';
  
  events: {
    type: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'spam' | 'unsubscribed';
    timestamp: string;
    metadata?: Record<string, any>;
  }[];
  
  metadata: {
    messageId?: string;
    provider?: string;
    errorMessage?: string;
    bounceReason?: string;
    clickedLinks?: string[];
    userAgent?: string;
    ipAddress?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export const emailApi = createApi({
  reducerPath: 'emailApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/email',
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
  tagTypes: ['EmailTemplate', 'EmailCampaign', 'EmailAlert', 'EmailLog'],
  endpoints: (builder) => ({
    // Email Templates
    getEmailTemplates: builder.query<{
      templates: EmailTemplate[];
      total: number;
    }, {
      type?: string;
      search?: string;
      isSystem?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/templates',
        params,
      }),
      providesTags: ['EmailTemplate'],
    }),

    getEmailTemplate: builder.query<EmailTemplate, string>({
      query: (id) => `/templates/${id}`,
      providesTags: (_, __, id) => [{ type: 'EmailTemplate', id }],
    }),

    createEmailTemplate: builder.mutation<{ template: EmailTemplate }, {
      name: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      type: EmailTemplate['type'];
      variables?: EmailTemplate['variables'];
    }>({
      query: (data) => ({
        url: '/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    updateEmailTemplate: builder.mutation<{ template: EmailTemplate }, {
      id: string;
      name?: string;
      subject?: string;
      htmlContent?: string;
      textContent?: string;
      variables?: EmailTemplate['variables'];
      isActive?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'EmailTemplate', id }],
    }),

    deleteEmailTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    previewEmailTemplate: builder.mutation<{ html: string; text: string }, {
      id: string;
      variables?: Record<string, any>;
    }>({
      query: ({ id, variables }) => ({
        url: `/templates/${id}/preview`,
        method: 'POST',
        body: { variables },
      }),
    }),

    // Email Campaigns
    getEmailCampaigns: builder.query<{
      campaigns: EmailCampaign[];
      total: number;
    }, {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/campaigns',
        params,
      }),
      providesTags: ['EmailCampaign'],
    }),

    getEmailCampaign: builder.query<EmailCampaign, string>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (_, __, id) => [{ type: 'EmailCampaign', id }],
    }),

    createEmailCampaign: builder.mutation<{ campaign: EmailCampaign }, {
      name: string;
      description?: string;
      templateId: string;
      recipients: EmailCampaign['recipients'];
      scheduling: EmailCampaign['scheduling'];
      personalization?: EmailCampaign['personalization'];
      tracking?: EmailCampaign['tracking'];
    }>({
      query: (data) => ({
        url: '/campaigns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmailCampaign'],
    }),

    updateEmailCampaign: builder.mutation<{ campaign: EmailCampaign }, {
      id: string;
      name?: string;
      description?: string;
      recipients?: EmailCampaign['recipients'];
      scheduling?: EmailCampaign['scheduling'];
      personalization?: EmailCampaign['personalization'];
      tracking?: EmailCampaign['tracking'];
    }>({
      query: ({ id, ...data }) => ({
        url: `/campaigns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'EmailCampaign', id }],
    }),

    sendEmailCampaign: builder.mutation<{ success: boolean }, {
      id: string;
      sendAt?: string;
    }>({
      query: ({ id, sendAt }) => ({
        url: `/campaigns/${id}/send`,
        method: 'POST',
        body: { sendAt },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'EmailCampaign', id }],
    }),

    pauseEmailCampaign: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/campaigns/${id}/pause`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'EmailCampaign', id }],
    }),

    // Email Alerts
    getEmailAlerts: builder.query<{
      alerts: EmailAlert[];
      total: number;
    }, {
      type?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/alerts',
        params,
      }),
      providesTags: ['EmailAlert'],
    }),

    getEmailAlert: builder.query<EmailAlert, string>({
      query: (id) => `/alerts/${id}`,
      providesTags: (_, __, id) => [{ type: 'EmailAlert', id }],
    }),

    createEmailAlert: builder.mutation<{ alert: EmailAlert }, {
      name: string;
      description?: string;
      trigger: EmailAlert['trigger'];
      actions: EmailAlert['actions'];
      throttling?: EmailAlert['throttling'];
    }>({
      query: (data) => ({
        url: '/alerts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmailAlert'],
    }),

    updateEmailAlert: builder.mutation<{ alert: EmailAlert }, {
      id: string;
      name?: string;
      description?: string;
      trigger?: EmailAlert['trigger'];
      actions?: EmailAlert['actions'];
      throttling?: EmailAlert['throttling'];
      isActive?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/alerts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'EmailAlert', id }],
    }),

    deleteEmailAlert: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/alerts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmailAlert'],
    }),

    testEmailAlert: builder.mutation<{ success: boolean }, {
      id: string;
      testData?: Record<string, any>;
    }>({
      query: ({ id, testData }) => ({
        url: `/alerts/${id}/test`,
        method: 'POST',
        body: { testData },
      }),
    }),

    // Email Logs
    getEmailLogs: builder.query<{
      logs: EmailLog[];
      total: number;
      stats: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        failed: number;
      };
    }, {
      campaignId?: string;
      alertId?: string;
      templateId?: string;
      recipient?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/logs',
        params,
      }),
      providesTags: ['EmailLog'],
    }),

    getEmailLog: builder.query<EmailLog, string>({
      query: (id) => `/logs/${id}`,
      providesTags: (_, __, id) => [{ type: 'EmailLog', id }],
    }),

    // Email Settings
    getEmailSettings: builder.query<{
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        username: string;
        fromEmail: string;
        fromName: string;
      };
      providers: {
        primary: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark';
        fallback?: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark';
      };
      limits: {
        perHour: number;
        perDay: number;
        perMonth: number;
      };
      unsubscribe: {
        enabled: boolean;
        listId?: string;
        footer: string;
      };
    }, void>({
      query: () => '/settings',
    }),

    updateEmailSettings: builder.mutation<{ success: boolean }, {
      smtp?: any;
      providers?: any;
      limits?: any;
      unsubscribe?: any;
    }>({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
    }),

    // Send individual email
    sendEmail: builder.mutation<{ success: boolean; messageId: string }, {
      templateId: string;
      recipient: {
        email: string;
        name?: string;
        userId?: string;
      };
      variables?: Record<string, any>;
      scheduledAt?: string;
    }>({
      query: (data) => ({
        url: '/send',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmailLog'],
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  usePreviewEmailTemplateMutation,
  useGetEmailCampaignsQuery,
  useGetEmailCampaignQuery,
  useCreateEmailCampaignMutation,
  useUpdateEmailCampaignMutation,
  useSendEmailCampaignMutation,
  usePauseEmailCampaignMutation,
  useGetEmailAlertsQuery,
  useGetEmailAlertQuery,
  useCreateEmailAlertMutation,
  useUpdateEmailAlertMutation,
  useDeleteEmailAlertMutation,
  useTestEmailAlertMutation,
  useGetEmailLogsQuery,
  useGetEmailLogQuery,
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useSendEmailMutation,
} = emailApi;