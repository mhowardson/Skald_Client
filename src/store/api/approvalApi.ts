import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  workspaceId?: string;
  steps: ApprovalStep[];
  isDefault: boolean;
  isActive: boolean;
  conditions: {
    contentTypes?: ('post' | 'story' | 'reel' | 'video' | 'carousel' | 'thread')[];
    platforms?: string[];
    minEngagementThreshold?: number;
    hasMediaAttachments?: boolean;
    containsKeywords?: string[];
  };
  notifications: {
    onSubmission: boolean;
    onApproval: boolean;
    onRejection: boolean;
    onEscalation: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  order: number;
  name: string;
  type: 'review' | 'approve' | 'legal' | 'brand' | 'manager';
  assignees: {
    userIds?: string[];
    roleIds?: string[];
    anyOf?: boolean; // true = any assignee can approve, false = all must approve
  };
  timeoutHours?: number; // auto-escalate after X hours
  escalationUserId?: string;
  isOptional: boolean;
  conditions?: {
    skipIf?: string; // JavaScript expression
    requireIf?: string; // JavaScript expression
  };
}

export interface ApprovalRequest {
  id: string;
  contentId: string;
  workflowId: string;
  submittedBy: string;
  currentStepId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  content: {
    title: string;
    body: string;
    type: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'thread';
    platforms: string[];
    scheduledAt?: string;
    mediaFiles?: string[];
    estimatedReach?: number;
  };
  
  steps: ApprovalRequestStep[];
  comments: ApprovalComment[];
  history: ApprovalHistoryEntry[];
  
  submittedAt: string;
  dueAt?: string;
  completedAt?: string;
  
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApprovalRequestStep {
  id: string;
  stepId: string; // references ApprovalStep.id
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'escalated';
  assignedTo: string[];
  approvals: {
    userId: string;
    decision: 'approved' | 'rejected';
    comment?: string;
    decidedAt: string;
  }[];
  startedAt?: string;
  completedAt?: string;
  escalatedAt?: string;
  escalatedTo?: string;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  type: 'general' | 'suggestion' | 'concern' | 'approval' | 'rejection';
  isInternal: boolean; // internal comments not visible to content creator
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'escalated' | 'commented' | 'modified' | 'cancelled';
  userId: string;
  userName: string;
  stepId?: string;
  stepName?: string;
  details?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ApprovalTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'workflow' | 'checklist' | 'guidelines';
  organizationId: string;
  
  checklist?: {
    items: {
      id: string;
      text: string;
      required: boolean;
      category?: string;
    }[];
  };
  
  guidelines?: {
    sections: {
      title: string;
      content: string;
      examples?: string[];
    }[];
  };
  
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  
  averageTimeToApproval: number; // in hours
  averageStepsPerRequest: number;
  approvalRate: number; // percentage
  
  byPriority: Record<'low' | 'medium' | 'high' | 'urgent', number>;
  byWorkflow: Record<string, number>;
  byStep: Record<string, {
    total: number;
    approved: number;
    rejected: number;
    averageTime: number;
  }>;
  
  performance: {
    onTimeApprovals: number;
    lateApprovals: number;
    escalations: number;
    bottlenecks: {
      stepId: string;
      stepName: string;
      averageTime: number;
      count: number;
    }[];
  };
}

export const approvalApi = createApi({
  reducerPath: 'approvalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/approval',
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
  tagTypes: ['ApprovalWorkflow', 'ApprovalRequest', 'ApprovalTemplate', 'ApprovalStats'],
  endpoints: (builder) => ({
    // Workflows
    getApprovalWorkflows: builder.query<{ workflows: ApprovalWorkflow[] }, { workspaceId?: string }>({
      query: (params) => ({
        url: '/workflows',
        params,
      }),
      providesTags: ['ApprovalWorkflow'],
    }),

    createApprovalWorkflow: builder.mutation<{ workflow: ApprovalWorkflow }, {
      name: string;
      description?: string;
      steps: Omit<ApprovalStep, 'id'>[];
      conditions?: ApprovalWorkflow['conditions'];
      notifications?: ApprovalWorkflow['notifications'];
      isDefault?: boolean;
      workspaceId?: string;
    }>({
      query: (data) => ({
        url: '/workflows',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalWorkflow'],
    }),

    updateApprovalWorkflow: builder.mutation<{ workflow: ApprovalWorkflow }, {
      id: string;
      name?: string;
      description?: string;
      steps?: Omit<ApprovalStep, 'id'>[];
      conditions?: ApprovalWorkflow['conditions'];
      notifications?: ApprovalWorkflow['notifications'];
      isActive?: boolean;
      isDefault?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/workflows/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ApprovalWorkflow'],
    }),

    deleteApprovalWorkflow: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/workflows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApprovalWorkflow'],
    }),

    // Approval Requests
    getApprovalRequests: builder.query<{
      requests: ApprovalRequest[];
      total: number;
      hasMore: boolean;
    }, {
      page?: number;
      limit?: number;
      status?: ApprovalRequest['status'];
      priority?: ApprovalRequest['priority'];
      assignedToMe?: boolean;
      workspaceId?: string;
      contentType?: string;
      sortBy?: 'submittedAt' | 'dueAt' | 'priority';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/requests',
        params,
      }),
      providesTags: ['ApprovalRequest'],
    }),

    getApprovalRequest: builder.query<{ request: ApprovalRequest }, string>({
      query: (id) => `/requests/${id}`,
      providesTags: (_, __, id) => [{ type: 'ApprovalRequest', id }],
    }),

