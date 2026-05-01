'use client';
import useSWR from 'swr';
import { workersApi, type Worker } from '../../api-data-access/workers';

export function useWorkersList() {
  const { data, error, isLoading } = useSWR('workers-list', () => workersApi.list(), {
    revalidateOnFocus: false,
  });
  return { workers: (data ?? []) as Worker[], isLoading, error };
}
