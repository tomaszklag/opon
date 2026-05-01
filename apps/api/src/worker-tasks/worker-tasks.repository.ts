import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const workerInclude = { worker: { select: { name: true } } } as const;

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
    return this.prisma.workerTask.create({ data, include: workerInclude });
  }

  findByWeek(providerId: string, weekStart: Date, weekEnd: Date) {
    return this.prisma.workerTask.findMany({
      where: { providerId, startAt: { gte: weekStart, lt: weekEnd } },
      include: workerInclude,
      orderBy: { startAt: 'asc' },
    });
  }

  findOne(id: string, providerId: string) {
    return this.prisma.workerTask.findFirst({ where: { id, providerId } });
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
