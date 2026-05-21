import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type TireSet = components['schemas']['TireSetResponseDto'];
export type TireSetDetail = components['schemas']['TireSetDetailResponseDto'];
export type TireSetPage = components['schemas']['TireSetPageResponseDto'];
export type StoragePeriod = components['schemas']['StoragePeriodResponseDto'];
export type DepotSlot = components['schemas']['DepotSlotResponseDto'];
export type DepotStats = components['schemas']['DepotStatsResponseDto'];
export type CreateTireSetBody = components['schemas']['CreateTireSetDto'];
type _UpdateTireSetDto = components['schemas']['UpdateTireSetDto'];
// Override slotId — openapi-typescript mis-generates nullable string as Record<string,never>
export type UpdateTireSetBody = Omit<_UpdateTireSetDto, 'slotId'> & { slotId?: string | null };
export type UpsertDepotSlotsBody = components['schemas']['UpsertDepotSlotsDto'];

export type TireType = 'SUMMER' | 'WINTER' | 'ALL_SEASON';
export type TireCondition = 'GOOD' | 'WORN' | 'CRITICAL';
export type TireSetStatus = 'IN_DEPOT' | 'PICKED_UP';

const BASE = '/v1/providers/me/depot';

export interface DepotListParams {
  status?: TireSetStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const depotApi = {
  list: (params?: DepotListParams) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return api.get<TireSetPage>(`${BASE}${qs ? `?${qs}` : ''}`);
  },
  getStats: () => api.get<DepotStats>(`${BASE}/stats`),
  getSlots: () => api.get<DepotSlot[]>(`${BASE}/slots`),
  get: (id: string) => api.get<TireSetDetail>(`${BASE}/${id}`),
  create: (body: CreateTireSetBody) => api.post<TireSetDetail>(BASE, body),
  update: (id: string, body: UpdateTireSetBody) => api.patch<TireSetDetail>(`${BASE}/${id}`, body),
  pickup: (id: string) => api.post<TireSetDetail>(`${BASE}/${id}/pickup`, {}),
  store: (
    id: string,
    body: { storedAt?: string; releaseDue?: string; pricePln?: number; notes?: string },
  ) => api.post<TireSetDetail>(`${BASE}/${id}/store`, body),
  remove: (id: string) => api.del<void>(`${BASE}/${id}`),
  bulkCreateSlots: (body: UpsertDepotSlotsBody) =>
    api.post<DepotSlot[]>(`${BASE}/slots/bulk`, body),
  removeSlot: (slotId: string) => api.del<void>(`${BASE}/slots/${slotId}`),
};
