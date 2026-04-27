'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth';
import { canonicalRoute, type AuthRoute } from '../auth-routing';

/**
 * Guard hook for protected pages.
 * Redirects to the user's canonical route if it doesn't match pageRoute.
 *
 * Usage: call at the top of every protected page component.
 * Return value: use isLoading to show a spinner while auth resolves.
 */
export function useAuthGuard(pageRoute: AuthRoute) {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.status === 'authenticated' ? auth.user : null;
  const isLoading = auth.status === 'loading';

  useEffect(() => {
    if (isLoading) return;
    const target = canonicalRoute(user);
    if (target !== pageRoute) router.replace(target);
  }, [user, isLoading, router, pageRoute]);

  return { isLoading, user };
}
