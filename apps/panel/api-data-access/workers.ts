import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type Worker = components['schemas']['WorkerResponseDto'];
export type WorkerLeave = components['schemas']['LeaveResponseDto'];
export type WorkerStation = components['schemas']['WorkerStationResponseDto'];

export type LeaveType = WorkerLeave['type'];

export interface CreateWorkerBody {
  name: string;
  role?: string;
}

export interface UpdateWorkerBody {
  name?: string;
  role?: string;
}

export interface CreateLeaveBody {
  type: LeaveType;
  startDate: string;
  endDate: string;
  note?: string;
}

const BASE = '/v1/providers/me/workers';

export const workersApi = {
  list: () => api.get<Worker[]>(BASE),
  create: (body: CreateWorkerBody) => api.post<Worker>(BASE, body),
  update: (id: string, body: UpdateWorkerBody) => api.put<Worker>(`${BASE}/${id}`, body),
  remove: (id: string) => api.del<void>(`${BASE}/${id}`),
  addLeave: (workerId: string, body: CreateLeaveBody) =>
    api.post<WorkerLeave>(`${BASE}/${workerId}/leaves`, body),
  removeLeave: (workerId: string, leaveId: string) =>
    api.del<void>(`${BASE}/${workerId}/leaves/${leaveId}`),
};
