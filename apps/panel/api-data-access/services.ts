import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type ServiceResponse = components['schemas']['ServiceResponseDto'];
export type AddonResponse = components['schemas']['AddonResponseDto'];
export type UpsertServicesBody = components['schemas']['UpsertServicesDto'];
export type UpsertAddonsBody = components['schemas']['UpsertAddonsDto'];

export const servicesApi = {
  listServices: () => api.get<ServiceResponse[]>('/v1/providers/me/services'),
  upsertServices: (body: UpsertServicesBody) =>
    api.put<ServiceResponse[]>('/v1/providers/me/services', body),
  deleteService: (id: string) => api.del<void>(`/v1/providers/me/services/${id}`),
  listAddons: () => api.get<AddonResponse[]>('/v1/providers/me/addons'),
  upsertAddons: (body: UpsertAddonsBody) =>
    api.put<AddonResponse[]>('/v1/providers/me/addons', body),
  deleteAddon: (id: string) => api.del<void>(`/v1/providers/me/addons/${id}`),
};
