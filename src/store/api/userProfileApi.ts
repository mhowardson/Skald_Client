import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface UserProfile {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    title?: string;
    phone?: string;
    location?: string;
    timezone: string;
    language: string;
  };
  preferences: {
    emailNotifications: {
      contentApproval: boolean;
      teamInvites: boolean;
      systemUpdates: boolean;
      weeklyDigest: boolean;
      securityAlerts: boolean;
    };
    pushNotifications: {
      contentPublished: boolean;
      teamMentions: boolean;
      taskAssignments: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'system';
      compactMode: boolean;
      language: string;
    };
    dashboard: {
      defaultView: 'overview' | 'content' | 'analytics';
      showMetrics: boolean;
      autoRefresh: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: number;
    backupCodes?: string[];
  };
  activity: {
    lastLoginAt: string;
    lastActiveAt: string;
    loginCount: number;
    currentStreak: number;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export interface UpdateProfileRequest {
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    title?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    language?: string;
  };
}

export interface UpdatePreferencesRequest {
  emailNotifications?: Partial<UserProfile['preferences']['emailNotifications']>;
  pushNotifications?: Partial<UserProfile['preferences']['pushNotifications']>;
  appearance?: Partial<UserProfile['preferences']['appearance']>;
  dashboard?: Partial<UserProfile['preferences']['dashboard']>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateAvatarRequest {
  avatar: File;
}

export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  current: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  type: 'login' | 'logout' | 'profile_update' | 'password_change' | 'content_created' | 'team_action' | 'billing_change';
  description: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/user',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['UserProfile', 'UserSessions', 'ActivityLog'],
  endpoints: (builder) => ({
    // Get current user profile
    getUserProfile: builder.query<{ user: UserProfile }, void>({
      query: () => '/profile',
      providesTags: ['UserProfile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<{ user: UserProfile }, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Update user preferences
    updatePreferences: builder.mutation<{ user: UserProfile }, UpdatePreferencesRequest>({
      query: (data) => ({
        url: '/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Change password
    changePassword: builder.mutation<{ success: boolean }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/password',
        method: 'PUT',
        body: data,
      }),
    }),

    // Upload avatar
    uploadAvatar: builder.mutation<{ user: UserProfile }, FormData>({
      query: (formData) => ({
        url: '/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Delete avatar
    deleteAvatar: builder.mutation<{ user: UserProfile }, void>({
      query: () => ({
        url: '/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Get user sessions
    getUserSessions: builder.query<{ sessions: UserSession[] }, void>({
      query: () => '/sessions',
      providesTags: ['UserSessions'],
    }),

    // Revoke session
    revokeSession: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserSessions'],
    }),

    // Revoke all other sessions
    revokeAllSessions: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/sessions/revoke-all',
        method: 'POST',
      }),
      invalidatesTags: ['UserSessions'],
    }),

    // Get activity log
    getActivityLog: builder.query<{ 
      activities: ActivityLogEntry[]; 
      hasMore: boolean; 
    }, { 
      limit?: number; 
      offset?: number; 
      type?: string; 
    }>({
      query: (params) => ({
        url: '/activity',
        params,
      }),
      providesTags: ['ActivityLog'],
    }),

    // Setup two-factor authentication
    setupTwoFactor: builder.mutation<TwoFactorSetup, void>({
      query: () => ({
        url: '/two-factor/setup',
        method: 'POST',
      }),
    }),

    // Enable two-factor authentication
    enableTwoFactor: builder.mutation<{ user: UserProfile; backupCodes: string[] }, { code: string }>({
      query: (data) => ({
        url: '/two-factor/enable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Disable two-factor authentication
    disableTwoFactor: builder.mutation<{ user: UserProfile }, { password: string }>({
      query: (data) => ({
        url: '/two-factor/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Generate new backup codes
    generateBackupCodes: builder.mutation<{ backupCodes: string[] }, { password: string }>({
      query: (data) => ({
        url: '/two-factor/backup-codes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Verify email address
    verifyEmail: builder.mutation<{ success: boolean }, { token: string }>({
      query: (data) => ({
        url: '/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Resend email verification
    resendEmailVerification: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/verify-email/resend',
        method: 'POST',
      }),
    }),

    // Update email address
    updateEmail: builder.mutation<{ success: boolean }, { email: string; password: string }>({
      query: (data) => ({
        url: '/email',
        method: 'PUT',
        body: data,
      }),
    }),

    // Delete account
    deleteAccount: builder.mutation<{ success: boolean }, { password: string; confirmation: string }>({
      query: (data) => ({
        url: '/account',
        method: 'DELETE',
        body: data,
      }),
    }),

    // Export user data
    exportUserData: builder.mutation<{ downloadUrl: string }, void>({
      query: () => ({
        url: '/export',
        method: 'POST',
      }),
    }),

    // Get user statistics
    getUserStats: builder.query<{
      stats: {
        contentCreated: number;
        postsPublished: number;
        teamCollaborations: number;
        organizationsJoined: number;
        daysActive: number;
        averageEngagement: number;
      };
    }, void>({
      query: () => '/stats',
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useGetUserSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetActivityLogQuery,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useGenerateBackupCodesMutation,
  useVerifyEmailMutation,
  useResendEmailVerificationMutation,
  useUpdateEmailMutation,
  useDeleteAccountMutation,
  useExportUserDataMutation,
  useGetUserStatsQuery,
} = userProfileApi;