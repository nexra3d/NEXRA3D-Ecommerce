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
  const originalJson = res.json.bind(res);
  res.json = async () => {
    let clone: Response | null = null;
    try {
      clone = res.clone();
    } catch {
      // ignore clone error if stream already consumed
    }
    try {
      return await originalJson();
    } catch (err) {
      if (clone) {
        try {
          const text = await clone.text();
          if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
            return JSON.parse(text);
          }
          return { error: text || res.statusText || 'Response parse error', message: text, status: res.status };
        } catch {
          // ignore
        }
      }
      return { error: 'Invalid JSON response', status: res.status };
    }
  };
  return res;
}

export async function safeParseJson<T = any>(res: Response): Promise<T | null> {
  try {
    const data = await res.json();
    return data as T;
  } catch {
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers || {})
  };

  // If body is FormData, browser auto-sets Content-Type boundary
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers
    });

    if (res.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/register') && !url.includes('/api/auth/me')) {
      clearStoredAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth_unauthorized'));
      }
    }

    return wrapResponseWithSafeJson(res);
  } catch (err) {
    // Return a synthetic Response object if fetch fails completely (e.g. network failure)
    const errorResponse = new Response(
      JSON.stringify({ error: 'Network or server error', message: String(err) }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
    return wrapResponseWithSafeJson(errorResponse);
  }
}
