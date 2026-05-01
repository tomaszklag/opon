import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type Provider = components['schemas']['ProviderResponseDto'];
export type UpdateProviderBody = components['schemas']['UpdateProviderDto'];
export type CreateProviderBody = components['schemas']['CreateProviderDto'];

export function getProvider(): Promise<Provider> {
  return api.get<Provider>('/v1/providers/me');
}

export function updateProvider(body: UpdateProviderBody): Promise<Provider> {
  return api.patch<Provider>('/v1/providers/me', body);
}

export function submitProvider(): Promise<Provider> {
  return api.post<Provider>('/v1/providers/me/submit', {});
}

export function setProviderPause(until: string | null): Promise<{ pausedUntil: string | null }> {
  return api.patch<{ pausedUntil: string | null }>('/v1/providers/me/pause', { until });
}
