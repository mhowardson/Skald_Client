/**
 * Real User Monitoring (RUM) Setup
 * 
 * Configures performance monitoring for production usage.
 */

export interface RUMConfig {
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate: number;
  enabledMetrics: string[];
  thresholds: Record<string, number>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  additional?: Record<string, any>;
}

/**
 * Real User Monitoring class for tracking performance in production
 */
export class RealUserMonitoring {
  private config: RUMConfig;
  private sessionId: string;
  private userId?: string;
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceMetric[] = [];
  private sendQueue: PerformanceMetric[] = [];

  constructor(config: RUMConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObservers();
    this.setupUnloadHandler();
    this.startPeriodicReporting();
  }

  /**
   * Initialize RUM with user context
   */
  public setUserContext(userId: string, additionalData?: Record<string, any>) {
    this.userId = userId;
    
    // Send user session start metric
    this.recordMetric('session_start', 1, {
      userId,
      ...additionalData
    });
  }

  /**
   * Record custom metric
   */
  public recordMetric(name: string, value: number, additional?: Record<string, any>) {
    if (!this.shouldSample()) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      additional
    };

    this.metrics.push(metric);
    this.sendQueue.push(metric);

    // Check thresholds
    this.checkThreshold(name, value);

    // Send immediately for critical metrics
    if (this.isCriticalMetric(name)) {
      this.sendMetrics([metric]);
    }
  }

  /**
   * Record user interaction
   */
  public recordInteraction(type: string, target: string, duration?: number) {
    this.recordMetric('user_interaction', duration || 1, {
      interactionType: type,
      targetElement: target,
      timestamp: Date.now()
    });
  }

  /**
   * Record page navigation
   */
  public recordNavigation(from: string, to: string, duration: number) {
    this.recordMetric('navigation', duration, {
      fromUrl: from,
      toUrl: to,
      navigationType: this.getNavigationType()
    });
  }

  /**
   * Record error
   */
  public recordError(error: Error, context?: Record<string, any>) {
    this.recordMetric('error', 1, {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context
    });
  }

  /**
   * Set up performance observers for Core Web Vitals
   */
  private setupPerformanceObservers() {
    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }

      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric('lcp', entry.startTime, {
              elementType: entry.element?.tagName,
              elementId: entry.element?.id,
              url: entry.url
            });
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          this.recordMetric('cls', clsScore);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime, {
              interactionType: entry.name,
              target: entry.target?.tagName
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Long Tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long_task', entry.duration, {
              startTime: entry.startTime,
              name: entry.name
            });
          });
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }

    // Navigation timing
    this.recordNavigationTiming();

    // Resource timing
    this.recordResourceTiming();
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
        this.recordMetric('load_complete', navigation.loadEventEnd - navigation.navigationStart);
        this.recordMetric('dom_processing', navigation.domComplete - navigation.domLoading);
        
        // Connection timing
        if (navigation.connectEnd && navigation.connectStart) {
          this.recordMetric('connection_time', navigation.connectEnd - navigation.connectStart);
        }
        
        // DNS timing
        if (navigation.domainLookupEnd && navigation.domainLookupStart) {
          this.recordMetric('dns_time', navigation.domainLookupEnd - navigation.domainLookupStart);
        }
      }
    });
  }

  /**
   * Record resource timing for critical resources
   */
  private recordResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach((resource) => {
        // Track critical resources only
        if (this.isCriticalResource(resource.name)) {
          this.recordMetric('resource_load_time', resource.responseEnd - resource.startTime, {
            resourceUrl: resource.name,
            resourceType: this.getResourceType(resource.name),
            size: resource.transferSize,
            fromCache: resource.transferSize === 0
          });
        }
      });
    });
  }

  /**
   * Set up page unload handler to send remaining metrics
   */
  private setupUnloadHandler() {
    const sendFinalMetrics = () => {
      if (this.sendQueue.length > 0) {
        // Use sendBeacon for reliable delivery
        this.sendMetricsViaBeacon(this.sendQueue);
      }
    };

    window.addEventListener('beforeunload', sendFinalMetrics);
    window.addEventListener('pagehide', sendFinalMetrics);
    
    // For single-page apps
    if ('onpagehide' in window) {
      window.addEventListener('pagehide', sendFinalMetrics);
    }
  }

  /**
   * Start periodic reporting of metrics
   */
  private startPeriodicReporting() {
    setInterval(() => {
      if (this.sendQueue.length > 0) {
        const metricsToSend = [...this.sendQueue];
        this.sendQueue = [];
        this.sendMetrics(metricsToSend);
      }
    }, 30000); // Send every 30 seconds
  }

  /**
   * Send metrics to collection endpoint
   */
  private async sendMetrics(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) return;

    try {
      const response = await fetch('/api/v1/analytics/rum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          metrics,
          environment: this.config.environment,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        console.warn('Failed to send RUM metrics:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending RUM metrics:', error);
    }
  }

  /**
   * Send metrics via navigator.sendBeacon for page unload
   */
  private sendMetricsViaBeacon(metrics: PerformanceMetric[]) {
    if ('sendBeacon' in navigator && metrics.length > 0) {
      const data = JSON.stringify({
        metrics,
        environment: this.config.environment,
        timestamp: Date.now()
      });

      navigator.sendBeacon('/api/v1/analytics/rum', data);
    }
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(metricName: string, value: number) {
    const threshold = this.config.thresholds[metricName];
    if (threshold && value > threshold) {
      this.recordMetric('threshold_exceeded', value, {
        metricName,
        threshold,
        severity: value > threshold * 1.5 ? 'high' : 'medium'
      });
    }
  }

  /**
   * Determine if this is a critical metric that should be sent immediately
   */
  private isCriticalMetric(metricName: string): boolean {
    return ['error', 'threshold_exceeded', 'long_task'].includes(metricName);
  }

  /**
   * Determine if this is a critical resource to track
   */
  private isCriticalResource(url: string): boolean {
    return url.includes('.js') || 
           url.includes('.css') || 
           url.includes('/api/') ||
           url.includes('fonts');
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('/api/')) return 'api';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  /**
   * Get navigation type
   */
  private getNavigationType(): string {
    if ('navigation' in performance) {
      const nav = (performance as any).navigation;
      switch (nav.type) {
        case 0: return 'navigate';
        case 1: return 'reload';
        case 2: return 'back_forward';
        default: return 'other';
      }
    }
    return 'unknown';
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if this request should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Clean up observers
   */
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Default RUM configuration
 */
export const defaultRUMConfig: RUMConfig = {
  apiKey: process.env.REACT_APP_RUM_API_KEY || 'development-key',
  environment: (process.env.NODE_ENV as any) || 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in prod
  enabledMetrics: [
    'fcp',
    'lcp', 
    'cls',
    'fid',
    'ttfb',
    'dom_content_loaded',
    'load_complete',
    'resource_load_time',
    'user_interaction',
    'navigation',
    'error',
    'long_task'
  ],
  thresholds: {
    'fcp': 2000,          // 2 seconds
    'lcp': 4000,          // 4 seconds  
    'cls': 0.1,           // 0.1 CLS score
    'fid': 100,           // 100ms
    'ttfb': 600,          // 600ms
    'long_task': 50,      // 50ms
    'resource_load_time': 3000 // 3 seconds
  }
};

/**
 * Initialize RUM monitoring
 */
export function initializeRUM(config: Partial<RUMConfig> = {}): RealUserMonitoring {
  const finalConfig = { ...defaultRUMConfig, ...config };
  return new RealUserMonitoring(finalConfig);
}

/**
 * React Hook for RUM integration
 */
export function useRUM() {
  const [rum, setRum] = useState<RealUserMonitoring | null>(null);

  useEffect(() => {
    const rumInstance = initializeRUM();
    setRum(rumInstance);

    return () => {
      rumInstance.destroy();
    };
  }, []);

  const recordInteraction = useCallback((type: string, target: string, duration?: number) => {
    rum?.recordInteraction(type, target, duration);
  }, [rum]);

  const recordError = useCallback((error: Error, context?: Record<string, any>) => {
    rum?.recordError(error, context);
  }, [rum]);

  const recordMetric = useCallback((name: string, value: number, additional?: Record<string, any>) => {
    rum?.recordMetric(name, value, additional);
  }, [rum]);

  return {
    rum,
    recordInteraction,
    recordError,
    recordMetric
  };
}