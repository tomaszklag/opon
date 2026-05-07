import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type ScheduleException = components['schemas']['ScheduleExceptionResponseDto'];
export type CreateScheduleExceptionBody = components['schemas']['CreateScheduleExceptionDto'];

const BASE = '/v1/providers/me/schedule-exceptions';

export const scheduleExceptionsApi = {
  list: () => api.get<ScheduleException[]>(BASE),
  create: (body: CreateScheduleExceptionBody) => api.post<ScheduleException>(BASE, body),
  remove: (id: string) => api.del<void>(`${BASE}/${id}`),
};
