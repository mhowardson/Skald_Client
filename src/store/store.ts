import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { organizationApi } from './api/organizationApi';
import { workspaceApi } from './api/workspaceApi';
import { contentApi } from './api/contentApi';
import { analyticsApi } from './api/analyticsApi';
import { aiContentApi } from './api/aiContentApi';
import { socialPlatformsApi } from './api/socialPlatformsApi';
import { billingApi } from './api/billingApi';
import { usageApi } from './api/usageApi';
import { adminApi } from './api/adminApi';
import { emailApi } from './api/emailApi';
import { onboardingApi } from './api/onboardingApi';
import { performanceApi } from './api/performanceApi';
import { aiInsightsApi } from './api/aiInsightsApi';
import { researchApi } from './api/researchApi';
import { advancedAnalyticsApi } from './api/advancedAnalyticsApi';
import { reportGenerationApi } from './api/reportGenerationApi';
import { aiContentOptimizationApi } from './api/aiContentOptimizationApi';
import { contentCreationApi } from './api/contentCreationApi';
import authReducer from './slices/authSlice';
import tenantReducer from './slices/tenantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [workspaceApi.reducerPath]: workspaceApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [aiContentApi.reducerPath]: aiContentApi.reducer,
    [socialPlatformsApi.reducerPath]: socialPlatformsApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [usageApi.reducerPath]: usageApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [performanceApi.reducerPath]: performanceApi.reducer,
    [aiInsightsApi.reducerPath]: aiInsightsApi.reducer,
    [researchApi.reducerPath]: researchApi.reducer,
    [advancedAnalyticsApi.reducerPath]: advancedAnalyticsApi.reducer,
    [reportGenerationApi.reducerPath]: reportGenerationApi.reducer,
    [aiContentOptimizationApi.reducerPath]: aiContentOptimizationApi.reducer,
    [contentCreationApi.reducerPath]: contentCreationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware,
      organizationApi.middleware,
      workspaceApi.middleware,
      contentApi.middleware,
      analyticsApi.middleware,
      aiContentApi.middleware,
      socialPlatformsApi.middleware,
      billingApi.middleware,
      usageApi.middleware,
      adminApi.middleware,
      emailApi.middleware,
      onboardingApi.middleware,
      performanceApi.middleware,
      aiInsightsApi.middleware,
      researchApi.middleware,
      advancedAnalyticsApi.middleware,
      reportGenerationApi.middleware,
      aiContentOptimizationApi.middleware,
      contentCreationApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;