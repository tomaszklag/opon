import { Injectable } from '@nestjs/common';
import { Prisma, WorkingHours } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import {
  CapacityBlockDto,
  WorkingHoursDayDto,
  UpsertWorkingHoursDto,
} from './dto/upsert-working-hours.dto';
import { WorkingHoursRepository } from './working-hours.repository';

@Injectable()
export class WorkingHoursService {
  constructor(private readonly repo: WorkingHoursRepository) {}

  listByProvider(providerId: string): Promise<WorkingHours[]> {
    return this.repo.findAllByProvider(providerId);
  }

  async upsert(providerId: string, dto: UpsertWorkingHoursDto): Promise<WorkingHours[]> {
    const days = dto.days.map((d) => this.validateAndMap(d));
    return this.repo.upsertMany(providerId, days);
  }

  private validateAndMap(day: WorkingHoursDayDto) {
    if (!day.isClosed) {
      if (!day.openTime || !day.closeTime) {
        throw new AppException(
          ErrorCode.WORKING_HOURS_MISSING_TIMES,
          `Dzień ${day.dayOfWeek}: openTime i closeTime są wymagane gdy isClosed=false.`,
          400,
        );
      }
      const open = this.parseTime(day.openTime);
      const close = this.parseTime(day.closeTime);
      if (open >= close) {
        throw new AppException(
          ErrorCode.WORKING_HOURS_INVALID_TIME_RANGE,
          `Dzień ${day.dayOfWeek}: openTime musi być wcześniejsza niż closeTime.`,
          400,
        );
      }
      const blocks = this.validateBlocks(day.blocks ?? null, day.dayOfWeek, open, close);
      return {
        dayOfWeek: day.dayOfWeek,
        isClosed: false,
        openTime: open,
        closeTime: close,
        slotMinutes: day.slotMinutes ?? 45,
        workstations: day.workstations ?? 1,
        blocks,
      };
    }

    // isClosed=true: zapisz placeholder times (nie są używane)
    const midnight = this.parseTime('00:00');
    return {
      dayOfWeek: day.dayOfWeek,
      isClosed: true,
      openTime: midnight,
      closeTime: midnight,
      slotMinutes: day.slotMinutes ?? 45,
      workstations: day.workstations ?? 1,
      blocks: Prisma.JsonNull,
    };
  }

  private validateBlocks(
    blocks: CapacityBlockDto[] | null | undefined,
    dayOfWeek: number,
    open: Date,
    close: Date,
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    if (!blocks || blocks.length === 0) return Prisma.JsonNull;

    const openMins = open.getUTCHours() * 60 + open.getUTCMinutes();
    const closeMins = close.getUTCHours() * 60 + close.getUTCMinutes();

    const sorted = [...blocks].sort((a, b) => this.toMins(a.from) - this.toMins(b.from));

    let prevEnd = openMins;
    for (const block of sorted) {
      const fromMins = this.toMins(block.from);
      const toMins = this.toMins(block.to);

      if (fromMins >= toMins) {
        throw new AppException(
          ErrorCode.WORKING_HOURS_INVALID_BLOCKS,
          `Dzień ${dayOfWeek}: blok ${block.from}–${block.to} ma błędny przedział czasu.`,
          400,
        );
      }
      if (fromMins < openMins || toMins > closeMins) {
        throw new AppException(
          ErrorCode.WORKING_HOURS_INVALID_BLOCKS,
          `Dzień ${dayOfWeek}: blok ${block.from}–${block.to} wychodzi poza ramy dnia.`,
          400,
        );
      }
      if (fromMins < prevEnd) {
        throw new AppException(
          ErrorCode.WORKING_HOURS_INVALID_BLOCKS,
          `Dzień ${dayOfWeek}: bloki obsady nakładają się.`,
          400,
        );
      }
      prevEnd = toMins;
    }

    return sorted as unknown as Prisma.InputJsonValue;
  }

  private toMins(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number) as [number, number];
    return h * 60 + m;
  }

  /** Parsuje "HH:MM" do Date z datą epoch (tylko czas ma znaczenie przy @db.Time) */
  private parseTime(hhmm: string): Date {
    const parts = hhmm.split(':').map(Number);
    const [h, m] = parts as [number, number];
    const d = new Date(0);
    d.setUTCHours(h, m, 0, 0);
    return d;
  }
}
