import { Injectable } from '@nestjs/common';
import { Prisma, SurchargeScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertServiceGroupDto } from './dto/upsert-service-groups.dto';
import { UpsertSurchargeDto } from './dto/upsert-surcharges.dto';

export type ServiceGroupWithRelations = Prisma.ServiceGroupGetPayload<{
  include: {
    variants: {
      include: {
        rimTiers: true;
        subServices: true;
      };
    };
  };
}>;

export type SurchargeRecord = Prisma.SurchargeGetPayload<Record<string, never>>;

@Injectable()
export class ServiceGroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findGroupsByProvider(providerId: string): Promise<ServiceGroupWithRelations[]> {
    return this.prisma.serviceGroup.findMany({
      where: { providerId },
      orderBy: { sortOrder: 'asc' },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
          include: {
            rimTiers: {
              orderBy: { sortOrder: 'asc' },
            },
            subServices: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  async replaceGroups(
    providerId: string,
    groups: UpsertServiceGroupDto[],
  ): Promise<ServiceGroupWithRelations[]> {
    await this.prisma.$transaction(async (tx) => {
      await tx.serviceGroup.deleteMany({ where: { providerId } });

      for (const group of groups) {
        await tx.serviceGroup.create({
          data: {
            providerId,
            name: group.name,
            pricingMode: group.pricingMode,
            sortOrder: group.sortOrder,
            variants: {
              create: group.variants.map((variant) => ({
                name: variant.name,
                enabled: variant.enabled,
                sortOrder: variant.sortOrder,
                rimTiers: {
                  create: variant.rimTiers.map((rt) => ({
                    rimSizes: rt.rimSizes,
                    pricePln: rt.pricePln,
                    durationMinutes: rt.durationMinutes,
                    sortOrder: rt.sortOrder,
                  })),
                },
                subServices: {
                  create: variant.subServices.map((ss) => ({
                    name: ss.name,
                    included: ss.included,
                    enabled: ss.enabled,
                    fromCatalog: ss.fromCatalog,
                    pricePln: ss.pricePln ?? null,
                    durationMinutes: ss.durationMinutes ?? null,
                    sortOrder: ss.sortOrder,
                  })),
                },
              })),
            },
          },
        });
      }
    });

    return this.findGroupsByProvider(providerId);
  }

  findSurchargesByProvider(providerId: string): Promise<SurchargeRecord[]> {
    return this.prisma.surcharge.findMany({
      where: { providerId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async replaceSurcharges(
    providerId: string,
    surcharges: UpsertSurchargeDto[],
  ): Promise<SurchargeRecord[]> {
    await this.prisma.$transaction(async (tx) => {
      await tx.surcharge.deleteMany({ where: { providerId } });

      if (surcharges.length > 0) {
        await tx.surcharge.createMany({
          data: surcharges.map((s) => ({
            providerId,
            name: s.name,
            enabled: s.enabled,
            scope: s.scope as SurchargeScope,
            pricePln: s.pricePln,
            sortOrder: s.sortOrder,
          })),
        });
      }
    });

    return this.findSurchargesByProvider(providerId);
  }
}
