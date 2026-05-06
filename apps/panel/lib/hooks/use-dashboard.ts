'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProvider, type Provider } from '../../api-data-access/providers';
import { ApiError } from '../api';
import { canonicalRoute } from '../auth-routing';
import { useAuth } from '../auth';

export type ProviderStatus = Provider['status'];

export const STATUS_LABEL: Record<ProviderStatus, string> = {
  PENDING_NIP: 'Oczekuje na NIP',
  PENDING_DOCS: 'Oczekuje na dokumenty',
  PENDING_APPROVAL: 'Oczekuje na weryfikację',
  APPROVED: 'Aktywna',
  SUSPENDED: 'Zawieszona',
  REJECTED: 'Odrzucona',
  PENDING_DELETION: 'Oczekuje na usunięcie',
};

export function useDashboard() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.status === 'authenticated' ? auth.user : null;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status === 'loading') return;
    const target = canonicalRoute(user);
    if (target !== '/dashboard') {
      router.replace(target);
    }
  }, [user, auth.status, router]);

  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    getProvider()
      .then(setProvider)
      .catch((err) => {
        if (err instanceof ApiError && (err.code === 'PROVIDER_NOT_FOUND' || err.status === 404)) {
          router.replace('/register');
        }
      })
      .finally(() => setLoading(false));
  }, [auth.status, router]);

  return { provider, loading, authLoading: auth.status === 'loading' };
}
