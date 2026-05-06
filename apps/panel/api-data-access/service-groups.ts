import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type ServiceGroupResponse = components['schemas']['ServiceGroupResponseDto'];
export type ServiceVariantResponse = components['schemas']['ServiceVariantResponseDto'];
export type RimTierResponse = components['schemas']['RimTierDto'];
export type SubServiceResponse = components['schemas']['SubServiceConfigDto'];
export type SurchargeResponse = components['schemas']['SurchargeResponseDto'];

export type UpsertServiceGroupsBody = components['schemas']['UpsertServiceGroupsDto'];
export type UpsertSurchargesBody = components['schemas']['UpsertSurchargesDto'];

export const serviceGroupsApi = {
  list: () => api.get<ServiceGroupResponse[]>('/v1/providers/me/service-groups'),
  surcharges: () => api.get<SurchargeResponse[]>('/v1/providers/me/surcharges'),
  upsertGroups: (body: UpsertServiceGroupsBody) =>
    api.put<ServiceGroupResponse[]>('/v1/providers/me/service-groups', body),
  upsertSurcharges: (body: UpsertSurchargesBody) =>
    api.put<SurchargeResponse[]>('/v1/providers/me/surcharges', body),
};
