import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { Layout } from './Layout';
import authSlice from '../../store/slices/authSlice';
import tenantSlice from '../../store/slices/tenantSlice';

// Mock hooks
const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
const mockUseTenant = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => mockUseTenant(),
}));

// Mock switcher components
vi.mock('../organization/OrganizationSwitcher', () => ({
  OrganizationSwitcher: ({ variant }: { variant?: string }) => (
    <div data-testid={`organization-switcher-${variant || 'button'}`}>
      Organization Switcher
    </div>
  )
}));

vi.mock('../workspace/WorkspaceSwitcher', () => ({
  WorkspaceSwitcher: ({ variant }: { variant?: string }) => (
    <div data-testid={`workspace-switcher-${variant || 'button'}`}>
      Workspace Switcher
    </div>
  )
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      tenant: tenantSlice,
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  { store = createTestStore(), initialEntries = ['/dashboard'] } = {}
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('Layout', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    profile: {
      firstName: 'John',
      lastName: 'Doe'
    }
  };

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    subscription: { plan: 'agency' }
  };

  const mockWorkspace = {
    id: 'ws-1',
    name: 'Test Workspace',
    client: { companyName: 'Test Company' },
    branding: {
      brandColors: { primary: '#6366f1' }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout
    });

    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: mockWorkspace
    });
  });

  it('renders main layout structure', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('ContentAutoPilot')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('organization-switcher-select')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-switcher-select')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
    expect(screen.getByTestId('nav-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('nav-team')).toBeInTheDocument();
    expect(screen.getByTestId('nav-integrations')).toBeInTheDocument();
    expect(screen.getByTestId('nav-billing')).toBeInTheDocument();
    expect(screen.getByTestId('nav-settings')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    renderWithProviders(
      <Layout><div>Test Content</div></Layout>,
      { initialEntries: ['/dashboard'] }
    );
    
    const dashboardNav = screen.getByTestId('nav-dashboard');
    expect(dashboardNav).toHaveClass('Mui-selected');
  });

  it('handles navigation clicks', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const contentNav = screen.getByTestId('nav-content');
    fireEvent.click(contentNav);
    
    expect(mockNavigate).toHaveBeenCalledWith('/content');
  });

  it('displays current organization in header', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('displays current workspace in sidebar', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('Current Workspace')).toBeInTheDocument();
    expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('does not display current organization when none selected', () => {
    mockUseTenant.mockReturnValue({
      currentOrganization: null,
      currentWorkspace: null
    });

    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.queryByText('Test Organization')).not.toBeInTheDocument();
    expect(screen.queryByText('Current Workspace')).not.toBeInTheDocument();
  });

  it('opens user menu when clicked', async () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const userMenuButton = screen.getByTestId('user-menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('handles logout from user menu', async () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const userMenuButton = screen.getByTestId('user-menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('navigates to organization settings from user menu', async () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const userMenuButton = screen.getByTestId('user-menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const orgSettingsButton = screen.getByText('Organization Settings');
      fireEvent.click(orgSettingsButton);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/settings/organization');
  });

  it('navigates to user settings from user menu', async () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    const userMenuButton = screen.getByTestId('user-menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const userSettingsButton = screen.getByText('User Settings');
      fireEvent.click(userSettingsButton);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('handles missing workspace data gracefully', () => {
    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganization,
      currentWorkspace: {
        id: 'ws-1',
        // Missing name, client, branding
      }
    });

    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    expect(screen.getByText('Workspace')).toBeInTheDocument(); // Default name
    expect(screen.getByText('Company')).toBeInTheDocument(); // Default company
  });

  it('renders mobile drawer', () => {
    // Mock mobile breakpoint
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 900px)'), // md breakpoint
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    
    // Should still render navigation items
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
  });

  it('applies correct styling to active navigation item', () => {
    renderWithProviders(
      <Layout><div>Test Content</div></Layout>,
      { initialEntries: ['/content'] }
    );
    
    const contentNav = screen.getByTestId('nav-content');
    expect(contentNav).toHaveClass('Mui-selected');
    
    const dashboardNav = screen.getByTestId('nav-dashboard');
    expect(dashboardNav).not.toHaveClass('Mui-selected');
  });
});