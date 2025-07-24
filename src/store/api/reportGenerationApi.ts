/**
 * Report Generation API
 * 
 * RTK Query API for automated report generation, scheduling, and management.
 * Provides React hooks for all report-related operations.
 * 
 * @api reportGenerationApi
 * @version 1.0.0
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'performance' | 'audience' | 'competitive' | 'comprehensive';
  description: string;
  sections: ReportSection[];
  defaultFilters: ReportFilters;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  type: 'metrics_summary' | 'charts' | 'tables' | 'insights' | 'recommendations';
  title: string;
  configuration: Record<string, any>;
  order: number;
}

export interface ReportFilters {
  timeframe: string;
  platforms?: string[];
  contentTypes?: string[];
  metrics?: string[];
  includeCompetitors?: boolean;
}

export interface ReportSchedule {
  id: string;
  organizationId: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  isActive: boolean;
  lastGenerated?: string;
  nextScheduled: string;
  filters: ReportFilters;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  organizationId: string;
  templateId?: string;
  scheduleId?: string;
  name: string;
  type: string;
  format: 'pdf' | 'csv' | 'excel' | 'html';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  generatedAt: string;
  expiresAt: string;
  filters: ReportFilters;
  metadata: {
    totalPages?: number;
    sections: number;
    dataPoints: number;
    generationTime: number;
  };
  error?: string;
}

export interface GenerateReportRequest {
  templateId: string;
  filters: ReportFilters;
  format?: 'pdf' | 'csv' | 'excel' | 'html';
}

export interface CreateTemplateRequest {
  name: string;
  type: 'performance' | 'audience' | 'competitive' | 'comprehensive';
  description: string;
  sections: Omit<ReportSection, 'id'>[];
  defaultFilters: ReportFilters;
}

export interface CreateScheduleRequest {
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  filters: ReportFilters;
}

export interface GetReportsRequest {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportsResponse {
  reports: GeneratedReport[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const reportGenerationApi = createApi({
  reducerPath: 'reportGenerationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/reports',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Report', 'Template', 'Schedule'],
  endpoints: (builder) => ({
    // Report Generation
    generateReport: builder.mutation<{ report: GeneratedReport }, GenerateReportRequest>({
      query: (data) => ({
        url: '/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    // Get Reports
    getReports: builder.query<ReportsResponse, GetReportsRequest>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Report'],
    }),

    // Get Single Report
    getReport: builder.query<{ report: GeneratedReport }, string>({
      query: (reportId) => `/${reportId}`,
      providesTags: (result, error, reportId) => [{ type: 'Report', id: reportId }],
    }),

    // Download Report
    downloadReport: builder.query<string, string>({
      query: (reportId) => `/${reportId}/download`,
      transformResponse: (response: any, meta) => {
        // Return the download URL
        return meta?.response?.url || '';
      },
    }),

    // Delete Report
    deleteReport: builder.mutation<{ message: string }, string>({
      query: (reportId) => ({
        url: `/${reportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: 'Report', id: reportId },
        'Report',
      ],
    }),

    // Templates
    getReportTemplates: builder.query<{ templates: ReportTemplate[] }, void>({
      query: () => '/templates',
      providesTags: ['Template'],
    }),

    createReportTemplate: builder.mutation<{ template: ReportTemplate }, CreateTemplateRequest>({
      query: (data) => ({
        url: '/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Template'],
    }),

    // Schedules
    getReportSchedules: builder.query<{ schedules: ReportSchedule[] }, void>({
      query: () => '/schedules',
      providesTags: ['Schedule'],
    }),

    createReportSchedule: builder.mutation<{ schedule: ReportSchedule }, CreateScheduleRequest>({
      query: (data) => ({
        url: '/schedules',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),

    updateReportSchedule: builder.mutation<
      { schedule: ReportSchedule },
      { scheduleId: string; data: Partial<CreateScheduleRequest> }
    >({
      query: ({ scheduleId, data }) => ({
        url: `/schedules/${scheduleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { scheduleId }) => [
        { type: 'Schedule', id: scheduleId },
        'Schedule',
      ],
    }),

    deleteReportSchedule: builder.mutation<{ message: string }, string>({
      query: (scheduleId) => ({
        url: `/schedules/${scheduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, scheduleId) => [
        { type: 'Schedule', id: scheduleId },
        'Schedule',
      ],
    }),
  }),
});

export const {
  // Report Generation
  useGenerateReportMutation,
  useGetReportsQuery,
  useGetReportQuery,
  useDownloadReportQuery,
  useDeleteReportMutation,

  // Templates
  useGetReportTemplatesQuery,
  useCreateReportTemplateMutation,

  // Schedules
  useGetReportSchedulesQuery,
  useCreateReportScheduleMutation,
  useUpdateReportScheduleMutation,
  useDeleteReportScheduleMutation,
} = reportGenerationApi;