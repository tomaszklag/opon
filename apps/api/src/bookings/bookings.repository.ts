import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminStatusFilter } from './dto/booking-admin-list-query.dto';

export interface ManualBookingData {
  clientPhone: string;
  clientName: string;
  providerId: string;
  startAt: Date;
  endAt: Date;
  tireSize: string | null;
  totalPricePln: number | null;
  serviceName: string | null;
  serviceDetails: { subServices?: { name: string; pricePln: number | null }[] } | null;
  notes: string | null;
  status: BookingStatus;
  confirmedAt: Date | null;
  workerId: string | null;
  stationId: string | null;
  isCustomService: boolean;
  customPricePln: number | null;
  customDurationMinutes: number | null;
}

type BookingWithClient = Prisma.BookingGetPayload<{
  include: {
    client: {
      select: { phone: true; firstName: true; lastName: true };
    };
    worker: {
      select: { name: true };
    };
  };
}>;

export type BookingWithDetail = Prisma.BookingGetPayload<{
  include: {
    client: { select: { phone: true; firstName: true; lastName: true } };
    vehicle: { select: { nickname: true; tireSize: true } };
    worker: { select: { name: true } };
    station: { select: { name: true } };
  };
}>;

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private generateReferenceCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(10);
    return Array.from(bytes)
      .map((b) => chars[b % chars.length])
      .join('');
  }

  private bookingCreatePayload(data: ManualBookingData, clientId: string, referenceCode: string) {
    return {
      referenceCode,
      clientId,
      providerId: data.providerId,
      startAt: data.startAt,
      endAt: data.endAt,
      tireSize: data.tireSize,
      totalPricePln: data.totalPricePln,
      serviceName: data.serviceName,
      serviceDetails: data.serviceDetails ?? undefined,
      notes: data.notes,
      isManual: true,
      isCustomService: data.isCustomService,
      customPricePln: data.customPricePln,
      customDurationMinutes: data.customDurationMinutes,
      status: data.status,
      confirmedAt: data.confirmedAt,
      workerId: data.workerId,
      stationId: data.stationId,
    };
  }

  private splitName(fullName: string): { firstName: string; lastName: string | null } {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? fullName;
    const lastName = parts.slice(1).join(' ') || null;
    return { firstName, lastName };
  }

  async createManual(data: ManualBookingData): Promise<BookingWithClient> {
    const { firstName, lastName } = this.splitName(data.clientName);
    const client = await this.prisma.client.upsert({
      where: { providerId_phone: { providerId: data.providerId, phone: data.clientPhone } },
      create: { providerId: data.providerId, phone: data.clientPhone, firstName, lastName },
      update: {},
      select: { id: true },
    });
    const referenceCode = this.generateReferenceCode();
    return this.prisma.booking.create({
      data: this.bookingCreatePayload(data, client.id, referenceCode),
      include: {
        client: { select: { phone: true, firstName: true, lastName: true } },
        worker: { select: { name: true } },
      },
    });
  }

  /** Variant that runs inside an already-open Prisma interactive transaction. */
  async createManualTx(
    tx: Prisma.TransactionClient,
    data: ManualBookingData,
  ): Promise<BookingWithClient> {
    const { firstName, lastName } = this.splitName(data.clientName);
    const client = await tx.client.upsert({
      where: { providerId_phone: { providerId: data.providerId, phone: data.clientPhone } },
      create: { providerId: data.providerId, phone: data.clientPhone, firstName, lastName },
      update: {},
      select: { id: true },
    });
    const referenceCode = this.generateReferenceCode();
    return tx.booking.create({
      data: this.bookingCreatePayload(data, client.id, referenceCode),
      include: {
        client: { select: { phone: true, firstName: true, lastName: true } },
        worker: { select: { name: true } },
      },
    });
  }

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
        worker: {
          select: { name: true },
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
        worker: { select: { name: true } },
        station: { select: { name: true } },
      },
    });
  }

  async rescheduleBooking(
    bookingId: string,
    providerId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<BookingWithClient> {
    return this.prisma.booking.update({
      where: { id: bookingId, providerId },
      data: { startAt, endAt },
      include: {
        client: { select: { phone: true, firstName: true, lastName: true } },
        worker: { select: { name: true } },
      },
    });
  }

  countClientBookings(clientId: string, providerId: string): Promise<number> {
    return this.prisma.booking.count({ where: { clientId, providerId } });
  }

  async getClientLastVisitAt(clientId: string, providerId: string): Promise<Date | null> {
    const row = await this.prisma.booking.findFirst({
      where: { clientId, providerId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });
    return row?.completedAt ?? null;
  }

  countClientUpcomingBookings(
    clientId: string,
    providerId: string,
    currentId: string,
  ): Promise<number> {
    return this.prisma.booking.count({
      where: {
        clientId,
        providerId,
        id: { not: currentId },
        startAt: { gt: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
  }

  async searchClients(
    providerId: string,
    q: string,
    limit = 8,
  ): Promise<{ phone: string; name: string }[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        providerId,
        OR: [
          { phone: { contains: q } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { phone: true, firstName: true, lastName: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return clients.map(({ phone, firstName, lastName }) => ({
      phone,
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || phone,
    }));
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
        include: {
          client: { select: { phone: true, firstName: true, lastName: true } },
          worker: { select: { name: true } },
        },
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
  ): Promise<string[]> {
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
    return ids;
  }

  async updateStatus(
    id: string,
    providerId: string,
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
      where: { id, providerId },
      data: {
        status,
        ...timestamps,
        ...(reason ? (isReject ? { rejectReason: reason } : { cancelReason: reason }) : {}),
      },
    });
  }

  async updateNotes(id: string, providerId: string, notes: string | null): Promise<void> {
    await this.prisma.booking.update({
      where: { id, providerId },
      data: { notes },
    });
  }

  findProviderPause(providerId: string) {
    return this.prisma.provider.findUnique({
      where: { id: providerId },
      select: { pausedUntil: true },
    });
  }

  countTireSetsForBooking(bookingId: string, providerId: string): Promise<number> {
    return this.prisma.tireSet.count({ where: { sourceBookingId: bookingId, providerId } });
  }

  async getCustomServiceSuggestions(
    providerId: string,
    q: string,
    limit = 8,
  ): Promise<
    { name: string; avgPricePln: number | null; avgDurationMinutes: number | null; count: number }[]
  > {
    const rows = await this.prisma.booking.groupBy({
      by: ['serviceName'],
      where: {
        providerId,
        isCustomService: true,
        serviceName: q ? { contains: q, mode: 'insensitive' } : { not: null },
      },
      _count: { serviceName: true },
      _avg: { customPricePln: true, customDurationMinutes: true },
      orderBy: { _count: { serviceName: 'desc' } },
      take: limit,
    });

    return rows
      .filter((r) => r.serviceName != null)
      .map((r) => ({
        name: r.serviceName as string,
        avgPricePln: r._avg?.customPricePln != null ? Number(r._avg.customPricePln) : null,
        avgDurationMinutes:
          r._avg?.customDurationMinutes != null ? Math.round(r._avg.customDurationMinutes) : null,
        count: r._count?.serviceName ?? 0,
      }));
  }
}
