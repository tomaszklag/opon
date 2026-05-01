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

export function getMarketRefBySizeTier(
  marketPrices: MarketPrice[],
  sizeTier: 'S' | 'M' | 'L',
): MarketPrice | undefined {
  if (sizeTier === 'S') return marketPrices.find((m) => m.category === 'small');
  if (sizeTier === 'M') return marketPrices.find((m) => m.category === 'medium');
  if (sizeTier === 'L') return marketPrices.find((m) => m.category === 'large');
  return undefined;
}
