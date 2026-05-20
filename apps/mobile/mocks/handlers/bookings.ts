import { http, HttpResponse } from 'msw';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface MockBooking {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  provider: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  };
  slot: {
    id: string;
    startAt: string;
    endAt: string;
  };
  vehicleTireSize: string;
  note: string | null;
  createdAt: string;
}

const mockBookings: MockBooking[] = [
  {
    id: 'booking-1',
    bookingCode: 'OPN-1234',
    status: 'CONFIRMED',
    provider: {
      id: 'provider-1',
      name: 'Serwis Opon Kowalski',
      address: 'ul. Lipowa 12, Nowy Sącz',
      phone: '+48123456789',
    },
    slot: {
      id: 'slot-3',
      startAt: '2026-05-28T10:00:00.000Z',
      endAt: '2026-05-28T11:00:00.000Z',
    },
    vehicleTireSize: '205/55 R16',
    note: null,
    createdAt: '2026-05-20T08:00:00.000Z',
  },
  {
    id: 'booking-2',
    bookingCode: 'OPN-5678',
    status: 'PENDING',
    provider: {
      id: 'provider-2',
      name: 'MobilTire - Dojazd do Klienta',
      address: null,
      phone: '+48987654321',
    },
    slot: {
      id: 'slot-5',
      startAt: '2026-05-30T13:00:00.000Z',
      endAt: '2026-05-30T14:00:00.000Z',
    },
    vehicleTireSize: '195/65 R15',
    note: null,
    createdAt: '2026-05-20T09:30:00.000Z',
  },
  {
    id: 'booking-3',
    bookingCode: 'OPN-9012',
    status: 'COMPLETED',
    provider: {
      id: 'provider-1',
      name: 'Serwis Opon Kowalski',
      address: 'ul. Lipowa 12, Nowy Sącz',
      phone: '+48123456789',
    },
    slot: {
      id: 'slot-old-1',
      startAt: '2026-04-15T09:00:00.000Z',
      endAt: '2026-04-15T10:00:00.000Z',
    },
    vehicleTireSize: '205/55 R16',
    note: 'Proszę o sprawdzenie ciśnienia w oponach.',
    createdAt: '2026-04-10T14:00:00.000Z',
  },
];

let bookingIdCounter = mockBookings.length + 1;

function generateBookingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `OPN-${num}`;
}

export const bookingsHandlers = [
  http.get(`${BASE}/v1/app/bookings`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filtered = status ? mockBookings.filter((b) => b.status === status) : mockBookings;
    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE}/v1/app/bookings/:id`, ({ params }) => {
    const booking = mockBookings.find((b) => b.id === params.id);
    if (!booking) return HttpResponse.json({ message: 'Nie znaleziono' }, { status: 404 });
    return HttpResponse.json(booking);
  }),

  http.post(`${BASE}/v1/app/bookings`, async ({ request }) => {
    const body = (await request.json()) as {
      providerId: string;
      slotId: string;
      vehicleId: string;
      address?: string;
    };

    // Symulacja konfliktu dla slot-2 (slot niedostępny w mockSlots)
    if (body.slotId === 'slot-2') {
      return HttpResponse.json(
        { message: 'Termin jest już zajęty', code: 'SLOT_ALREADY_BOOKED' },
        { status: 409 },
      );
    }

    const providerMap: Record<
      string,
      { name: string; address: string | null; phone: string | null }
    > = {
      'provider-1': {
        name: 'Serwis Opon Kowalski',
        address: 'ul. Lipowa 12, Nowy Sącz',
        phone: '+48123456789',
      },
      'provider-2': { name: 'MobilTire - Dojazd do Klienta', address: null, phone: '+48987654321' },
      'provider-3': {
        name: 'AutoCenter Plus',
        address: 'ul. Przemysłowa 7, Nowy Sącz',
        phone: '+48111222333',
      },
    };

    const provider = providerMap[body.providerId] ?? {
      name: 'Nieznany warsztat',
      address: null,
      phone: null,
    };

    const newBooking: MockBooking = {
      id: `booking-${++bookingIdCounter}`,
      bookingCode: generateBookingCode(),
      status: 'PENDING',
      provider: { id: body.providerId, ...provider },
      slot: {
        id: body.slotId,
        startAt: '2026-05-21T10:00:00.000Z',
        endAt: '2026-05-21T11:00:00.000Z',
      },
      vehicleTireSize: '205/55 R16',
      note: null,
      createdAt: new Date().toISOString(),
    };

    mockBookings.unshift(newBooking);
    return HttpResponse.json(newBooking, { status: 201 });
  }),

  http.post(`${BASE}/v1/app/bookings/:id/cancel`, ({ params }) => {
    const booking = mockBookings.find((b) => b.id === params.id);
    if (!booking) return HttpResponse.json({ message: 'Nie znaleziono' }, { status: 404 });
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return HttpResponse.json({ message: 'Nie można anulować tej rezerwacji' }, { status: 409 });
    }
    booking.status = 'CANCELLED';
    return HttpResponse.json(booking);
  }),
];
