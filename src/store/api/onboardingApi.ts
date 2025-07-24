import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'setup' | 'tutorial' | 'checklist' | 'video' | 'interactive';
  order: number;
  
  content: {
    html?: string;
    markdown?: string;
    videoUrl?: string;
    imageUrl?: string;
    interactiveElements?: {
      type: 'button' | 'form' | 'dropdown' | 'checkbox' | 'input';
      selector?: string;
      action?: string;
      text?: string;
      required?: boolean;
    }[];
  };
  
  prerequisites?: string[];
  actions?: {
    type: 'create_workspace' | 'connect_platform' | 'create_content' | 'invite_team' | 'setup_billing' | 'custom';
    config?: Record<string, any>;
    autoComplete?: boolean;
  }[];
  
  completion: {
    type: 'manual' | 'automatic' | 'api_call' | 'event';
    criteria?: {
      apiEndpoint?: string;
      event?: string;
      condition?: Record<string, any>;
    };
  };
  
  isOptional: boolean;
  isSkippable: boolean;
  estimatedTime: number; // minutes
  
  targeting: {
    userRoles?: string[];
    organizationTypes?: string[];
    plans?: string[];
    newUsersOnly?: boolean;
    conditions?: Record<string, any>;
  };
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  version: string;
  
  steps: OnboardingStep[];
  
  triggers: {
    type: 'user_signup' | 'first_login' | 'plan_upgrade' | 'feature_unlock' | 'manual' | 'scheduled';
    conditions?: Record<string, any>;
    delay?: number; // minutes
  }[];
  
  completion: {
    rewards?: {
      type: 'credits' | 'features' | 'badge' | 'discount';
      value?: any;
      description?: string;
    }[];
    redirectUrl?: string;
    message?: string;
  };
  
  settings: {
    allowSkip: boolean;
    showProgress: boolean;
    autoAdvance: boolean;
    pauseOnExit: boolean;
    timeLimit?: number; // minutes
  };
  
  isActive: boolean;
  isDefault: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOnboardingProgress {
  id: string;
  userId: string;
  flowId: string;
  organizationId: string;
  
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'paused' | 'abandoned';
  
  currentStep: {
    stepId: string;
    startedAt: string;
    attempts: number;
  };
  
  completedSteps: {
    stepId: string;
    completedAt: string;
    duration: number; // seconds
    skipped: boolean;
  }[];
  
  progress: {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
    estimatedTimeRemaining: number; // minutes
  };
  
  startedAt: string;
  completedAt?: string;
  lastActiveAt: string;
  
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    completionSource?: string;
  };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting_started' | 'content_creation' | 'analytics' | 'team_management' | 'integrations' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  content: {
    type: 'video' | 'interactive' | 'article' | 'guided_tour';
    videoUrl?: string;
    duration?: number; // minutes
    transcript?: string;
    steps?: {
      title: string;
      description: string;
      selector?: string;
      action?: string;
      screenshot?: string;
    }[];
    markdown?: string;
  };
  
  prerequisites?: string[];
  relatedTutorials?: string[];
  
  resources: {
    type: 'link' | 'download' | 'template' | 'example';
    title: string;
    url: string;
    description?: string;
  }[];
  
  completion: {
    trackingEnabled: boolean;
    certificate?: {
      enabled: boolean;
      templateId?: string;
    };
    assessment?: {
      questions: {
        question: string;
        type: 'multiple_choice' | 'true_false' | 'text';
        options?: string[];
        correctAnswer: string | string[];
      }[];
      passingScore: number;
    };
  };
  
  isPublished: boolean;
  isFeatured: boolean;
  
  stats: {
    views: number;
    completions: number;
    averageRating: number;
    completionRate: number;
    averageDuration: number;
  };
  
  tags: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTutorialProgress {
  id: string;
  userId: string;
  tutorialId: string;
  
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    timeSpent: number; // minutes
  };
  
  assessment?: {
    attempts: number;
    score: number;
    passed: boolean;
    answers: Record<string, any>;
  };
  
  rating?: {
    score: number;
    feedback?: string;
  };
  
  startedAt: string;
  completedAt?: string;
  lastActiveAt: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  
  tags: string[];
  keywords: string[];
  
  metadata: {
    author: string;
    lastUpdated: string;
    version: string;
    readTime: number; // minutes
  };
  
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  
  isPublished: boolean;
  isFeatured: boolean;
  
  stats: {
    views: number;
    helpful: number;
    notHelpful: number;
    shares: number;
  };
  
  relatedArticles?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/onboarding',
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
  tagTypes: ['OnboardingFlow', 'UserProgress', 'Tutorial', 'HelpArticle'],
  endpoints: (builder) => ({
    // Onboarding Flows
    getOnboardingFlows: builder.query<{
      flows: OnboardingFlow[];
      total: number;
    }, {
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/flows',
        params,
      }),
      providesTags: ['OnboardingFlow'],
    }),

    getOnboardingFlow: builder.query<OnboardingFlow, string>({
      query: (id) => `/flows/${id}`,
      providesTags: (_, __, id) => [{ type: 'OnboardingFlow', id }],
    }),

    createOnboardingFlow: builder.mutation<{ flow: OnboardingFlow }, {
      name: string;
      description: string;
      steps: OnboardingStep[];
      triggers: OnboardingFlow['triggers'];
      settings?: OnboardingFlow['settings'];
    }>({
      query: (data) => ({
        url: '/flows',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OnboardingFlow'],
    }),

    updateOnboardingFlow: builder.mutation<{ flow: OnboardingFlow }, {
      id: string;
      name?: string;
      description?: string;
      steps?: OnboardingStep[];
      triggers?: OnboardingFlow['triggers'];
      settings?: OnboardingFlow['settings'];
      isActive?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/flows/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'OnboardingFlow', id }],
    }),

    deleteOnboardingFlow: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/flows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OnboardingFlow'],
    }),

    // User Onboarding Progress
    getUserOnboardingProgress: builder.query<UserOnboardingProgress, {
      flowId?: string;
      userId?: string;
    }>({
      query: (params) => ({
        url: '/progress',
        params,
      }),
      providesTags: ['UserProgress'],
    }),

    startOnboardingFlow: builder.mutation<{ progress: UserOnboardingProgress }, {
      flowId: string;
      userId?: string;
    }>({
      query: (data) => ({
        url: '/progress/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    completeOnboardingStep: builder.mutation<{ progress: UserOnboardingProgress }, {
      progressId: string;
      stepId: string;
      skipped?: boolean;
      data?: Record<string, any>;
    }>({
      query: ({ progressId, ...data }) => ({
        url: `/progress/${progressId}/step`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    pauseOnboardingFlow: builder.mutation<{ success: boolean }, string>({
      query: (progressId) => ({
        url: `/progress/${progressId}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProgress'],
    }),

    resumeOnboardingFlow: builder.mutation<{ success: boolean }, string>({
      query: (progressId) => ({
        url: `/progress/${progressId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProgress'],
    }),

    // Tutorials
    getTutorials: builder.query<{
      tutorials: Tutorial[];
      total: number;
      categories: string[];
    }, {
      category?: string;
      difficulty?: string;
      search?: string;
      featured?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/tutorials',
        params,
      }),
      providesTags: ['Tutorial'],
    }),

    getTutorial: builder.query<Tutorial, string>({
      query: (id) => `/tutorials/${id}`,
      providesTags: (_, __, id) => [{ type: 'Tutorial', id }],
    }),

    createTutorial: builder.mutation<{ tutorial: Tutorial }, {
      title: string;
      description: string;
      category: Tutorial['category'];
      difficulty: Tutorial['difficulty'];
      content: Tutorial['content'];
      prerequisites?: string[];
      resources?: Tutorial['resources'];
    }>({
      query: (data) => ({
        url: '/tutorials',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tutorial'],
    }),

    updateTutorial: builder.mutation<{ tutorial: Tutorial }, {
      id: string;
      title?: string;
      description?: string;
      content?: Tutorial['content'];
      isPublished?: boolean;
      isFeatured?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/tutorials/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Tutorial', id }],
    }),

    // Tutorial Progress
    getTutorialProgress: builder.query<UserTutorialProgress, {
      tutorialId: string;
      userId?: string;
    }>({
      query: (params) => ({
        url: '/tutorials/progress',
        params,
      }),
      providesTags: ['UserProgress'],
    }),

    startTutorial: builder.mutation<{ progress: UserTutorialProgress }, {
      tutorialId: string;
      userId?: string;
    }>({
      query: (data) => ({
        url: '/tutorials/progress/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    updateTutorialProgress: builder.mutation<{ progress: UserTutorialProgress }, {
      progressId: string;
      currentStep?: number;
      timeSpent?: number;
      completed?: boolean;
    }>({
      query: ({ progressId, ...data }) => ({
        url: `/tutorials/progress/${progressId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProgress'],
    }),

    submitTutorialAssessment: builder.mutation<{ result: any }, {
      tutorialId: string;
      answers: Record<string, any>;
    }>({
      query: ({ tutorialId, answers }) => ({
        url: `/tutorials/${tutorialId}/assessment`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['UserProgress'],
    }),

    rateTutorial: builder.mutation<{ success: boolean }, {
      tutorialId: string;
      rating: number;
      feedback?: string;
    }>({
      query: ({ tutorialId, ...data }) => ({
        url: `/tutorials/${tutorialId}/rating`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { tutorialId }) => [{ type: 'Tutorial', id: tutorialId }],
    }),

    // Help Articles
    getHelpArticles: builder.query<{
      articles: HelpArticle[];
      total: number;
      categories: string[];
    }, {
      category?: string;
      search?: string;
      featured?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/help',
        params,
      }),
      providesTags: ['HelpArticle'],
    }),

    getHelpArticle: builder.query<HelpArticle, string>({
      query: (id) => `/help/${id}`,
      providesTags: (_, __, id) => [{ type: 'HelpArticle', id }],
    }),

    searchHelp: builder.mutation<{
      articles: HelpArticle[];
      suggestions: string[];
    }, {
      query: string;
      category?: string;
      limit?: number;
    }>({
      query: (data) => ({
        url: '/help/search',
        method: 'POST',
        body: data,
      }),
    }),

    voteHelpArticle: builder.mutation<{ success: boolean }, {
      articleId: string;
      helpful: boolean;
    }>({
      query: ({ articleId, helpful }) => ({
        url: `/help/${articleId}/vote`,
        method: 'POST',
        body: { helpful },
      }),
      invalidatesTags: (_, __, { articleId }) => [{ type: 'HelpArticle', id: articleId }],
    }),

    // Analytics
    getOnboardingAnalytics: builder.query<{
      flows: {
        flowId: string;
        name: string;
        totalUsers: number;
        completionRate: number;
        averageTime: number;
        dropoffPoints: { stepId: string; count: number }[];
      }[];
      tutorials: {
        tutorialId: string;
        title: string;
        views: number;
        completions: number;
        averageRating: number;
      }[];
      overall: {
        totalUsers: number;
        activeFlows: number;
        completionRate: number;
        averageOnboardingTime: number;
      };
    }, {
      period?: 'week' | 'month' | 'quarter';
      flowId?: string;
    }>({
      query: (params) => ({
        url: '/analytics',
        params,
      }),
    }),
  }),
});

export const {
  useGetOnboardingFlowsQuery,
  useGetOnboardingFlowQuery,
  useCreateOnboardingFlowMutation,
  useUpdateOnboardingFlowMutation,
  useDeleteOnboardingFlowMutation,
  useGetUserOnboardingProgressQuery,
  useStartOnboardingFlowMutation,
  useCompleteOnboardingStepMutation,
  usePauseOnboardingFlowMutation,
  useResumeOnboardingFlowMutation,
  useGetTutorialsQuery,
  useGetTutorialQuery,
  useCreateTutorialMutation,
  useUpdateTutorialMutation,
  useGetTutorialProgressQuery,
  useStartTutorialMutation,
  useUpdateTutorialProgressMutation,
  useSubmitTutorialAssessmentMutation,
  useRateTutorialMutation,
  useGetHelpArticlesQuery,
  useGetHelpArticleQuery,
  useSearchHelpMutation,
  useVoteHelpArticleMutation,
  useGetOnboardingAnalyticsQuery,
} = onboardingApi;