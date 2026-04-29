import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type WorkerAssignment = components['schemas']['StationWorkerResponseDto'];

export interface DaySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: boolean;
  startTime: string;
  endTime: string;
}

// Override schedule: openapi-typescript emits Record<string,never> for Prisma JSON fields
type StationBase = components['schemas']['StationResponseDto'];
export type Station = Omit<StationBase, 'schedule'> & { schedule: DaySchedule[] };

export type ServiceType = Station['services'][number];

export interface CreateStationBody {
  name: string;
  services: ServiceType[];
  schedule: DaySchedule[];
}

export interface UpdateStationBody {
  name?: string;
  services?: ServiceType[];
  schedule?: DaySchedule[];
}

export interface AssignWorkerBody {
  workerId: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  SEASONAL_SWAP: 'Sezonowa wymiana',
  WHEEL_SWAP: 'Wymiana kół',
  BALANCING: 'Wyważanie kół',
  PUNCTURE_REPAIR: 'Naprawa opony',
};

const BASE = '/v1/providers/me/stations';

export const stationsApi = {
  list: () => api.get<Station[]>(BASE),
  create: (body: CreateStationBody) => api.post<Station>(BASE, body),
  update: (id: string, body: UpdateStationBody) => api.put<Station>(`${BASE}/${id}`, body),
  remove: (id: string) => api.del<void>(`${BASE}/${id}`),
  assignWorker: (stationId: string, body: AssignWorkerBody) =>
    api.post<Station>(`${BASE}/${stationId}/workers`, body),
  removeWorker: (stationId: string, workerId: string) =>
    api.del<Station>(`${BASE}/${stationId}/workers/${workerId}`),
  updateShift: (
    stationId: string,
    workerId: string,
    body: { shiftStart?: string; shiftEnd?: string },
  ) => api.put<Station>(`${BASE}/${stationId}/workers/${workerId}`, body),
};
