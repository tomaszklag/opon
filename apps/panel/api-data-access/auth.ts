import { api } from '../lib/api';
import { type AuthUser } from '../lib/auth';
import type { components } from '@opony/api-client';

export type { AuthUser };
export type RequestOtpBody = components['schemas']['RequestOtpDto'];
export type VerifyOtpBody = components['schemas']['VerifyOtpDto'];
export type VerifyOtpResponse = components['schemas']['VerifyOtpResponseDto'];
export type ChangePhoneBody = components['schemas']['ChangePhoneDto'];
export type ChangePhoneResponse = components['schemas']['ChangePhoneResponseDto'];
export type SessionDto = components['schemas']['SessionResponseDto'];

export interface RequestOtpResponse {
  message: string;
  expiresIn: number;
  alreadySent?: boolean;
}

export function requestOtp(body: RequestOtpBody): Promise<RequestOtpResponse> {
  return api.post<RequestOtpResponse>('/v1/auth/request-otp', body);
}

export function verifyOtp(body: VerifyOtpBody): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>('/v1/auth/verify-otp', body);
}

export function changePhone(body: ChangePhoneBody): Promise<ChangePhoneResponse> {
  return api.patch<ChangePhoneResponse>('/v1/auth/change-phone', body);
}

export function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/v1/auth/me');
}

export function listSessions(): Promise<SessionDto[]> {
  return api.get<SessionDto[]>('/v1/auth/sessions');
}

export function revokeSession(id: string): Promise<void> {
  return api.del<void>(`/v1/auth/sessions/${id}`);
}

export function revokeOtherSessions(): Promise<void> {
  return api.del<void>('/v1/auth/sessions');
}
