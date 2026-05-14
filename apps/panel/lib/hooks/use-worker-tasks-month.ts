'use client';
import useSWR from 'swr';
import { workerTasksApi, type WorkerTask } from '../../api-data-access/worker-tasks';

export function useWorkerTasksMonth(weekStarts: string[]) {
  const key = weekStarts.length > 0 ? ['worker-tasks-month', ...weekStarts] : null;
  const { data, error, isLoading } = useSWR(
    key,
    () => Promise.all(weekStarts.map((ws) => workerTasksApi.list(ws))).then((r) => r.flat()),
    { revalidateOnFocus: false },
  );
  return { tasks: (data ?? []) as WorkerTask[], isLoading, error };
}
