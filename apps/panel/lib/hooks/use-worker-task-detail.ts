'use client';
import useSWR from 'swr';
import { workerTasksApi } from '../../api-data-access/worker-tasks';

export function useWorkerTaskDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['worker-task-detail', id] : null,
    () => workerTasksApi.getById(id!),
    { revalidateOnFocus: false },
  );
  return { task: data ?? null, isLoading, error, mutate };
}
