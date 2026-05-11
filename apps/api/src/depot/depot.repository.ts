import { Injectable } from '@nestjs/common';
import { Prisma, TireCondition, TireSetStatus, TireType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type TireSetWithRelations = Prisma.TireSetGetPayload<{
  include: {
    slot: { select: { section: true; row: true; position: true; label: true } };
    periods: { orderBy: { storedAt: 'desc' }; take: 1 };
  };
}>;

type TireSetDetail = Prisma.TireSetGetPayload<{
  include: {
    slot: { select: { section: true; row: true; position: true; label: true } };
    periods: { orderBy: { storedAt: 'desc' } };
  };
}>;

@Injectable()
export class DepotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    providerId: string,
    opts: { status?: TireSetStatus; search?: string; page: number; pageSize: number },
  ): Promise<{ items: TireSetWithRelations[]; total: number }> {
    const where: Prisma.TireSetWhereInput = {
      providerId,
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              { clientName: { contains: opts.search, mode: 'insensitive' } },
              { clientPhone: { contains: opts.search } },
              { licensePlate: { contains: opts.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const include = {
      slot: { select: { section: true, row: true, position: true, label: true } },
      periods: { orderBy: { storedAt: 'desc' as const }, take: 1 },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tireSet.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.tireSet.count({ where }),
    ]);

    return { items, total };
  }

  findById(providerId: string, id: string): Promise<TireSetDetail | null> {
    return this.prisma.tireSet.findUnique({
      where: { id, providerId },
      include: {
        slot: { select: { section: true, row: true, position: true, label: true } },
        periods: { orderBy: { storedAt: 'desc' } },
      },
    });
  }

  async create(data: {
    providerId: string;
    clientPhone: string;
    clientName: string;
    vehicleName?: string;
    licensePlate?: string;
    brand?: string;
    model?: string;
    tireSize: string;
    tireType: TireType;
    isOnRims: boolean;
    dotCode?: string;
    treadDepthMm?: number;
    slotId?: string;
    storagePricePln?: number;
    storedAt?: Date;
    releaseDue?: Date;
    sourceBookingId?: string;
    notes?: string;
  }): Promise<TireSetDetail> {
    const client = await this.prisma.user.upsert({
      where: { phone: data.clientPhone },
      create: { phone: data.clientPhone, firstName: data.clientName, role: UserRole.CLIENT },
      update: {},
    });

    return this.prisma.tireSet.create({
      data: {
        providerId: data.providerId,
        clientId: client.id,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        vehicleName: data.vehicleName ?? null,
        licensePlate: data.licensePlate ?? null,
        brand: data.brand ?? null,
        model: data.model ?? null,
        tireSize: data.tireSize,
        tireType: data.tireType,
        isOnRims: data.isOnRims,
        dotCode: data.dotCode ?? null,
        treadDepthMm: data.treadDepthMm ?? null,
        slotId: data.slotId ?? null,
        storagePricePln: data.storagePricePln ?? null,
        sourceBookingId: data.sourceBookingId ?? null,
        notes: data.notes ?? null,
        status: TireSetStatus.IN_DEPOT,
        periods: {
          create: {
            storedAt: data.storedAt ?? new Date(),
            releaseDue: data.releaseDue ?? null,
            pricePln: data.storagePricePln ?? null,
          },
        },
      },
      include: {
        slot: { select: { section: true, row: true, position: true, label: true } },
        periods: { orderBy: { storedAt: 'desc' } },
      },
    });
  }

  async update(
    providerId: string,
    id: string,
    data: {
      clientName?: string;
      vehicleName?: string | null;
      licensePlate?: string | null;
      brand?: string | null;
      model?: string | null;
      tireSize?: string;
      tireType?: TireType;
      isOnRims?: boolean;
      dotCode?: string | null;
      treadDepthMm?: number | null;
      condition?: TireCondition;
      slotId?: string | null;
      storagePricePln?: number | null;
      notes?: string | null;
    },
  ): Promise<TireSetDetail> {
    return this.prisma.tireSet.update({
      where: { id, providerId },
      data: {
        ...data,
        storagePricePln: data.storagePricePln !== undefined ? data.storagePricePln : undefined,
      },
      include: {
        slot: { select: { section: true, row: true, position: true, label: true } },
        periods: { orderBy: { storedAt: 'desc' } },
      },
    });
  }

  async pickup(providerId: string, id: string): Promise<TireSetDetail> {
    const now = new Date();

    await this.prisma.storagePeriod.updateMany({
      where: { tireSetId: id, pickedUpAt: null },
      data: { pickedUpAt: now },
    });

    return this.prisma.tireSet.update({
      where: { id, providerId },
      data: { status: TireSetStatus.PICKED_UP, slotId: null },
      include: {
        slot: { select: { section: true, row: true, position: true, label: true } },
        periods: { orderBy: { storedAt: 'desc' } },
      },
    });
  }

  async store(
    providerId: string,
    id: string,
    data: { storedAt?: Date; releaseDue?: Date; pricePln?: number; notes?: string },
  ): Promise<TireSetDetail> {
    return this.prisma.tireSet.update({
      where: { id, providerId },
      data: {
        status: TireSetStatus.IN_DEPOT,
        periods: {
          create: {
            storedAt: data.storedAt ?? new Date(),
            releaseDue: data.releaseDue ?? null,
            pricePln: data.pricePln ?? null,
            notes: data.notes ?? null,
          },
        },
      },
      include: {
        slot: { select: { section: true, row: true, position: true, label: true } },
        periods: { orderBy: { storedAt: 'desc' } },
      },
    });
  }

  async remove(providerId: string, id: string): Promise<void> {
    await this.prisma.tireSet.delete({ where: { id, providerId } });
  }

  async getStats(
    providerId: string,
  ): Promise<{ inDepot: number; dueSoon: number; revenueMonth: number }> {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [inDepot, dueSoon, revenueAgg] = await this.prisma.$transaction([
      this.prisma.tireSet.count({ where: { providerId, status: TireSetStatus.IN_DEPOT } }),
      this.prisma.storagePeriod.count({
        where: {
          tireSet: { providerId },
          pickedUpAt: null,
          releaseDue: { lte: in30Days, gte: now },
        },
      }),
      this.prisma.storagePeriod.aggregate({
        where: {
          tireSet: { providerId },
          storedAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { pricePln: true },
      }),
    ]);

    return {
      inDepot,
      dueSoon,
      revenueMonth: Number(revenueAgg._sum.pricePln ?? 0),
    };
  }

  // ── Slots ────────────────────────────────────────────────────────────────────

  async findSlots(providerId: string) {
    return this.prisma.depotSlot.findMany({
      where: { providerId },
      include: {
        tireSets: {
          where: { status: TireSetStatus.IN_DEPOT },
          select: { id: true, clientName: true },
        },
      },
      orderBy: [{ section: 'asc' }, { row: 'asc' }, { position: 'asc' }],
    });
  }

  async bulkCreateSlots(
    providerId: string,
    section: string,
    rowFrom: number,
    rowTo: number,
    positionsPerRow: number,
  ) {
    const data: Prisma.DepotSlotCreateManyInput[] = [];
    for (let row = rowFrom; row <= rowTo; row++) {
      for (let position = 1; position <= positionsPerRow; position++) {
        data.push({ providerId, section, row, position });
      }
    }
    await this.prisma.depotSlot.createMany({ data, skipDuplicates: true });
    return this.findSlots(providerId);
  }

  async removeSlot(providerId: string, slotId: string): Promise<void> {
    await this.prisma.depotSlot.delete({ where: { id: slotId, providerId } });
  }
}
