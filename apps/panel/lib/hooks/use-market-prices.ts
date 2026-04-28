'use client';

import useSWR from 'swr';
import { getMarketPrices, type MarketPrice } from '../../api-data-access/pricing-tiers';

export type { MarketPrice };

export function useMarketPrices(): MarketPrice[] {
  const { data = [] } = useSWR<MarketPrice[]>('/v1/providers/me/market-prices', getMarketPrices, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 min — market data changes slowly
  });
  return data;
}

export function getMarketRef(
  marketPrices: MarketPrice[],
  rimSizeMin: number,
  rimSizeMax: number,
): MarketPrice | undefined {
  if (rimSizeMax <= 15) return marketPrices.find((m) => m.category === 'small');
  if (rimSizeMin >= 16 && rimSizeMax <= 17)
    return marketPrices.find((m) => m.category === 'medium');
  if (rimSizeMin >= 18) return marketPrices.find((m) => m.category === 'large');
  return undefined;
}
