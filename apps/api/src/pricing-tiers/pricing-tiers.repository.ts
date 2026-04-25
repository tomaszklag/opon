import { Injectable } from '@nestjs/common';
import { Prisma, PricingTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingTiersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<PricingTier[]> {
    return this.prisma.pricingTier.findMany({
      where: { providerId },
      orderBy: { rimSizeMin: 'asc' },
    });
  }

  findById(id: string): Promise<PricingTier | null> {
    return this.prisma.pricingTier.findUnique({ where: { id } });
  }

  findByProviderAndRange(
    providerId: string,
    rimSizeMin: number,
    rimSizeMax: number,
  ): Promise<PricingTier | null> {
    return this.prisma.pricingTier.findUnique({
      where: { providerId_rimSizeMin_rimSizeMax: { providerId, rimSizeMin, rimSizeMax } },
    });
  }

  create(data: Prisma.PricingTierCreateInput): Promise<PricingTier> {
    return this.prisma.pricingTier.create({ data });
  }

  update(id: string, data: Prisma.PricingTierUpdateInput): Promise<PricingTier> {
    return this.prisma.pricingTier.update({ where: { id }, data });
  }

  delete(id: string): Promise<PricingTier> {
    return this.prisma.pricingTier.delete({ where: { id } });
  }
}
