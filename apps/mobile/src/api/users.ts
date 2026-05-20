import { api } from './client';
import type { AuthUser } from '../stores/auth.store';

export interface Vehicle {
  id: string;
  nickname: string | null;
  make: string;
  model: string;
  year: number;
  tireSize: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AddVehiclePayload {
  nickname?: string;
  make: string;
  model: string;
  year: number;
  tireSize: string;
}

export const getMe = () => api.get<AuthUser>('/v1/app/users/me');

export const updateMe = (body: UpdateProfilePayload) =>
  api.patch<AuthUser>('/v1/app/users/me', body);

export const getVehicles = () => api.get<Vehicle[]>('/v1/app/users/me/vehicles');

export const addVehicle = (body: AddVehiclePayload) =>
  api.post<Vehicle>('/v1/app/users/me/vehicles', body);

export const deleteVehicle = (id: string) => api.delete<void>(`/v1/app/users/me/vehicles/${id}`);
