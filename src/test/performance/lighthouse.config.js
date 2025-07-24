/**
 * Lighthouse Performance Testing Configuration
 * 
 * Configures Lighthouse for automated performance audits.
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:5173/login',
        'http://localhost:5173/register',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/content',
        'http://localhost:5173/analytics'
      ],
      
      // Chrome flags for consistent testing
      chromeFlags: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--no-zygote',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Additional settings
      settings: {
        // Simulate mobile
        formFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        },
        emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }
    },
    
    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'metrics:first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'metrics:largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'metrics:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'metrics:total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Other performance metrics
        'metrics:speed-index': ['warn', { maxNumericValue: 4000 }],
        'metrics:interactive': ['warn', { maxNumericValue: 5000 }],
        
        // Resource metrics
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }],
        
        // Audit checks
        'audits:unused-javascript': ['warn', { maxNumericValue: 0.1 }],
        'audits:uses-optimized-images': 'error',
        'audits:uses-webp-images': 'warn',
        'audits:efficient-animated-content': 'warn',
        'audits:offscreen-images': 'warn'
      }
    },
    
    upload: {
      target: 'temporary-public-storage',
      // Can be configured for CI/CD reporting
    },
    
    server: {
      command: 'npm run dev',
      port: 5173,
      wait: 10000
    }
  }
};