    submitForApproval: builder.mutation<{ request: ApprovalRequest }, {
      contentId: string;
      workflowId?: string; // if not provided, uses default workflow
      priority?: ApprovalRequest['priority'];
      dueAt?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }>({
      query: (data) => ({
        url: '/requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    approveStep: builder.mutation<{ request: ApprovalRequest }, {
      requestId: string;
      stepId: string;
      comment?: string;
    }>({
      query: ({ requestId, stepId, ...data }) => ({
        url: `/requests/${requestId}/steps/${stepId}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    rejectStep: builder.mutation<{ request: ApprovalRequest }, {
      requestId: string;
      stepId: string;
      comment: string;
      suggestions?: string[];
    }>({
      query: ({ requestId, stepId, ...data }) => ({
        url: `/requests/${requestId}/steps/${stepId}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    escalateStep: builder.mutation<{ request: ApprovalRequest }, {
      requestId: string;
      stepId: string;
      reason: string;
      escalateTo?: string;
    }>({
      query: ({ requestId, stepId, ...data }) => ({
        url: `/requests/${requestId}/steps/${stepId}/escalate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    addComment: builder.mutation<{ comment: ApprovalComment }, {
      requestId: string;
      message: string;
      type?: ApprovalComment['type'];
      isInternal?: boolean;
      attachments?: ApprovalComment['attachments'];
    }>({
      query: ({ requestId, ...data }) => ({
        url: `/requests/${requestId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { requestId }) => [{ type: 'ApprovalRequest', id: requestId }],
    }),

    updateComment: builder.mutation<{ comment: ApprovalComment }, {
      requestId: string;
      commentId: string;
      message: string;
    }>({
      query: ({ requestId, commentId, ...data }) => ({
        url: `/requests/${requestId}/comments/${commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { requestId }) => [{ type: 'ApprovalRequest', id: requestId }],
    }),

    deleteComment: builder.mutation<{ success: boolean }, {
      requestId: string;
      commentId: string;
    }>({
      query: ({ requestId, commentId }) => ({
        url: `/requests/${requestId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { requestId }) => [{ type: 'ApprovalRequest', id: requestId }],
    }),

    cancelApprovalRequest: builder.mutation<{ request: ApprovalRequest }, {
      requestId: string;
      reason?: string;
    }>({
      query: ({ requestId, ...data }) => ({
        url: `/requests/${requestId}/cancel`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    // Templates
    getApprovalTemplates: builder.query<{ templates: ApprovalTemplate[] }, {
      type?: ApprovalTemplate['type'];
    }>({
      query: (params) => ({
        url: '/templates',
        params,
      }),
      providesTags: ['ApprovalTemplate'],
    }),

    createApprovalTemplate: builder.mutation<{ template: ApprovalTemplate }, {
      name: string;
      description?: string;
      type: ApprovalTemplate['type'];
      checklist?: ApprovalTemplate['checklist'];
      guidelines?: ApprovalTemplate['guidelines'];
    }>({
      query: (data) => ({
        url: '/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalTemplate'],
    }),

    updateApprovalTemplate: builder.mutation<{ template: ApprovalTemplate }, {
      id: string;
      name?: string;
      description?: string;
      checklist?: ApprovalTemplate['checklist'];
      guidelines?: ApprovalTemplate['guidelines'];
    }>({
      query: ({ id, ...data }) => ({
        url: `/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ApprovalTemplate'],
    }),

    deleteApprovalTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApprovalTemplate'],
    }),

    // Statistics
    getApprovalStats: builder.query<ApprovalStats, {
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      workspaceId?: string;
      workflowId?: string;
    }>({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['ApprovalStats'],
    }),

    // Bulk operations
    bulkApprove: builder.mutation<{ results: { requestId: string; success: boolean; error?: string }[] }, {
      requestIds: string[];
      comment?: string;
    }>({
      query: (data) => ({
        url: '/requests/bulk/approve',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    bulkReject: builder.mutation<{ results: { requestId: string; success: boolean; error?: string }[] }, {
      requestIds: string[];
      comment: string;
    }>({
      query: (data) => ({
        url: '/requests/bulk/reject',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest', 'ApprovalStats'],
    }),

    // Notifications and assignments
    reassignStep: builder.mutation<{ request: ApprovalRequest }, {
      requestId: string;
      stepId: string;
      newAssignees: string[];
      reason?: string;
    }>({
      query: ({ requestId, stepId, ...data }) => ({
        url: `/requests/${requestId}/steps/${stepId}/reassign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { requestId }) => [{ type: 'ApprovalRequest', id: requestId }],
    }),

    getMyAssignments: builder.query<{
      assignments: {
        request: ApprovalRequest;
        step: ApprovalRequestStep;
        daysOverdue?: number;
      }[];
      total: number;
    }, {
      status?: 'pending' | 'overdue';
      priority?: ApprovalRequest['priority'];
    }>({
      query: (params) => ({
        url: '/my-assignments',
        params,
      }),
      providesTags: ['ApprovalRequest'],
    }),
  }),
});

export const {
  useGetApprovalWorkflowsQuery,
  useCreateApprovalWorkflowMutation,
  useUpdateApprovalWorkflowMutation,
  useDeleteApprovalWorkflowMutation,
  useGetApprovalRequestsQuery,
  useGetApprovalRequestQuery,
  useSubmitForApprovalMutation,
  useApproveStepMutation,
  useRejectStepMutation,
  useEscalateStepMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useCancelApprovalRequestMutation,
  useGetApprovalTemplatesQuery,
  useCreateApprovalTemplateMutation,
  useUpdateApprovalTemplateMutation,
  useDeleteApprovalTemplateMutation,
  useGetApprovalStatsQuery,
  useBulkApproveMutation,
  useBulkRejectMutation,
  useReassignStepMutation,
  useGetMyAssignmentsQuery,
} = approvalApi;