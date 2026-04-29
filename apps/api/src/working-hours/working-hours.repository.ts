import { Injectable } from '@nestjs/common';
import { Prisma, WorkingHours } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type UpsertPayload = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: Date;
  closeTime: Date;
  slotMinutes: number;
  workstations: number;
  blocks: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
};

@Injectable()
export class WorkingHoursRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<WorkingHours[]> {
    return this.prisma.workingHours.findMany({
      where: { providerId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /**
   * Upsert wielu dni jednocześnie — atomowa transakcja.
   * Istnienie unique(providerId, dayOfWeek) gwarantuje brak duplikatów.
   */
  upsertMany(providerId: string, days: UpsertPayload[]): Promise<WorkingHours[]> {
    return this.prisma.$transaction(async (tx) => {
      const results: WorkingHours[] = [];
      for (const day of days) {
        const record = await tx.workingHours.upsert({
          where: { providerId_dayOfWeek: { providerId, dayOfWeek: day.dayOfWeek } },
          create: { providerId, ...day },
          update: day,
        });
        results.push(record);
      }
      return results;
    });
  }
}
