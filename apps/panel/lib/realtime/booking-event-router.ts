import { mutate } from 'swr';
import { toast } from '@opony/design-system-web';

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

interface RealtimeEvent {
  type: string;
  payload: unknown;
  ts: string;
}

const CANCELATION_STATUSES = new Set([
  'CANCELLED_BY_CLIENT',
  'CANCELLED_BY_PROVIDER',
  'CANCELLED_BY_SYSTEM',
]);

export function routeBookingEvent(event: RealtimeEvent): void {
  const { type, payload } = event;

  if (type === 'booking.created') {
    const p = payload as BookingCreatedPayload;
    mutate(['bookings', p.weekStart]);
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings-month');
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
    toast.success(`Nowa rezerwacja #${p.referenceCode}`, { duration: 6000 });
  } else if (type === 'booking.status_changed') {
    const p = payload as BookingStatusChangedPayload;
    mutate(['bookings', p.weekStart]);
    mutate(['booking-detail', p.referenceCode]);
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'availability');
    if (CANCELATION_STATUSES.has(p.newStatus)) {
      toast.error(`Rezerwacja #${p.referenceCode} anulowana`, { duration: 6000 });
    }
  } else if (type === 'booking.bulk_status_changed') {
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'bookings-month');
    mutate('booking-stats');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-count');
    mutate((key: unknown) => Array.isArray(key) && key[0] === 'booking-admin');
  } else if (type === 'worker-task.created') {
    const p = payload as unknown as { taskId: string; weekStart: string };
    void mutate(['worker-tasks', p.weekStart]);
  } else if (type === 'worker-task.deleted') {
    const p = payload as unknown as { taskId: string; weekStart: string };
    void mutate(['worker-tasks', p.weekStart]);
  }
}
