import { z } from 'zod';

export const newTierSchema = z
  .object({
    rimSizeMin: z.number().int().min(10).max(24),
    rimSizeMax: z.number().int().min(10).max(24),
    priceSwapPln: z.number().min(1, 'Cena wymiany musi być > 0'),
    balancingEnabled: z.boolean(),
    priceBalancingPerWheelPln: z.number().min(0),
  })
  .refine((d) => d.rimSizeMin <= d.rimSizeMax, {
    message: 'Rozmiar min nie może być większy niż max',
    path: ['rimSizeMin'],
  });

export type NewTierValues = z.infer<typeof newTierSchema>;
