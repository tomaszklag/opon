import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { AppException, ErrorCode } from '../common/errors';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ProvidersService } from '../providers/providers.service';
import { AppBookingResponseDto } from './dto/app-booking-response.dto';
import { AppCreateBookingDto } from './dto/app-create-booking.dto';

const SLOT_MINUTES = 45;

const INACTIVE_STATUSES = [
  BookingStatus.CANCELLED_BY_CLIENT,
  BookingStatus.CANCELLED_BY_PROVIDER,
  BookingStatus.CANCELLED_BY_SYSTEM,
  BookingStatus.REJECTED,
  BookingStatus.NO_SHOW,
] as const;

const ACTIVE_STATUSES = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
] as const;

const PAST_STATUSES = [
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED_BY_CLIENT,
  BookingStatus.CANCELLED_BY_PROVIDER,
  BookingStatus.CANCELLED_BY_SYSTEM,
  BookingStatus.NO_SHOW,
  BookingStatus.REJECTED,
] as const;

type BookingWithProviderAndVehicle = Prisma.BookingGetPayload<{
  include: {
    provider: { select: { id: true; name: true; address: true; phone: true } };
    vehicle: { select: { tireSize: true } };
  };
}>;

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(10);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}

function normalizeStatus(
  status: BookingStatus,
): 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' {
  switch (status) {
    case BookingStatus.PENDING:
      return 'PENDING';
    case BookingStatus.CONFIRMED:
    case BookingStatus.IN_PROGRESS:
      return 'CONFIRMED';
    case BookingStatus.COMPLETED:
      return 'COMPLETED';
    default:
      return 'CANCELLED';
  }
}

@Injectable()
export class AppBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {}

  private toAppBookingDto(booking: BookingWithProviderAndVehicle): AppBookingResponseDto {
    return {
      id: booking.id,
      bookingCode: booking.referenceCode,
      status: normalizeStatus(booking.status),
      provider: {
        id: booking.provider.id,
        name: booking.provider.name,
        address: booking.provider.address ?? null,
        phone: booking.provider.phone ?? null,
      },
      slot: {
        id: booking.startAt.toISOString(),
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
      },
      vehicleTireSize: booking.vehicle?.tireSize ?? booking.tireSize ?? '',
      note: booking.clientNote ?? null,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  async listForClient(
    userId: string,
    statusFilter?: 'ACTIVE' | 'PAST',
  ): Promise<AppBookingResponseDto[]> {
    let statusIn: BookingStatus[] | undefined;

    if (statusFilter === 'ACTIVE') {
      statusIn = [...ACTIVE_STATUSES];
    } else if (statusFilter === 'PAST') {
      statusIn = [...PAST_STATUSES];
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        client: { userId },
        ...(statusIn ? { status: { in: statusIn } } : {}),
      },
      include: {
        provider: { select: { id: true, name: true, address: true, phone: true } },
        vehicle: { select: { tireSize: true } },
      },
      orderBy: { startAt: 'desc' },
    });

    return bookings.map((b) => this.toAppBookingDto(b));
  }

  async getForClient(userId: string, bookingId: string): Promise<AppBookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, client: { userId } },
      include: {
        provider: { select: { id: true, name: true, address: true, phone: true } },
        vehicle: { select: { tireSize: true } },
      },
    });

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    return this.toAppBookingDto(booking);
  }

  async createForClient(
    user: JwtPayload,
    dto: AppCreateBookingDto,
  ): Promise<AppBookingResponseDto> {
    const { providerId, slotId, vehicleId, address } = dto;

    // Verify provider exists and is APPROVED
    await this.providersService.getApprovedById(providerId);

    // Parse slot time
    const startAt = new Date(slotId);
    if (isNaN(startAt.getTime())) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'Nieprawidłowy format slotId (oczekiwano ISO 8601).',
        400,
      );
    }
    const endAt = new Date(startAt.getTime() + SLOT_MINUTES * 60 * 1000);

    // Verify vehicle belongs to current user and get tireSize
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: user.sub },
      select: { id: true, tireSize: true },
    });

    if (!vehicle) {
      throw new AppException(ErrorCode.NOT_FOUND, 'Pojazd nie istnieje lub brak dostępu.', 404);
    }

    // Find or create Client record (upsert by providerId+phone)
    const client = await this.prisma.client.upsert({
      where: { providerId_phone: { providerId, phone: user.phone } },
      create: {
        providerId,
        phone: user.phone,
        userId: user.sub,
        firstName: null,
        lastName: null,
      },
      update: { userId: user.sub },
      select: { id: true },
    });

    // Atomic capacity check + insert (Serializable transaction)
    let booking: BookingWithProviderAndVehicle;
    try {
      booking = await this.prisma.$transaction(
        async (tx) => {
          const overlap = await tx.booking.count({
            where: {
              providerId,
              startAt: { lt: endAt },
              endAt: { gt: startAt },
              status: { notIn: [...INACTIVE_STATUSES] },
            },
          });

          if (overlap > 0) {
            throw new AppException(ErrorCode.BOOKING_SLOT_TAKEN, 'Termin jest już zajęty.', 409);
          }

          const referenceCode = generateReferenceCode();

          return tx.booking.create({
            data: {
              referenceCode,
              clientId: client.id,
              providerId,
              vehicleId,
              status: BookingStatus.PENDING,
              startAt,
              endAt,
              tireSize: vehicle.tireSize,
              addressLine: address ?? null,
              isManual: false,
            },
            include: {
              provider: { select: { id: true, name: true, address: true, phone: true } },
              vehicle: { select: { tireSize: true } },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      // P2034: serialization failure — retry-safe 409
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2034') {
        throw new AppException(
          ErrorCode.BOOKING_SLOT_TAKEN,
          'Termin jest już zajęty — spróbuj ponownie.',
          409,
        );
      }
      throw err;
    }

    return this.toAppBookingDto(booking);
  }

  async cancelForClient(userId: string, bookingId: string): Promise<AppBookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, client: { userId } },
    });

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new AppException(
        ErrorCode.BOOKING_INVALID_STATUS,
        'Rezerwacja nie może zostać anulowana w bieżącym statusie.',
        422,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED_BY_CLIENT },
      include: {
        provider: { select: { id: true, name: true, address: true, phone: true } },
        vehicle: { select: { tireSize: true } },
      },
    });

    return this.toAppBookingDto(updated);
  }
}
