/**
 * Performance Budgets Configuration
 * 
 * Defines performance budgets and CI/CD integration for automated testing.
 */

export interface PerformanceBudget {
  name: string;
  metrics: {
    [key: string]: {
      budget: number;
      unit: string;
      tolerance?: number; // percentage tolerance (e.g., 0.1 = 10%)
    };
  };
  resourceBudgets: {
    [key: string]: {
      budget: number;
      unit: 'KB' | 'MB' | 'count';
    };
  };
}

/**
 * Performance budgets for different page types
 */
export const performanceBudgets: Record<string, PerformanceBudget> = {
  // Landing and authentication pages (should be fast)
  'auth-pages': {
    name: 'Authentication Pages',
    metrics: {
      'first-contentful-paint': { budget: 1500, unit: 'ms', tolerance: 0.2 },
      'largest-contentful-paint': { budget: 2500, unit: 'ms', tolerance: 0.2 },
      'cumulative-layout-shift': { budget: 0.05, unit: 'score', tolerance: 0.5 },
      'total-blocking-time': { budget: 200, unit: 'ms', tolerance: 0.3 },
      'speed-index': { budget: 2000, unit: 'ms', tolerance: 0.2 }
    },
    resourceBudgets: {
      'total-size': { budget: 500, unit: 'KB' },
      'javascript': { budget: 200, unit: 'KB' },
      'css': { budget: 50, unit: 'KB' },
      'images': { budget: 200, unit: 'KB' },
      'fonts': { budget: 50, unit: 'KB' },
      'js-files': { budget: 10, unit: 'count' },
      'css-files': { budget: 5, unit: 'count' }
    }
  },

  // Dashboard and main application pages
  'dashboard-pages': {
    name: 'Dashboard Pages',
    metrics: {
      'first-contentful-paint': { budget: 2000, unit: 'ms', tolerance: 0.2 },
      'largest-contentful-paint': { budget: 4000, unit: 'ms', tolerance: 0.2 },
      'cumulative-layout-shift': { budget: 0.1, unit: 'score', tolerance: 0.3 },
      'total-blocking-time': { budget: 300, unit: 'ms', tolerance: 0.3 },
      'speed-index': { budget: 3500, unit: 'ms', tolerance: 0.2 }
    },
    resourceBudgets: {
      'total-size': { budget: 1000, unit: 'KB' },
      'javascript': { budget: 600, unit: 'KB' },
      'css': { budget: 100, unit: 'KB' },
      'images': { budget: 250, unit: 'KB' },
      'fonts': { budget: 50, unit: 'KB' },
      'js-files': { budget: 15, unit: 'count' },
      'css-files': { budget: 8, unit: 'count' }
    }
  },

  // Content creation and editing pages
  'content-pages': {
    name: 'Content Pages',
    metrics: {
      'first-contentful-paint': { budget: 2500, unit: 'ms', tolerance: 0.2 },
      'largest-contentful-paint': { budget: 4500, unit: 'ms', tolerance: 0.2 },
      'cumulative-layout-shift': { budget: 0.15, unit: 'score', tolerance: 0.3 },
      'total-blocking-time': { budget: 400, unit: 'ms', tolerance: 0.3 },
      'speed-index': { budget: 4000, unit: 'ms', tolerance: 0.2 }
    },
    resourceBudgets: {
      'total-size': { budget: 1500, unit: 'KB' },
      'javascript': { budget: 800, unit: 'KB' },
      'css': { budget: 150, unit: 'KB' },
      'images': { budget: 400, unit: 'KB' },
      'fonts': { budget: 75, unit: 'KB' },
      'js-files': { budget: 20, unit: 'count' },
      'css-files': { budget: 10, unit: 'count' }
    }
  },

  // Mobile-specific budgets (stricter)
  'mobile': {
    name: 'Mobile Pages',
    metrics: {
      'first-contentful-paint': { budget: 2000, unit: 'ms', tolerance: 0.15 },
      'largest-contentful-paint': { budget: 3500, unit: 'ms', tolerance: 0.15 },
      'cumulative-layout-shift': { budget: 0.08, unit: 'score', tolerance: 0.25 },
      'total-blocking-time': { budget: 250, unit: 'ms', tolerance: 0.2 },
      'speed-index': { budget: 3000, unit: 'ms', tolerance: 0.15 }
    },
    resourceBudgets: {
      'total-size': { budget: 800, unit: 'KB' },
      'javascript': { budget: 400, unit: 'KB' },
      'css': { budget: 75, unit: 'KB' },
      'images': { budget: 300, unit: 'KB' },
      'fonts': { budget: 25, unit: 'KB' },
      'js-files': { budget: 12, unit: 'count' },
      'css-files': { budget: 6, unit: 'count' }
    }
  }
};

