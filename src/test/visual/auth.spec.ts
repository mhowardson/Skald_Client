/**
 * Authentication Visual Regression Tests
 * 
 * Visual tests for login, register, and auth-related pages.
 */

import { 
  test, 
  expect, 
  setupTestEnvironment, 
  hideDynamicContent,
  waitForUIStable,
  takeSnapshot,
  testResponsiveDesign,
  VIEWPORT_SIZES,
  BASE_URL 
} from './setup';

test.describe('Authentication Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('Login Page - Default State', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login Page - Default State');
  });

  test('Login Page - Form Validation', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Try to submit empty form to trigger validation
    await page.click('[data-testid="login-button"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login Page - Validation Errors');
  });

  test('Login Page - Loading State', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Intercept login request to capture loading state
    await page.route('**/api/v1/auth/login', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    // Submit and capture loading state
    const submitPromise = page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="login-loading"]');
    
    await takeSnapshot(page, percy, 'Login Page - Loading State');
    
    await submitPromise;
  });

  test('Login Page - Error State', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Mock login error
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Invalid credentials' }
        })
      });
    });
    
    // Fill form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login Page - Error State');
  });

  test('Register Page - Default State', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Default State');
  });

  test('Register Page - Form Filled', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'securepassword123');
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.fill('[data-testid="organizationName-input"]', 'My Agency');
    
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Form Filled');
  });

  test('Register Page - Validation Errors', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Fill form with invalid data
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', '123'); // Too short
    
    // Try to submit to trigger validation
    await page.click('[data-testid="register-button"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Validation Errors');
  });

  test('Register Page - Organization Type Selection', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Open organization type dropdown
    await page.click('[data-testid="organization-type-select"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Organization Type Selection');
  });

  test('Register Page - Plan Selection', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Scroll to plan selection if it exists
    try {
      await page.locator('[data-testid="plan-selection"]').scrollIntoViewIfNeeded();
      await takeSnapshot(page, percy, 'Register Page - Plan Selection');
    } catch (e) {
      console.log('Plan selection not found, skipping');
    }
  });

  test('Forgot Password Page', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Forgot Password Page - Default State');
    
    // Fill email and test form state
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await takeSnapshot(page, percy, 'Forgot Password Page - Email Filled');
  });

  test('Reset Password Page', async ({ page, percy }) => {
    // Navigate with mock token
    await page.goto(`${BASE_URL}/reset-password?token=mock-reset-token`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Reset Password Page - Default State');
    
    // Fill new password
    await page.fill('[data-testid="password-input"]', 'newpassword123');
    await page.fill('[data-testid="confirmPassword-input"]', 'newpassword123');
    
    await takeSnapshot(page, percy, 'Reset Password Page - Passwords Filled');
  });

  test('Authentication Pages - Responsive Design', async ({ page, percy }) => {
    const pages = [
      { url: '/login', name: 'Login' },
      { url: '/register', name: 'Register' },
      { url: '/forgot-password', name: 'Forgot Password' }
    ];
    
    for (const pageInfo of pages) {
      await testResponsiveDesign(page, percy, pageInfo.name, async () => {
        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await waitForUIStable(page);
      });
    }
  });
});

test.describe('Authentication Mobile Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobile);
    await setupTestEnvironment(page);
  });

  test('Login Page - Mobile Layout', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login Page - Mobile Layout');
  });

  test('Register Page - Mobile Layout', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Mobile Layout');
  });

  test('Register Page - Mobile Form Interaction', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Fill form on mobile
    await page.fill('[data-testid="email-input"]', 'mobile@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'Mobile');
    await page.fill('[data-testid="lastName-input"]', 'User');
    
    // Focus on organization name field
    await page.focus('[data-testid="organizationName-input"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register Page - Mobile Form Focus');
  });
});

test.describe('Authentication Error States', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('Login - Network Error', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Mock network error
    await page.route('**/api/v1/auth/login', route => {
      route.abort('failed');
    });
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login - Network Error');
  });

  test('Register - Server Error', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Mock server error
    await page.route('**/api/v1/auth/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Server error occurred' }
        })
      });
    });
    
    // Fill and submit form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="firstName-input"]', 'Test');
    await page.fill('[data-testid="lastName-input"]', 'User');
    await page.fill('[data-testid="organizationName-input"]', 'Test Org');
    
    await page.click('[data-testid="register-button"]');
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Register - Server Error');
  });

  test('Login - Account Locked', async ({ page, percy }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Mock account locked error
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 423,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { 
            message: 'Account temporarily locked due to too many failed attempts',
            code: 'ACCOUNT_LOCKED'
          }
        })
      });
    });
    
    await page.fill('[data-testid="email-input"]', 'locked@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await waitForUIStable(page);
    
    await takeSnapshot(page, percy, 'Login - Account Locked');
  });
});