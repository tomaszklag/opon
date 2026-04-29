import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
