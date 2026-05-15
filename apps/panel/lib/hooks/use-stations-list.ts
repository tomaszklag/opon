'use client';
import useSWR from 'swr';
import { stationsApi, type Station } from '../../api-data-access/stations';

export function useStationsList() {
  const { data, isLoading, error } = useSWR('stations-list', stationsApi.list, {
    revalidateOnFocus: false,
  });
  return { stations: (data ?? []) as Station[], isLoading, error };
}
