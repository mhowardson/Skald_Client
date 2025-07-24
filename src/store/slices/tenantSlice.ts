import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'agency' | 'enterprise' | 'freelancer';
  subscription: {
    plan: 'creator' | 'agency' | 'studio' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: string;
  };
  settings: {
    whiteLabel: {
      enabled: boolean;
      logoUrl?: string;
      brandColors?: {
        primary: string;
        secondary: string;
      };
    };
    features: Record<string, boolean>;
  };
  limits: {
    clientWorkspaces: number;
    contentPerMonth: number;
    teamMembers: number;
    storageGB: number;
  };
  usage: {
    clientWorkspaces: number;
    contentGenerated: number;
    teamMembers: number;
    storageUsed: number;
  };
}

export interface ClientWorkspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  client: {
    companyName: string;
    industry?: string;
    website?: string;
    logo?: string;
    description?: string;
  };
  branding: {
    brandVoice: string;
    toneOfVoice: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
    targetAudience: string;
    keyMessages: string[];
    brandColors: {
      primary: string;
      secondary: string;
      accent?: string;
    };
  };
  contentSettings: {
    defaultVoice: string;
    contentPillars: string[];
    defaultPlatforms: string[];
    approvalRequired: boolean;
    autoPublish: boolean;
  };
  status: 'active' | 'paused' | 'archived';
  totalContent: number;
  totalPublished: number;
}

interface TenantState {
  currentOrganization: Organization | null;
  currentWorkspace: ClientWorkspace | null;
  organizations: Organization[];
  workspaces: ClientWorkspace[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentOrganization: null,
  currentWorkspace: null,
  organizations: [],
  workspaces: [],
  isLoading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setOrganizations: (state, action: PayloadAction<Organization[]>) => {
      state.organizations = action.payload || [];
      
      // Set current organization if not set and organizations exist
      if (!state.currentOrganization && action.payload?.length > 0) {
        state.currentOrganization = action.payload[0];
      }
    },
    
    setCurrentOrganization: (state, action: PayloadAction<Organization>) => {
      state.currentOrganization = action.payload;
      // Clear current workspace when switching organizations
      state.currentWorkspace = null;
    },
    
    setWorkspaces: (state, action: PayloadAction<ClientWorkspace[]>) => {
      state.workspaces = action.payload;
    },
    
    setCurrentWorkspace: (state, action: PayloadAction<ClientWorkspace | null>) => {
      state.currentWorkspace = action.payload;
    },
    
    updateOrganization: (state, action: PayloadAction<Partial<Organization> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      
      // Update in organizations array
      const orgIndex = state.organizations.findIndex(org => org.id === id);
      if (orgIndex !== -1) {
        state.organizations[orgIndex] = { ...state.organizations[orgIndex], ...updates };
      }
      
      // Update current organization if it's the one being updated
      if (state.currentOrganization?.id === id) {
        state.currentOrganization = { ...state.currentOrganization, ...updates };
      }
    },
    
    updateWorkspace: (state, action: PayloadAction<Partial<ClientWorkspace> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      
      // Update in workspaces array
      const wsIndex = state.workspaces.findIndex(ws => ws.id === id);
      if (wsIndex !== -1) {
        state.workspaces[wsIndex] = { ...state.workspaces[wsIndex], ...updates };
      }
      
      // Update current workspace if it's the one being updated
      if (state.currentWorkspace?.id === id) {
        state.currentWorkspace = { ...state.currentWorkspace, ...updates };
      }
    },
    
    addWorkspace: (state, action: PayloadAction<ClientWorkspace>) => {
      state.workspaces.push(action.payload);
    },
    
    removeWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter(ws => ws.id !== action.payload);
      
      // Clear current workspace if it's the one being removed
      if (state.currentWorkspace?.id === action.payload) {
        state.currentWorkspace = null;
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearTenantData: (state) => {
      state.currentOrganization = null;
      state.currentWorkspace = null;
      state.organizations = [];
      state.workspaces = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setOrganizations,
  setCurrentOrganization,
  setWorkspaces,
  setCurrentWorkspace,
  updateOrganization,
  updateWorkspace,
  addWorkspace,
  removeWorkspace,
  setLoading,
  setError,
  clearTenantData,
} = tenantSlice.actions;

export default tenantSlice.reducer;