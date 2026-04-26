import { api } from '../lib/api';
import { type AuthUser } from '../lib/auth';
import type { components } from '@opony/api-client';

export type { AuthUser };
export type RequestOtpBody = components['schemas']['RequestOtpDto'];
export type VerifyOtpBody = components['schemas']['VerifyOtpDto'];
export type VerifyOtpResponse = components['schemas']['VerifyOtpResponseDto'];

export function requestOtp(body: RequestOtpBody): Promise<void> {
  return api.post('/v1/auth/request-otp', body);
}

export function verifyOtp(body: VerifyOtpBody): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>('/v1/auth/verify-otp', body);
}

export function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/v1/auth/me');
}
