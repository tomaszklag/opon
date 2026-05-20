import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listBookings,
  getBooking,
  createBooking,
  cancelBooking,
  type CreateBookingDto,
} from '@/api/bookings';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useBookings(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.list(status),
    queryFn: () => listBookings(status),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 30_000 : false),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookingDto) => createBooking(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
