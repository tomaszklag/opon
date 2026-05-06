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

export function listDeletionRequests(): Promise<AdminProviderPage> {
  return api.get<AdminProviderPage>('/v1/admin/providers?status=PENDING_DELETION');
}

export function confirmDeletion(id: string): Promise<{ ok: boolean }> {
  return api.patch<{ ok: boolean }>(`/v1/admin/providers/${id}/confirm-deletion`, {});
}

export function cancelDeletion(id: string): Promise<Provider> {
  return api.patch<Provider>(`/v1/admin/providers/${id}/cancel-deletion`, {});
}

export function requestAccountDeletion(): Promise<{ status: string }> {
  return api.post<{ status: string }>('/v1/providers/me/deletion-requests', {});
}

export function getGusHealth(): Promise<GusHealthResponse> {
  return api.get<GusHealthResponse>('/v1/admin/gus/health');
}
