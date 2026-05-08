const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = fetch(`${API_URL}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(path: string, options: ApiOptions = {}, retry = true): Promise<T> {
  const { body, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(rest.headers ?? {}),
    },
    ...(body !== undefined ? { body: isFormData ? (body as FormData) : JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Błąd sieci' }));
    const parsed = error as { message?: string; code?: string };
    throw new ApiError(res.status, parsed.message ?? 'Nieznany błąd', parsed.code);
  }

  const text = await res.text();
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isConflict() {
    return this.status === 409;
  }
  get isTooManyRequests() {
    return this.status === 429;
  }
}

export const api = {
  get: <T>(path: string, init?: ApiOptions) => request<T>(path, { method: 'GET', ...init }),
  post: <T>(path: string, body?: unknown, init?: ApiOptions) =>
    request<T>(path, { method: 'POST', body, ...init }),
  patch: <T>(path: string, body?: unknown, init?: ApiOptions) =>
    request<T>(path, { method: 'PATCH', body, ...init }),
  put: <T>(path: string, body?: unknown, init?: ApiOptions) =>
    request<T>(path, { method: 'PUT', body, ...init }),
  del: <T>(path: string, init?: ApiOptions) => request<T>(path, { method: 'DELETE', ...init }),
};
