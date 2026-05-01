import { z } from 'zod';

export const SIZE_TIERS = ['S', 'M', 'L'] as const;
export type SizeTierValue = (typeof SIZE_TIERS)[number];

export const newTierSchema = z.object({
  sizeTier: z.enum(SIZE_TIERS),
  priceSwapPln: z.number().min(1, 'Cena wymiany musi być > 0'),
  balancingEnabled: z.boolean(),
  priceBalancingPerWheelPln: z.number().min(0),
});

export type NewTierValues = z.infer<typeof newTierSchema>;
