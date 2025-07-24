import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../slices/authSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationType: 'agency' | 'enterprise' | 'freelancer';
  plan?: 'creator' | 'agency' | 'studio' | 'enterprise';
}

interface AuthResponse {
  user: User;
  organization?: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/auth',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { success: boolean; data: AuthResponse }) => response.data,
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: { success: boolean; data: AuthResponse }) => response.data,
      invalidatesTags: ['User'],
    }),
    
    refreshToken: builder.mutation<{ accessToken: string; expiresIn: number }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    
    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => '/me',
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data,
      providesTags: ['User'],
    }),
    
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;