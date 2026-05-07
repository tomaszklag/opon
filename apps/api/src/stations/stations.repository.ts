import { Injectable } from '@nestjs/common';
import { Prisma, Station, StationWorker } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type StationWithWorkers = Prisma.StationGetPayload<{
  include: {
    workers: {
      include: { worker: true };
    };
  };
}>;

@Injectable()
export class StationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<StationWithWorkers[]> {
    return this.prisma.station.findMany({
      where: { providerId },
      include: {
        workers: {
          include: { worker: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string, providerId: string): Promise<StationWithWorkers | null> {
    return this.prisma.station.findFirst({
      where: { id, providerId },
      include: {
        workers: {
          include: { worker: true },
        },
      },
    });
  }

  create(
    providerId: string,
    data: { name: string; serviceIds: string[]; schedule: Prisma.InputJsonValue },
  ): Promise<StationWithWorkers> {
    return this.prisma.station.create({
      data: {
        providerId,
        name: data.name,
        serviceIds: data.serviceIds,
        schedule: data.schedule,
      },
      include: {
        workers: {
          include: { worker: true },
        },
      },
    });
  }

  update(id: string, data: Prisma.StationUpdateInput): Promise<StationWithWorkers> {
    return this.prisma.station.update({
      where: { id },
      data,
      include: {
        workers: {
          include: { worker: true },
        },
      },
    });
  }

  delete(id: string): Promise<Station> {
    return this.prisma.station.delete({ where: { id } });
  }

  assignWorker(
    stationId: string,
    data: { workerId: string; shiftStart?: string | null; shiftEnd?: string | null },
  ): Promise<StationWorker> {
    return this.prisma.stationWorker.upsert({
      where: { stationId_workerId: { stationId, workerId: data.workerId } },
      create: {
        stationId,
        workerId: data.workerId,
        shiftStart: data.shiftStart ?? null,
        shiftEnd: data.shiftEnd ?? null,
      },
      update: {
        shiftStart: data.shiftStart ?? null,
        shiftEnd: data.shiftEnd ?? null,
      },
    });
  }

  findWorkerAssignment(stationId: string, workerId: string): Promise<StationWorker | null> {
    return this.prisma.stationWorker.findUnique({
      where: { stationId_workerId: { stationId, workerId } },
    });
  }

  removeWorker(stationId: string, workerId: string): Promise<StationWorker> {
    return this.prisma.stationWorker.delete({
      where: { stationId_workerId: { stationId, workerId } },
    });
  }

  updateShift(
    stationId: string,
    workerId: string,
    data: { shiftStart?: string | null; shiftEnd?: string | null },
  ): Promise<StationWorker> {
    return this.prisma.stationWorker.update({
      where: { stationId_workerId: { stationId, workerId } },
      data: {
        shiftStart: data.shiftStart ?? null,
        shiftEnd: data.shiftEnd ?? null,
      },
    });
  }

  findByIdOrThrow(id: string): Promise<StationWithWorkers> {
    return this.prisma.station.findUniqueOrThrow({
      where: { id },
      include: {
        workers: {
          include: { worker: true },
        },
      },
    });
  }

  findWorkerById(workerId: string): Promise<{ id: string; providerId: string } | null> {
    return this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, providerId: true },
    });
  }
}
