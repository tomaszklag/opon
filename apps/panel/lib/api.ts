const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Błąd sieci' }));
    throw new ApiError(res.status, (error as { message?: string }).message ?? 'Nieznany błąd');
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
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
