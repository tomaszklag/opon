import { api } from '../lib/api';
import type { components } from '../../../packages/api-client/src/schema';

export type NotificationPreferencesDto = components['schemas']['NotificationPreferencesDto'];

export type UpdateNotificationPreferencesDto = Partial<NotificationPreferencesDto>;

export function getNotificationPreferences(): Promise<NotificationPreferencesDto> {
  return api.get<NotificationPreferencesDto>('/v1/providers/me/notification-preferences');
}

export function updateNotificationPreferences(
  dto: UpdateNotificationPreferencesDto,
): Promise<NotificationPreferencesDto> {
  return api.put<NotificationPreferencesDto>('/v1/providers/me/notification-preferences', dto);
}
