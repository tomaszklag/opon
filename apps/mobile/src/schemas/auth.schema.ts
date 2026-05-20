import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(1, 'Podaj numer telefonu')
  .regex(/^\+48\d{9}$/, 'Podaj numer w formacie +48XXXXXXXXX');

export const otpSchema = z
  .string()
  .length(6, 'Kod musi mieć 6 cyfr')
  .regex(/^\d{6}$/, 'Kod musi składać się z cyfr');

export const loginSchema = z.object({ phone: phoneSchema });
export const otpVerifySchema = z.object({ code: otpSchema });

export const consentSchema = z.object({
  terms: z.boolean().refine((v) => v === true, 'Akceptacja regulaminu jest wymagana'),
  privacy: z.boolean().refine((v) => v === true, 'Akceptacja polityki prywatności jest wymagana'),
  marketing: z.boolean(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type OtpVerifyForm = z.infer<typeof otpVerifySchema>;
export type ConsentForm = z.infer<typeof consentSchema>;
