import { Injectable } from '@nestjs/common';
import { BookingResponseDto } from './dto/booking-response.dto';
import { BookingsRepository } from './bookings.repository';
import { Prisma } from '@prisma/client';

type BookingWithClient = Prisma.BookingGetPayload<{
  include: {
    client: {
      select: { phone: true; firstName: true; lastName: true };
    };
  };
}>;

@Injectable()
export class BookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  // ── helpers ───────────────────────────────────────────────────────────────

  private toResponseDto(booking: BookingWithClient): BookingResponseDto {
    const { client } = booking;

    const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ').trim();

    const clientName = fullName || client.phone;

    return {
      id: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      clientName,
      clientPhone: client.phone,
      tireSize: booking.tireSize ?? null,
      serviceType: booking.serviceType ?? null,
      sizeTier: booking.sizeTier ?? null,
      tpmsRequired: booking.tpmsRequired,
      basePricePln: booking.basePricePln != null ? Number(booking.basePricePln) : null,
      travelFeePln: booking.travelFeePln != null ? Number(booking.travelFeePln) : null,
      totalPricePln: booking.totalPricePln != null ? Number(booking.totalPricePln) : null,
      stationId: booking.stationId ?? null,
      notes: booking.notes ?? null,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  // ── list ──────────────────────────────────────────────────────────────────

  async listByProvider(providerId: string, weekStart?: string): Promise<BookingResponseDto[]> {
    let weekStartDate: Date | undefined;
    let weekEndDate: Date | undefined;

    if (weekStart) {
      weekStartDate = new Date(weekStart);
      weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);
    }

    const bookings = await this.bookingsRepository.findByProviderAndWeek(
      providerId,
      weekStartDate,
      weekEndDate,
    );

    return bookings.map((b) => this.toResponseDto(b));
  }
}
