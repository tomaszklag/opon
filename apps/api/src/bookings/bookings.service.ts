import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { BookingDetailResponseDto } from './dto/booking-detail-response.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsRepository, BookingWithDetail } from './bookings.repository';
import { BookingAdminListQueryDto } from './dto/booking-admin-list-query.dto';
import { BookingPageResponseDto } from './dto/booking-page-response.dto';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';

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
      isManual: booking.isManual,
    };
  }

  // ── detail helpers ────────────────────────────────────────────────────────

  private toDetailResponseDto(
    booking: BookingWithDetail,
    bookingCount: number,
  ): BookingDetailResponseDto {
    const { client, vehicle } = booking;
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ').trim();
    const clientName = fullName || client.phone;

    return {
      id: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      client: {
        clientId: booking.clientId,
        clientName,
        clientPhone: client.phone,
        bookingCount,
      },
      vehicle: vehicle
        ? {
            vehicleId: booking.vehicleId as string,
            nickname: vehicle.nickname,
            tireSize: vehicle.tireSize,
          }
        : null,
      addressLine: booking.addressLine ?? null,
      addressCity: booking.addressCity ?? null,
      addressLat: booking.addressLat != null ? Number(booking.addressLat) : null,
      addressLng: booking.addressLng != null ? Number(booking.addressLng) : null,
      tireSize: booking.tireSize ?? null,
      serviceType: booking.serviceType ?? null,
      sizeTier: booking.sizeTier ?? null,
      tpmsRequired: booking.tpmsRequired,
      basePricePln: booking.basePricePln != null ? Number(booking.basePricePln) : null,
      travelFeePln: booking.travelFeePln != null ? Number(booking.travelFeePln) : null,
      totalPricePln: booking.totalPricePln != null ? Number(booking.totalPricePln) : null,
      stationId: booking.stationId ?? null,
      notes: booking.notes ?? null,
      rejectReason: booking.rejectReason ?? null,
      cancelReason: booking.cancelReason ?? null,
      isManual: booking.isManual,
      createdAt: booking.createdAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
      startedAt: booking.startedAt?.toISOString() ?? null,
      completedAt: booking.completedAt?.toISOString() ?? null,
      cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    };
  }

  // ── create manual ─────────────────────────────────────────────────────────

  async createManual(providerId: string, dto: CreateManualBookingDto): Promise<BookingResponseDto> {
    const status = dto.autoConfirm !== false ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
    const confirmedAt = status === BookingStatus.CONFIRMED ? new Date() : null;

    const booking = await this.bookingsRepository.createManual({
      clientPhone: dto.clientPhone,
      clientName: dto.clientName,
      providerId,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      tireSize: dto.tireSize ?? null,
      totalPricePln: dto.totalPricePln ?? null,
      serviceType: dto.serviceType ?? null,
      notes: dto.notes ?? null,
      status,
      confirmedAt,
    });

    return this.toResponseDto(booking);
  }

  // ── get detail ────────────────────────────────────────────────────────────

  async getDetail(providerId: string, referenceCode: string): Promise<BookingDetailResponseDto> {
    const booking = await this.bookingsRepository.findDetailByReferenceCode(
      providerId,
      referenceCode,
    );

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    const bookingCount = await this.bookingsRepository.countClientBookings(
      booking.clientId,
      providerId,
    );

    return this.toDetailResponseDto(booking, bookingCount);
  }

  // ── update status ─────────────────────────────────────────────────────────

  async updateStatus(
    providerId: string,
    referenceCode: string,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingDetailResponseDto> {
    const booking = await this.bookingsRepository.findDetailByReferenceCode(
      providerId,
      referenceCode,
    );

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    const now = new Date();
    const { action } = dto;
    let newStatus: BookingStatus;
    let timestamps: Partial<{
      confirmedAt: Date;
      startedAt: Date;
      completedAt: Date;
      cancelledAt: Date;
    }> = {};
    let isReject = false;

    const currentStatus = booking.status;

    if (action === 'confirm' && currentStatus === BookingStatus.PENDING) {
      newStatus = BookingStatus.CONFIRMED;
      timestamps = { confirmedAt: now };
    } else if (action === 'start' && currentStatus === BookingStatus.CONFIRMED) {
      newStatus = BookingStatus.IN_PROGRESS;
      timestamps = { startedAt: now };
    } else if (action === 'complete' && currentStatus === BookingStatus.IN_PROGRESS) {
      newStatus = BookingStatus.COMPLETED;
      timestamps = { completedAt: now };
    } else if (
      action === 'cancel' &&
      (currentStatus === BookingStatus.CONFIRMED || currentStatus === BookingStatus.IN_PROGRESS)
    ) {
      newStatus = BookingStatus.CANCELLED_BY_PROVIDER;
      timestamps = { cancelledAt: now };
    } else if (
      action === 'no_show' &&
      (currentStatus === BookingStatus.CONFIRMED || currentStatus === BookingStatus.IN_PROGRESS)
    ) {
      newStatus = BookingStatus.NO_SHOW;
      timestamps = { cancelledAt: now };
    } else if (action === 'reject' && currentStatus === BookingStatus.PENDING) {
      newStatus = BookingStatus.REJECTED;
      timestamps = { cancelledAt: now };
      isReject = true;
    } else {
      throw new AppException(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe przejście statusu.', 400);
    }

    await this.bookingsRepository.updateStatus(
      booking.id,
      newStatus,
      timestamps,
      dto.reason,
      isReject,
    );

    return this.getDetail(providerId, referenceCode);
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

  async listAdmin(
    providerId: string,
    query: BookingAdminListQueryDto,
  ): Promise<BookingPageResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? 'startAt';
    const sortDir = query.sortDir ?? 'desc';

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const { items, total } = await this.bookingsRepository.findAdminList(providerId, {
      search: query.search,
      status: query.status,
      dateFrom,
      dateTo,
      page,
      pageSize,
      sortBy,
      sortDir,
    });

    return {
      items: items.map((b) => this.toResponseDto(b)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStats(providerId: string): Promise<BookingStatsResponseDto> {
    const now = new Date();
    const dateTo = new Date(now);
    const dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 30);

    const prevDateTo = new Date(dateFrom);
    prevDateTo.setDate(prevDateTo.getDate() - 1);
    const prevDateFrom = new Date(prevDateTo);
    prevDateFrom.setDate(prevDateFrom.getDate() - 30);

    const [curr, prev] = await Promise.all([
      this.bookingsRepository.getStats(providerId, dateFrom, dateTo),
      this.bookingsRepository.getStats(providerId, prevDateFrom, prevDateTo),
    ]);

    const completionRate =
      curr.total > 0 ? Math.round(((curr.total - curr.nonShowCount) / curr.total) * 100) : 100;
    const completionRatePrev =
      prev.total > 0 ? Math.round(((prev.total - prev.nonShowCount) / prev.total) * 100) : null;

    return {
      total: curr.total,
      totalPrev: prev.total,
      revenuePln: Math.round(curr.revenuePln * 100) / 100,
      revenuePrevPln: Math.round(prev.revenuePln * 100) / 100,
      avgValuePln: Math.round(curr.avgValuePln * 100) / 100,
      completionRate,
      completionRatePrev,
    };
  }

  async bulkUpdateStatus(providerId: string, dto: BulkUpdateStatusDto): Promise<void> {
    await this.bookingsRepository.bulkUpdateStatus(providerId, dto.ids, dto.action);
  }
}
