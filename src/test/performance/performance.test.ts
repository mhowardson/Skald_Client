/**
 * Performance Tests using Playwright
 * 
 * Comprehensive performance testing including load times, Core Web Vitals, and user interactions.
 */

import { test, expect, Page } from '@playwright/test';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  totalPageSize: number;
  resourceCount: number;
}

/**
 * Collect Core Web Vitals and performance metrics
 */
async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {};
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
      }
      
      // Resource timing
      const resources = performance.getEntriesByType('resource');
      metrics.resourceCount = resources.length;
      metrics.totalPageSize = resources.reduce((total, resource: any) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      // Web Vitals observer
      let metricsCollected = 0;
      const targetMetrics = 4; // FCP, LCP, CLS, FID
      
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
                metricsCollected++;
              }
              break;
            case 'largest-contentful-paint':
              metrics.lcp = entry.startTime;
              metricsCollected++;
              break;
            case 'layout-shift':
              if (!entry.hadRecentInput) {
                metrics.cls = (metrics.cls || 0) + entry.value;
              }
              break;
            case 'first-input':
              metrics.fid = entry.processingStart - entry.startTime;
              metricsCollected++;
              break;
          }
          
          if (metricsCollected >= targetMetrics - 1) { // CLS is accumulated
            metrics.cls = metrics.cls || 0;
            metricsCollected++;
          }
          
          if (metricsCollected >= targetMetrics) {
            observer.disconnect();
            resolve(metrics as PerformanceMetrics);
          }
        });
      });
      
      observer.observe({ 
        type: 'paint', 
        buffered: true 
      });
      observer.observe({ 
        type: 'largest-contentful-paint', 
        buffered: true 
      });
      observer.observe({ 
        type: 'layout-shift', 
        buffered: true 
      });
      observer.observe({ 
        type: 'first-input', 
        buffered: true 
      });
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(metrics as PerformanceMetrics);
      }, 10000);
    });
  });
}

/**
 * Test page load performance
 */
async function testPageLoadPerformance(page: Page, url: string, label: string) {
  const startTime = Date.now();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const loadTime = Date.now() - startTime;
  const metrics = await collectPerformanceMetrics(page);
  
  console.log(`\n${label} Performance Metrics:`);
  console.log(`  Load Time: ${loadTime}ms`);
  console.log(`  TTFB: ${metrics.ttfb?.toFixed(2)}ms`);
  console.log(`  FCP: ${metrics.fcp?.toFixed(2)}ms`);
  console.log(`  LCP: ${metrics.lcp?.toFixed(2)}ms`);
  console.log(`  CLS: ${metrics.cls?.toFixed(4)}`);
  console.log(`  FID: ${metrics.fid?.toFixed(2)}ms`);
  console.log(`  DOM Content Loaded: ${metrics.domContentLoaded?.toFixed(2)}ms`);
  console.log(`  Page Size: ${(metrics.totalPageSize / 1024).toFixed(2)}KB`);
  console.log(`  Resource Count: ${metrics.resourceCount}`);
  
  return { loadTime, metrics };
}

