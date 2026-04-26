'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';

export type ProviderStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export interface DashboardProvider {
  id: string;
  name: string;
  status: ProviderStatus;
  city: string;
  voivodeship: string;
  phone: string;
  email?: string;
  nip: string;
}

export const STATUS_LABEL: Record<ProviderStatus, string> = {
  PENDING: 'Oczekuje na weryfikację',
  APPROVED: 'Aktywna',
  SUSPENDED: 'Zawieszona',
};

export function useDashboard() {
  const router = useRouter();
  const { status } = useAuth();

  const [provider, setProvider] = useState<DashboardProvider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    api
      .get<DashboardProvider>('/v1/providers/me')
      .then(setProvider)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) router.replace('/register');
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  return { provider, loading, authLoading: status === 'loading' };
}
