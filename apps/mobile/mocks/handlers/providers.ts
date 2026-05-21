import { http, HttpResponse } from 'msw';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const mockProviders = [
  {
    id: 'provider-1',
    name: 'Serwis Opon Kowalski',
    type: 'STATIONARY',
    logoUrl: null,
    tagline: 'Profesjonalna wymiana opon od 2005 roku',
    address: 'ul. Lipowa 12, Nowy Sącz',
    cityCenterLat: 49.6237,
    cityCenterLng: 20.6983,
    serviceRadiusKm: 0,
    avgRating: 4.8,
    reviewCount: 124,
    description:
      'Specjalizujemy się w wymianie i przechowywaniu opon dla samochodów osobowych i dostawczych. Dysponujemy nowoczesnym sprzętem do wyważania kół.',
    phone: '+48123456789',
    showPhone: true,
    vehicleTypes: ['osobowy', 'dostawczy'],
    tireSizes: ['195/65 R15', '205/55 R16', '225/45 R17'],
    additionalServices: ['Przechowywanie opon', 'TPMS'],
  },
  {
    id: 'provider-2',
    name: 'MobilTire - Dojazd do Klienta',
    type: 'MOBILE',
    logoUrl: null,
    tagline: 'Wymieniamy opony tam gdzie jesteś',
    address: null,
    cityCenterLat: 49.6237,
    cityCenterLng: 20.6983,
    serviceRadiusKm: 20,
    avgRating: 4.6,
    reviewCount: 58,
    description:
      'Mobilna wymiana opon w całym powiecie nowosądeckim. Dojeżdżamy pod dom, do pracy lub miejsca awarii.',
    phone: '+48987654321',
    showPhone: true,
    vehicleTypes: ['osobowy'],
    tireSizes: ['185/65 R14', '195/65 R15', '205/55 R16'],
    additionalServices: [],
  },
  {
    id: 'provider-3',
    name: 'AutoCenter Plus',
    type: 'BOTH',
    logoUrl: null,
    tagline: null,
    address: 'ul. Przemysłowa 7, Nowy Sącz',
    cityCenterLat: 49.6137,
    cityCenterLng: 20.7083,
    serviceRadiusKm: 15,
    avgRating: 4.3,
    reviewCount: 31,
    description: null,
    phone: '+48111222333',
    showPhone: false,
    vehicleTypes: ['osobowy', 'SUV', 'dostawczy'],
    tireSizes: ['195/65 R15', '205/55 R16', '225/45 R17', '235/40 R18'],
    additionalServices: ['TPMS', 'Przechowywanie opon'],
  },
];

const mockSlots = [
  {
    id: 'slot-1',
    startAt: '2026-05-21T08:00:00.000Z',
    endAt: '2026-05-21T09:00:00.000Z',
    available: true,
  },
  {
    id: 'slot-2',
    startAt: '2026-05-21T09:00:00.000Z',
    endAt: '2026-05-21T10:00:00.000Z',
    available: false,
  },
  {
    id: 'slot-3',
    startAt: '2026-05-21T10:00:00.000Z',
    endAt: '2026-05-21T11:00:00.000Z',
    available: true,
  },
  {
    id: 'slot-4',
    startAt: '2026-05-21T11:00:00.000Z',
    endAt: '2026-05-21T12:00:00.000Z',
    available: true,
  },
  {
    id: 'slot-5',
    startAt: '2026-05-21T13:00:00.000Z',
    endAt: '2026-05-21T14:00:00.000Z',
    available: true,
  },
  {
    id: 'slot-6',
    startAt: '2026-05-21T14:00:00.000Z',
    endAt: '2026-05-21T15:00:00.000Z',
    available: false,
  },
];

export const providersHandlers = [
  http.get(`${BASE}/v1/app/providers`, ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const filtered = type
      ? mockProviders.filter((p) => p.type === type || p.type === 'BOTH')
      : mockProviders;
    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 30,
    });
  }),

  http.get(`${BASE}/v1/app/providers/:id`, ({ params }) => {
    const provider = mockProviders.find((p) => p.id === params.id);
    if (!provider) return HttpResponse.json({ message: 'Nie znaleziono' }, { status: 404 });
    return HttpResponse.json(provider);
  }),

  http.get(`${BASE}/v1/app/providers/:id/slots`, () => HttpResponse.json(mockSlots)),

  http.post(`${BASE}/v1/app/providers/:id/waitlist`, ({ params }) => {
    return HttpResponse.json(
      { providerId: params.id, createdAt: new Date().toISOString() },
      { status: 201 },
    );
  }),
];
