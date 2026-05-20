import { api } from './client';

// TODO: replace with components['schemas']['AppProviderResponseDto'] after BE /v1/app/providers implementation
export interface AppProvider {
  id: string;
  name: string;
  type: 'MOBILE' | 'STATIONARY' | 'BOTH';
  logoUrl: string | null;
  tagline: string | null;
  address: string | null;
  cityCenterLat: number | null;
  cityCenterLng: number | null;
  serviceRadiusKm: number;
  avgRating: number;
  reviewCount: number;
  description: string | null;
  phone: string | null;
  showPhone: boolean;
  vehicleTypes: string[];
  tireSizes: string[];
  additionalServices: string[];
}

export interface AppProviderListResponse {
  data: AppProvider[];
  total: number;
  page: number;
  limit: number;
}

export interface ListProvidersParams {
  type?: 'MOBILE' | 'STATIONARY' | 'BOTH';
  tireSize?: string;
  page?: number;
  limit?: number;
}

// TODO: replace with components['schemas']['AppSlotResponseDto'] after BE implementation
export interface AppSlot {
  id: string;
  startAt: string;
  endAt: string;
  available: boolean;
}

// TODO: replace with components['schemas']['AppReviewResponseDto'] after BE implementation
export interface AppReview {
  id: string;
  rating: number;
  comment: string | null;
  clientName: string;
  createdAt: string;
}

export const listProviders = (params?: ListProvidersParams) =>
  api.get<AppProviderListResponse>(
    '/v1/app/providers',
    params as Record<string, string | number | boolean | undefined>,
  );

export const getProvider = (id: string) => api.get<AppProvider>(`/v1/app/providers/${id}`);

export const getSlots = (providerId: string, date: string) =>
  api.get<AppSlot[]>(`/v1/app/providers/${providerId}/slots`, { date });

export const getReviews = (providerId: string) =>
  api.get<AppReview[]>(`/v1/app/providers/${providerId}/reviews`);
