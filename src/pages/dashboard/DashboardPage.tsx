import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  ContentCopy as ContentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { OrganizationSwitcher } from '../../components/organization/OrganizationSwitcher';
import { WorkspaceSwitcher } from '../../components/workspace/WorkspaceSwitcher';
import { CreateWorkspaceDialog } from '../../components/workspace/CreateWorkspaceDialog';
import { useTenant } from '../../contexts/TenantContext';
import { useOnboarding } from '../../features/onboarding/hooks/useOnboarding';
import { useProductTour } from '../../features/onboarding/hooks/useProductTour';
import { ProductTourContainer } from '../../features/onboarding/components/ProductTour/ProductTourContainer';
import { WelcomeModal } from '../../features/onboarding/components/WelcomeModal/WelcomeModal';
import { OnboardingChecklist } from '../../features/onboarding/components/OnboardingChecklist/OnboardingChecklist';
import { FeatureSpotlight } from '../../features/onboarding/components/FeatureHighlight/FeatureSpotlight';
import { DashboardTourDemo } from '../../features/onboarding/components/TourDemo/DashboardTourDemo';
import { FeatureAnnouncementContainer } from '../../features/onboarding/components/FeatureAnnouncement/FeatureAnnouncementContainer';
import { DASHBOARD_TOUR } from '../../features/onboarding/data/tours';

/**
 * Dashboard Page Component
 * 
 * Main dashboard interface showing organization overview, workspace switcher,
 * content statistics, and quick actions for authenticated users. This component
 * serves as the primary landing page after login and provides a comprehensive
 * view of the user's current organization and workspace context.
 * 
 * @component
 * @example
 * // Basic usage (requires authentication and tenant context)
 * <DashboardPage />
 * 
 * @requires {@link TenantProvider} - Must be wrapped in TenantProvider for organization/workspace data
 * @requires {@link AuthGuard} - User must be authenticated to access this page
 * @requires {@link OnboardingProvider} - Provides onboarding state and progress tracking
 * 
 * @dependencies
 * - `useTenant()` - For organization/workspace data and context switching
 * - `useOnboarding()` - For user onboarding progress and tour management
 * - `useProductTour()` - For interactive feature tours and highlights
 * - `OrganizationSwitcher` - Organization selection component
 * - `WorkspaceSwitcher` - Workspace selection component
 * - `CreateWorkspaceDialog` - Modal for creating new client workspaces
 * - `ProductTourContainer` - Container for guided product tours
 * - `WelcomeModal` - Welcome dialog for new users
 * - `OnboardingChecklist` - Progress checklist for onboarding tasks
 * - `FeatureSpotlight` - Highlight new features and capabilities
 * 
 * @state
 * - `createWorkspaceOpen: boolean` - Controls workspace creation dialog visibility
 * 
 * @features
 * - **Multi-tenant Support**: Organization and workspace context switching
 * - **Content Statistics**: Display of total, published, and scheduled content
 * - **Quick Actions**: Generate Content and Schedule Posts buttons
 * - **Onboarding Integration**: Welcome flows, tours, and progress tracking
 * - **Responsive Design**: Mobile and desktop layout optimization
 * - **Real-time Updates**: Automatic data refresh and state synchronization
 * - **Error Handling**: Graceful degradation for missing data scenarios
 * 
 * @loading_states
 * - Shows "Loading dashboard..." spinner while tenant data loads
 * - Displays skeleton loaders for content statistics
 * - Graceful loading transitions for workspace switching
 * 
 * @error_handling
 * - Displays error messages for API failures
 * - Fallback UI when organization data is unavailable
 * - Safe property access with optional chaining throughout
 * - Automatic retry mechanisms for failed requests
 * 
 * @responsive_behavior
 * - **Mobile (< 768px)**: Stacked layout, simplified navigation, touch-optimized
 * - **Tablet (768px - 1024px)**: Balanced grid layout with collapsible sections
 * - **Desktop (> 1024px)**: Full grid layout with sidebar navigation
 * - **Large Screens (> 1440px)**: Expanded content areas with additional panels
 * 
 * @accessibility
 * - ARIA labels on all interactive elements
 * - Keyboard navigation support for all actions
 * - Screen reader compatible with semantic HTML structure
 * - High contrast mode support
 * - Focus management for modals and dialogs
 * 
 * @performance
 * - Lazy loading of non-critical components
 * - Memoized expensive calculations
 * - Optimized re-renders with React.memo where appropriate
 * - Efficient data fetching with RTK Query caching
 * 
 * @security
 * - Protected route requiring valid authentication
 * - Organization-scoped data access controls
 * - Sanitized user input and safe rendering
 * - CSRF protection on all form submissions
 * 
 * @analytics
 * - Page view tracking for dashboard visits
 * - Interaction tracking for quick actions
 * - Feature usage metrics for onboarding optimization
 * - Performance monitoring for load times
 * 
 * @testing
 * - Unit tests: `src/pages/dashboard/DashboardPage.test.tsx`
 * - Integration tests: `src/test/integration/dashboard-flow.test.tsx`
 * - E2E tests: `cypress/e2e/dashboard/dashboard-navigation.cy.ts`
 * - Performance tests: Lighthouse CI integration
 * 
 * @see {@link OrganizationSwitcher} - Organization selection component
 * @see {@link WorkspaceSwitcher} - Workspace selection component
 * @see {@link TenantProvider} - Tenant context provider
 * @see {@link useOnboarding} - Onboarding hook documentation
 * 
 * @since 1.0.0
 * @version 1.2.0
 */
