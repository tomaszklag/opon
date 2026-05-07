import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleException } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleExceptionDto } from './dto/create-schedule-exception.dto';
import { ScheduleExceptionResponseDto } from './dto/schedule-exception-response.dto';

@Injectable()
export class ScheduleExceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private toDto(e: ScheduleException): ScheduleExceptionResponseDto {
    return {
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      reason: e.reason,
      isClosed: !e.customOpenTime,
      customOpenTime: e.customOpenTime ? this.formatTime(e.customOpenTime) : null,
      customCloseTime: e.customCloseTime ? this.formatTime(e.customCloseTime) : null,
    };
  }

  private formatTime(dt: Date): string {
    const h = dt.getUTCHours().toString().padStart(2, '0');
    const m = dt.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private toTimeDate(hhmm: string): Date {
    return new Date(`1970-01-01T${hhmm}:00Z`);
  }

  async list(providerId: string): Promise<ScheduleExceptionResponseDto[]> {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    from.setUTCHours(0, 0, 0, 0);

    const exceptions = await this.prisma.scheduleException.findMany({
      where: { providerId, date: { gte: from } },
      orderBy: { date: 'asc' },
    });

    return exceptions.map((e) => this.toDto(e));
  }

  async create(
    providerId: string,
    dto: CreateScheduleExceptionDto,
  ): Promise<ScheduleExceptionResponseDto> {
    const date = new Date(dto.date + 'T00:00:00Z');
    const customOpenTime = dto.customOpenTime ? this.toTimeDate(dto.customOpenTime) : null;
    const customCloseTime = dto.customCloseTime ? this.toTimeDate(dto.customCloseTime) : null;

    const exception = await this.prisma.scheduleException.upsert({
      where: { providerId_date: { providerId, date } },
      create: { providerId, date, reason: dto.reason, customOpenTime, customCloseTime },
      update: { reason: dto.reason, customOpenTime, customCloseTime },
    });

    return this.toDto(exception);
  }

  async remove(id: string, providerId: string): Promise<void> {
    const exc = await this.prisma.scheduleException.findUnique({ where: { id } });
    if (!exc || exc.providerId !== providerId) {
      throw new NotFoundException('Wyjątek nie istnieje.');
    }
    await this.prisma.scheduleException.delete({ where: { id } });
  }
}
