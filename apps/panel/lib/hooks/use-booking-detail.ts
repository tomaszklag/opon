'use client';
import useSWR from 'swr';
import { bookingsApi } from '../../api-data-access/bookings';

export function useBookingDetail(referenceCode: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['booking-detail', referenceCode],
    () => bookingsApi.getDetail(referenceCode),
    { revalidateOnFocus: false },
  );
  return { booking: data ?? null, isLoading, error, mutate };
}
