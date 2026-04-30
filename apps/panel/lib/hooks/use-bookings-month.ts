'use client';
import useSWR from 'swr';
import { bookingsApi, type Booking } from '../../api-data-access/bookings';

export function useBookingsMonth(weekStarts: string[]) {
  const key = weekStarts.length > 0 ? ['bookings-month', ...weekStarts] : null;
  const { data, error, isLoading } = useSWR(
    key,
    () => Promise.all(weekStarts.map((ws) => bookingsApi.list(ws))).then((r) => r.flat()),
    { revalidateOnFocus: false },
  );
  return { bookings: (data ?? []) as Booking[], isLoading, error };
}
