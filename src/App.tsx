import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './hooks/useAuth';
import { TenantProvider } from './contexts/TenantContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ContentPage } from './pages/content/ContentPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { OrganizationSettingsPage } from './pages/settings/OrganizationSettingsPage';
import { TeamPage } from './pages/team/TeamPage';
import { SocialPlatformsPage } from './pages/integrations/SocialPlatformsPage';
import { BillingPage } from './pages/billing/BillingPage';
import { UsagePage } from './pages/usage/UsagePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmailPage } from './pages/email/EmailPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { PerformancePage } from './pages/performance/PerformancePage';
import { AIInsightsPage } from './pages/insights/AIInsightsPage';
import { CompetitiveIntelligencePage } from './pages/competitive/CompetitiveIntelligencePage';
import { SocialContentCreationPage } from './pages/content/SocialContentCreationPage';
import { AdvancedAnalyticsPage } from './pages/analytics/AdvancedAnalyticsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ContentOptimizationPage } from './pages/optimization/ContentOptimizationPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        Loading...
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <TenantProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/content/*"
            element={
              <AuthGuard>
                <ContentPage />
              </AuthGuard>
            }
          />
          <Route
            path="/content/social/*"
            element={
              <AuthGuard>
                <SocialContentCreationPage />
              </AuthGuard>
            }
          />
          <Route
            path="/analytics/*"
            element={
              <AuthGuard>
                <AnalyticsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/analytics/advanced/*"
            element={
              <AuthGuard>
                <AdvancedAnalyticsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/team/*"
            element={
              <AuthGuard>
                <TeamPage />
              </AuthGuard>
            }
          />
          <Route
            path="/integrations/*"
            element={
              <AuthGuard>
                <SocialPlatformsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/billing/*"
            element={
              <AuthGuard>
                <BillingPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings/organization"
            element={
              <AuthGuard>
                <OrganizationSettingsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/settings/*"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/usage/*"
            element={
              <AuthGuard>
                <UsagePage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/email/*"
            element={
              <AuthGuard>
                <EmailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/onboarding/*"
            element={
              <AuthGuard>
                <OnboardingPage />
              </AuthGuard>
            }
          />
          <Route
            path="/performance/*"
            element={
              <AuthGuard>
                <PerformancePage />
              </AuthGuard>
            }
          />
          <Route
            path="/insights/*"
            element={
              <AuthGuard>
                <AIInsightsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/competitive-intelligence/*"
            element={
              <AuthGuard>
                <CompetitiveIntelligencePage />
              </AuthGuard>
            }
          />
          <Route
            path="/reports/*"
            element={
              <AuthGuard>
                <ReportsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/optimization/*"
            element={
              <AuthGuard>
                <ContentOptimizationPage />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </TenantProvider>
  );
}

export default App;