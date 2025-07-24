/**
 * Dashboard Visual Regression Tests
 * 
 * Tests visual consistency of dashboard components across different states and browsers.
 */

import { test, expect } from '@playwright/test';

// Test data for consistent screenshots
const testUser = {
  email: 'demo@agency.com',
  password: 'demo123'
};

test.describe('Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    
    // Submit login
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    // Wait for any loading states to complete
    await page.waitForTimeout(2000);
  });

  test('dashboard overview - default state', async ({ page }) => {
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-overview.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard with no workspaces', async ({ page }) => {
    // Mock API to return no workspaces
    await page.route('**/api/v1/workspaces', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { workspaces: [] }
        })
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="create-workspace"]');

    await expect(page).toHaveScreenshot('dashboard-no-workspaces.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard with onboarding checklist', async ({ page }) => {
    // Mock API to return incomplete onboarding
    await page.route('**/api/v1/onboarding/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            journey: {
              currentStage: 'first_workspace',
              completedSteps: [],
              preferences: { tourEnabled: true }
            },
            nextSteps: [
              {
                id: 'create_workspace',
                title: 'Create Your First Workspace',
                description: 'Set up a workspace for your content',
                category: 'essential',
                estimatedMinutes: 3
              },
              {
                id: 'first_content',
                title: 'Generate Your First Content',
                description: 'Create your first AI-generated post',
                category: 'essential',
                estimatedMinutes: 5
              }
            ],
            availableTours: []
          }
        })
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="onboarding-checklist"]');

    await expect(page).toHaveScreenshot('dashboard-with-onboarding.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard with feature announcements', async ({ page }) => {
    // Ensure feature announcements are visible
    await page.waitForTimeout(1000);
    
    // Check if announcements are present
    const announcements = await page.locator('[data-testid="feature-announcement"]').count();
    
    if (announcements > 0) {
      await expect(page).toHaveScreenshot('dashboard-with-announcements.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('organization switcher dropdown', async ({ page }) => {
    // Open organization switcher
    await page.click('[data-testid="organization-switcher"]');
    
    // Wait for dropdown animation
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('organization-switcher-open.png', {
      animations: 'disabled'
    });
  });

  test('workspace switcher dropdown', async ({ page }) => {
    // Open workspace switcher
    await page.click('[data-testid="workspace-switcher"]');
    
    // Wait for dropdown animation
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('workspace-switcher-open.png', {
      animations: 'disabled'
    });
  });

  test('user menu dropdown', async ({ page }) => {
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    
    // Wait for dropdown animation
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('user-menu-open.png', {
      animations: 'disabled'
    });
  });

  test('dashboard loading state', async ({ page }) => {
    // Intercept API calls to add delay
    await page.route('**/api/v1/organizations', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/dashboard');
    
    // Capture loading state
    await expect(page).toHaveScreenshot('dashboard-loading.png', {
      animations: 'disabled'
    });
  });

  test('dashboard error state', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/organizations', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Server error' }
        })
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="error-message"]');

    await expect(page).toHaveScreenshot('dashboard-error.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Dashboard Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForTimeout(2000);
  });

  test('dashboard mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-mobile-portrait.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard tablet landscape', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-tablet-landscape.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dashboard wide desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-wide-desktop.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Dashboard Dark Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set system to dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForTimeout(2000);
  });

  test('dashboard dark mode', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});