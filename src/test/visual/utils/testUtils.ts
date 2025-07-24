/**
 * Visual Test Utilities
 * 
 * Helper functions for visual regression testing.
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role?: string;
}

export const TEST_USERS = {
  admin: {
    email: 'admin@contentautopilot.com',
    password: 'admin123',
    role: 'admin'
  },
  agency: {
    email: 'demo@agency.com',
    password: 'demo123',
    role: 'owner'
  },
  freelancer: {
    email: 'test@freelancer.com',
    password: 'test123',
    role: 'owner'
  },
  enterprise: {
    email: 'john@enterprise.com',
    password: 'john123',
    role: 'owner'
  }
};

/**
 * Login helper for visual tests
 */
export async function loginUser(page: Page, user: TestUser = TEST_USERS.agency) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="dashboard-content"]');
  await page.waitForTimeout(2000); // Wait for dashboard to stabilize
}

/**
 * Mock API responses for consistent visual tests
 */
export async function mockApiResponses(page: Page, scenario: 'empty' | 'basic' | 'advanced' = 'basic') {
  switch (scenario) {
    case 'empty':
      await page.route('**/api/v1/organizations', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { organizations: [] }
          })
        });
      });
      
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
      break;

    case 'basic':
      await page.route('**/api/v1/organizations', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              organizations: [{
                _id: 'org1',
                name: 'Demo Marketing Agency',
                type: 'agency',
                subscription: { plan: 'agency', status: 'active' }
              }]
            }
          })
        });
      });
      
      await page.route('**/api/v1/workspaces', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              workspaces: [{
                _id: 'workspace1',
                name: 'TechStart Client',
                client: { companyName: 'TechStart Inc', industry: 'technology' },
                branding: { brandColors: { primary: '#6366f1' }, toneOfVoice: 'innovative' },
                status: 'active',
                analytics: { totalContent: 15, totalPublished: 8 }
              }]
            }
          })
        });
      });
      break;

    case 'advanced':
      await page.route('**/api/v1/onboarding/progress', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              journey: {
                currentStage: 'power_user',
                completedSteps: [
                  { stepId: 'create_organization', completedAt: new Date() },
                  { stepId: 'create_workspace', completedAt: new Date() },
                  { stepId: 'first_content', completedAt: new Date() }
                ],
                discoveredFeatures: ['content_generation', 'voice_to_text', 'analytics'],
                preferences: { tourEnabled: false, tooltipsEnabled: true }
              },
              nextSteps: [],
              availableTours: []
            }
          })
        });
      });
      break;
  }
}

/**
 * Wait for loading states to complete
 */
export async function waitForPageStabilization(page: Page) {
  // Wait for common loading indicators to disappear
  await page.waitForFunction(() => {
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], .MuiCircularProgress-root');
    return loadingElements.length === 0;
  }, { timeout: 10000 });
  
  // Wait for network idle
  await page.waitForLoadState('networkidle');
  
  // Additional stabilization wait
  await page.waitForTimeout(1000);
}

/**
 * Hide dynamic content for consistent screenshots
 */
export async function hideDynamicContent(page: Page) {
  await page.addStyleTag({
    content: `
      /* Hide time-sensitive content */
      [data-testid*="timestamp"],
      [data-testid*="time"],
      .timestamp,
      .relative-time {
        visibility: hidden !important;
      }
      
      /* Hide animations */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Hide cursors for consistent screenshots */
      * {
        cursor: none !important;
      }
      
      /* Hide scrollbars */
      ::-webkit-scrollbar {
        display: none !important;
      }
      
      /* Ensure consistent font rendering */
      * {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    `
  });
}

/**
 * Set up consistent test environment
 */
export async function setupVisualTest(page: Page, options: {
  user?: TestUser;
  mockScenario?: 'empty' | 'basic' | 'advanced';
  hideDynamic?: boolean;
} = {}) {
  const {
    user = TEST_USERS.agency,
    mockScenario = 'basic',
    hideDynamic = true
  } = options;

  // Mock API responses
  await mockApiResponses(page, mockScenario);
  
  // Login user
  await loginUser(page, user);
  
  // Hide dynamic content if requested
  if (hideDynamic) {
    await hideDynamicContent(page);
  }
  
  // Wait for page stabilization
  await waitForPageStabilization(page);
}

/**
 * Generate mobile viewports for testing
 */
export const MOBILE_VIEWPORTS = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'iPad': { width: 768, height: 1024 },
  'iPad Pro': { width: 1024, height: 1366 },
  'Android Phone': { width: 360, height: 640 },
  'Android Tablet': { width: 800, height: 1280 }
};

/**
 * Generate desktop viewports for testing
 */
export const DESKTOP_VIEWPORTS = {
  'Small Desktop': { width: 1024, height: 768 },
  'Medium Desktop': { width: 1440, height: 900 },
  'Large Desktop': { width: 1920, height: 1080 },
  'Ultrawide': { width: 2560, height: 1440 }
};

/**
 * Take screenshot with consistent options
 */
export async function takeStandardScreenshot(
  page: Page, 
  name: string, 
  options: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  } = {}
) {
  const defaultOptions = {
    animations: 'disabled' as const,
    ...options
  };

  return await page.screenshot({
    path: `test-results/${name}`,
    ...defaultOptions
  });
}

/**
 * Test component in different states
 */
export async function testComponentStates(
  page: Page,
  componentSelector: string,
  states: Array<{
    name: string;
    setup: () => Promise<void>;
  }>,
  screenshotBaseName: string
) {
  for (const state of states) {
    await state.setup();
    await waitForPageStabilization(page);
    
    const element = page.locator(componentSelector);
    await element.screenshot({
      path: `test-results/${screenshotBaseName}-${state.name}.png`,
      animations: 'disabled'
    });
  }
}

/**
 * Test responsive breakpoints
 */
export async function testResponsiveBreakpoints(
  page: Page,
  screenshotBaseName: string,
  viewports: Record<string, { width: number; height: number }> = {
    ...MOBILE_VIEWPORTS,
    ...DESKTOP_VIEWPORTS
  }
) {
  for (const [name, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await waitForPageStabilization(page);
    
    await page.screenshot({
      path: `test-results/${screenshotBaseName}-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
      fullPage: true,
      animations: 'disabled'
    });
  }
}

/**
 * Create test data for visual consistency
 */
export const VISUAL_TEST_DATA = {
  organization: {
    _id: 'visual-test-org',
    name: 'Visual Test Agency',
    type: 'agency',
    subscription: { plan: 'agency', status: 'active' }
  },
  workspace: {
    _id: 'visual-test-workspace',
    name: 'Visual Test Client',
    client: {
      companyName: 'Test Client Co',
      industry: 'technology',
      contactEmail: 'test@client.com'
    },
    branding: {
      brandColors: { primary: '#6366f1', secondary: '#8b5cf6' },
      toneOfVoice: 'professional'
    },
    status: 'active',
    analytics: {
      totalContent: 42,
      totalPublished: 28,
      totalViews: 15420,
      totalEngagements: 3240
    }
  },
  content: {
    _id: 'visual-test-content',
    platform: 'instagram',
    type: 'post',
    content: {
      text: 'This is a sample Instagram post for visual testing! 🚀 #test #visual #consistent',
      hashtags: ['#test', '#visual', '#consistent']
    },
    status: 'published',
    metadata: {
      characterCount: 85,
      platform: 'instagram',
      tone: 'professional'
    }
  }
};