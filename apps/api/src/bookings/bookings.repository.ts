import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type BookingWithClient = Prisma.BookingGetPayload<{
  include: {
    client: {
      select: { phone: true; firstName: true; lastName: true };
    };
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
}
