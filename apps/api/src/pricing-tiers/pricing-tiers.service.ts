import { Injectable } from '@nestjs/common';
import { PricingTier, Provider, SizeTier } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { CreatePricingTierDto } from './dto/create-pricing-tier.dto';
import { MarketPriceCategory, MarketPriceResponseDto } from './dto/market-price-response.dto';
import { UpdatePricingTierDto } from './dto/update-pricing-tier.dto';
import { PricingTiersRepository } from './pricing-tiers.repository';

@Injectable()
export class PricingTiersService {
  constructor(private readonly repo: PricingTiersRepository) {}

  listByProvider(providerId: string): Promise<PricingTier[]> {
    return this.repo.findAllByProvider(providerId);
  }

  async create(providerId: string, dto: CreatePricingTierDto): Promise<PricingTier> {
    const existing = await this.repo.findByProviderAndSizeTier(providerId, dto.sizeTier);
    if (existing) {
      throw new AppException(
        ErrorCode.PRICING_TIER_RANGE_CONFLICT,
        `Tier rozmiaru ${dto.sizeTier} już istnieje.`,
        409,
      );
    }

    return this.repo.create({
      sizeTier: dto.sizeTier,
      priceSwapPln: dto.priceSwapPln,
      priceBalancingPerWheelPln: dto.priceBalancingPerWheelPln,
      travelFeeFirstKmPln: dto.travelFeeFirstKmPln ?? 0,
      travelFeeExtraKmPln: dto.travelFeeExtraKmPln ?? 0,
      provider: { connect: { id: providerId } },
    });
  }

  async update(
    tierId: string,
    providerId: string,
    dto: UpdatePricingTierDto,
  ): Promise<PricingTier> {
    const tier = await this.repo.findById(tierId);
    if (!tier)
      throw new AppException(ErrorCode.PRICING_TIER_NOT_FOUND, 'Tier cenowy nie istnieje.', 404);
    if (tier.providerId !== providerId)
      throw new AppException(ErrorCode.PRICING_TIER_ACCESS_DENIED, 'Brak dostępu.', 403);
    return this.repo.update(tierId, dto);
  }

  async remove(tierId: string, providerId: string): Promise<void> {
    const tier = await this.repo.findById(tierId);
    if (!tier)
      throw new AppException(ErrorCode.PRICING_TIER_NOT_FOUND, 'Tier cenowy nie istnieje.', 404);
    if (tier.providerId !== providerId)
      throw new AppException(ErrorCode.PRICING_TIER_ACCESS_DENIED, 'Brak dostępu.', 403);
    await this.repo.delete(tierId);
  }

  async getMarketPrices(provider: Provider): Promise<MarketPriceResponseDto[]> {
    const lat = provider.cityCenterLat ? Number(provider.cityCenterLat) : null;
    const lng = provider.cityCenterLng ? Number(provider.cityCenterLng) : null;
    if (!lat || !lng) return [];

    // Search within 1.5× own radius to ensure enough competitors are captured
    const radiusKm = (provider.serviceRadiusKm ?? 20) * 1.5;
    const rows = await this.repo.findNearbyApprovedTiers(lat, lng, radiusKm, provider.id);
    if (rows.length === 0) return [];

    const CATEGORIES: Array<{
      key: MarketPriceCategory;
      sizeTier: SizeTier;
    }> = [
      { key: 'small', sizeTier: SizeTier.S },
      { key: 'medium', sizeTier: SizeTier.M },
      { key: 'large', sizeTier: SizeTier.L },
    ];

    return CATEGORIES.flatMap(({ key, sizeTier }) => {
      const matching = rows.filter((r) => r.sizeTier === sizeTier);
      const uniqueProviders = new Set(matching.map((r) => r.providerId)).size;
      if (uniqueProviders < 2) return []; // suppress single-provider "market" data
      const prices = matching.map((r) => r.priceSwapPln);
      return [
        {
          category: key,
          priceMin: Math.round(Math.min(...prices)),
          priceMax: Math.round(Math.max(...prices)),
          providerCount: uniqueProviders,
        },
      ];
    });
  }
}
