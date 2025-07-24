/**
 * Authentication Visual Regression Tests
 * 
 * Tests visual consistency of login, registration, and authentication-related components.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Visual Tests', () => {
  test('login page - default state', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-form"]');

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('login page - with form validation errors', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without filling form to trigger validation
    await page.click('[data-testid="login-button"]');
    
    // Wait for validation errors to appear
    await page.waitForSelector('[data-testid="email-error"]', { timeout: 2000 });

    await expect(page).toHaveScreenshot('login-validation-errors.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('login page - loading state', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Intercept login request to add delay
    await page.route('**/api/v1/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Click login and capture loading state
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('login-loading.png', {
      animations: 'disabled'
    });
  });

  test('login page - error state', async ({ page }) => {
    await page.goto('/login');
    
    // Mock login error
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Invalid credentials' }
        })
      });
    });
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForSelector('[data-testid="login-error"]');

    await expect(page).toHaveScreenshot('login-error.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('registration page - default state', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('[data-testid="register-form"]');

    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('registration page - step 1 filled', async ({ page }) => {
    await page.goto('/register');
    
    // Fill personal information
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'securepassword123');

    await expect(page).toHaveScreenshot('register-step1-filled.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('registration page - step 2 organization setup', async ({ page }) => {
    await page.goto('/register');
    
    // Fill step 1
    await page.fill('[data-testid="firstName-input"]', 'John');
    await page.fill('[data-testid="lastName-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'securepassword123');
    
    // Go to step 2
    await page.click('[data-testid="next-step-button"]');
    await page.waitForSelector('[data-testid="organization-setup"]');

    await expect(page).toHaveScreenshot('register-step2-organization.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('registration page - validation errors', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit without filling required fields
    await page.click('[data-testid="next-step-button"]');
    
    // Wait for validation errors
    await page.waitForSelector('[data-testid="firstName-error"]', { timeout: 2000 });

    await expect(page).toHaveScreenshot('register-validation-errors.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForSelector('[data-testid="forgot-password-form"]');

    await expect(page).toHaveScreenshot('forgot-password-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('forgot password - success state', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Mock successful password reset request
    await page.route('**/api/v1/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Password reset email sent'
        })
      });
    });
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="reset-button"]');
    
    await page.waitForSelector('[data-testid="success-message"]');

    await expect(page).toHaveScreenshot('forgot-password-success.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Authentication Mobile Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-form"]');

    await expect(page).toHaveScreenshot('mobile-login-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile registration page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('[data-testid="register-form"]');

    await expect(page).toHaveScreenshot('mobile-register-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile keyboard interaction', async ({ page }) => {
    await page.goto('/login');
    
    // Focus on email input to show mobile keyboard
    await page.focus('[data-testid="email-input"]');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('mobile-login-keyboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Authentication Dark Mode Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('dark mode login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-form"]');

    await expect(page).toHaveScreenshot('dark-login-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dark mode registration page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('[data-testid="register-form"]');

    await expect(page).toHaveScreenshot('dark-register-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Authentication Form Interactions', () => {
  test('password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="password-input"]', 'mypassword');
    
    // Show password
    await page.click('[data-testid="password-visibility-toggle"]');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('password-visible.png', {
      animations: 'disabled'
    });
  });

  test('form field focus states', async ({ page }) => {
    await page.goto('/login');
    
    // Focus on email field
    await page.focus('[data-testid="email-input"]');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('email-field-focused.png', {
      animations: 'disabled'
    });
  });

  test('form autocomplete suggestions', async ({ page }) => {
    await page.goto('/login');
    
    // Type to trigger autocomplete
    await page.fill('[data-testid="email-input"]', 'test@');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('email-autocomplete.png', {
      animations: 'disabled'
    });
  });
});