import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpsertServiceDto } from './dto/upsert-services.dto';
import type { UpsertAddonDto } from './dto/upsert-addons.dto';

const INCLUDE_FULL = {
  variants: { orderBy: { sortOrder: 'asc' as const } },
  subLinks: { select: { subId: true }, orderBy: { sortOrder: 'asc' as const } },
  addonLinks: { select: { addonId: true }, orderBy: { sortOrder: 'asc' as const } },
};

const ACTIVE_STATUSES = [
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(providerId: string) {
    return this.prisma.service.findMany({
      where: { providerId, deletedAt: null },
      include: INCLUDE_FULL,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async replaceAll(providerId: string, dtos: UpsertServiceDto[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.service.deleteMany({ where: { providerId, deletedAt: null } });

      const created: Array<{ dto: UpsertServiceDto; id: string }> = [];

      for (const dto of dtos) {
        const service = await tx.service.create({
          data: {
            id: dto.id,
            providerId,
            name: dto.name,
            description: dto.description ?? null,
            pricingType: dto.pricingType as 'FLAT' | 'VARIANTS' | 'RIM_SIZES',
            enabled: dto.enabled,
            sortOrder: dto.sortOrder,
            variants: {
              create: dto.variants.map((v) => ({
                id: v.id,
                name: v.name ?? null,
                rimSizes: v.rimSizes,
                pricePln: v.pricePln,
                durationMinutes: v.durationMinutes,
                pricePerWheelPln: v.pricePerWheelPln ?? null,
                durationPerWheelMinutes: v.durationPerWheelMinutes ?? null,
                sortOrder: v.sortOrder,
              })),
            },
          },
          select: { id: true },
        });
        created.push({ dto, id: service.id });
      }

      for (const { dto, id: serviceId } of created) {
        for (let i = 0; i < dto.subServiceIds.length; i++) {
          const subId = dto.subServiceIds[i];
          if (!subId) continue;
          await tx.serviceSubLink.create({
            data: { parentId: serviceId, subId, sortOrder: i },
          });
        }

        for (let i = 0; i < dto.addonIds.length; i++) {
          const addonId = dto.addonIds[i];
          if (!addonId) continue;
          await tx.serviceAddonLink.create({
            data: { serviceId, addonId, sortOrder: i },
          });
        }
      }

      return tx.service.findMany({
        where: { providerId, deletedAt: null },
        include: INCLUDE_FULL,
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async deleteService(id: string, providerId: string): Promise<boolean> {
    const soft = await this.providerHasActiveBookings(providerId);
    if (soft) {
      await this.prisma.service.updateMany({
        where: { id, providerId },
        data: { deletedAt: new Date(), enabled: false },
      });
      return false;
    }
    await this.prisma.service.deleteMany({ where: { id, providerId } });
    return true;
  }

  findAllAddons(providerId: string) {
    return this.prisma.addon.findMany({
      where: { providerId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async replaceAllAddons(providerId: string, dtos: UpsertAddonDto[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.addon.deleteMany({ where: { providerId, deletedAt: null } });
      await tx.addon.createMany({
        data: dtos.map((d) => ({
          id: d.id,
          providerId,
          name: d.name,
          pricePln: d.pricePln,
          durationMinutes: d.durationMinutes ?? null,
          enabled: d.enabled,
          sortOrder: d.sortOrder,
        })),
      });
      return tx.addon.findMany({
        where: { providerId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async deleteAddon(id: string, providerId: string): Promise<boolean> {
    const soft = await this.providerHasActiveBookings(providerId);
    if (soft) {
      await this.prisma.addon.updateMany({
        where: { id, providerId },
        data: { deletedAt: new Date(), enabled: false },
      });
      return false;
    }
    await this.prisma.addon.deleteMany({ where: { id, providerId } });
    return true;
  }

  private async providerHasActiveBookings(providerId: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: { providerId, status: { in: ACTIVE_STATUSES } },
    });
    return count > 0;
  }
}
