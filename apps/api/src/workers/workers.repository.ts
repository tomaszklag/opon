import { Injectable } from '@nestjs/common';
import { LeaveType, Prisma, Worker, WorkerLeave } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type WorkerWithRelations = Prisma.WorkerGetPayload<{
  include: {
    stations: {
      include: { station: true };
    };
    leaves: true;
  };
}>;

@Injectable()
export class WorkersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<WorkerWithRelations[]> {
    return this.prisma.worker.findMany({
      where: { providerId },
      include: {
        stations: {
          include: { station: true },
        },
        leaves: {
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string, providerId: string): Promise<WorkerWithRelations | null> {
    return this.prisma.worker.findFirst({
      where: { id, providerId },
      include: {
        stations: {
          include: { station: true },
        },
        leaves: {
          orderBy: { startDate: 'asc' },
        },
      },
    });
  }

  create(
    providerId: string,
    data: { name: string; role?: string | null },
  ): Promise<WorkerWithRelations> {
    return this.prisma.worker.create({
      data: {
        providerId,
        name: data.name,
        role: data.role ?? null,
      },
      include: {
        stations: {
          include: { station: true },
        },
        leaves: true,
      },
    });
  }

  update(id: string, data: Prisma.WorkerUpdateInput): Promise<WorkerWithRelations> {
    return this.prisma.worker.update({
      where: { id },
      data,
      include: {
        stations: {
          include: { station: true },
        },
        leaves: {
          orderBy: { startDate: 'asc' },
        },
      },
    });
  }

  delete(id: string): Promise<Worker> {
    return this.prisma.worker.delete({ where: { id } });
  }

  findLeave(leaveId: string, workerId: string): Promise<WorkerLeave | null> {
    return this.prisma.workerLeave.findFirst({
      where: { id: leaveId, workerId },
    });
  }

  findOverlappingLeave(
    workerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WorkerLeave | null> {
    return this.prisma.workerLeave.findFirst({
      where: {
        workerId,
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });
  }

  createLeave(
    workerId: string,
    data: { type: LeaveType; startDate: Date; endDate: Date; note?: string | null },
  ): Promise<WorkerLeave> {
    return this.prisma.workerLeave.create({
      data: {
        workerId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        note: data.note ?? null,
      },
    });
  }

  deleteLeave(leaveId: string): Promise<WorkerLeave> {
    return this.prisma.workerLeave.delete({ where: { id: leaveId } });
  }

  async isWorkerOnLeave(workerId: string, date: Date): Promise<boolean> {
    const leave = await this.prisma.workerLeave.findFirst({
      where: {
        workerId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
    return leave !== null;
  }

  findByIdOrThrow(id: string): Promise<WorkerWithRelations> {
    return this.prisma.worker.findUniqueOrThrow({
      where: { id },
      include: {
        stations: {
          include: { station: true },
        },
        leaves: {
          orderBy: { startDate: 'asc' },
        },
      },
    });
  }
}
