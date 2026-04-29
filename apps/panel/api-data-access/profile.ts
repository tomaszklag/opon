import { api } from '../lib/api';

export interface ProviderProfileDto {
  id: string;
  name: string;
  nip: string;
  type: 'MOBILE' | 'STATIONARY' | 'BOTH';
  status: string;
  description: string | null;
  tagline: string | null;
  foundedYear: number | null;
  showPhone: boolean;
  address: string | null;
  phone: string | null;
  vehicleTypes: string[];
  tireSizes: string[];
  additionalServices: string[];
  avgRating: number;
  reviewCount: number;
}

export interface ProviderPhotoDto {
  id: string;
  url: string;
  type: string;
  isPrimary: boolean;
  createdAt: string;
}

export const profileApi = {
  get: () => api.get<ProviderProfileDto>('/v1/providers/me'),
  patch: (
    data: Partial<Omit<ProviderProfileDto, 'id' | 'nip' | 'status' | 'avgRating' | 'reviewCount'>>,
  ) => api.patch<ProviderProfileDto>('/v1/providers/me', data),
  getPhotos: () => api.get<ProviderPhotoDto[]>('/v1/providers/me/photos'),
  addPhoto: (url: string, type?: string) =>
    api.post<ProviderPhotoDto>('/v1/providers/me/photos', { url, type }),
  deletePhoto: (id: string) => api.del<void>(`/v1/providers/me/photos/${id}`),
  reorderPhotos: (orderedIds: string[]) =>
    api.patch<void>('/v1/providers/me/photos/reorder', { orderedIds }),
};
