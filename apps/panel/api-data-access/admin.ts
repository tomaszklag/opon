import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type Provider = components['schemas']['ProviderResponseDto'];

export interface AdminProviderPage {
  data: Provider[];
  total: number;
  page: number;
  limit: number;
}

export type GusHealthStatus = 'ok' | 'degraded' | 'down';

export interface GusHealthResponse {
  status: GusHealthStatus;
  checkedAt: string;
  message: string;
}

export function listPendingProviders(): Promise<AdminProviderPage> {
  return api.get<AdminProviderPage>('/v1/admin/providers?status=PENDING_APPROVAL');
}

export function approveProvider(id: string): Promise<Provider> {
  return api.patch<Provider>(`/v1/admin/providers/${id}/approve`, {});
}

export function rejectProvider(id: string, reason?: string): Promise<Provider> {
  return api.patch<Provider>(`/v1/admin/providers/${id}/reject`, reason ? { reason } : {});
}

export function getGusHealth(): Promise<GusHealthResponse> {
  return api.get<GusHealthResponse>('/v1/admin/gus/health');
}
