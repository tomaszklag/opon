import { useQuery } from '@tanstack/react-query';
import { getProvider, getReviews, getSlots } from '@/api/providers';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useProvider(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.detail(id),
    queryFn: () => getProvider(id),
    enabled: !!id,
  });
}

export function useProviderReviews(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.reviews(id),
    queryFn: () => getReviews(id),
    enabled: !!id,
  });
}

export function useProviderSlots(id: string, date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.slots(id, date),
    queryFn: () => getSlots(id, date),
    enabled: !!id && !!date,
  });
}
