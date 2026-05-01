'use client';
import useSWR from 'swr';
import { bookingsApi, type AvailabilityResponse } from '../../api-data-access/bookings';

export function useAvailability(date: string | null, workerId?: string) {
  const key = date ? ['availability', date, workerId ?? ''] : null;
  const { data, error, isLoading } = useSWR(
    key,
    () => bookingsApi.getAvailability(date!, workerId),
    { revalidateOnFocus: false },
  );
  return { availability: data ?? null, isLoading, error };
}

export type { AvailabilityResponse };
