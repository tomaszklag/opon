import { useQuery } from '@tanstack/react-query';
import { getProvider, getSlots } from '@/api/providers';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useProvider(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.detail(id),
    queryFn: () => getProvider(id),
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
