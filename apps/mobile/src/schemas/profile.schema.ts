import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').max(100),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki').max(100),
  email: z.string().email('Podaj prawidłowy adres email').optional().or(z.literal('')),
});

// Format np. "205/55 R16"
export const tireSizeSchema = z
  .string()
  .regex(/^\d{3}\/\d{2}\s*R\d{2}$/, 'Podaj rozmiar w formacie: 205/55 R16');

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Podaj markę pojazdu'),
  model: z.string().min(1, 'Podaj model pojazdu'),
  year: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  tireSize: tireSizeSchema,
  nickname: z.string().max(50).optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;
export type VehicleForm = z.infer<typeof vehicleSchema>;
