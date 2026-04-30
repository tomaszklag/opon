'use client';
import useSWR from 'swr';
import { workerTasksApi, type WorkerTask } from '../../api-data-access/worker-tasks';

export function useWorkerTasks(weekStart: string | null) {
  const { data, error, isLoading, mutate } = useSWR<WorkerTask[]>(
    weekStart ? ['worker-tasks', weekStart] : null,
    () => workerTasksApi.list(weekStart!),
    { revalidateOnFocus: false },
  );
  return { tasks: data ?? [], isLoading, error, mutate };
}
