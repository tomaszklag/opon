'use client';
import useSWR from 'swr';
import {
  bookingsApi,
  type BookingPage,
  type BookingStats,
  type BookingListParams,
} from '../../api-data-access/bookings';

export function useBookingAdmin(params: BookingListParams) {
  const key = ['booking-admin', JSON.stringify(params)];
  const { data, error, isLoading, mutate } = useSWR<BookingPage>(
    key,
    () => bookingsApi.listAdmin(params),
    { revalidateOnFocus: false, keepPreviousData: true },
  );
  return { page: data, isLoading, error, mutate };
}

export function useBookingStats() {
  const { data, error, isLoading } = useSWR<BookingStats>(
    'booking-stats',
    () => bookingsApi.getStats(),
    { revalidateOnFocus: false },
  );
  return { stats: data, isLoading, error };
}

// Each tab is always rendered in the same order — not truly conditional
export function useBookingTabCounts() {
  const pendingResult = useSWR(
    ['booking-count', 'pending'],
    () => bookingsApi.listAdmin({ status: 'pending', pageSize: 1, page: 1 }),
    { revalidateOnFocus: false },
  );
  const confirmedResult = useSWR(
    ['booking-count', 'confirmed'],
    () => bookingsApi.listAdmin({ status: 'confirmed', pageSize: 1, page: 1 }),
    { revalidateOnFocus: false },
  );
  const completedResult = useSWR(
    ['booking-count', 'completed'],
    () => bookingsApi.listAdmin({ status: 'completed', pageSize: 1, page: 1 }),
    { revalidateOnFocus: false },
  );
  const cancelledResult = useSWR(
    ['booking-count', 'cancelled'],
    () => bookingsApi.listAdmin({ status: 'cancelled', pageSize: 1, page: 1 }),
    { revalidateOnFocus: false },
  );
  const noShowResult = useSWR(
    ['booking-count', 'no_show'],
    () => bookingsApi.listAdmin({ status: 'no_show', pageSize: 1, page: 1 }),
    { revalidateOnFocus: false },
  );

  return {
    pending: pendingResult.data?.total,
    confirmed: confirmedResult.data?.total,
    completed: completedResult.data?.total,
    cancelled: cancelledResult.data?.total,
    no_show: noShowResult.data?.total,
  };
}
