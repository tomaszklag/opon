import { Injectable } from '@nestjs/common';
import { Prisma, PricingTier, SizeTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingTiersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<PricingTier[]> {
    return this.prisma.pricingTier.findMany({
      where: { providerId },
      orderBy: { sizeTier: 'asc' },
    });
  }

  findById(id: string): Promise<PricingTier | null> {
    return this.prisma.pricingTier.findUnique({ where: { id } });
  }

  findByProviderAndSizeTier(providerId: string, sizeTier: SizeTier): Promise<PricingTier | null> {
    return this.prisma.pricingTier.findUnique({
      where: { providerId_sizeTier: { providerId, sizeTier } },
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

  /**
   * Finds pricing tiers of APPROVED providers within a radius (Haversine).
   * Excludes the requesting provider so they don't see their own prices as "market".
   */
  findNearbyApprovedTiers(
    lat: number,
    lng: number,
    radiusKm: number,
    excludeProviderId: string,
  ): Promise<Array<{ providerId: string; sizeTier: SizeTier; priceSwapPln: number }>> {
    return this.prisma.$queryRaw`
      SELECT
        pt."providerId",
        pt."sizeTier",
        CAST(pt."priceSwapPln" AS FLOAT) AS "priceSwapPln"
      FROM pricing_tiers pt
      JOIN providers p ON p.id = pt."providerId"
      WHERE p.status = 'APPROVED'
        AND p.id != ${excludeProviderId}
        AND p."cityCenterLat" IS NOT NULL
        AND p."cityCenterLng" IS NOT NULL
        AND (
          6371 * acos(
            GREATEST(-1, LEAST(1,
              cos(radians(${lat})) * cos(radians(CAST(p."cityCenterLat" AS FLOAT)))
              * cos(radians(CAST(p."cityCenterLng" AS FLOAT)) - radians(${lng}))
              + sin(radians(${lat})) * sin(radians(CAST(p."cityCenterLat" AS FLOAT)))
            ))
          )
        ) <= ${radiusKm}
    `;
  }
}