/**
 * Budget validation result
 */
export interface BudgetValidationResult {
  passed: boolean;
  budget: PerformanceBudget;
  violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    unit: string;
    severity: 'warning' | 'error';
    exceedsBy: number;
    exceedsByPercent: number;
  }>;
  summary: {
    totalChecks: number;
    passedChecks: number;
    warnings: number;
    errors: number;
  };
}

/**
 * Validate performance metrics against budget
 */
export function validatePerformanceBudget(
  budgetName: string,
  metrics: Record<string, number>,
  resources?: Record<string, number>
): BudgetValidationResult {
  const budget = performanceBudgets[budgetName];
  if (!budget) {
    throw new Error(`Unknown performance budget: ${budgetName}`);
  }

  const violations: BudgetValidationResult['violations'] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Check performance metrics
  Object.entries(budget.metrics).forEach(([metricName, budgetConfig]) => {
    totalChecks++;
    const actualValue = metrics[metricName];
    
    if (actualValue !== undefined) {
      const tolerance = budgetConfig.tolerance || 0;
      const budgetWithTolerance = budgetConfig.budget * (1 + tolerance);
      
      if (actualValue <= budgetWithTolerance) {
        passedChecks++;
      } else {
        const exceedsBy = actualValue - budgetConfig.budget;
        const exceedsByPercent = (exceedsBy / budgetConfig.budget) * 100;
        
        violations.push({
          metric: metricName,
          actual: actualValue,
          budget: budgetConfig.budget,
          unit: budgetConfig.unit,
          severity: actualValue > budgetWithTolerance * 1.2 ? 'error' : 'warning',
          exceedsBy,
          exceedsByPercent
        });
      }
    }
  });

  // Check resource budgets if provided
  if (resources) {
    Object.entries(budget.resourceBudgets).forEach(([resourceName, budgetConfig]) => {
      totalChecks++;
      const actualValue = resources[resourceName];
      
      if (actualValue !== undefined) {
        const budgetValue = budgetConfig.unit === 'KB' ? budgetConfig.budget * 1024 : budgetConfig.budget;
        
        if (actualValue <= budgetValue) {
          passedChecks++;
        } else {
          const exceedsBy = actualValue - budgetValue;
          const exceedsByPercent = (exceedsBy / budgetValue) * 100;
          
          violations.push({
            metric: resourceName,
            actual: actualValue,
            budget: budgetValue,
            unit: budgetConfig.unit,
            severity: exceedsByPercent > 50 ? 'error' : 'warning',
            exceedsBy,
            exceedsByPercent
          });
        }
      }
    });
  }

  const warnings = violations.filter(v => v.severity === 'warning').length;
  const errors = violations.filter(v => v.severity === 'error').length;

  return {
    passed: violations.length === 0,
    budget,
    violations,
    summary: {
      totalChecks,
      passedChecks,
      warnings,
      errors
    }
  };
}

/**
 * Generate performance budget report
 */
export function generateBudgetReport(results: BudgetValidationResult[]): string {
  let report = '# Performance Budget Report\n\n';
  
  const allPassed = results.every(r => r.passed);
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
  
  report += `## Summary\n\n`;
  report += `- **Status**: ${allPassed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `- **Total Budgets Checked**: ${results.length}\n`;
  report += `- **Total Violations**: ${totalViolations}\n\n`;

  results.forEach(result => {
    report += `## ${result.budget.name}\n\n`;
    
    if (result.passed) {
      report += `✅ **All checks passed** (${result.summary.passedChecks}/${result.summary.totalChecks})\n\n`;
    } else {
      report += `❌ **Budget exceeded** (${result.summary.passedChecks}/${result.summary.totalChecks} passed)\n\n`;
      
      if (result.violations.length > 0) {
        report += `### Violations\n\n`;
        report += `| Metric | Actual | Budget | Unit | Exceeds By | Severity |\n`;
        report += `|--------|--------|--------|------|------------|----------|\n`;
        
        result.violations.forEach(violation => {
          const icon = violation.severity === 'error' ? '🚨' : '⚠️';
          report += `| ${violation.metric} | ${violation.actual.toFixed(2)} | ${violation.budget.toFixed(2)} | ${violation.unit} | ${violation.exceedsByPercent.toFixed(1)}% | ${icon} ${violation.severity} |\n`;
        });
        
        report += '\n';
      }
    }
  });

  return report;
}

