import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type DataExportRequestDto = components['schemas']['DataExportRequestDto'];
export type DataExportPage = components['schemas']['DataExportPage'];

export function requestDataExport(): Promise<{ status: string; requestedAt: string }> {
  return api.post<{ status: string; requestedAt: string }>(
    '/v1/providers/me/data-export-requests',
    {},
  );
}

export function listDataExportRequests(): Promise<DataExportPage> {
  return api.get<DataExportPage>('/v1/admin/data-export-requests');
}

export function completeDataExportRequest(id: string): Promise<{ ok: boolean }> {
  return api.patch<{ ok: boolean }>(`/v1/admin/data-export-requests/${id}/complete`, {});
}

export function cancelDataExportRequest(id: string): Promise<{ ok: boolean }> {
  return api.patch<{ ok: boolean }>(`/v1/admin/data-export-requests/${id}/cancel`, {});
}
