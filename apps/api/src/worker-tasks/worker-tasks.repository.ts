import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const taskInclude = {
  worker: { select: { name: true } },
  linkedBooking: {
    select: {
      id: true,
      referenceCode: true,
      startAt: true,
      client: { select: { firstName: true, lastName: true } },
    } satisfies Prisma.BookingSelect,
  },
} satisfies Prisma.WorkerTaskInclude;

@Injectable()
export class WorkerTasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    providerId: string;
    workerId: string | null;
    title: string;
    startAt: Date;
    endAt: Date;
    notes: string | null;
  }) {
    return this.prisma.workerTask.create({ data, include: taskInclude });
  }

  findByWeek(providerId: string, weekStart: Date, weekEnd: Date) {
    return this.prisma.workerTask.findMany({
      where: { providerId, startAt: { gte: weekStart, lt: weekEnd } },
      include: taskInclude,
      orderBy: { startAt: 'asc' },
    });
  }

  findOne(id: string, providerId: string) {
    return this.prisma.workerTask.findFirst({
      where: { id, providerId },
      include: taskInclude,
    });
  }

  update(
    id: string,
    providerId: string,
    data: {
      notes?: string | null;
      linkedBookingId?: string | null;
      startAt?: Date;
      endAt?: Date;
    },
  ) {
    return this.prisma.workerTask.update({
      where: { id },
      data: {
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.linkedBookingId !== undefined ? { linkedBookingId: data.linkedBookingId } : {}),
        ...(data.startAt !== undefined ? { startAt: data.startAt } : {}),
        ...(data.endAt !== undefined ? { endAt: data.endAt } : {}),
      },
      include: taskInclude,
    });
  }

  async delete(id: string, providerId: string): Promise<boolean> {
    const result = await this.prisma.workerTask.deleteMany({ where: { id, providerId } });
    return result.count > 0;
  }

  findActiveInRange(workerId: string, rangeStart: Date, rangeEnd: Date) {
    return this.prisma.workerTask.findMany({
      where: { workerId, startAt: { lt: rangeEnd }, endAt: { gt: rangeStart } },
      select: { startAt: true, endAt: true },
    });
  }
}
