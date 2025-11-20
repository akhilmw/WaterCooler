// API utility for making authenticated requests to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  message: string;
  status?: number;
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Get token from localStorage (set by Supabase auth)
  const { data: { session } } = await import('@/app/lib/supabase').then(m => m.supabase.auth.getSession());
  return session?.access_token || null;
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw {
      message: error.detail || error.message || 'An error occurred',
      status: response.status,
    } as ApiError;
  }

  return response;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetchWithAuth(endpoint, { method: 'GET' });
    return response.json();
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  },

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetchWithAuth(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetchWithAuth(endpoint, { method: 'DELETE' });
    return response.json();
  },
};

