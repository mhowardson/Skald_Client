/**
 * Onboarding Visual Regression Tests
 * 
 * Tests visual consistency of onboarding components including tours, modals, and announcements.
 */

import { test, expect } from '@playwright/test';

const testUser = {
  email: 'demo@agency.com',
  password: 'demo123'
};

test.describe('Onboarding Components Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForTimeout(2000);
  });

  test('welcome modal - first time user', async ({ page }) => {
    // Mock API to show new user state
    await page.route('**/api/v1/onboarding/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            journey: {
              currentStage: 'registration',
              completedSteps: [],
              preferences: { tourEnabled: true }
            },
            nextSteps: [],
            availableTours: [{
              id: 'dashboard_overview',
              title: 'Dashboard Overview',
              estimatedMinutes: 3
            }]
          }
        })
      });
    });

    // Trigger welcome modal display
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('showWelcomeModal'));
    });

    await page.waitForSelector('[data-testid="welcome-modal"]', { timeout: 5000 });
    
    await expect(page).toHaveScreenshot('welcome-modal.png', {
      animations: 'disabled'
    });
  });

  test('onboarding checklist - multiple states', async ({ page }) => {
    // Mock checklist with various completion states
    await page.route('**/api/v1/onboarding/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            journey: {
              currentStage: 'first_content',
              completedSteps: [
                { stepId: 'create_organization', completedAt: new Date() }
              ],
              preferences: { tourEnabled: true }
            },
            nextSteps: [
              {
                id: 'create_workspace',
                title: 'Create Your First Workspace',
                description: 'Set up a workspace for your content',
                category: 'essential',
                estimatedMinutes: 3,
                status: 'completed'
              },
              {
                id: 'first_content',
                title: 'Generate Your First Content',
                description: 'Create your first AI-generated post',
                category: 'essential',
                estimatedMinutes: 5,
                status: 'pending'
              },
              {
                id: 'invite_team',
                title: 'Invite Team Members',
                description: 'Collaborate with your team',
                category: 'recommended',
                estimatedMinutes: 2,
                status: 'pending'
              }
            ],
            availableTours: []
          }
        })
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="onboarding-checklist"]');

    await expect(page).toHaveScreenshot('onboarding-checklist.png', {
      animations: 'disabled'
    });
  });

  test('feature announcement banner', async ({ page }) => {
    // Mock feature announcements
    await page.evaluate(() => {
      // Simulate adding a feature announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('data-testid', 'feature-announcement');
      announcement.className = 'feature-announcement-banner';
      announcement.innerHTML = `
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">🚀</div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600;">New Voice-to-Text Feature</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Transform your voice recordings into engaging social media content with our new AI-powered feature.</p>
            </div>
            <button style="background: none; border: none; padding: 8px; cursor: pointer;">×</button>
          </div>
        </div>
      `;
      document.querySelector('[data-testid="dashboard-content"]')?.prepend(announcement);
    });

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('feature-announcement-banner.png', {
      animations: 'disabled'
    });
  });

  test('product tour overlay', async ({ page }) => {
    // Simulate tour activation
    await page.evaluate(() => {
      // Create tour overlay
      const overlay = document.createElement('div');
      overlay.setAttribute('data-testid', 'tour-overlay');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        position: relative;
      `;
      
      tooltip.innerHTML = `
        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Welcome to Your Dashboard! 👋</h3>
        <p style="margin: 0 0 16px 0; color: #6b7280;">This is your central hub for managing content across all your workspaces.</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #9ca3af; font-size: 14px;">Step 1 of 6</span>
          <div style="display: flex; gap: 8px;">
            <button style="background: #f3f4f6; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Skip</button>
            <button style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Next</button>
          </div>
        </div>
      `;
      
      overlay.appendChild(tooltip);
      document.body.appendChild(overlay);
    });

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('product-tour-overlay.png', {
      animations: 'disabled'
    });
  });

  test('help center widget - closed state', async ({ page }) => {
    // Help center should be visible in bottom right
    await page.waitForSelector('[data-testid="help-center-trigger"]', { timeout: 5000 });

    await expect(page.locator('[data-testid="help-center-trigger"]')).toHaveScreenshot('help-center-closed.png', {
      animations: 'disabled'
    });
  });

  test('help center widget - open state', async ({ page }) => {
    // Click help center trigger
    await page.click('[data-testid="help-center-trigger"]');
    await page.waitForSelector('[data-testid="help-center-content"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('help-center-open.png', {
      animations: 'disabled'
    });
  });

  test('announcement center modal', async ({ page }) => {
    // Click announcements trigger in navigation
    await page.click('[data-testid="announcements-trigger"]');
    await page.waitForSelector('[data-testid="announcement-center"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('announcement-center-modal.png', {
      animations: 'disabled'
    });
  });

  test('milestone celebration animation', async ({ page }) => {
    // Simulate milestone achievement
    await page.evaluate(() => {
      const celebration = document.createElement('div');
      celebration.setAttribute('data-testid', 'milestone-celebration');
      celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        padding: 32px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        border: 3px solid #10b981;
      `;
      
      celebration.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 8px 0; color: #10b981;">Milestone Achieved!</h2>
        <p style="margin: 0 0 16px 0; color: #6b7280;">You've completed your first content generation</p>
        <button style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Continue</button>
      `;
      
      document.body.appendChild(celebration);
    });

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('milestone-celebration.png', {
      animations: 'disabled'
    });
  });
});

test.describe('Onboarding Components Mobile Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForTimeout(2000);
  });

  test('mobile welcome modal', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('showWelcomeModal'));
    });

    await page.waitForSelector('[data-testid="welcome-modal"]', { timeout: 5000 });
    
    await expect(page).toHaveScreenshot('mobile-welcome-modal.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile onboarding checklist', async ({ page }) => {
    await page.route('**/api/v1/onboarding/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            journey: { currentStage: 'first_content', completedSteps: [], preferences: { tourEnabled: true } },
            nextSteps: [
              { id: 'create_workspace', title: 'Create Workspace', description: 'Set up workspace', category: 'essential', estimatedMinutes: 3 },
              { id: 'first_content', title: 'Generate Content', description: 'Create first post', category: 'essential', estimatedMinutes: 5 }
            ],
            availableTours: []
          }
        })
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="onboarding-checklist"]');

    await expect(page).toHaveScreenshot('mobile-onboarding-checklist.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile help center', async ({ page }) => {
    await page.click('[data-testid="help-center-trigger"]');
    await page.waitForSelector('[data-testid="help-center-content"]');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('mobile-help-center.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});