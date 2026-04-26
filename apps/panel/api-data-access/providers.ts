import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type UpdateProviderBody = components['schemas']['UpdateProviderDto'];

export type Provider = {
  id: string;
  name: string;
  nip: string;
  status: string;
  city: string;
  voivodeship: string;
  phone: string;
  email: string | null;
  description: string | null;
  logoUrl: string | null;
  serviceRadiusKm: number | null;
};

export function getProvider(): Promise<Provider> {
  return api.get<Provider>('/v1/providers/me');
}

export function updateProvider(body: UpdateProviderBody): Promise<Provider> {
  return api.patch<Provider>('/v1/providers/me', body);
}
