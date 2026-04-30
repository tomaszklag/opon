'use client';
import useSWR from 'swr';
import { profileApi, type ProviderProfileDto } from '../../api-data-access/profile';

export function useProvider() {
  const { data, error, isLoading } = useSWR('provider-me', () => profileApi.get(), {
    revalidateOnFocus: false,
  });
  return { provider: data ?? null, isLoading, error };
}

export type { ProviderProfileDto };
