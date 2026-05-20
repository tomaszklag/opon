import { api } from './client';

// TODO: replace with components['schemas']['AppBookingResponseDto'] after BE /v1/app/bookings implementation
export interface AppBooking {
  id: string;
  bookingCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
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

// TODO: replace with components['schemas']['CreateAppBookingDto'] after BE implementation
export interface CreateBookingDto {
  providerId: string;
  slotId: string;
  vehicleId: string;
  address?: string;
}

export const listBookings = (status?: string) =>
  api.get<AppBooking[]>('/v1/app/bookings', status ? { status } : undefined);

export const getBooking = (id: string) => api.get<AppBooking>(`/v1/app/bookings/${id}`);

export const createBooking = (dto: CreateBookingDto) =>
  api.post<AppBooking>('/v1/app/bookings', dto);

export const cancelBooking = (id: string) => api.post<AppBooking>(`/v1/app/bookings/${id}/cancel`);
