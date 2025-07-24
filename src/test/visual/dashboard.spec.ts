/**
 * Dashboard Visual Regression Tests
 * 
 * Visual tests for dashboard components and layouts.
 */

import { 
  test, 
  expect, 
  authenticateUser, 
  setupTestEnvironment, 
  hideDynamicContent,
  waitForUIStable,
  takeSnapshot,
  testResponsiveDesign,
  USER_STATES,
  VIEWPORT_SIZES 
} from './setup';

test.describe('Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('Dashboard - Empty State', async ({ page, percy }) => {
    await USER_STATES.emptyDashboard(page);
    await hideDynamicContent(page);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Empty State');
  });

  test('Dashboard - Populated State', async ({ page, percy }) => {
    await USER_STATES.populatedDashboard(page);
    await hideDynamicContent(page);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Populated State');
  });

  test('Dashboard - Organization Switcher', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    
    // Click organization switcher to open dropdown
    await page.click('[data-testid="organization-switcher"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Organization Switcher Open');
  });

  test('Dashboard - Workspace Switcher', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    
    // Click workspace switcher to open dropdown
    await page.click('[data-testid="workspace-switcher"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Workspace Switcher Open');
  });

  test('Dashboard - Create Workspace Modal', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    
    // Open create workspace modal
    await page.click('[data-testid="create-workspace"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Create Workspace Modal');
  });

  test('Dashboard - Responsive Design', async ({ page, percy }) => {
    await testResponsiveDesign(page, percy, 'Dashboard', async () => {
      await USER_STATES.populatedDashboard(page);
      await hideDynamicContent(page);
      await waitForUIStable(page);
    });
  });

  test('Dashboard - Stats Cards', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Focus on stats section
    const statsSection = page.locator('[data-testid="organization-stats"]');
    await statsSection.scrollIntoViewIfNeeded();
    
    await takeSnapshot(page, percy, 'Dashboard - Stats Cards', {
      clip: await statsSection.boundingBox()
    });
  });

  test('Dashboard - Quick Actions', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Focus on quick actions section
    const quickActions = page.locator('[data-testid="quick-actions"]');
    await quickActions.scrollIntoViewIfNeeded();
    
    await takeSnapshot(page, percy, 'Dashboard - Quick Actions', {
      clip: await quickActions.boundingBox()
    });
  });

  test('Dashboard - Recent Activity', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Focus on recent activity section
    const recentActivity = page.locator('[data-testid="recent-content"]');
    await recentActivity.scrollIntoViewIfNeeded();
    
    await takeSnapshot(page, percy, 'Dashboard - Recent Activity', {
      clip: await recentActivity.boundingBox()
    });
  });

  test('Dashboard - Loading State', async ({ page, percy }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/v1/**', route => {
      // Delay response to capture loading state
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    await authenticateUser(page);
    const navigation = page.goto('/dashboard');
    
    // Take snapshot during loading
    await page.waitForSelector('[data-testid="loading-spinner"]');
    await takeSnapshot(page, percy, 'Dashboard - Loading State');
    
    // Wait for navigation to complete
    await navigation;
  });

  test('Dashboard - Error State', async ({ page, percy }) => {
    // Mock API error
    await page.route('**/api/v1/organizations', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Server error' }
        })
      });
    });
    
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Error State');
  });
});

test.describe('Dashboard Onboarding Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('Dashboard - Onboarding Checklist', async ({ page, percy }) => {
    await USER_STATES.onboardingFlow(page);
    await waitForUIStable(page);
    
    // Look for onboarding checklist
    await page.waitForSelector('[data-testid="onboarding-checklist"]');
    await takeSnapshot(page, percy, 'Dashboard - Onboarding Checklist');
  });

  test('Dashboard - Welcome Modal', async ({ page, percy }) => {
    // Mock new user state
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'New');
    await page.fill('[data-testid="lastName-input"]', 'User');
    await page.fill('[data-testid="organizationName-input"]', 'New Organization');
    
    await page.click('[data-testid="register-button"]');
    await page.waitForURL('**/dashboard');
    
    // Welcome modal should appear for new users
    await page.waitForSelector('[data-testid="welcome-modal"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Welcome Modal');
  });

  test('Dashboard - Feature Announcements', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Look for feature announcements
    const announcements = page.locator('[data-testid*="announcement"]');
    if (await announcements.count() > 0) {
      await takeSnapshot(page, percy, 'Dashboard - Feature Announcements');
    }
  });

  test('Dashboard - Product Tour Active', async ({ page, percy }) => {
    await authenticateUser(page, 'newUser');
    await page.goto('/dashboard');
    
    // Start dashboard tour if available
    try {
      await page.click('[data-testid="start-tour"]');
      await waitForUIStable(page);
      
      // Take snapshot with tour overlay
      await takeSnapshot(page, percy, 'Dashboard - Product Tour Active');
      
      // Navigate through tour steps
      await page.click('[data-testid="tour-next"]');
      await waitForUIStable(page);
      await takeSnapshot(page, percy, 'Dashboard - Product Tour Step 2');
      
    } catch (e) {
      console.log('Tour not available for this user state');
    }
  });

  test('Dashboard - Help Center Widget', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Open help center widget
    await page.click('[data-testid="help-center-trigger"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Help Center Widget');
  });
});

test.describe('Dashboard Mobile Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobile);
    await setupTestEnvironment(page);
  });

  test('Dashboard - Mobile Navigation', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    
    // Open mobile navigation
    await page.click('[data-testid="mobile-menu-toggle"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Mobile Navigation Open');
  });

  test('Dashboard - Mobile Layout', async ({ page, percy }) => {
    await USER_STATES.populatedDashboard(page);
    await hideDynamicContent(page);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Dashboard - Mobile Layout');
  });

  test('Dashboard - Mobile Stats Cards', async ({ page, percy }) => {
    await authenticateUser(page);
    await page.goto('/dashboard');
    await waitForUIStable(page);
    
    // Scroll to stats section
    await page.locator('[data-testid="organization-stats"]').scrollIntoViewIfNeeded();
    
    await takeSnapshot(page, percy, 'Dashboard - Mobile Stats Cards');
  });
});