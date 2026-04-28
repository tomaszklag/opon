import { Injectable } from '@nestjs/common';
import { PricingTier } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { CreatePricingTierDto } from './dto/create-pricing-tier.dto';
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
}
