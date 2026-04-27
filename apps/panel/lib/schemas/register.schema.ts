import { z } from 'zod';

export const registerSchema = z.object({
  consentTerms: z.boolean().refine((v) => v, 'Wymagana akceptacja Regulaminu'),
  consentRodo: z.boolean().refine((v) => v, 'Wymagana akceptacja polityki prywatności (RODO)'),
  consentMarketing: z.boolean(),
  nip: z.string().length(10, 'NIP musi mieć dokładnie 10 cyfr'),
  phone: z.string().length(9, 'Podaj 9 cyfr numeru telefonu (bez +48)'),
  email: z.string().min(1, 'E-mail jest wymagany').email('Nieprawidłowy adres e-mail'),
  iban: z.string().max(26).optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
