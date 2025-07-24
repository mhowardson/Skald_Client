interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  api: {
    baseUrl: string;
    version: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    aiFeatures: boolean;
    socialSharing: boolean;
    realTimeUpdates: boolean;
  };
  external: {
    sentryDsn?: string;
    googleAnalyticsId?: string;
    hotjarId?: string;
  };
  development: {
    mockApi: boolean;
    debugMode: boolean;
    logLevel: string;
  };
}

const getConfig = (): AppConfig => {
  // Get environment variables with fallbacks
  const apiHost = import.meta.env.VITE_API_HOST || 'localhost';
  const apiPort = import.meta.env.VITE_API_PORT || '3001';
  const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'http';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${apiProtocol}://${apiHost}:${apiPort}`;

  return {
    app: {
      name: import.meta.env.VITE_APP_NAME || 'ContentAutoPilot',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_NODE_ENV || 'development',
    },
    api: {
      baseUrl: apiBaseUrl,
      version: import.meta.env.VITE_API_VERSION || 'v1',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    features: {
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
      socialSharing: import.meta.env.VITE_ENABLE_SOCIAL_SHARING === 'true',
      realTimeUpdates: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
    },
    external: {
      sentryDsn: import.meta.env.VITE_SENTRY_DSN,
      googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
      hotjarId: import.meta.env.VITE_HOTJAR_ID,
    },
    development: {
      mockApi: import.meta.env.VITE_MOCK_API === 'true',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    },
  };
};

export const config = getConfig();

// Type declarations for Vite define variables
declare global {
  const __APP_NAME__: string;
  const __APP_VERSION__: string;
  const __API_BASE_URL__: string;
}

export default config;