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

type BookingDetailBase = components['schemas']['BookingDetailResponseDto'];
export type BookingClient = components['schemas']['BookingClientDto'];
export type BookingVehicle = components['schemas']['BookingVehicleDto'];
export type BookingDetail = Omit<BookingDetailBase, 'status'> & { status: BookingStatus };

export type StatusAction = 'confirm' | 'start' | 'complete' | 'cancel' | 'reject' | 'no_show';

export const bookingsApi = {
  list: (weekStart?: string) =>
    api.get<Booking[]>(`/v1/providers/me/bookings${weekStart ? `?weekStart=${weekStart}` : ''}`),
  getDetail: (referenceCode: string) =>
    api.get<BookingDetail>(`/v1/providers/me/bookings/${referenceCode}`),
  updateStatus: (referenceCode: string, action: StatusAction, reason?: string) =>
    api.patch<BookingDetail>(`/v1/providers/me/bookings/${referenceCode}/status`, {
      action,
      reason,
    }),
};
