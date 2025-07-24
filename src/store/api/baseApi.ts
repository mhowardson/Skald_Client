import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { config } from '../../config/environment';

const baseQuery = fetchBaseQuery({
  baseUrl: `/api/${config.api.version}`,
  timeout: config.api.timeout,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Set tenant context headers
    const { currentOrganization, currentWorkspace } = state.tenant;
    if (currentOrganization) {
      headers.set('x-organization-id', currentOrganization.id);
    }
    if (currentWorkspace) {
      headers.set('x-workspace-id', currentWorkspace.id);
    }
    
    return headers;
  },
});

// Base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    
    if (refreshToken) {
      // Attempt to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store the new token
        const { accessToken } = refreshResult.data as any;
        api.dispatch({
          type: 'auth/updateTokens',
          payload: { accessToken },
        });
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Organization', 'Workspace', 'Content', 'Analytics', 'Research', 'Hooks', 'Topics', 'Competitors', 'Trends', 'ContentGaps', 'ViralPatterns', 'Insights', 'CrossPlatformMetrics', 'AudienceInsights', 'PerformanceReport', 'ContentAnalysis', 'Recommendations', 'TrendingInsights', 'PerformanceSummary'],
  endpoints: () => ({}),
});