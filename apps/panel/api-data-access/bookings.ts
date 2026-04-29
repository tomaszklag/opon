import { api } from '../lib/api';
import type { components } from '@opony/api-client';

// Override status: openapi-typescript emits string for Prisma enum fields
type BookingBase = components['schemas']['BookingResponseDto'];
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_CLIENT'
  | 'CANCELLED_BY_PROVIDER'
  | 'CANCELLED_BY_SYSTEM'
  | 'NO_SHOW'
  | 'REJECTED';
export type Booking = Omit<BookingBase, 'status'> & { status: BookingStatus };

export const bookingsApi = {
  list: (weekStart?: string) =>
    api.get<Booking[]>(`/v1/providers/me/bookings${weekStart ? `?weekStart=${weekStart}` : ''}`),
};