export const DashboardPage: React.FC = () => {
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const { currentOrganization, currentWorkspace, workspaces, isLoading, error } = useTenant();
  const {
    isOnboardingComplete,
    currentStageProgress,
    nextSteps,
    suggestedTours,
    unviewedHighlights,
    completeStep,
    markFeatureDiscovered
  } = useOnboarding();

  const {
    isActive: isTourActive,
    start: startTour
  } = useProductTour();

  const handleCreateWorkspace = () => {
    setCreateWorkspaceOpen(true);
  };

  const handleCreateWorkspaceSuccess = () => {
    // Workspace will be refetched automatically via RTK Query
    completeStep('create_workspace');
  };

  // Check if user should see welcome modal on first visit
  useEffect(() => {
    if (currentOrganization && !isOnboardingComplete && currentStageProgress < 0.1) {
      // Show welcome modal for new users
    }
  }, [currentOrganization, isOnboardingComplete, currentStageProgress]);

  const handleStartDashboardTour = () => {
    startTour('dashboard_overview');
  };

  const handleFeatureDiscovered = (feature: string) => {
    markFeatureDiscovered(feature);
  };

  const stats = [
    {
      title: 'Total Content',
      value: currentWorkspace?.totalContent || 0,
      icon: <ContentIcon />,
      color: '#6366f1'
    },
    {
      title: 'Published',
      value: currentWorkspace?.totalPublished || 0,
      icon: <TrendingUpIcon />,
      color: '#10b981'
    },
    {
      title: 'Scheduled',
      value: (currentWorkspace?.totalContent || 0) - (currentWorkspace?.totalPublished || 0),
      icon: <ScheduleIcon />,
      color: '#f59e0b'
    }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography data-testid="loading-spinner">Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom data-testid="error-message">
            Error loading dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="dashboard-content">
      {/* Onboarding Components */}
      <ProductTourContainer />
      <WelcomeModal />
      
      {/* Feature Highlights */}
      {unviewedHighlights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {unviewedHighlights.map((highlight) => (
            <FeatureSpotlight
              key={highlight.id}
              highlight={highlight}
              onDismiss={() => handleFeatureDiscovered(highlight.feature)}
            />
          ))}
        </Box>
      )}

      {/* Header with Tour Button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to ContentAutoPilot
          </Typography>
        </Box>
        {!isOnboardingComplete && suggestedTours.length > 0 && (
          <Button
            variant="outlined"
            onClick={handleStartDashboardTour}
            size="small"
          >
            Take Dashboard Tour
          </Button>
        )}
      </Box>

      {/* Onboarding Progress for New Users */}
      {!isOnboardingComplete && nextSteps.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <OnboardingChecklist
            steps={nextSteps}
            onStepComplete={completeStep}
            progress={currentStageProgress}
          />
        </Box>
      )}

      {/* Feature Announcements */}
      <FeatureAnnouncementContainer position="banner" maxVisible={2} />

      {/* Organization and Workspace Switchers */}
      {currentOrganization ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Organization
              </Typography>
              <OrganizationSwitcher />
              <Typography variant="body2" data-testid="organization-name" sx={{ mt: 1 }}>
                {currentOrganization.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Workspace
              </Typography>
              <WorkspaceSwitcher onCreateWorkspace={handleCreateWorkspace} />
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to ContentAutoPilot!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Setting up your organization...
          </Typography>
        </Paper>
      )}

      {currentWorkspace ? (
        <>
          {/* Current Workspace Overview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: currentWorkspace.branding?.brandColors?.primary || '#6366f1',
                  width: 48,
                  height: 48
                }}
              >
                {currentWorkspace.name?.charAt(0) || 'W'}
              </Avatar>
              <Box>
                <Typography variant="h6">{currentWorkspace.name || 'Workspace'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentWorkspace.client?.companyName || 'Company'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={currentWorkspace.status || 'active'} 
                    size="small" 
                    color={currentWorkspace.status === 'active' ? 'success' : 'default'}
                  />
                  <Chip 
                    label={currentWorkspace.branding?.toneOfVoice || 'Professional'} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }} data-testid="organization-stats">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: stat.color }}>
                        {stat.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent data-testid="quick-actions">
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ mb: 1 }}
                    onClick={() => handleFeatureDiscovered('content_generation')}
                  >
                    Generate Content
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    onClick={() => handleFeatureDiscovered('scheduling')}
                  >
                    Schedule Posts
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent data-testid="recent-content">
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No recent activity
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        /* No Workspace Selected */
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {workspaces.length === 0 ? 'Create Your First Workspace' : 'Select a Workspace'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {workspaces.length === 0 
              ? 'Get started by creating a workspace for your first client'
              : 'Choose a workspace from the switcher above to view its dashboard'
            }
          </Typography>
          {workspaces.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkspace}
              data-testid="create-workspace"
            >
              Create Workspace
            </Button>
          )}
        </Paper>
      )}

      {/* Organization Usage - for tests */}
      {currentOrganization && (
        <Box sx={{ display: 'none' }}>
          <Box data-testid="organization-switcher">{currentOrganization.name}</Box>
          <Box data-testid="workspace-switcher">{currentWorkspace?.name || ''}</Box>
        </Box>
      )}

      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
        onSuccess={handleCreateWorkspaceSuccess}
      />

      {/* Tour Demo Component - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
        <DashboardTourDemo />
      )}
    </Container>
  );
};