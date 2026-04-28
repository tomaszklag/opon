import { Injectable } from '@nestjs/common';
import { PricingTier, Provider } from '@prisma/client';
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
    if (dto.rimSizeMin > dto.rimSizeMax) {
      throw new AppException(
        ErrorCode.PRICING_TIER_INVALID_RIM_RANGE,
        'rimSizeMin musi być ≤ rimSizeMax.',
        400,
      );
    }

    const existing = await this.repo.findByProviderAndRange(
      providerId,
      dto.rimSizeMin,
      dto.rimSizeMax,
    );
    if (existing) {
      throw new AppException(
        ErrorCode.PRICING_TIER_RANGE_CONFLICT,
        `Przedział felg ${dto.rimSizeMin}–${dto.rimSizeMax}" już istnieje.`,
        409,
      );
    }

    return this.repo.create({
      rimSizeMin: dto.rimSizeMin,
      rimSizeMax: dto.rimSizeMax,
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
      match: (r: (typeof rows)[0]) => boolean;
    }> = [
      { key: 'small', match: (r) => r.rimSizeMax <= 15 },
      { key: 'medium', match: (r) => r.rimSizeMin >= 16 && r.rimSizeMax <= 17 },
      { key: 'large', match: (r) => r.rimSizeMin >= 18 },
    ];

    return CATEGORIES.flatMap(({ key, match }) => {
      const matching = rows.filter(match);
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
