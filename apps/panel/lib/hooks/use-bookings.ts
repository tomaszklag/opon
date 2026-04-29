'use client';
import useSWR from 'swr';
import { bookingsApi, type Booking } from '../../api-data-access/bookings';

export function useBookings(weekStart: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['bookings', weekStart],
    () => bookingsApi.list(weekStart),
    { revalidateOnFocus: false },
  );
  return { bookings: (data ?? []) as Booking[], isLoading, error, mutate };
}
