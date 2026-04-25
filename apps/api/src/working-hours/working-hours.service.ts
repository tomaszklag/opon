import { BadRequestException, Injectable } from '@nestjs/common';
import { WorkingHours } from '@prisma/client';
import { WorkingHoursDayDto, UpsertWorkingHoursDto } from './dto/upsert-working-hours.dto';
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
        throw new BadRequestException(
          `Dzień ${day.dayOfWeek}: openTime i closeTime są wymagane gdy isClosed=false.`,
        );
      }
      const open = this.parseTime(day.openTime);
      const close = this.parseTime(day.closeTime);
      if (open >= close) {
        throw new BadRequestException(
          `Dzień ${day.dayOfWeek}: openTime musi być wcześniejsza niż closeTime.`,
        );
      }
      return {
        dayOfWeek: day.dayOfWeek,
        isClosed: false,
        openTime: open,
        closeTime: close,
        slotMinutes: day.slotMinutes ?? 45,
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
    };
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