test.describe('Performance Tests', () => {
  test('login page performance', async ({ page }) => {
    const { loadTime, metrics } = await testPageLoadPerformance(page, '/login', 'Login Page');
    
    // Assertions
    expect(loadTime).toBeLessThan(3000); // Page load under 3s
    expect(metrics.fcp).toBeLessThan(2000); // FCP under 2s
    expect(metrics.lcp).toBeLessThan(4000); // LCP under 4s
    expect(metrics.cls).toBeLessThan(0.1); // CLS under 0.1
    expect(metrics.totalPageSize).toBeLessThan(1024 * 1024); // Under 1MB
  });

  test('dashboard page performance', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'demo@agency.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    
    const { loadTime, metrics } = await testPageLoadPerformance(page, '/dashboard', 'Dashboard');
    
    // Dashboard might be heavier due to data loading
    expect(loadTime).toBeLessThan(5000);
    expect(metrics.fcp).toBeLessThan(2500);
    expect(metrics.lcp).toBeLessThan(5000);
    expect(metrics.cls).toBeLessThan(0.15);
  });

  test('content generation performance', async ({ page }) => {
    // Login and navigate to content generation
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'demo@agency.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    const startTime = Date.now();
    
    // Test content generation flow
    await page.goto('/content/generate');
    await page.waitForSelector('[data-testid="content-generator"]');
    
    const pageLoadTime = Date.now() - startTime;
    
    // Test form interaction performance
    const formStartTime = Date.now();
    await page.fill('[data-testid="prompt-input"]', 'Create a professional LinkedIn post about AI technology');
    await page.selectOption('[data-testid="platform-select"]', 'linkedin');
    
    // Mock API response for consistent testing
    await page.route('**/api/v1/content/generate', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate 1s AI processing
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            content: {
              text: 'AI is transforming how we create content...',
              hashtags: ['#AI', '#ContentCreation', '#Innovation']
            }
          }
        })
      });
    });
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generated-content"]');
    
    const generationTime = Date.now() - formStartTime;
    
    console.log(`\nContent Generation Performance:`);
    console.log(`  Page Load: ${pageLoadTime}ms`);
    console.log(`  Generation Flow: ${generationTime}ms`);
    
    expect(pageLoadTime).toBeLessThan(4000);
    expect(generationTime).toBeLessThan(3000); // Including 1s mock delay
  });

  test('mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const { loadTime, metrics } = await testPageLoadPerformance(page, '/login', 'Mobile Login');
    
    // Mobile should be optimized
    expect(loadTime).toBeLessThan(4000);
    expect(metrics.fcp).toBeLessThan(2500);
    expect(metrics.lcp).toBeLessThan(5000);
    expect(metrics.cls).toBeLessThan(0.1);
  });

  test('bundle size analysis', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    const resourceAnalysis = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const analysis = {
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        imageSize: 0,
        fontSize: 0,
        resourceCounts: {
          js: 0,
          css: 0,
          images: 0,
          fonts: 0,
          other: 0
        }
      };
      
      resources.forEach((resource) => {
        const size = resource.transferSize || 0;
        analysis.totalSize += size;
        
        if (resource.name.includes('.js') || resource.name.includes('javascript')) {
          analysis.jsSize += size;
          analysis.resourceCounts.js++;
        } else if (resource.name.includes('.css') || resource.name.includes('stylesheet')) {
          analysis.cssSize += size;
          analysis.resourceCounts.css++;
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          analysis.imageSize += size;
          analysis.resourceCounts.images++;
        } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/i)) {
          analysis.fontSize += size;
          analysis.resourceCounts.fonts++;
        } else {
          analysis.resourceCounts.other++;
        }
      });
      
      return analysis;
    });
    
    console.log('\nBundle Size Analysis:');
    console.log(`  Total Size: ${(resourceAnalysis.totalSize / 1024).toFixed(2)}KB`);
    console.log(`  JavaScript: ${(resourceAnalysis.jsSize / 1024).toFixed(2)}KB`);
    console.log(`  CSS: ${(resourceAnalysis.cssSize / 1024).toFixed(2)}KB`);
    console.log(`  Images: ${(resourceAnalysis.imageSize / 1024).toFixed(2)}KB`);
    console.log(`  Fonts: ${(resourceAnalysis.fontSize / 1024).toFixed(2)}KB`);
    console.log('\nResource Counts:');
    console.log(`  JS files: ${resourceAnalysis.resourceCounts.js}`);
    console.log(`  CSS files: ${resourceAnalysis.resourceCounts.css}`);
    console.log(`  Images: ${resourceAnalysis.resourceCounts.images}`);
    console.log(`  Fonts: ${resourceAnalysis.resourceCounts.fonts}`);
    
    // Bundle size assertions
    expect(resourceAnalysis.totalSize).toBeLessThan(2 * 1024 * 1024); // Under 2MB
    expect(resourceAnalysis.jsSize).toBeLessThan(1024 * 1024); // JS under 1MB
    expect(resourceAnalysis.cssSize).toBeLessThan(200 * 1024); // CSS under 200KB
    expect(resourceAnalysis.resourceCounts.js).toBeLessThan(20); // Not too many JS files
  });

  test('memory usage monitoring', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Monitor memory usage over time
    const measurements = [];
    
    for (let i = 0; i < 5; i++) {
      const memoryUsage = await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            usedJSMemory: (performance as any).memory.usedJSMemory,
            totalJSMemory: (performance as any).memory.totalJSMemory,
            jsMemoryLimit: (performance as any).memory.jsMemoryLimit
          };
        }
        return null;
      });
      
      if (memoryUsage) {
        measurements.push(memoryUsage);
      }
      
      // Simulate some user interactions
      await page.click('[data-testid="workspace-switcher"]');
      await page.waitForTimeout(1000);
    }
    
    if (measurements.length > 0) {
      const avgMemory = measurements.reduce((sum, m) => sum + m.usedJSMemory, 0) / measurements.length;
      const maxMemory = Math.max(...measurements.map(m => m.usedJSMemory));
      
      console.log('\nMemory Usage:');
      console.log(`  Average: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Peak: ${(maxMemory / 1024 / 1024).toFixed(2)}MB`);
      
      // Memory assertions (adjust based on your app's requirements)
      expect(avgMemory).toBeLessThan(50 * 1024 * 1024); // Under 50MB average
      expect(maxMemory).toBeLessThan(100 * 1024 * 1024); // Under 100MB peak
    }
  });

  test('network throttling performance', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    const { loadTime } = await testPageLoadPerformance(page, '/login', 'Throttled Network');
    
    // Should still be reasonable on slow network
    expect(loadTime).toBeLessThan(8000); // 8s on slow network
  });
});

test.describe('Performance Regression Tests', () => {
  const benchmarks = {
    loginPage: { fcp: 1500, lcp: 3000, cls: 0.05 },
    dashboardPage: { fcp: 2000, lcp: 4000, cls: 0.1 },
    contentPage: { fcp: 2000, lcp: 4000, cls: 0.1 }
  };

  Object.entries(benchmarks).forEach(([pageName, thresholds]) => {
    test(`${pageName} regression test`, async ({ page }) => {
      const url = pageName === 'loginPage' ? '/login' : 
                  pageName === 'dashboardPage' ? '/dashboard' : '/content';
      
      if (url !== '/login') {
        // Login first for protected pages
        await page.goto('/login');
        await page.fill('[data-testid="email-input"]', 'demo@agency.com');
        await page.fill('[data-testid="password-input"]', 'demo123');
        await page.click('[data-testid="login-button"]');
      }
      
      const { metrics } = await testPageLoadPerformance(page, url, `${pageName} Regression`);
      
      // Compare against benchmarks
      expect(metrics.fcp).toBeLessThan(thresholds.fcp);
      expect(metrics.lcp).toBeLessThan(thresholds.lcp);
      expect(metrics.cls).toBeLessThan(thresholds.cls);
    });
  });
});