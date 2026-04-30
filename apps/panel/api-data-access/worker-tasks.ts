import { api } from '../lib/api';

export interface WorkerTask {
  id: string;
  providerId: string;
  workerId: string | null;
  workerName: string | null;
  title: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateWorkerTaskBody {
  title: string;
  workerId?: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export const workerTasksApi = {
  list: (weekStart: string) =>
    api.get<WorkerTask[]>(`/v1/providers/me/tasks?weekStart=${weekStart}`),
  create: (body: CreateWorkerTaskBody) => api.post<WorkerTask>('/v1/providers/me/tasks', body),
  remove: (id: string) => api.del<void>(`/v1/providers/me/tasks/${id}`),
};
