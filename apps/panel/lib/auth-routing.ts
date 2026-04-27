import type { AuthUser } from './auth';

export type AuthRoute = '/login' | '/register' | '/onboarding/weryfikacja' | '/dashboard';

/** Returns the canonical destination for a given auth state. */
export function canonicalRoute(user: AuthUser | null): AuthRoute {
  if (!user) return '/login';
  if (!user.providerId) return '/register';
  if (user.status !== 'APPROVED') return '/onboarding/weryfikacja';
  return '/dashboard';
}
