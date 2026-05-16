'use client';
import useSWR from 'swr';
import { bookingsApi } from '../../api-data-access/bookings';

export function useBookingDetail(referenceCode: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    referenceCode ? ['booking-detail', referenceCode] : null,
    () => bookingsApi.getDetail(referenceCode!),
    { revalidateOnFocus: false },
  );
  return { booking: data ?? null, isLoading, error, mutate };
}
