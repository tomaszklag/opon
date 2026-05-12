import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma, ServiceType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppException, ErrorCode } from '../common/errors';
import { WorkerTasksService } from '../worker-tasks/worker-tasks.service';
import { BookingDetailResponseDto } from './dto/booking-detail-response.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsRepository, BookingWithDetail } from './bookings.repository';
import { BookingAdminListQueryDto } from './dto/booking-admin-list-query.dto';
import { BookingPageResponseDto } from './dto/booking-page-response.dto';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { AvailabilityResponseDto, AvailabilitySlotDto } from './dto/availability-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingCreatedEvent,
  BookingRescheduledEvent,
  BookingStatusChangedEvent,
  BookingBulkStatusChangedEvent,
} from '../realtime/events/booking.events';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';

interface DaySchedule {
  dayOfWeek: number;
  open: boolean;
  startTime: string;
  endTime: string;
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

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly workerTasksService: WorkerTasksService,
  ) {}

  // ── helpers ───────────────────────────────────────────────────────────────

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
  }

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
      workerName: booking.worker?.name ?? null,
      notes: booking.notes ?? null,
      createdAt: booking.createdAt.toISOString(),
      isManual: booking.isManual,
    };
  }

  // ── detail helpers ────────────────────────────────────────────────────────

  private toDetailResponseDto(
    booking: BookingWithDetail,
    bookingCount: number,
    hasTireSetsInDepot: boolean,
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
      hasTireSetsInDepot,
      createdAt: booking.createdAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString() ?? null,
      startedAt: booking.startedAt?.toISOString() ?? null,
      completedAt: booking.completedAt?.toISOString() ?? null,
      cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    };
  }

  // ── create manual ─────────────────────────────────────────────────────────

  private async validateManualSlot(
    providerId: string,
    startAt: Date,
    endAt: Date,
    workerId?: string | null,
  ): Promise<void> {
    const dayOfWeek = startAt.getUTCDay();
    const dateStr = startAt.toISOString().slice(0, 10);

    const [stations, provider, exception] = await Promise.all([
      this.prisma.station.findMany({ where: { providerId }, select: { schedule: true } }),
      this.prisma.provider.findUnique({ where: { id: providerId } }),
      this.prisma.scheduleException.findUnique({
        where: { providerId_date: { providerId, date: new Date(dateStr) } },
      }),
    ]);

    const isOpenDay = stations.some((s) =>
      ((s.schedule as unknown as DaySchedule[]) ?? []).some(
        (d) => d.dayOfWeek === dayOfWeek && d.open,
      ),
    );

    if (exception) {
      if (!exception.customOpenTime) {
        throw new AppException(
          ErrorCode.BOOKING_OUTSIDE_HOURS,
          'Warsztat jest zamknięty w tym dniu (wyjątek kalendarzowy).',
          422,
        );
      }
    } else if (!isOpenDay) {
      throw new AppException(
        ErrorCode.BOOKING_OUTSIDE_HOURS,
        'Warsztat jest zamknięty w tym dniu.',
        422,
      );
    }

    if (provider?.pausedUntil && provider.pausedUntil > new Date()) {
      throw new AppException(ErrorCode.PROVIDER_PAUSED, 'Warsztat ma aktywną pauzę.', 422);
    }

    if (workerId) {
      const [leave, tasks] = await Promise.all([
        this.prisma.workerLeave.findFirst({
          where: { workerId, startDate: { lte: startAt }, endDate: { gte: startAt } },
        }),
        this.workerTasksService.findActiveInRange(workerId, startAt, endAt),
      ]);
      if (leave)
        throw new AppException(
          ErrorCode.WORKER_ON_LEAVE,
          'Pracownik jest nieobecny w tym dniu.',
          422,
        );
      if (tasks.length > 0)
        throw new AppException(
          ErrorCode.WORKER_ON_LEAVE,
          'Pracownik ma zaplanowane zadanie w tym czasie.',
          422,
        );
    }
  }

  async createManual(providerId: string, dto: CreateManualBookingDto): Promise<BookingResponseDto> {
    if (!dto.skipAvailabilityCheck) {
      await this.validateManualSlot(
        providerId,
        new Date(dto.startAt),
        new Date(dto.endAt),
        dto.workerId,
      );
    }

    const status = dto.autoConfirm !== false ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
    const confirmedAt = status === BookingStatus.CONFIRMED ? new Date() : null;

    const validServiceTypes = Object.values(ServiceType) as string[];
    const serviceType =
      dto.serviceType && validServiceTypes.includes(dto.serviceType)
        ? (dto.serviceType as ServiceType)
        : null;

    const booking = await this.bookingsRepository.createManual({
      clientPhone: dto.clientPhone,
      clientName: dto.clientName,
      providerId,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      tireSize: dto.tireSize ?? null,
      totalPricePln: dto.totalPricePln ?? null,
      serviceType,
      notes: dto.notes ?? null,
      status,
      confirmedAt,
      workerId: dto.workerId ?? null,
      stationId: dto.stationId ?? null,
    });

    this.eventEmitter.emit(
      BookingCreatedEvent.EVENT,
      new BookingCreatedEvent(
        providerId,
        booking.id,
        booking.referenceCode,
        this.getWeekStart(booking.startAt),
      ),
    );

    return this.toResponseDto(booking);
  }

  // ── reschedule ────────────────────────────────────────────────────────────

  async reschedule(
    providerId: string,
    referenceCode: string,
    dto: RescheduleBookingDto,
  ): Promise<BookingResponseDto> {
    const existing = await this.bookingsRepository.findDetailByReferenceCode(
      providerId,
      referenceCode,
    );

    if (!existing) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    const reschedulableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.IN_PROGRESS,
    ];
    if (!reschedulableStatuses.includes(existing.status)) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'Rezerwacja w tym statusie nie może być przeniesiona.',
        422,
      );
    }

    const oldWeekStart = this.getWeekStart(existing.startAt);
    const newStartAt = new Date(dto.startAt);
    const newEndAt = new Date(dto.endAt);

    const updated = await this.bookingsRepository.rescheduleBooking(
      existing.id,
      newStartAt,
      newEndAt,
    );

    this.eventEmitter.emit(
      BookingRescheduledEvent.EVENT,
      new BookingRescheduledEvent(
        providerId,
        existing.id,
        referenceCode,
        oldWeekStart,
        this.getWeekStart(newStartAt),
        dto.notifyClient ?? false,
        existing.client.phone,
        dto.startAt,
      ),
    );

    return this.toResponseDto(updated);
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

    const [bookingCount, tireSetCount] = await Promise.all([
      this.bookingsRepository.countClientBookings(booking.clientId, providerId),
      this.bookingsRepository.countTireSetsForBooking(booking.id),
    ]);

    return this.toDetailResponseDto(booking, bookingCount, tireSetCount > 0);
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

    this.eventEmitter.emit(
      BookingStatusChangedEvent.EVENT,
      new BookingStatusChangedEvent(
        providerId,
        booking.id,
        booking.referenceCode,
        this.getWeekStart(booking.startAt),
        newStatus,
      ),
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
    const updatedIds = await this.bookingsRepository.bulkUpdateStatus(
      providerId,
      dto.ids,
      dto.action,
    );
    this.eventEmitter.emit(
      BookingBulkStatusChangedEvent.EVENT,
      new BookingBulkStatusChangedEvent(providerId, updatedIds, dto.action),
    );
  }

  // ── availability ──────────────────────────────────────────────────────────

  async getAvailability(
    providerId: string,
    query: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto> {
    const parsedDate = new Date(query.date);
    // dayOfWeek: 0=Sun…6=Sat
    const dayOfWeek = parsedDate.getUTCDay();

    const stationsWhere = query.stationId ? { id: query.stationId, providerId } : { providerId };

    const [stations, providerData, exception] = await Promise.all([
      this.prisma.station.findMany({ where: stationsWhere, select: { schedule: true } }),
      this.prisma.provider.findUnique({ where: { id: providerId } }),
      this.prisma.scheduleException.findUnique({
        where: { providerId_date: { providerId, date: parsedDate } },
      }),
    ]);

    const SLOT_MINUTES = 45;

    const pausedUntil = (providerData as unknown as { pausedUntil?: Date | null })?.pausedUntil;
    if (pausedUntil && pausedUntil > new Date()) {
      return { slots: [], slotMinutes: SLOT_MINUTES, isClosedDay: true };
    }

    // If exception exists with no custom open time → closed day
    if (exception && !exception.customOpenTime) {
      return { slots: [], slotMinutes: 0, isClosedDay: true };
    }

    // Collect schedule entries for this day across all queried stations
    const openEntries = stations
      .flatMap((s) => (s.schedule as unknown as DaySchedule[]) ?? [])
      .filter((d) => d.dayOfWeek === dayOfWeek && d.open);

    if (!exception?.customOpenTime && openEntries.length === 0) {
      return { slots: [], slotMinutes: 0, isClosedDay: true };
    }

    // Determine effective open/close times
    let openHour: number;
    let openMin: number;
    let closeHour: number;
    let closeMin: number;

    if (exception?.customOpenTime) {
      // Exception overrides: Prisma Time stored as 1970-01-01THH:MM:SS.000Z
      openHour = (exception.customOpenTime as unknown as Date).getUTCHours();
      openMin = (exception.customOpenTime as unknown as Date).getUTCMinutes();
      closeHour = (exception.customCloseTime as unknown as Date).getUTCHours();
      closeMin = (exception.customCloseTime as unknown as Date).getUTCMinutes();
    } else {
      // Earliest start / latest end across all open stations
      const earliest = openEntries.reduce((a, b) => (a.startTime < b.startTime ? a : b));
      const latest = openEntries.reduce((a, b) => (a.endTime > b.endTime ? a : b));
      openHour = Number(earliest.startTime.split(':')[0]);
      openMin = Number(earliest.startTime.split(':')[1]);
      closeHour = Number(latest.endTime.split(':')[0]);
      closeMin = Number(latest.endTime.split(':')[1]);
    }

    const slotMinutes = SLOT_MINUTES;
    // Capacity = number of stations open on this day (or 1 if driven by exception only)
    const workstations = openEntries.length || 1;

    // Build slot boundaries as full ISO strings for the given date (UTC)
    const dayStart = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        openHour,
        openMin,
        0,
        0,
      ),
    );
    const dayClose = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        closeHour,
        closeMin,
        0,
        0,
      ),
    );
    const fullDayStart = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const fullDayEnd = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate() + 1,
        0,
        0,
        0,
        0,
      ),
    );

    // Check worker leave if workerId provided
    let workerOnLeave = false;
    if (query.workerId) {
      const leave = await this.prisma.workerLeave.findFirst({
        where: {
          workerId: query.workerId,
          startDate: { lte: parsedDate },
          endDate: { gte: parsedDate },
        },
      });
      workerOnLeave = !!leave;
    }

    // Check station-level leave: if all assigned workers are on leave → block all slots
    let stationAllWorkersOnLeave = false;
    if (query.stationId) {
      // Include station: { providerId } to enforce provider ownership silently
      const stationWorkers = await this.prisma.stationWorker.findMany({
        where: { stationId: query.stationId, station: { providerId } },
        select: { workerId: true },
      });
      if (stationWorkers.length > 0) {
        const workerIds = stationWorkers.map((sw) => sw.workerId);
        // Use distinct to count unique workers on leave (one worker may have multiple leave records)
        const workersOnLeave = await this.prisma.workerLeave.findMany({
          where: {
            workerId: { in: workerIds },
            startDate: { lte: parsedDate },
            endDate: { gte: parsedDate },
          },
          select: { workerId: true },
          distinct: ['workerId'],
        });
        stationAllWorkersOnLeave = workersOnLeave.length >= stationWorkers.length;
      }
    }

    // Check worker task conflicts if workerId provided
    let workerTaskConflicts: { startAt: Date; endAt: Date }[] = [];
    if (query.workerId) {
      workerTaskConflicts = await this.workerTasksService.findActiveInRange(
        query.workerId,
        fullDayStart,
        fullDayEnd,
      );
    }

    // Fetch existing bookings for that day (excluding cancelled/rejected statuses)
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        providerId,
        startAt: { gte: fullDayStart, lt: fullDayEnd },
        status: {
          notIn: [
            BookingStatus.CANCELLED_BY_CLIENT,
            BookingStatus.CANCELLED_BY_PROVIDER,
            BookingStatus.CANCELLED_BY_SYSTEM,
            BookingStatus.REJECTED,
            BookingStatus.NO_SHOW,
          ],
        },
      },
      select: { startAt: true, endAt: true },
    });

    // Generate slots
    const slots: AvailabilitySlotDto[] = [];
    let cursor = dayStart.getTime();
    const closeMs = dayClose.getTime();
    const slotMs = slotMinutes * 60 * 1000;

    while (cursor + slotMs <= closeMs) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + slotMs);

      const conflictCount = existingBookings.filter(
        (b) => b.startAt < slotEnd && b.endAt > slotStart,
      ).length;

      const taskConflict = workerTaskConflicts.some(
        (t) => t.startAt < slotEnd && t.endAt > slotStart,
      );

      const isAvailable =
        !workerOnLeave &&
        !taskConflict &&
        !stationAllWorkersOnLeave &&
        conflictCount < workstations;

      slots.push({
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        isAvailable,
        conflictCount,
      });

      cursor += slotMs;
    }

    return { slots, slotMinutes, isClosedDay: false };
  }
}
