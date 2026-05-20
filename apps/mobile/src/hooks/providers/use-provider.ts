import { useQuery, useMutation } from '@tanstack/react-query';
import { getProvider, getSlots, joinWaitlist } from '@/api/providers';
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

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (providerId: string) => joinWaitlist(providerId),
  });
}
