import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type WorkingDayBody = components['schemas']['WorkingHoursDayDto'];
export type UpsertWorkingHoursBody = components['schemas']['UpsertWorkingHoursDto'];

export type WorkingDay = {
  id: string;
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  slotMinutes: number;
};

export function getWorkingHours(): Promise<WorkingDay[]> {
  return api.get<WorkingDay[]>('/v1/providers/me/working-hours');
}

export function saveWorkingHours(body: UpsertWorkingHoursBody): Promise<WorkingDay[]> {
  return api.put<WorkingDay[]>('/v1/providers/me/working-hours', body);
}
