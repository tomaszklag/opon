import { z } from 'zod';

export const providerSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(200, 'Maksymalnie 200 znaków'),
  description: z.string().max(3000, 'Maksymalnie 3000 znaków'),
  phone: z
    .string()
    .refine((v) => v === '' || /^\+\d{7,15}$/.test(v), 'Format: +48600000000 (+ i 7–15 cyfr)'),
  email: z
    .string()
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Nieprawidłowy adres e-mail'),
  logoUrl: z
    .string()
    .refine((v) => v === '' || /^https?:\/\/.+/.test(v), 'Podaj pełny URL (https://...)'),
});

export type ProviderFormValues = z.infer<typeof providerSchema>;
