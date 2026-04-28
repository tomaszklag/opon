import type { AuthUser } from './auth';

export type AuthRoute =
  | '/login'
  | '/register'
  | '/onboarding/zdjecia'
  | '/onboarding/weryfikacja'
  | '/dashboard'
  | '/admin/providers';

/** Returns the canonical destination for a given auth state. */
export function canonicalRoute(user: AuthUser | null): AuthRoute {
  if (!user) return '/login';
  if (user.role === 'ADMIN') return '/admin/providers';
  if (!user.providerId) return '/register';
  if (user.status === 'PENDING_DOCS' || user.status === 'PENDING_NIP') return '/onboarding/zdjecia';
  if (user.status !== 'APPROVED') return '/onboarding/weryfikacja';
  return '/dashboard';
}
