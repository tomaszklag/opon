import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type WorkingDay = components['schemas']['WorkingHoursResponseDto'];
export type WorkingDayBody = components['schemas']['WorkingHoursDayDto'];
export type UpsertWorkingHoursBody = components['schemas']['UpsertWorkingHoursDto'];

export function getWorkingHours(): Promise<WorkingDay[]> {
  return api.get<WorkingDay[]>('/v1/providers/me/working-hours');
}

export function saveWorkingHours(body: UpsertWorkingHoursBody): Promise<WorkingDay[]> {
  return api.put<WorkingDay[]>('/v1/providers/me/working-hours', body);
}
