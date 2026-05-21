'use client';
import { useState } from 'react';
import { bookingsApi, type ManualBookingPayload } from '../../api-data-access/bookings';
import { ApiError } from '../api';

export type { ManualBookingPayload };

export type CreateBookingResult =
  | { success: true }
  | { success: false; code?: string; message: string };

export function useCreateManualBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(payload: ManualBookingPayload): Promise<CreateBookingResult> {
    setIsLoading(true);
    setError(null);
    try {
      await bookingsApi.createManual(payload);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Nie udało się utworzyć rezerwacji';
      const code = err instanceof ApiError ? err.code : undefined;
      setError(msg);
      return { success: false, code, message: msg };
    } finally {
      setIsLoading(false);
    }
  }

  return { createBooking, isLoading, error };
}
