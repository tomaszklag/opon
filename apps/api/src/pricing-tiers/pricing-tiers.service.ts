import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PricingTier } from '@prisma/client';
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
      throw new ConflictException('rimSizeMin musi być ≤ rimSizeMax.');
    }

    const existing = await this.repo.findByProviderAndRange(
      providerId,
      dto.rimSizeMin,
      dto.rimSizeMax,
    );
    if (existing) {
      throw new ConflictException(
        `Przedział felg ${dto.rimSizeMin}–${dto.rimSizeMax}" już istnieje.`,
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
    if (!tier) throw new NotFoundException('Tier cenowy nie istnieje.');
    if (tier.providerId !== providerId) throw new ForbiddenException('Brak dostępu.');
    return this.repo.update(tierId, dto);
  }

  async remove(tierId: string, providerId: string): Promise<void> {
    const tier = await this.repo.findById(tierId);
    if (!tier) throw new NotFoundException('Tier cenowy nie istnieje.');
    if (tier.providerId !== providerId) throw new ForbiddenException('Brak dostępu.');
    await this.repo.delete(tierId);
  }
}
