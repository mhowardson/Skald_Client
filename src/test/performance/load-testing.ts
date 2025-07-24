/**
 * Load Testing with Artillery.js Configuration
 * 
 * Tests application performance under various load conditions.
 */

export const loadTestingConfig = {
  // Basic load test configuration
  config: {
    target: 'http://localhost:5173',
    phases: [
      // Warm up phase
      {
        duration: 60,
        arrivalRate: 5,
        name: 'Warm up'
      },
      // Ramp up phase
      {
        duration: 120,
        arrivalRate: 10,
        rampTo: 50,
        name: 'Ramp up load'
      },
      // Sustained load phase
      {
        duration: 300,
        arrivalRate: 50,
        name: 'Sustained load'
      },
      // Peak load phase
      {
        duration: 60,
        arrivalRate: 100,
        name: 'Peak load'
      },
      // Cool down phase
      {
        duration: 60,
        arrivalRate: 5,
        name: 'Cool down'
      }
    ],
    // Global configuration
    http: {
      timeout: 30000,
      pool: 10
    },
    // Metrics and monitoring
    plugins: {
      'artillery-plugin-metrics-by-endpoint': {
        useOnlyRequestNames: true
      }
    }
  },

  // Test scenarios
  scenarios: [
    {
      name: 'User Authentication Flow',
      weight: 30,
      flow: [
        {
          get: {
            url: '/login',
            capture: [
              {
                json: '$.csrfToken',
                as: 'csrfToken'
              }
            ]
          }
        },
        {
          post: {
            url: '/api/v1/auth/login',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': '{{ csrfToken }}'
            },
            json: {
              email: 'loadtest{{ $randomString() }}@example.com',
              password: 'loadtest123'
            },
            capture: [
              {
                json: '$.data.tokens.accessToken',
                as: 'authToken'
              }
            ]
          }
        },
        {
          get: {
            url: '/dashboard',
            headers: {
              'Authorization': 'Bearer {{ authToken }}'
            }
          }
        }
      ]
    },
    {
      name: 'Content Generation Flow',
      weight: 40,
      flow: [
        // Login first
        {
          post: {
            url: '/api/v1/auth/login',
            json: {
              email: 'demo@agency.com',
              password: 'demo123'
            },
            capture: [
              {
                json: '$.data.tokens.accessToken',
                as: 'authToken'
              },
              {
                json: '$.data.user.organizationMemberships[0].organizationId',
                as: 'orgId'
              }
            ]
          }
        },
        // Get workspaces
        {
          get: {
            url: '/api/v1/workspaces',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            },
            capture: [
              {
                json: '$.data.workspaces[0]._id',
                as: 'workspaceId'
              }
            ]
          }
        },
        // Generate content
        {
          post: {
            url: '/api/v1/content/generate',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            },
            json: {
              prompt: 'Create a professional social media post about {{ $randomString() }}',
              platform: '{{ $randomPickSetMember(["instagram", "twitter", "linkedin", "facebook"]) }}',
              contentType: 'post',
              workspaceId: '{{ workspaceId }}'
            }
          }
        }
      ]
    },
    {
      name: 'Onboarding Flow',
      weight: 20,
      flow: [
        // Get onboarding progress
        {
          get: {
            url: '/api/v1/onboarding/progress',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            }
          }
        },
        // Complete a step
        {
          post: {
            url: '/api/v1/onboarding/steps/{{ $randomPickSetMember(["create_workspace", "first_content", "invite_team"]) }}/complete',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            },
            json: {
              metadata: {
                timeSpent: '{{ $randomInt(10000, 120000) }}',
                source: 'load_test'
              }
            }
          }
        },
        // Start a tour
        {
          post: {
            url: '/api/v1/onboarding/tours/dashboard_overview/start',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            }
          }
        }
      ]
    },
    {
      name: 'Analytics and Monitoring',
      weight: 10,
      flow: [
        // Get organization analytics
        {
          get: {
            url: '/api/v1/analytics/organization',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            },
            qs: {
              timeframe: '{{ $randomPickSetMember(["week", "month", "quarter"]) }}',
              metrics: 'content,engagement,performance'
            }
          }
        },
        // Get onboarding analytics
        {
          get: {
            url: '/api/v1/onboarding/analytics',
            headers: {
              'Authorization': 'Bearer {{ authToken }}',
              'X-Organization-Context': '{{ orgId }}'
            },
            qs: {
              timeframe: 'month'
            }
          }
        }
      ]
    }
  ],

  // Performance thresholds
  thresholds: {
    // Response time thresholds (95th percentile)
    'http.response_time.p95': 2000, // 2 seconds
    'http.response_time.p99': 5000, // 5 seconds
    
    // Error rate threshold
    'http.response_time.mean': 1000, // 1 second average
    'http.request_rate': 100, // Requests per second
    
    // Success rate threshold
    'vusers.failed': 0.01, // Less than 1% failure rate
    
    // Custom thresholds by endpoint
    'plugins.metrics-by-endpoint.response_time.login.p95': 1500,
    'plugins.metrics-by-endpoint.response_time.content-generation.p95': 3000,
    'plugins.metrics-by-endpoint.response_time.dashboard.p95': 2000
  }
};

