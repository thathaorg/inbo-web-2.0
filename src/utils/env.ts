/**
 * Environment variables helper
 */
export const env = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://inbo-django-api.azurewebsites.net',
  
  // App Configuration
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || 'inbo.app',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // Deep Linking
  DEEP_LINK_SCHEME: process.env.NEXT_PUBLIC_DEEP_LINK_SCHEME || 'inbo://',
  
  // CORS
  ALLOWED_ORIGIN: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

