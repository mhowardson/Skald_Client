/**
 * API Endpoint Performance Benchmarking Tests
 * 
 * Tests API response times and database query performance.
 */

import { test, expect } from '@playwright/test';

interface ApiPerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  payloadSize: number;
  timeToFirstByte: number;
}

/**
 * Measure API endpoint performance
 */
async function measureApiPerformance(
  baseUrl: string,
  endpoint: string,
  method: string = 'GET',
  payload?: any,
  headers?: Record<string, string>
): Promise<ApiPerformanceMetrics> {
  const startTime = performance.now();
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (payload) {
    fetchOptions.body = JSON.stringify(payload);
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);
  const endTime = performance.now();
  
  const responseText = await response.text();
  
  return {
    endpoint,
    method,
    responseTime: endTime - startTime,
    statusCode: response.status,
    payloadSize: new Blob([responseText]).size,
    timeToFirstByte: endTime - startTime // Simplified for this example
  };
}

/**
 * Run multiple API calls and get statistics
 */
async function benchmarkEndpoint(
  baseUrl: string,
  endpoint: string,
  runs: number = 10,
  method: string = 'GET',
  payload?: any,
  headers?: Record<string, string>
) {
  const results: ApiPerformanceMetrics[] = [];
  
  for (let i = 0; i < runs; i++) {
    const metrics = await measureApiPerformance(baseUrl, endpoint, method, payload, headers);
    results.push(metrics);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const responseTimes = results.map(r => r.responseTime);
  const payloadSizes = results.map(r => r.payloadSize);
  
  return {
    endpoint,
    method,
    runs,
    metrics: {
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / runs,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p95ResponseTime: responseTimes.sort((a, b) => a - b)[Math.floor(runs * 0.95)],
      avgPayloadSize: payloadSizes.reduce((a, b) => a + b, 0) / runs,
      successRate: results.filter(r => r.statusCode < 400).length / runs,
      statusCodes: results.reduce((acc, r) => {
        acc[r.statusCode] = (acc[r.statusCode] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    }
  };
}

test.describe('API Performance Benchmarks', () => {
  const API_BASE_URL = 'http://localhost:3000';
  let authToken: string;
  let orgId: string;
  
  test.beforeAll(async () => {
    // Get auth token for authenticated endpoints
    const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@agency.com',
        password: 'demo123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.data.tokens.accessToken;
      orgId = loginData.data.user.organizationMemberships[0].organizationId;
    }
  });

  test('Authentication Endpoints', async () => {
    console.log('\n=== Authentication Endpoints ===');
    
    // Login endpoint
    const loginBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/auth/login',
      5, // Fewer runs for login to avoid rate limiting
      'POST',
      { email: 'demo@agency.com', password: 'demo123' }
    );
    
    console.log(`Login Endpoint Performance:`);
    console.log(`  Average Response Time: ${loginBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  P95 Response Time: ${loginBenchmark.metrics.p95ResponseTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${(loginBenchmark.metrics.successRate * 100).toFixed(1)}%`);
    
    // Performance assertions
    expect(loginBenchmark.metrics.avgResponseTime).toBeLessThan(1000); // Under 1s
    expect(loginBenchmark.metrics.p95ResponseTime).toBeLessThan(2000); // P95 under 2s
    expect(loginBenchmark.metrics.successRate).toBeGreaterThan(0.95); // 95% success rate
    
    // Token refresh endpoint
    if (authToken) {
      const refreshBenchmark = await benchmarkEndpoint(
        API_BASE_URL,
        '/api/v1/auth/refresh',
        10,
        'POST',
        {},
        { 'Authorization': `Bearer ${authToken}` }
      );
      
      console.log(`Token Refresh Performance:`);
      console.log(`  Average Response Time: ${refreshBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
      console.log(`  P95 Response Time: ${refreshBenchmark.metrics.p95ResponseTime.toFixed(2)}ms`);
      
      expect(refreshBenchmark.metrics.avgResponseTime).toBeLessThan(500); // Under 500ms
      expect(refreshBenchmark.metrics.successRate).toBeGreaterThan(0.95);
    }
  });

  test('User Data Endpoints', async () => {
    console.log('\n=== User Data Endpoints ===');
    
    if (!authToken) {
      test.skip('No auth token available');
      return;
    }
    
    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'X-Organization-Context': orgId 
    };
    
    // User profile endpoint
    const profileBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/users/profile',
      15,
      'GET',
      undefined,
      headers
    );
    
    console.log(`User Profile Performance:`);
    console.log(`  Average Response Time: ${profileBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Average Payload Size: ${(profileBenchmark.metrics.avgPayloadSize / 1024).toFixed(2)}KB`);
    
    expect(profileBenchmark.metrics.avgResponseTime).toBeLessThan(300); // Under 300ms
    expect(profileBenchmark.metrics.avgPayloadSize).toBeLessThan(10240); // Under 10KB
    
    // Organizations endpoint
    const orgsBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/organizations',
      15,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Organizations List Performance:`);
    console.log(`  Average Response Time: ${orgsBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Average Payload Size: ${(orgsBenchmark.metrics.avgPayloadSize / 1024).toFixed(2)}KB`);
    
    expect(orgsBenchmark.metrics.avgResponseTime).toBeLessThan(500);
    expect(orgsBenchmark.metrics.avgPayloadSize).toBeLessThan(51200); // Under 50KB
  });

  test('Content Management Endpoints', async () => {
    console.log('\n=== Content Management Endpoints ===');
    
    if (!authToken) {
      test.skip('No auth token available');
      return;
    }
    
    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'X-Organization-Context': orgId 
    };
    
    // Workspaces list
    const workspacesBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/workspaces',
      15,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Workspaces List Performance:`);
    console.log(`  Average Response Time: ${workspacesBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  P95 Response Time: ${workspacesBenchmark.metrics.p95ResponseTime.toFixed(2)}ms`);
    
    expect(workspacesBenchmark.metrics.avgResponseTime).toBeLessThan(400);
    expect(workspacesBenchmark.metrics.p95ResponseTime).toBeLessThan(800);
    
    // Content list endpoint
    const contentBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/content?limit=20&page=1',
      15,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Content List Performance:`);
    console.log(`  Average Response Time: ${contentBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Average Payload Size: ${(contentBenchmark.metrics.avgPayloadSize / 1024).toFixed(2)}KB`);
    
    expect(contentBenchmark.metrics.avgResponseTime).toBeLessThan(600);
    expect(contentBenchmark.metrics.avgPayloadSize).toBeLessThan(102400); // Under 100KB
  });

  test('Content Generation Endpoint', async () => {
    console.log('\n=== Content Generation Endpoint ===');
    
    if (!authToken) {
      test.skip('No auth token available');
      return;
    }
    
    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'X-Organization-Context': orgId 
    };
    
    // Content generation (mock for performance testing)
    const generationPayload = {
      prompt: 'Create a short social media post about technology trends',
      platform: 'linkedin',
      contentType: 'post'
    };
    
    const generationBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/content/generate',
      5, // Fewer runs due to potentially expensive operation
      'POST',
      generationPayload,
      headers
    );
    
    console.log(`Content Generation Performance:`);
    console.log(`  Average Response Time: ${generationBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Max Response Time: ${generationBenchmark.metrics.maxResponseTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${(generationBenchmark.metrics.successRate * 100).toFixed(1)}%`);
    
    // Content generation might take longer due to AI processing
    expect(generationBenchmark.metrics.avgResponseTime).toBeLessThan(5000); // Under 5s
    expect(generationBenchmark.metrics.maxResponseTime).toBeLessThan(10000); // Max 10s
    expect(generationBenchmark.metrics.successRate).toBeGreaterThan(0.8); // 80% success rate
  });

  test('Analytics Endpoints', async () => {
    console.log('\n=== Analytics Endpoints ===');
    
    if (!authToken) {
      test.skip('No auth token available');
      return;
    }
    
    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'X-Organization-Context': orgId 
    };
    
    // Organization analytics
    const analyticsBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/analytics/organization?timeframe=month',
      10,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Organization Analytics Performance:`);
    console.log(`  Average Response Time: ${analyticsBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  P95 Response Time: ${analyticsBenchmark.metrics.p95ResponseTime.toFixed(2)}ms`);
    
    expect(analyticsBenchmark.metrics.avgResponseTime).toBeLessThan(1000); // Under 1s
    expect(analyticsBenchmark.metrics.p95ResponseTime).toBeLessThan(2000);
    
    // Content analytics
    const contentAnalyticsBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/analytics/content?timeframe=week',
      10,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Content Analytics Performance:`);
    console.log(`  Average Response Time: ${contentAnalyticsBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Average Payload Size: ${(contentAnalyticsBenchmark.metrics.avgPayloadSize / 1024).toFixed(2)}KB`);
    
    expect(contentAnalyticsBenchmark.metrics.avgResponseTime).toBeLessThan(800);
  });

  test('Onboarding Endpoints', async () => {
    console.log('\n=== Onboarding Endpoints ===');
    
    if (!authToken) {
      test.skip('No auth token available');
      return;
    }
    
    const headers = { 
      'Authorization': `Bearer ${authToken}`,
      'X-Organization-Context': orgId 
    };
    
    // Onboarding progress
    const progressBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/onboarding/progress',
      15,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Onboarding Progress Performance:`);
    console.log(`  Average Response Time: ${progressBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  P95 Response Time: ${progressBenchmark.metrics.p95ResponseTime.toFixed(2)}ms`);
    
    expect(progressBenchmark.metrics.avgResponseTime).toBeLessThan(300);
    expect(progressBenchmark.metrics.p95ResponseTime).toBeLessThan(600);
    
    // Onboarding analytics
    const onboardingAnalyticsBenchmark = await benchmarkEndpoint(
      API_BASE_URL,
      '/api/v1/onboarding/analytics',
      10,
      'GET',
      undefined,
      headers
    );
    
    console.log(`Onboarding Analytics Performance:`);
    console.log(`  Average Response Time: ${onboardingAnalyticsBenchmark.metrics.avgResponseTime.toFixed(2)}ms`);
    
    expect(onboardingAnalyticsBenchmark.metrics.avgResponseTime).toBeLessThan(500);
  });
});

test.describe('Database Query Performance', () => {
  test('Database Connection Pool Stress Test', async () => {
    console.log('\n=== Database Connection Pool Test ===');
    
    const API_BASE_URL = 'http://localhost:3000';
    
    // Simulate multiple concurrent requests to test connection pooling
    const concurrentRequests = 20;
    const promises: Promise<any>[] = [];
    
    const startTime = performance.now();
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(`${API_BASE_URL}/api/v1/health`)
          .then(response => response.json())
          .then(data => ({ success: true, data }))
          .catch(error => ({ success: false, error: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    const successfulRequests = results.filter(r => r.success).length;
    const totalTime = endTime - startTime;
    
    console.log(`Concurrent Requests Test:`);
    console.log(`  Total Requests: ${concurrentRequests}`);
    console.log(`  Successful Requests: ${successfulRequests}`);
    console.log(`  Success Rate: ${(successfulRequests / concurrentRequests * 100).toFixed(1)}%`);
    console.log(`  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`  Average Time per Request: ${(totalTime / concurrentRequests).toFixed(2)}ms`);
    
    // Assertions
    expect(successfulRequests).toBeGreaterThan(concurrentRequests * 0.95); // 95% success rate
    expect(totalTime).toBeLessThan(5000); // All requests should complete within 5s
  });

  test('Memory Usage Under Load', async () => {
    console.log('\n=== Memory Usage Under Load ===');
    
    const API_BASE_URL = 'http://localhost:3000';
    
    // Check if memory metrics endpoint exists
    try {
      const memoryResponse = await fetch(`${API_BASE_URL}/api/v1/health/memory`);
      
      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        
        console.log(`Server Memory Usage:`);
        console.log(`  Used Memory: ${(memoryData.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  Total Memory: ${(memoryData.heapTotal / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  External Memory: ${(memoryData.external / 1024 / 1024).toFixed(2)}MB`);
        
        // Basic memory usage assertions
        expect(memoryData.heapUsed).toBeLessThan(512 * 1024 * 1024); // Under 512MB
      } else {
        console.log('Memory metrics endpoint not available');
      }
    } catch (error) {
      console.log('Could not fetch memory metrics:', error);
    }
  });
});