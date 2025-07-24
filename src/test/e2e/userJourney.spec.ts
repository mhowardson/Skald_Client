import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    await page.route('**/api/v1/content**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          content: [
            {
              id: '1',
              title: 'Test Content',
              description: 'Test content description',
              type: 'post',
              status: 'draft',
              platforms: ['twitter', 'facebook'],
              content: {
                text: 'Test content text',
                media: [],
                hashtags: ['#test'],
              },
              createdAt: '2023-01-01T00:00:00Z',
            },
          ],
          total: 1,
        }),
      });
    });

    await page.route('**/api/v1/analytics**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          metrics: {
            totalViews: 10000,
            totalEngagements: 500,
            totalReach: 5000,
            engagementRate: 0.05,
          },
          topContent: [],
          demographics: {},
        }),
      });
    });
  });

  test('complete user workflow', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Navigate to content page
    await page.click('[data-testid="nav-content"]');
    await expect(page).toHaveURL('/content');

    // Create new content
    await page.click('[data-testid="create-content-button"]');
    await page.fill('[data-testid="content-title"]', 'New Test Content');
    await page.fill('[data-testid="content-description"]', 'New content description');
    await page.fill('[data-testid="content-text"]', 'This is new content text');
    
    // Select platforms
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="platform-facebook"]');
    
    // Save content
    await page.click('[data-testid="save-content-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Navigate to analytics
    await page.click('[data-testid="nav-analytics"]');
    await expect(page).toHaveURL('/analytics');
    await expect(page.locator('h1')).toContainText('Analytics');

    // Check analytics data is displayed
    await expect(page.locator('[data-testid="total-views"]')).toContainText('10,000');
    await expect(page.locator('[data-testid="total-engagements"]')).toContainText('500');

    // Navigate to settings
    await page.click('[data-testid="nav-settings"]');
    await expect(page).toHaveURL('/settings');

    // Update profile
    await page.fill('[data-testid="profile-name"]', 'Updated Test User');
    await page.click('[data-testid="save-profile-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('content publishing workflow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Go to content page
    await page.goto('/content');

    // Create content
    await page.click('[data-testid="create-content-button"]');
    await page.fill('[data-testid="content-title"]', 'Content to Publish');
    await page.fill('[data-testid="content-text"]', 'This content will be published');
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="save-content-button"]');

    // Publish content
    await page.click('[data-testid="publish-content-button"]');
    await page.click('[data-testid="publish-now-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="publish-success"]')).toBeVisible();
    
    // Content status should change to published
    await expect(page.locator('[data-testid="content-status"]')).toContainText('published');
  });

  test('content scheduling workflow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Go to content page
    await page.goto('/content');

    // Create content
    await page.click('[data-testid="create-content-button"]');
    await page.fill('[data-testid="content-title"]', 'Scheduled Content');
    await page.fill('[data-testid="content-text"]', 'This content will be scheduled');
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="save-content-button"]');

    // Schedule content
    await page.click('[data-testid="publish-content-button"]');
    await page.click('[data-testid="schedule-button"]');
    
    // Set schedule date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('[data-testid="schedule-date"]', dateString);
    await page.fill('[data-testid="schedule-time"]', '12:00');
    await page.click('[data-testid="confirm-schedule-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="schedule-success"]')).toBeVisible();
    
    // Content status should change to scheduled
    await expect(page.locator('[data-testid="content-status"]')).toContainText('scheduled');
  });

  test('team collaboration workflow', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Go to team page
    await page.goto('/team');

    // Invite team member
    await page.click('[data-testid="invite-member-button"]');
    await page.fill('[data-testid="invite-email"]', 'teammate@example.com');
    await page.selectOption('[data-testid="invite-role"]', 'editor');
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="invite-success"]')).toBeVisible();

    // Go to content page
    await page.goto('/content');

    // Create content and assign to team member
    await page.click('[data-testid="create-content-button"]');
    await page.fill('[data-testid="content-title"]', 'Team Content');
    await page.fill('[data-testid="content-text"]', 'Content assigned to team member');
    await page.selectOption('[data-testid="assign-to"]', 'teammate@example.com');
    await page.click('[data-testid="save-content-button"]');
    
    // Should show assignment success
    await expect(page.locator('[data-testid="assignment-success"]')).toBeVisible();
  });

  test('analytics and insights workflow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Go to analytics page
    await page.goto('/analytics');

    // Check overview metrics
    await expect(page.locator('[data-testid="total-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-engagements"]')).toBeVisible();
    await expect(page.locator('[data-testid="engagement-rate"]')).toBeVisible();

    // Switch to performance tab
    await page.click('[data-testid="performance-tab"]');
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();

    // Switch to audience tab
    await page.click('[data-testid="audience-tab"]');
    await expect(page.locator('[data-testid="audience-demographics"]')).toBeVisible();

    // Generate report
    await page.click('[data-testid="generate-report-button"]');
    await page.selectOption('[data-testid="report-period"]', 'last-month');
    await page.click('[data-testid="confirm-generate-button"]');
    
    // Should show report generation success
    await expect(page.locator('[data-testid="report-success"]')).toBeVisible();

    // Go to AI insights
    await page.goto('/insights');

    // Check sentiment analysis
    await expect(page.locator('[data-testid="sentiment-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="trend-detection"]')).toBeVisible();

    // Generate AI insights
    await page.click('[data-testid="generate-insights-button"]');
    await expect(page.locator('[data-testid="insights-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="insights-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Check mobile menu
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

    // Navigate using mobile menu
    await page.click('[data-testid="mobile-nav-content"]');
    await expect(page).toHaveURL('/content');

    // Check mobile-optimized content creation
    await page.click('[data-testid="mobile-create-content"]');
    await expect(page.locator('[data-testid="mobile-content-form"]')).toBeVisible();

    // Fill form on mobile
    await page.fill('[data-testid="content-title"]', 'Mobile Content');
    await page.fill('[data-testid="content-text"]', 'Content created on mobile');
    await page.click('[data-testid="save-content-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('error handling', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({
          message: 'Invalid credentials',
        }),
      });
    });

    // Try to login with invalid credentials
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');

    // Mock network error
    await page.route('**/api/v1/content', (route) => {
      route.abort('failed');
    });

    // Login with valid credentials (restore login endpoint)
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-token',
        }),
      });
    });

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to content page (should show network error)
    await page.goto('/content');
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();

    // Should have retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});