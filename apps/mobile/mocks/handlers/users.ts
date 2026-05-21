import { http, HttpResponse } from 'msw';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const mockUser = {
  id: 'user-1',
  phone: '+48123456789',
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com',
  role: 'CLIENT',
};

const mockVehicles = [
  {
    id: 'vehicle-1',
    nickname: 'Moja Skoda',
    make: 'Skoda',
    model: 'Octavia',
    year: 2019,
    tireSize: '205/55 R16',
  },
  {
    id: 'vehicle-2',
    nickname: null,
    make: 'Toyota',
    model: 'Corolla',
    year: 2021,
    tireSize: '195/65 R15',
  },
];

export const usersHandlers = [
  http.get(`${BASE}/v1/app/users/me`, () => HttpResponse.json(mockUser)),

  http.patch(`${BASE}/v1/app/users/me`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  http.get(`${BASE}/v1/app/users/me/vehicles`, () => HttpResponse.json(mockVehicles)),

  http.post(`${BASE}/v1/app/users/me/vehicles`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newVehicle = { id: `vehicle-${Date.now()}`, nickname: null, ...body };
    return HttpResponse.json(newVehicle, { status: 201 });
  }),

  http.delete(
    `${BASE}/v1/app/users/me/vehicles/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
