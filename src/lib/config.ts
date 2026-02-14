/**
 * Application Configuration
 * Centralized configuration for API URLs and environment settings
 */

export const config = {
  // API URL - uses environment variable in production, localhost in development
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Environment
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // App info
  appName: 'Doc2Learn',
  appVersion: '0.1.0',
} as const

/**
 * Helper to build API URLs
 */
export function apiEndpoint(path: string): string {
  const baseUrl = config.apiUrl.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${baseUrl}/${cleanPath}`
}