/**
 * CI/CD Integration: GitHub Actions Workflow
 */
export const githubActionsWorkflow = `
name: Performance Budget Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  performance-budget:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Start test server
      run: |
        npm run dev &
        npx wait-on http://localhost:5173
    
    - name: Run Lighthouse Performance Tests
      run: npx lhci autorun
    
    - name: Run Performance Budget Tests
      run: npm run test:performance:budget
    
    - name: Generate Performance Report
      run: npm run test:performance:report
    
    - name: Comment PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const reportPath = './performance-budget-report.md';
          
          if (fs.existsSync(reportPath)) {
            const report = fs.readFileSync(reportPath, 'utf8');
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
          }
`;

/**
 * Package.json scripts for performance testing
 */
export const packageJsonScripts = {
  "test:performance": "playwright test src/test/performance",
  "test:performance:lighthouse": "lhci autorun",
  "test:performance:budget": "playwright test src/test/performance/performance-budget.test.ts",
  "test:performance:api": "playwright test src/test/performance/api-benchmarks.test.ts",
  "test:performance:load": "artillery run src/test/performance/load-testing.yml",
  "test:performance:report": "node scripts/generate-performance-report.js",
  "test:performance:ci": "npm run test:performance:lighthouse && npm run test:performance:budget"
};

/**
 * Lighthouse CI configuration for budget enforcement
 */
export const lighthouseCIConfig = `
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5173/login",
        "http://localhost:5173/dashboard", 
        "http://localhost:5173/content"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "budgets": [
        {
          "path": "/login",
          "resourceSizes": [
            { "resourceType": "total", "budget": 500 },
            { "resourceType": "script", "budget": 200 },
            { "resourceType": "stylesheet", "budget": 50 }
          ],
          "resourceCounts": [
            { "resourceType": "script", "budget": 10 },
            { "resourceType": "stylesheet", "budget": 5 }
          ]
        },
        {
          "path": "/dashboard",
          "resourceSizes": [
            { "resourceType": "total", "budget": 1000 },
            { "resourceType": "script", "budget": 600 },
            { "resourceType": "stylesheet", "budget": 100 }
          ]
        }
      ],
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "metrics:first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "metrics:largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "metrics:cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
`;

/**
 * Performance budget test file generator
 */
export function generateBudgetTestFile(budgetName: string): string {
  return `
import { test, expect } from '@playwright/test';
import { validatePerformanceBudget, generateBudgetReport } from './performance-budgets';

test.describe('${budgetName} Performance Budget', () => {
  test('should meet performance budget requirements', async ({ page }) => {
    // Navigate to page and collect metrics
    await page.goto('/your-page-url');
    await page.waitForLoadState('networkidle');
    
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        'first-contentful-paint': paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        'largest-contentful-paint': 0, // Collect from LCP observer
        'cumulative-layout-shift': 0,  // Collect from CLS observer
        'total-blocking-time': 0,      // Calculate from long tasks
        'speed-index': 0               // Calculate or use Lighthouse
      };
    });
    
    // Collect resource metrics
    const resources = await page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      let jsCount = 0;
      let cssCount = 0;
      
      resourceEntries.forEach(resource => {
        const size = resource.transferSize || 0;
        totalSize += size;
        
        if (resource.name.includes('.js')) {
          jsSize += size;
          jsCount++;
        } else if (resource.name.includes('.css')) {
          cssSize += size;
          cssCount++;
        }
      });
      
      return {
        'total-size': totalSize,
        'javascript': jsSize,
        'css': cssSize,
        'js-files': jsCount,
        'css-files': cssCount
      };
    });
    
    // Validate against budget
    const result = validatePerformanceBudget('${budgetName}', metrics, resources);
    
    // Generate report if there are violations
    if (!result.passed) {
      const report = generateBudgetReport([result]);
      console.log('Performance Budget Violations:\\n', report);
    }
    
    // Assert budget compliance
    expect(result.passed).toBe(true);
    expect(result.summary.errors).toBe(0);
  });
});
`;
}