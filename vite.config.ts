import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const apiHost = env.VITE_API_HOST || 'localhost'
  const apiPort = env.VITE_API_PORT || '3000'
  const apiProtocol = env.VITE_API_PROTOCOL || 'http'
  const apiBaseUrl = env.VITE_API_BASE_URL || `${apiProtocol}://${apiHost}:${apiPort}`
  
  const webHost = env.VITE_WEB_HOST || 'localhost'
  const webPort = parseInt(env.VITE_WEB_PORT || '5173')
  
  return {
    plugins: [react()],
    server: {
      host: webHost,
      port: webPort,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: apiProtocol === 'https'
        }
      }
    },
    define: {
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'ContentAutoPilot'),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    }
  }
})