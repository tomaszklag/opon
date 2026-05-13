import { api } from '../lib/api';

export interface LinkedBooking {
  referenceCode: string;
  clientName: string;
  startAt: string;
}

export interface WorkerTask {
  id: string;
  providerId: string;
  workerId: string | null;
  workerName: string | null;
  title: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  linkedBookingId: string | null;
  linkedBooking: LinkedBooking | null;
  createdAt: string;
}

export interface CreateWorkerTaskBody {
  title: string;
  workerId?: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export interface UpdateWorkerTaskBody {
  notes?: string | null;
  linkedBookingId?: string | null;
}

export const workerTasksApi = {
  list: (weekStart: string) =>
    api.get<WorkerTask[]>(`/v1/providers/me/tasks?weekStart=${weekStart}`),
  getById: (id: string) => api.get<WorkerTask>(`/v1/providers/me/tasks/${id}`),
  create: (body: CreateWorkerTaskBody) => api.post<WorkerTask>('/v1/providers/me/tasks', body),
  update: (id: string, body: UpdateWorkerTaskBody) =>
    api.patch<WorkerTask>(`/v1/providers/me/tasks/${id}`, body),
  remove: (id: string) => api.del<void>(`/v1/providers/me/tasks/${id}`),
};
