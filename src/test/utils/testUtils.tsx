import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

import { store } from '../../store/store';
import { theme } from '../../theme/theme';
import { TenantProvider, TenantContext } from '../../contexts/TenantContext';

// Mock authentication context
export const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    permissions: ['read', 'write'],
    organizationId: 'org-1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
};

// Mock tenant context
export const mockTenantContext = {
  organizations: [
    {
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
      domain: 'test.com',
      plan: 'pro',
      settings: {},
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ],
  currentOrganization: {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    domain: 'test.com',
    plan: 'pro',
    settings: {},
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  workspaces: [
    {
      id: 'workspace-1',
      name: 'Test Workspace',
      slug: 'test-workspace',
      organizationId: 'org-1',
      client: {
        companyName: 'Test Client',
        contactEmail: 'client@test.com',
        industry: 'technology'
      },
      status: 'active',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    }
  ],
  currentWorkspace: {
    id: 'workspace-1',
    name: 'Test Workspace',
    slug: 'test-workspace',
    organizationId: 'org-1',
    client: {
      companyName: 'Test Client',
      contactEmail: 'client@test.com',
      industry: 'technology'
    },
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  switchOrganization: vi.fn(),
  switchWorkspace: vi.fn(),
  isLoading: false,
  error: null,
  refreshOrganizations: vi.fn(),
};

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  store?: any;
  withRouter?: boolean;
  withAuth?: boolean;
  withTenant?: boolean;
}

const createTestStore = (initialState?: any) => {
  // Mock RTK Query API reducers
  const mockApiReducer = (state = {}) => state;
  
  return configureStore({
    reducer: {
      auth: (state = {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }) => state,
      tenant: (state = {
        currentOrganization: null,
        currentWorkspace: null,
        organizations: [],
        workspaces: [],
        isLoading: false,
        error: null,
      }) => state,
      // Mock API reducers
      authApi: mockApiReducer,
      organizationApi: mockApiReducer,
      workspaceApi: mockApiReducer,
      contentApi: mockApiReducer,
      analyticsApi: mockApiReducer,
      aiContentApi: mockApiReducer,
      socialPlatformsApi: mockApiReducer,
      billingApi: mockApiReducer,
      usageApi: mockApiReducer,
      adminApi: mockApiReducer,
      emailApi: mockApiReducer,
      onboardingApi: mockApiReducer,
      performanceApi: mockApiReducer,
      aiInsightsApi: mockApiReducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialState,
    store: testStore,
    withRouter = true,
    withAuth = true,
    withTenant = true, // Enable by default for components that need it
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const storeInstance = testStore || createTestStore(initialState);

  const AllProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    let wrappedChildren = children;

    // Theme provider (innermost)
    wrappedChildren = (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {wrappedChildren}
      </ThemeProvider>
    );

    // Redux provider (must be outside tenant provider)
    wrappedChildren = (
      <Provider store={storeInstance}>
        {wrappedChildren}
      </Provider>
    );

    // Tenant provider (depends on Redux)
    if (withTenant) {
      wrappedChildren = (
        <TenantProvider>
          {wrappedChildren}
        </TenantProvider>
      );
    }

    // Router provider (outermost)
    if (withRouter) {
      wrappedChildren = <BrowserRouter>{wrappedChildren}</BrowserRouter>;
    }

    return wrappedChildren;
  };

  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

// Mock API responses
export const mockApiResponse = <T,>(data: T) => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
};

export const mockApiError = (message: string, status: number = 400) => {
  return {
    response: {
      data: { message },
      status,
      statusText: 'Error',
      headers: {},
      config: {},
    },
  };
};

// Mock RTK Query hooks
export const createMockQuery = <T,>(data: T, isLoading: boolean = false, error: any = null) => ({
  data,
  isLoading,
  isError: !!error,
  error,
  refetch: vi.fn(),
  isFetching: isLoading,
  isSuccess: !isLoading && !error,
});

export const createMockMutation = () => ({
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: vi.fn(),
});

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  permissions: ['read', 'write'],
  organizationId: 'org-1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  domain: 'test.com',
  plan: 'pro',
  settings: {},
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockContent = {
  id: '1',
  title: 'Test Content',
  description: 'Test content description',
  type: 'post',
  status: 'draft',
  platforms: ['twitter', 'facebook'],
  scheduledFor: '2023-12-01T12:00:00Z',
  content: {
    text: 'Test content text',
    media: [],
    hashtags: ['#test'],
    mentions: [],
  },
  createdBy: '1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockCampaign = {
  id: '1',
  name: 'Test Campaign',
  description: 'Test campaign description',
  status: 'active',
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T23:59:59Z',
  budget: {
    total: 1000,
    spent: 250,
    remaining: 750,
  },
  metrics: {
    impressions: 10000,
    clicks: 500,
    conversions: 25,
    ctr: 0.05,
    conversionRate: 0.05,
  },
  createdBy: '1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockAnalytics = {
  id: '1',
  period: {
    start: '2023-01-01T00:00:00Z',
    end: '2023-01-31T23:59:59Z',
  },
  metrics: {
    impressions: 100000,
    engagements: 5000,
    reach: 25000,
    clicks: 2500,
    shares: 500,
    saves: 250,
  },
  demographics: {
    age: {
      '18-24': 0.25,
      '25-34': 0.35,
      '35-44': 0.25,
      '45-54': 0.15,
    },
    gender: {
      male: 0.45,
      female: 0.55,
    },
    location: {
      'New York': 0.3,
      'Los Angeles': 0.2,
      'Chicago': 0.15,
      'Houston': 0.1,
    },
  },
  topContent: [mockContent],
  createdAt: '2023-01-01T00:00:00Z',
};

// Test utilities
export const waitForLoadingToFinish = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Custom matchers
expect.extend({
  toHaveBeenCalledWithExpectedArgs(received, ...expectedArgs) {
    const pass = received.mock.calls.some((call) =>
      call.every((arg, index) => {
        const expected = expectedArgs[index];
        if (typeof expected === 'object' && expected !== null) {
          return JSON.stringify(arg) === JSON.stringify(expected);
        }
        return arg === expected;
      })
    );

    if (pass) {
      return {
        message: () => `Expected function not to have been called with ${JSON.stringify(expectedArgs)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected function to have been called with ${JSON.stringify(expectedArgs)}`,
        pass: false,
      };
    }
  },
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };