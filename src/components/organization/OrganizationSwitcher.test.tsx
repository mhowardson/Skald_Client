import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { OrganizationSwitcher } from './OrganizationSwitcher';

// Mock the tenant context
const mockSwitchOrganization = vi.fn();
const mockUseTenant = vi.fn();

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => mockUseTenant(),
}));

describe('OrganizationSwitcher', () => {
  const mockOrganizations = [
    {
      id: 'org-1',
      name: 'Test Organization 1',
      subscription: { plan: 'agency' },
      type: 'agency'
    },
    {
      id: 'org-2',
      name: 'Test Organization 2',
      subscription: { plan: 'enterprise' },
      type: 'enterprise'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseTenant.mockReturnValue({
      currentOrganization: mockOrganizations[0],
      organizations: mockOrganizations,
      switchOrganization: mockSwitchOrganization
    });
  });

  describe('select variant', () => {
    it('renders select dropdown with organizations', () => {
      render(<OrganizationSwitcher variant="select" />);
      
      expect(screen.getByTestId('organization-switcher')).toBeInTheDocument();
      expect(screen.getByLabelText('Organization')).toBeInTheDocument();
    });

    it('shows current organization as selected', () => {
      render(<OrganizationSwitcher variant="select" />);
      
      const select = screen.getByTestId('organization-switcher');
      expect(select).toHaveValue('org-1');
    });

    it('renders all organizations as options', async () => {
      render(<OrganizationSwitcher variant="select" />);
      
      const select = screen.getByTestId('organization-switcher');
      fireEvent.mouseDown(select);
      
      await waitFor(() => {
        expect(screen.getByTestId('org-option-org-1')).toBeInTheDocument();
        expect(screen.getByTestId('org-option-org-2')).toBeInTheDocument();
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
        expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
      });
    });

    it('switches organization when option selected', async () => {
      render(<OrganizationSwitcher variant="select" />);
      
      const select = screen.getByTestId('organization-switcher');
      fireEvent.mouseDown(select);
      
      await waitFor(() => {
        const option = screen.getByTestId('org-option-org-2');
        fireEvent.click(option);
      });
      
      expect(mockSwitchOrganization).toHaveBeenCalledWith(mockOrganizations[1]);
    });

    it('shows create organization option when handler provided', async () => {
      const mockCreate = vi.fn();
      render(<OrganizationSwitcher variant="select" onCreateOrganization={mockCreate} />);
      
      const select = screen.getByTestId('organization-switcher');
      fireEvent.mouseDown(select);
      
      await waitFor(() => {
        const createOption = screen.getByTestId('create-organization');
        expect(createOption).toBeInTheDocument();
        fireEvent.click(createOption);
      });
      
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('button variant', () => {
    it('renders button with current organization', () => {
      render(<OrganizationSwitcher variant="button" />);
      
      expect(screen.getByTestId('organization-switcher')).toBeInTheDocument();
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
      expect(screen.getByText('agency plan')).toBeInTheDocument();
    });

    it('shows placeholder when no current organization', () => {
      mockUseTenant.mockReturnValue({
        currentOrganization: null,
        organizations: mockOrganizations,
        switchOrganization: mockSwitchOrganization
      });

      render(<OrganizationSwitcher variant="button" />);
      
      expect(screen.getByText('Select Organization')).toBeInTheDocument();
    });

    it('opens menu when clicked', async () => {
      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('org-option-org-1')).toBeInTheDocument();
        expect(screen.getByTestId('org-option-org-2')).toBeInTheDocument();
      });
    });

    it('shows organization details in menu items', async () => {
      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
        expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
        expect(screen.getAllByText('agency')).toHaveLength(2); // plan + type chips
        expect(screen.getByText('enterprise')).toBeInTheDocument();
      });
    });

    it('highlights current organization in menu', async () => {
      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        const currentOption = screen.getByTestId('org-option-org-1');
        expect(currentOption).toHaveClass('Mui-selected');
      });
    });

    it('switches organization from menu', async () => {
      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        const option = screen.getByTestId('org-option-org-2');
        fireEvent.click(option);
      });
      
      expect(mockSwitchOrganization).toHaveBeenCalledWith(mockOrganizations[1]);
    });

    it('shows create and settings options in menu', async () => {
      const mockCreate = vi.fn();
      render(<OrganizationSwitcher variant="button" onCreateOrganization={mockCreate} />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('create-organization')).toBeInTheDocument();
        expect(screen.getByTestId('organization-settings')).toBeInTheDocument();
        expect(screen.getByText('Create Organization')).toBeInTheDocument();
        expect(screen.getByText('Organization Settings')).toBeInTheDocument();
      });
    });

    it('calls create handler when create option clicked', async () => {
      const mockCreate = vi.fn();
      render(<OrganizationSwitcher variant="button" onCreateOrganization={mockCreate} />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        const createOption = screen.getByTestId('create-organization');
        fireEvent.click(createOption);
      });
      
      expect(mockCreate).toHaveBeenCalled();
    });

    it('closes menu when settings clicked', async () => {
      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        const settingsOption = screen.getByTestId('organization-settings');
        fireEvent.click(settingsOption);
      });
      
      // Menu should close (no longer visible)
      await waitFor(() => {
        expect(screen.queryByTestId('org-option-org-1')).not.toBeInTheDocument();
      });
    });
  });

  describe('defaults', () => {
    it('defaults to button variant', () => {
      render(<OrganizationSwitcher />);
      
      // Should render button variant (not select)
      expect(screen.getByTestId('organization-switcher')).toBeInTheDocument();
      expect(screen.queryByLabelText('Organization')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty organizations list', () => {
      mockUseTenant.mockReturnValue({
        currentOrganization: null,
        organizations: [],
        switchOrganization: mockSwitchOrganization
      });

      render(<OrganizationSwitcher variant="select" />);
      
      expect(screen.getByTestId('organization-switcher')).toBeInTheDocument();
    });

    it('handles organization without subscription plan', async () => {
      const orgWithoutPlan = {
        id: 'org-3',
        name: 'Org Without Plan',
        type: 'agency'
      };

      mockUseTenant.mockReturnValue({
        currentOrganization: orgWithoutPlan,
        organizations: [orgWithoutPlan],
        switchOrganization: mockSwitchOrganization
      });

      render(<OrganizationSwitcher variant="button" />);
      
      const button = screen.getByTestId('organization-switcher');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Org Without Plan')).toBeInTheDocument();
      });
    });
  });
});