import { User } from '../types';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredAuth(token?: string | null, user?: User | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = getStoredToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function wrapResponseWithSafeJson(res: Response): Response {
  return res;
}

export async function safeParseJson<T = any>(res: Response): Promise<T | null> {
  try {
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.error('safeParseJson error:', err);
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string> || {})
  };

  // Only attach application/json Content-Type if body is present and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers
    });

    if (res.status === 401 && (url.includes('/api/auth/me') || url.includes('/api/user/profile'))) {
      clearStoredAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth_unauthorized'));
      }
    }

    return res;
  } catch (err) {
    console.warn(`apiFetch network error for ${url}:`, err);
    return new Response(
      JSON.stringify({ error: 'Network or server error', message: String(err) }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
