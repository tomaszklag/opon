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
// isManual is present in BookingResponseDto backend DTO but not yet in generated schema
export type Booking = Omit<BookingBase, 'status'> & { status: BookingStatus; isManual: boolean };

type BookingDetailBase = components['schemas']['BookingDetailResponseDto'];
export type BookingClient = components['schemas']['BookingClientDto'];
export type BookingVehicle = components['schemas']['BookingVehicleDto'];
export type BookingDetail = Omit<BookingDetailBase, 'status'> & { status: BookingStatus };

export type StatusAction = 'confirm' | 'start' | 'complete' | 'cancel' | 'reject' | 'no_show';

export type AdminStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface BookingListParams {
  status?: AdminStatusFilter;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface BookingPage {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingStats {
  total: number;
  totalPrev: number | null;
  revenuePln: number;
  revenuePrevPln: number | null;
  avgValuePln: number;
  completionRate: number;
  completionRatePrev: number | null;
}

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
  listAdmin: (params: BookingListParams) => {
    const qs = new URLSearchParams();
    if (params.status && params.status !== 'all') qs.set('status', params.status);
    if (params.search) qs.set('search', params.search);
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.sortDir) qs.set('sortDir', params.sortDir);
    const q = qs.toString();
    return api.get<BookingPage>(`/v1/providers/me/bookings/summary${q ? `?${q}` : ''}`);
  },
  getStats: () => api.get<BookingStats>('/v1/providers/me/bookings/stats'),
  bulkUpdate: (ids: string[], action: 'confirm' | 'cancel') =>
    api.patch<void>('/v1/providers/me/bookings/bulk-status', { ids, action }),
  createManual: (payload: ManualBookingPayload, idempotencyKey?: string) =>
    api.post<Booking>('/v1/providers/me/bookings/manual', payload, {
      headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
    }),
  reschedule: (referenceCode: string, startAt: string, endAt: string, notifyClient: boolean) =>
    api.patch<Booking>(`/v1/providers/me/bookings/${referenceCode}/reschedule`, {
      startAt,
      endAt,
      notifyClient,
    }),
  getAvailability: (date: string, workerId?: string) => {
    const qs = workerId ? `?date=${date}&workerId=${workerId}` : `?date=${date}`;
    return api.get<AvailabilityResponse>(`/v1/providers/me/bookings/availability${qs}`);
  },
};

export interface ManualBookingPayload {
  clientName: string;
  clientPhone: string;
  startAt: string;
  endAt: string;
  tireSize?: string;
  totalPricePln?: number;
  serviceType?: string;
  workerId?: string;
  notes?: string;
  autoConfirm?: boolean;
  availabilityVersion?: string;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  isAvailable: boolean;
  conflictCount: number;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
  slotMinutes: number;
  isClosedDay: boolean;
  version: string;
}
