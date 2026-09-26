// Centralized backend API resolution
// When running locally on localhost:3000, API calls use relative paths ('')
// When deployed on static hosts like Surge.sh, API calls target the live Cloud Run backend

export const DEFAULT_CLOUD_BACKEND = 'https://ais-dev-6xw4pc5bsvblgs5qq6r6ex-758556151517.asia-east1.run.app';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const host = window.location.hostname;

  // Custom backend URL specified by env var takes precedence
  const customUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
    return customUrl.trim().replace(/\/$/, '');
  }

  // Full-stack hosts (localhost, Vercel, Render, Cloud Run, etc.) serve their own /api routes directly
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.includes('vercel.app') ||
    host.includes('onrender.com') ||
    host.includes('run.app')
  ) {
    return '';
  }

  // Pure static frontend-only hosts (like Surge) route to external backend
  if (host.includes('surge.sh')) {
    return DEFAULT_CLOUD_BACKEND;
  }

  // Default to relative path for any custom domain deployed with the backend
  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
