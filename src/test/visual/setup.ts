/**
 * Visual Regression Testing Setup
 * 
 * Configuration and utilities for visual testing with Playwright and Percy.
 */

import { test as base, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

// Extend Playwright test with Percy snapshot functionality
export const test = base.extend<{ percy: typeof percySnapshot }>({
  percy: async ({}, use) => {
    await use(percySnapshot);
  },
});

export { expect };

// Default viewport sizes for testing
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  desktopLarge: { width: 2560, height: 1440 }
};

// Common test user credentials
export const TEST_USERS = {
  admin: {
    email: 'admin@contentautopilot.com',
    password: 'admin123'
  },
  regularUser: {
    email: 'john.doe@agency.com',
    password: 'password123'
  },
  newUser: {
    email: 'new.user@test.com',
    password: 'password123'
  }
};

// Base URL for testing
export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

/**
 * Navigate to page with authentication
 */
export async function authenticateUser(page: any, userType: keyof typeof TEST_USERS = 'regularUser') {
  const user = TEST_USERS[userType];
  
  // Go to login page
  await page.goto(`${BASE_URL}/login`);
  
  // Fill in credentials
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  
  // Submit login form
  await page.click('[data-testid="login-button"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');
}

/**
 * Setup test environment before each test
 */
export async function setupTestEnvironment(page: any) {
  // Set viewport to desktop by default
  await page.setViewportSize(VIEWPORT_SIZES.desktop);
  
  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });
  
  // Wait for fonts to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Give extra time for font rendering
}

/**
 * Hide dynamic content that changes between test runs
 */
export async function hideDynamicContent(page: any) {
  await page.addStyleTag({
    content: `
      /* Hide timestamps and dates */
      [data-testid*="timestamp"],
      [data-testid*="date"],
      .timestamp,
      .date,
      time {
        visibility: hidden !important;
      }
      
      /* Hide random IDs */
      [data-testid*="id"],
      .id {
        visibility: hidden !important;
      }
      
      /* Hide loading indicators */
      .loading,
      [data-testid*="loading"],
      .spinner {
        visibility: hidden !important;
      }
      
      /* Hide dynamic counters */
      [data-testid*="count"],
      .count {
        visibility: hidden !important;
      }
    `
  });
}

/**
 * Wait for UI to stabilize
 */
export async function waitForUIStable(page: any, timeout: number = 3000) {
  // Wait for any ongoing animations
  await page.waitForTimeout(500);
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for any lazy-loaded content
  await page.waitForTimeout(1000);
  
  // Check for loading indicators and wait for them to disappear
  try {
    await page.waitForSelector('[data-testid*="loading"]', { 
      state: 'hidden', 
      timeout: timeout 
    });
  } catch (e) {
    // Loading indicator might not exist, continue
  }
}

/**
 * Take Percy snapshot with standard options
 */
export async function takeSnapshot(
  page: any, 
  percy: typeof percySnapshot, 
  name: string, 
  options: any = {}
) {
  const defaultOptions = {
    widths: [375, 768, 1200, 1920],
    minHeight: 1024,
    ...options
  };
  
  await percy(page, name, defaultOptions);
}

/**
 * Test responsive design across viewports
 */
export async function testResponsiveDesign(
  page: any,
  percy: typeof percySnapshot,
  testName: string,
  testFn: () => Promise<void>
) {
  for (const [sizeName, size] of Object.entries(VIEWPORT_SIZES)) {
    await page.setViewportSize(size);
    await setupTestEnvironment(page);
    await testFn();
    await takeSnapshot(page, percy, `${testName} - ${sizeName}`);
  }
}

/**
 * Test dark mode if supported
 */
export async function testDarkMode(
  page: any,
  percy: typeof percySnapshot,
  testName: string,
  testFn: () => Promise<void>
) {
  // Test light mode
  await testFn();
  await takeSnapshot(page, percy, `${testName} - Light Mode`);
  
  // Switch to dark mode if available
  try {
    await page.click('[data-testid="theme-toggle"]');
    await waitForUIStable(page);
    await testFn();
    await takeSnapshot(page, percy, `${testName} - Dark Mode`);
  } catch (e) {
    console.log('Dark mode toggle not found, skipping dark mode test');
  }
}

/**
 * Simulate different user states
 */
export const USER_STATES = {
  newUser: async (page: any) => {
    // Simulate new user with onboarding
    await page.goto(`${BASE_URL}/register`);
  },
  
  emptyDashboard: async (page: any) => {
    // User with no content
    await authenticateUser(page, 'newUser');
    await page.goto(`${BASE_URL}/dashboard`);
  },
  
  populatedDashboard: async (page: any) => {
    // User with content and data
    await authenticateUser(page, 'regularUser');
    await page.goto(`${BASE_URL}/dashboard`);
  },
  
  onboardingFlow: async (page: any) => {
    // User going through onboarding
    await authenticateUser(page, 'newUser');
    await page.click('[data-testid="start-tour"]');
  }
};

/**
 * Common UI elements to test
 */
export const UI_ELEMENTS = {
  navigation: '[data-testid*="nav"]',
  buttons: 'button',
  forms: 'form',
  modals: '[role="dialog"]',
  tooltips: '[role="tooltip"]',
  dropdowns: '[role="menu"]',
  cards: '[data-testid*="card"]',
  tables: 'table'
};

/**
 * Performance monitoring for visual tests
 */
export async function measurePagePerformance(page: any) {
  const performanceMetrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
    };
  });
  
  return performanceMetrics;
}

/**
 * Accessibility testing helpers
 */
export async function checkAccessibility(page: any) {
  // Check for basic accessibility attributes
  const accessibilityIssues = await page.evaluate(() => {
    const issues = [];
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for missing labels on form inputs
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputs).filter(input => {
      const labels = document.querySelectorAll(`label[for="${input.id}"]`);
      return labels.length === 0;
    });
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs missing labels`);
    }
    
    // Check for missing headings structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No heading elements found');
    }
    
    return issues;
  });
  
  return accessibilityIssues;
}