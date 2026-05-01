'use client';
import { useState } from 'react';
import { bookingsApi, type ManualBookingPayload } from '../../api-data-access/bookings';

export type { ManualBookingPayload };

export function useCreateManualBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(payload: ManualBookingPayload): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await bookingsApi.createManual(payload);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nie udało się utworzyć rezerwacji';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { createBooking, isLoading, error };
}