/**
 * Artillery.js test runner configuration
 */
export const artilleryTestRunner = `
# Artillery Load Test Configuration
# Run with: npx artillery run load-test.yml

config:
  target: http://localhost:5173
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
    - duration: 60
      arrivalRate: 5
      name: "Cool down"
  http:
    timeout: 30000
    pool: 10
  plugins:
    metrics-by-endpoint:
      useOnlyRequestNames: true
    cloudwatch:
      namespace: "ContentAutoPilot/LoadTest"

scenarios:
  - name: "Authentication Flow"
    weight: 30
    flow:
      - get:
          url: "/login"
          name: "login-page"
      - post:
          url: "/api/v1/auth/login"
          name: "login-api"
          headers:
            Content-Type: "application/json"
          json:
            email: "demo@agency.com"
            password: "demo123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
            - json: "$.data.user.organizationMemberships[0].organizationId"
              as: "orgId"
      - get:
          url: "/dashboard"
          name: "dashboard-page"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Content Generation"
    weight: 40
    flow:
      - post:
          url: "/api/v1/auth/login"
          name: "login-api"
          json:
            email: "demo@agency.com"
            password: "demo123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
            - json: "$.data.user.organizationMemberships[0].organizationId"
              as: "orgId"
      - get:
          url: "/api/v1/workspaces"
          name: "get-workspaces"
          headers:
            Authorization: "Bearer {{ authToken }}"
            X-Organization-Context: "{{ orgId }}"
          capture:
            - json: "$.data.workspaces[0]._id"
              as: "workspaceId"
      - post:
          url: "/api/v1/content/generate"
          name: "content-generation"
          headers:
            Authorization: "Bearer {{ authToken }}"
            X-Organization-Context: "{{ orgId }}"
          json:
            prompt: "Create a social media post about technology trends"
            platform: "linkedin"
            contentType: "post"
            workspaceId: "{{ workspaceId }}"

  - name: "Onboarding Flow"
    weight: 20
    flow:
      - get:
          url: "/api/v1/onboarding/progress"
          name: "onboarding-progress"
          headers:
            Authorization: "Bearer {{ authToken }}"
            X-Organization-Context: "{{ orgId }}"
      - post:
          url: "/api/v1/onboarding/steps/create_workspace/complete"
          name: "complete-step"
          headers:
            Authorization: "Bearer {{ authToken }}"
            X-Organization-Context: "{{ orgId }}"
          json:
            metadata:
              timeSpent: 45000
              source: "load_test"

  - name: "Analytics"
    weight: 10
    flow:
      - get:
          url: "/api/v1/analytics/organization"
          name: "org-analytics"
          headers:
            Authorization: "Bearer {{ authToken }}"
            X-Organization-Context: "{{ orgId }}"
          qs:
            timeframe: "month"
            metrics: "content,engagement"
`;

/**
 * Performance monitoring configuration
 */
export const performanceMonitoring = {
  // Metrics to track
  metrics: [
    'response_time',
    'throughput',
    'error_rate',
    'cpu_usage',
    'memory_usage',
    'database_connections',
    'cache_hit_rate'
  ],

  // Alerting thresholds
  alerts: {
    response_time_p95: {
      threshold: 2000,
      operator: 'greater_than',
      action: 'email_alert'
    },
    error_rate: {
      threshold: 0.05, // 5%
      operator: 'greater_than',
      action: 'slack_alert'
    },
    cpu_usage: {
      threshold: 0.8, // 80%
      operator: 'greater_than',
      action: 'scale_up'
    },
    memory_usage: {
      threshold: 0.85, // 85%
      operator: 'greater_than',
      action: 'restart_service'
    }
  },

  // Dashboard configuration
  dashboard: {
    refresh_interval: 30, // seconds
    charts: [
      {
        type: 'line',
        metric: 'response_time',
        title: 'Response Time (P95)',
        timeframe: '1h'
      },
      {
        type: 'gauge',
        metric: 'error_rate',
        title: 'Error Rate',
        max_value: 0.1
      },
      {
        type: 'bar',
        metric: 'throughput',
        title: 'Requests per Second',
        timeframe: '5m'
      },
      {
        type: 'heatmap',
        metric: 'response_time_distribution',
        title: 'Response Time Distribution',
        timeframe: '1h'
      }
    ]
  }
};