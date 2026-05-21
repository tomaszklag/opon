import { secureStorage } from '../lib/secure-storage';
import { ApiError } from '../lib/error';
import { useAuthStore } from '../stores/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL is not set');

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function tryRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }
  isRefreshing = true;
  try {
    const refreshToken = await secureStorage.getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { accessToken: string; refreshToken?: string };
    await secureStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) await secureStorage.setRefreshToken(data.refreshToken);
    refreshQueue.forEach((cb) => cb(data.accessToken));
    return data.accessToken;
  } catch {
    refreshQueue.forEach((cb) => cb(null));
    return null;
  } finally {
    refreshQueue = [];
    isRefreshing = false;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await secureStorage.getAccessToken();

  const makeRequest = async (authToken: string | null): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...init.headers,
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401 && token) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      useAuthStore.getState().logout();
      await secureStorage.clearAll();
      throw new ApiError(401, {
        code: 'SESSION_EXPIRED',
        message: 'Sesja wygasła. Zaloguj się ponownie.',
      });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : path;
    return request<T>(url, { method: 'GET' });
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
