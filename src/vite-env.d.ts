/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_AI_FEATURES: string
  readonly VITE_ENABLE_SOCIAL_SHARING: string
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string
  readonly VITE_POSTHOG_KEY: string
  readonly VITE_POSTHOG_HOST: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_INTERCOM_APP_ID: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_PUSHER_APP_KEY: string
  readonly VITE_PUSHER_CLUSTER: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}