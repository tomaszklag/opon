import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type WorkerTask = components['schemas']['WorkerTaskResponseDto'];
export type LinkedBooking = components['schemas']['LinkedBookingDto'];
export type CreateWorkerTaskBody = components['schemas']['CreateWorkerTaskDto'];
export type UpdateWorkerTaskBody = components['schemas']['UpdateWorkerTaskDto'];

export const workerTasksApi = {
  list: (weekStart: string) =>
    api.get<WorkerTask[]>(`/v1/providers/me/tasks?weekStart=${weekStart}`),
  getById: (id: string) => api.get<WorkerTask>(`/v1/providers/me/tasks/${id}`),
  create: (body: CreateWorkerTaskBody) => api.post<WorkerTask>('/v1/providers/me/tasks', body),
  update: (id: string, body: UpdateWorkerTaskBody) =>
    api.patch<WorkerTask>(`/v1/providers/me/tasks/${id}`, body),
  remove: (id: string) => api.del<void>(`/v1/providers/me/tasks/${id}`),
};
