import { api } from '../lib/api';

export type ServiceType = 'SEASONAL_SWAP' | 'WHEEL_SWAP' | 'BALANCING' | 'PUNCTURE_REPAIR';

export interface ServiceConfigDto {
  serviceType: ServiceType;
  durationMinutes: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  SEASONAL_SWAP: 'Wymiana sezonowa',
  WHEEL_SWAP: 'Wymiana kół',
  BALANCING: 'Wyważanie',
  PUNCTURE_REPAIR: 'Naprawa przebicia',
};

export const SERVICE_TYPE_ORDER: ServiceType[] = [
  'SEASONAL_SWAP',
  'WHEEL_SWAP',
  'BALANCING',
  'PUNCTURE_REPAIR',
];

export function getServiceConfigs(): Promise<ServiceConfigDto[]> {
  return api.get<ServiceConfigDto[]>('/v1/providers/me/service-configs');
}

export function saveServiceConfigs(configs: ServiceConfigDto[]): Promise<ServiceConfigDto[]> {
  return api.put<ServiceConfigDto[]>('/v1/providers/me/service-configs', { configs });
}
