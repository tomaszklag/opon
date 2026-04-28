'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from './api';

export type UserRole = 'CLIENT' | 'PROVIDER_OWNER' | 'PROVIDER_STAFF' | 'ADMIN';

export type ProviderStatus =
  | 'PENDING_NIP'
  | 'PENDING_DOCS'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'REJECTED';

export type AuthUser = {
  sub: string;
  phone: string;
  role: UserRole;
  providerId?: string;
  status?: ProviderStatus;
  jti?: string;
};

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AuthUser };

type AuthCtx = AuthState & {
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const user = await api.get<AuthUser>('/v1/auth/me');
      setState({ status: 'authenticated', user });
      return user;
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setState({ status: 'unauthenticated' });
      }
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((user: AuthUser) => {
    setState({ status: 'authenticated', user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/v1/auth/logout');
    } finally {
      setState({ status: 'unauthenticated' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth(): AuthUser {
  const auth = useAuth();
  if (auth.status !== 'authenticated') throw new Error('Not authenticated');
  return auth.user;
}
