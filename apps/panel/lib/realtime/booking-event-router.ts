import { mutate } from 'swr';

interface BookingCreatedPayload {
  bookingId: string;
  referenceCode: string;
  weekStart: string;
}

interface BookingStatusChangedPayload {
  bookingId: string;
  referenceCode: string;
  weekStart: string;
  newStatus: string;
}

interface BookingBulkStatusChangedPayload {
  ids: string[];
  action: string;
}

interface RealtimeEvent {
  type: string;
  payload: BookingCreatedPayload | BookingStatusChangedPayload | BookingBulkStatusChangedPayload;
  ts: string;
}

export function routeBookingEvent(event: RealtimeEvent): void {
  const { type, payload } = event;

  if (type === 'booking.created') {
    const p = payload as BookingCreatedPayload;
    mutate(['bookings', p.weekStart]);
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings-month');
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
  } else if (type === 'booking.status_changed') {
    const p = payload as BookingStatusChangedPayload;
    mutate(['bookings', p.weekStart]);
    mutate(['booking-detail', p.referenceCode]);
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'availability');
  } else if (type === 'booking.bulk_status_changed') {
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings-month');
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
  }
}
