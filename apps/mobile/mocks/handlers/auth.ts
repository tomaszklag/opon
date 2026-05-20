import { http, HttpResponse } from 'msw';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const authHandlers = [
  http.post(`${BASE}/v1/auth/request-otp`, () =>
    HttpResponse.json({ message: 'Kod OTP wysłany', expiresIn: 300 }),
  ),

  http.post(`${BASE}/v1/auth/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as { phone: string; code: string };
    if (body.code === '000000') {
      return HttpResponse.json({ message: 'Nieprawidłowy kod' }, { status: 404 });
    }
    const isNewUser = body.code === '111111';
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'user-1',
        phone: body.phone,
        firstName: isNewUser ? null : 'Jan',
        lastName: isNewUser ? null : 'Kowalski',
        email: null,
        role: 'CLIENT',
      },
      requiresConsent: false,
      isNewUser,
    });
  }),

  http.post(`${BASE}/v1/auth/refresh`, () =>
    HttpResponse.json({
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-rotated',
    }),
  ),

  http.post(`${BASE}/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${BASE}/v1/app/users/me/consent`, () => new HttpResponse(null, { status: 204 })),
];
