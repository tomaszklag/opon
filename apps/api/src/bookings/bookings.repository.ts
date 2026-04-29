import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminStatusFilter } from './dto/booking-admin-list-query.dto';

type BookingWithClient = Prisma.BookingGetPayload<{
  include: {
    client: {
      select: { phone: true; firstName: true; lastName: true };
    };
  };
}>;

export type BookingWithDetail = Prisma.BookingGetPayload<{
  include: {
    client: { select: { phone: true; firstName: true; lastName: true } };
    vehicle: { select: { nickname: true; tireSize: true } };
  };
}>;

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProviderAndWeek(
    providerId: string,
    weekStart?: Date,
    weekEnd?: Date,
  ): Promise<BookingWithClient[]> {
    return this.prisma.booking.findMany({
      where: {
        providerId,
        ...(weekStart && weekEnd ? { startAt: { gte: weekStart, lt: weekEnd } } : {}),
      },
      include: {
        client: {
          select: { phone: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  findDetailByReferenceCode(
    providerId: string,
    referenceCode: string,
  ): Promise<BookingWithDetail | null> {
    return this.prisma.booking.findUnique({
      where: { referenceCode, providerId },
      include: {
        client: { select: { phone: true, firstName: true, lastName: true } },
        vehicle: { select: { nickname: true, tireSize: true } },
      },
    });
  }

  countClientBookings(clientId: string, providerId: string): Promise<number> {
    return this.prisma.booking.count({ where: { clientId, providerId } });
  }

  async findAdminList(
    providerId: string,
    opts: {
      search?: string;
      status?: AdminStatusFilter;
      dateFrom?: Date;
      dateTo?: Date;
      page: number;
      pageSize: number;
      sortBy: string;
      sortDir: string;
    },
  ): Promise<{ items: BookingWithClient[]; total: number }> {
    const statusMap: Record<string, BookingStatus[]> = {
      pending: [BookingStatus.PENDING],
      confirmed: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      completed: [BookingStatus.COMPLETED],
      cancelled: [
        BookingStatus.CANCELLED_BY_CLIENT,
        BookingStatus.CANCELLED_BY_PROVIDER,
        BookingStatus.CANCELLED_BY_SYSTEM,
        BookingStatus.REJECTED,
      ],
      no_show: [BookingStatus.NO_SHOW],
      all: [],
    };

    const statuses = opts.status && opts.status !== 'all' ? statusMap[opts.status] : undefined;

    const where: Prisma.BookingWhereInput = {
      providerId,
      ...(statuses?.length ? { status: { in: statuses } } : {}),
      ...(opts.dateFrom || opts.dateTo
        ? { startAt: { gte: opts.dateFrom, lte: opts.dateTo } }
        : {}),
      ...(opts.search
        ? {
            OR: [
              { referenceCode: { contains: opts.search, mode: 'insensitive' } },
              { client: { firstName: { contains: opts.search, mode: 'insensitive' } } },
              { client: { lastName: { contains: opts.search, mode: 'insensitive' } } },
              { client: { phone: { contains: opts.search } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: { client: { select: { phone: true, firstName: true, lastName: true } } },
        orderBy: { [opts.sortBy]: opts.sortDir },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async getStats(
    providerId: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<{
    total: number;
    revenuePln: number;
    avgValuePln: number;
    completedCount: number;
    nonShowCount: number;
  }> {
    const where: Prisma.BookingWhereInput = {
      providerId,
      startAt: { gte: dateFrom, lte: dateTo },
      status: {
        notIn: [
          BookingStatus.CANCELLED_BY_CLIENT,
          BookingStatus.CANCELLED_BY_PROVIDER,
          BookingStatus.CANCELLED_BY_SYSTEM,
          BookingStatus.REJECTED,
        ],
      },
    };

    const agg = await this.prisma.booking.aggregate({
      where,
      _count: { id: true },
      _sum: { totalPricePln: true },
      _avg: { totalPricePln: true },
    });

    const completedCount = await this.prisma.booking.count({
      where: { ...where, status: BookingStatus.COMPLETED },
    });
    const noShowCount = await this.prisma.booking.count({
      where: { ...where, status: BookingStatus.NO_SHOW },
    });

    const total = agg._count.id;
    const revenuePln = Number(agg._sum.totalPricePln ?? 0);
    const avgValuePln = Number(agg._avg.totalPricePln ?? 0);

    return { total, revenuePln, avgValuePln, completedCount, nonShowCount: noShowCount };
  }

  async bulkUpdateStatus(
    providerId: string,
    ids: string[],
    action: 'confirm' | 'cancel',
  ): Promise<void> {
    const now = new Date();
    if (action === 'confirm') {
      await this.prisma.booking.updateMany({
        where: { id: { in: ids }, providerId, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CONFIRMED, confirmedAt: now },
      });
    } else {
      await this.prisma.booking.updateMany({
        where: {
          id: { in: ids },
          providerId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
        data: { status: BookingStatus.CANCELLED_BY_PROVIDER, cancelledAt: now },
      });
    }
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    timestamps: Partial<{
      confirmedAt: Date;
      startedAt: Date;
      completedAt: Date;
      cancelledAt: Date;
    }>,
    reason?: string,
    isReject = false,
  ): Promise<void> {
    await this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...timestamps,
        ...(reason ? (isReject ? { rejectReason: reason } : { cancelReason: reason }) : {}),
      },
    });
  }
}
