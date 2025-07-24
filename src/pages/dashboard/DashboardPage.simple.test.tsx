import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { DashboardPage } from './DashboardPage';

// Mock the tenant context
const mockUseTenant = vi.fn();
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => mockUseTenant(),
}));

// Mock components to avoid complex dependencies
vi.mock('../../components/organization/OrganizationSwitcher', () => ({
  OrganizationSwitcher: () => <div data-testid="organization-switcher">Organization Switcher</div>
}));

vi.mock('../../components/workspace/WorkspaceSwitcher', () => ({
  WorkspaceSwitcher: ({ onCreateWorkspace }: { onCreateWorkspace?: () => void }) => (
    <div data-testid="workspace-switcher">
      <button onClick={onCreateWorkspace} data-testid="create-workspace-trigger">
        Workspace Switcher
      </button>
    </div>
  )
}));

vi.mock('../../components/workspace/CreateWorkspaceDialog', () => ({
  CreateWorkspaceDialog: ({ open, onClose }: any) => (
    open ? (
      <div data-testid="create-workspace-dialog">
        <button onClick={onClose} data-testid="dialog-close">Close</button>
      </div>
    ) : null
  )
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DashboardPage - Simple Tests', () => {
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

    renderWithRouter(<DashboardPage />);
    
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

    renderWithRouter(<DashboardPage />);
    
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

    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to ContentAutoPilot')).toBeInTheDocument();
    expect(screen.getByText('Welcome to ContentAutoPilot!')).toBeInTheDocument();
    expect(screen.getByText('Setting up your organization...')).toBeInTheDocument();
  });

  it('renders organization with workspace stats', () => {
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

    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getAllByText('Test Workspace')).toHaveLength(2); // Appears in workspace switcher and workspace overview
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByTestId('organization-stats')).toBeInTheDocument();
    
    // Check stats values
    expect(screen.getByText('25')).toBeInTheDocument(); // Total Content
    expect(screen.getByText('15')).toBeInTheDocument(); // Published
    expect(screen.getByText('10')).toBeInTheDocument(); // Scheduled (25-15)
  });

  it('handles missing workspace data gracefully', () => {
    const mockOrganization = {
      id: 'org-1',
      name: 'Test Organization',
      subscription: { plan: 'agency' }
    };

    const mockWorkspace = {
      id: 'ws-1',
      // Missing optional fields
    };

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isLoading: false,
      error: null
    });

    renderWithRouter(<DashboardPage />);
    
    // Should render with defaults
    expect(screen.getAllByText('Workspace')).toHaveLength(2); // Default name appears in switcher and overview
    expect(screen.getByText('Company')).toBeInTheDocument(); // Default company
    expect(screen.getAllByText('0')).toHaveLength(3); // Default stats (3 stat cards showing 0)
  });

  it('shows create workspace button when no workspaces', () => {
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

    renderWithRouter(<DashboardPage />);
    
    expect(screen.getByText('Create Your First Workspace')).toBeInTheDocument();
    expect(screen.getByTestId('create-workspace')).toBeInTheDocument();
  });
});