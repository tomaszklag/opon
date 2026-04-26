import { api } from '../lib/api';
import type { components } from '@opony/api-client';

export type CreatePricingTierBody = components['schemas']['CreatePricingTierDto'];
export type UpdatePricingTierBody = components['schemas']['UpdatePricingTierDto'];

export type PricingTier = {
  id: string;
  rimSizeMin: number;
  rimSizeMax: number;
  priceSwapPln: number;
  priceBalancingPerWheelPln: number | null;
};

export function getPricingTiers(): Promise<PricingTier[]> {
  return api.get<PricingTier[]>('/v1/providers/me/pricing-tiers');
}

export function createPricingTier(body: CreatePricingTierBody): Promise<PricingTier> {
  return api.post<PricingTier>('/v1/providers/me/pricing-tiers', body);
}

export function updatePricingTier(id: string, body: UpdatePricingTierBody): Promise<PricingTier> {
  return api.patch<PricingTier>(`/v1/providers/me/pricing-tiers/${id}`, body);
}

export function deletePricingTier(id: string): Promise<void> {
  return api.del(`/v1/providers/me/pricing-tiers/${id}`);
}
