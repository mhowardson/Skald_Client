import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { DashboardPage } from './DashboardPage';
import authSlice from '../../store/slices/authSlice';
import tenantSlice from '../../store/slices/tenantSlice';

// Mock the tenant context
const mockUseTenant = vi.fn();
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => mockUseTenant(),
}));

// Mock workspace and organization switchers
vi.mock('../../components/organization/OrganizationSwitcher', () => ({
  OrganizationSwitcher: () => <div data-testid="organization-switcher">Organization Switcher</div>
}));

vi.mock('../../components/workspace/WorkspaceSwitcher', () => ({
  WorkspaceSwitcher: ({ onCreateWorkspace }: { onCreateWorkspace: () => void }) => (
    <div data-testid="workspace-switcher">
      <button onClick={onCreateWorkspace} data-testid="create-workspace-trigger">
        Workspace Switcher
      </button>
    </div>
  )
}));

vi.mock('../../components/workspace/CreateWorkspaceDialog', () => ({
  CreateWorkspaceDialog: ({ open, onClose, onSuccess }: any) => (
    open ? (
      <div data-testid="create-workspace-dialog">
        <button onClick={onClose} data-testid="dialog-close">Close</button>
        <button onClick={onSuccess} data-testid="dialog-success">Success</button>
      </div>
    ) : null
  )
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      tenant: tenantSlice,
    },
    preloadedState: {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          profile: { firstName: 'Test', lastName: 'User' }
        },
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        isLoading: false
      },
      tenant: {
        organizations: [],
        currentOrganization: null,
        workspaces: [],
        currentWorkspace: null,
        isLoading: false,
        error: null
      }
    }
  });
};

const renderWithProviders = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseTenant.mockReturnValue({
      currentOrganization: null,
      currentWorkspace: null,
      workspaces: [],
      isLoading: true,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load dashboard data';
    mockUseTenant.mockReturnValue({
      currentOrganization: null,
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: errorMessage
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders welcome state when no organization', () => {
    mockUseTenant.mockReturnValue({
      currentOrganization: null,
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to ContentAutoPilot')).toBeInTheDocument();
    expect(screen.getByText('Welcome to ContentAutoPilot!')).toBeInTheDocument();
    expect(screen.getByText('Setting up your organization...')).toBeInTheDocument();
  });

  it('renders organization with no workspaces', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getByTestId('organization-name')).toHaveTextContent('Test Organization');
    expect(screen.getByText('Create Your First Workspace')).toBeInTheDocument();
    expect(screen.getByTestId('create-workspace')).toBeInTheDocument();
  });

  it('renders organization with workspace selected', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    const mockWorkspace = {
      id: 'ws-1',
      name: 'Test Workspace',
      status: 'active',
      client: { companyName: 'Test Company' },
      branding: {
        brandColors: { primary: '#6366f1' },
        toneOfVoice: 'Professional'
      },
      totalContent: 25,
      totalPublished: 15
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getByTestId('organization-name')).toHaveTextContent('Test Organization');
    expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByTestId('organization-stats')).toBeInTheDocument();
    
    // Check stats
    expect(screen.getByText('25')).toBeInTheDocument(); // Total Content
    expect(screen.getByText('15')).toBeInTheDocument(); // Published
    expect(screen.getByText('10')).toBeInTheDocument(); // Scheduled (25-15)
    
    // Check quick actions
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByText('Generate Content')).toBeInTheDocument();
    expect(screen.getByText('Schedule Posts')).toBeInTheDocument();
    
    // Check recent activity
    expect(screen.getByTestId('recent-content')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('handles workspace creation dialog', async () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    // Open dialog
    const createButton = screen.getByTestId('create-workspace');
    createButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('create-workspace-dialog')).toBeInTheDocument();
    });
  });

  it('renders workspace switcher when organization has workspaces', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    const mockWorkspace = {
      id: 'ws-1',
      name: 'Test Workspace',
      status: 'active'
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: null,
      workspaces: [mockWorkspace],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Select a Workspace')).toBeInTheDocument();
    expect(screen.getByText('Choose a workspace from the switcher above to view its dashboard')).toBeInTheDocument();
  });

  it('handles missing workspace data gracefully', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    const mockWorkspace = {
      id: 'ws-1',
      // Missing name, client, branding, etc.
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isLoading: false,
      error: null
    });

    renderWithProviders(<DashboardPage />);
    
    // Should render with defaults
    expect(screen.getByText('Workspace')).toBeInTheDocument(); // Default name
    expect(screen.getByText('Company')).toBeInTheDocument(); // Default company
    expect(screen.getByText('0')).toBeInTheDocument(); // Default stats
  });
});