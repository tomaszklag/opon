import { useQuery } from '@tanstack/react-query';
import { listProviders, type ListProvidersParams } from '@/api/providers';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useProviders(params: ListProvidersParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.providers.list(params),
    queryFn: () => listProviders(params),
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });
}
