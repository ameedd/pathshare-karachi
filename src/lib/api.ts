// Centralized backend API resolution
// When running locally on localhost:3000, API calls use relative paths ('')
// When deployed on static hosts like Surge.sh, API calls target the live Cloud Run backend

export const DEFAULT_CLOUD_BACKEND = 'https://ais-dev-6xw4pc5bsvblgs5qq6r6ex-758556151517.asia-east1.run.app';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const host = window.location.hostname;
  // If running locally, use relative path to localhost Express server
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return '';
  }

  // If running on AI Studio Cloud Run dev/preview server directly
  if (host.includes('run.app')) {
    return '';
  }

  // If deployed to Surge or external static domain, route to Cloud Run backend
  const customUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
    return customUrl.trim().replace(/\/$/, '');
  }

  return DEFAULT_CLOUD_BACKEND;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
