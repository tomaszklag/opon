import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type Provider = components['schemas']['ProviderResponseDto'];
export type UpdateProviderBody = components['schemas']['UpdateProviderDto'];
export type CreateProviderBody = components['schemas']['CreateProviderDto'];
export type ProviderPauseResponse = components['schemas']['ProviderPauseResponseDto'];

export function getProvider(): Promise<Provider> {
  return api.get<Provider>('/v1/providers/me');
}

export function updateProvider(body: UpdateProviderBody): Promise<Provider> {
  return api.patch<Provider>('/v1/providers/me', body);
}

export function submitProvider(): Promise<Provider> {
  return api.post<Provider>('/v1/providers/me/submit', {});
}

export function setProviderPause(until: string | null): Promise<ProviderPauseResponse> {
  return api.patch<ProviderPauseResponse>('/v1/providers/me/pause', { until });
}

export function selfSuspendProvider(): Promise<{ status: string }> {
  return api.post<{ status: string }>('/v1/providers/me/suspend', {});
}
