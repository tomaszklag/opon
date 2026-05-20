import { api } from './client';
import type { AuthUser } from '../stores/auth.store';

export interface RequestOtpPayload {
  phone: string;
}
export interface RequestOtpResponse {
  message: string;
  expiresIn: number;
  alreadySent?: boolean;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}
export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  requiresConsent: boolean;
  isNewUser: boolean;
}

export interface ConsentPayload {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
}

export const requestOtp = (body: RequestOtpPayload) =>
  api.post<RequestOtpResponse>('/v1/auth/request-otp', body);

export const verifyOtp = (body: VerifyOtpPayload) =>
  api.post<VerifyOtpResponse>('/v1/auth/verify-otp', body);

export const postConsent = (body: ConsentPayload) =>
  api.post<void>('/v1/app/users/me/consent', body);

export const logout = () => api.post<void>('/v1/auth/logout');
