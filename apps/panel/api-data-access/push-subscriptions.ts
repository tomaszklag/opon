import { api } from '../lib/api';

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export function registerPushSubscription(dto: PushSubscriptionPayload): Promise<void> {
  return api.post<void>('/v1/providers/me/push-subscriptions', dto);
}

export function unregisterPushSubscription(dto: PushSubscriptionPayload): Promise<void> {
  return api.del<void>('/v1/providers/me/push-subscriptions', { body: dto });
}
