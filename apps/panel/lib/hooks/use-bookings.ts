'use client';
import useSWR from 'swr';
import { bookingsApi, type Booking } from '../../api-data-access/bookings';

export function useBookings(weekStart: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    weekStart ? ['bookings', weekStart] : null,
    weekStart ? () => bookingsApi.list(weekStart) : null,
    { revalidateOnFocus: false },
  );
  return { bookings: (data ?? []) as Booking[], isLoading, error, mutate };
}
