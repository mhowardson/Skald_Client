import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Organization, ClientWorkspace } from '../store/slices/tenantSlice';
import {
  setOrganizations,
  setCurrentOrganization,
  setWorkspaces,
  setCurrentWorkspace,
  setLoading,
  setError,
} from '../store/slices/tenantSlice';
import { useGetOrganizationsQuery } from '../store/api/organizationApi';
import { useGetWorkspacesQuery } from '../store/api/workspaceApi';

interface TenantContextType {
  currentOrganization: Organization | null;
  currentWorkspace: ClientWorkspace | null;
  organizations: Organization[];
  workspaces: ClientWorkspace[];
  isLoading: boolean;
  error: string | null;
  switchOrganization: (organization: Organization) => void;
  switchWorkspace: (workspace: ClientWorkspace | null) => void;
  permissions: string[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const {
    currentOrganization,
    currentWorkspace,
    organizations,
    workspaces,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.tenant);

  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch organizations
  const {
    data: organizationsData,
    error: orgsError,
    isLoading: orgsLoading,
  } = useGetOrganizationsQuery(undefined, {
    skip: !user,
  });

  // Fetch workspaces for current organization
  const {
    data: workspacesData,
    error: workspacesError,
    isLoading: workspacesLoading,
  } = useGetWorkspacesQuery(undefined, {
    skip: !currentOrganization,
  });

  // Update organizations when data is received
  useEffect(() => {
    if (organizationsData) {
      dispatch(setOrganizations(organizationsData.organizations));
    }
  }, [organizationsData, dispatch]);

  // Update workspaces when data is received
  useEffect(() => {
    if (workspacesData) {
      dispatch(setWorkspaces(workspacesData.workspaces));
    }
  }, [workspacesData, dispatch]);

  // Handle loading states
  useEffect(() => {
    dispatch(setLoading(orgsLoading || workspacesLoading));
  }, [orgsLoading, workspacesLoading, dispatch]);

  // Handle errors
  useEffect(() => {
    if (orgsError || workspacesError) {
      const errorMessage = 
        (orgsError as any)?.data?.error?.message ||
        (workspacesError as any)?.data?.error?.message ||
        'Failed to load tenant data';
      dispatch(setError(errorMessage));
    } else {
      dispatch(setError(null));
    }
  }, [orgsError, workspacesError, dispatch]);

  // Set default organization when organizations are loaded
  useEffect(() => {
    if (organizations.length > 0 && !currentOrganization) {
      // Use user's default organization or first one
      const defaultOrg = user?.preferences?.defaultOrganization
        ? organizations.find(org => org.id === user.preferences.defaultOrganization)
        : organizations[0];
      
      if (defaultOrg) {
        dispatch(setCurrentOrganization(defaultOrg));
      }
    }
  }, [organizations, currentOrganization, user, dispatch]);

  const switchOrganization = (organization: Organization) => {
    dispatch(setCurrentOrganization(organization));
    dispatch(setCurrentWorkspace(null)); // Clear workspace when switching org
  };

  const switchWorkspace = (workspace: ClientWorkspace | null) => {
    dispatch(setCurrentWorkspace(workspace));
  };

  // Compute user permissions based on current context
  const permissions = React.useMemo(() => {
    const perms: string[] = [];
    
    if (user && currentOrganization) {
      const orgMembership = user.organizationMemberships.find(
        m => m.organizationId === currentOrganization.id
      );
      
      if (orgMembership) {
        // Add organization permissions
        Object.entries(orgMembership.permissions).forEach(([key, value]) => {
          if (value) {
            perms.push(key);
          }
        });
        
        // Add role-based permissions
        switch (orgMembership.role) {
          case 'owner':
            perms.push('manage_organization', 'manage_billing', 'manage_team', 'create_workspaces', 'manage_workspaces', 'view_all_analytics');
            break;
          case 'admin':
            perms.push('manage_team', 'create_workspaces', 'manage_workspaces', 'view_all_analytics');
            break;
          case 'manager':
            perms.push('create_workspaces', 'manage_workspaces');
            break;
        }
      }
    }

    if (user && currentWorkspace) {
      const workspaceAccess = user.workspaceAccess.find(
        a => a.workspaceId === currentWorkspace.id
      );
      
      if (workspaceAccess) {
        Object.entries(workspaceAccess.permissions).forEach(([key, value]) => {
          if (value) {
            perms.push(`workspace_${key}`);
          }
        });
      }
    }
    
    return [...new Set(perms)]; // Remove duplicates
  }, [user, currentOrganization, currentWorkspace]);

  const value: TenantContextType = {
    currentOrganization,
    currentWorkspace,
    organizations,
    workspaces,
    isLoading,
    error,
    switchOrganization,
    switchWorkspace,
    permissions,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};