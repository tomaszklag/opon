import { api } from '../lib/api';
import type { components } from '@opony/api-client';

type _ScheduleExceptionDto = components['schemas']['ScheduleExceptionResponseDto'];
// Override time fields — openapi-typescript mis-generates Time type as Record<string,never>
export type ScheduleException = Omit<
  _ScheduleExceptionDto,
  'customOpenTime' | 'customCloseTime'
> & {
  customOpenTime?: string;
  customCloseTime?: string;
};
export type CreateScheduleExceptionBody = components['schemas']['CreateScheduleExceptionDto'];

const BASE = '/v1/providers/me/schedule-exceptions';

export const scheduleExceptionsApi = {
  list: () => api.get<ScheduleException[]>(BASE),
  create: (body: CreateScheduleExceptionBody) => api.post<ScheduleException>(BASE, body),
  remove: (id: string) => api.del<void>(`${BASE}/${id}`),
};
