import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import {
  LeaveResponseDto,
  WorkerResponseDto,
  WorkerStationResponseDto,
} from './dto/worker-response.dto';
import { WorkersRepository } from './workers.repository';

type WorkerWithRelations = Prisma.WorkerGetPayload<{
  include: {
    stations: {
      include: { station: true };
    };
    leaves: true;
  };
}>;

@Injectable()
export class WorkersService {
  constructor(private readonly workersRepository: WorkersRepository) {}

  // ── helpers ───────────────────────────────────────────────────────────────

  private toResponseDto(worker: WorkerWithRelations): WorkerResponseDto {
    const stations: WorkerStationResponseDto[] = worker.stations.map((sw) => ({
      stationId: sw.stationId,
      stationName: sw.station.name,
      shiftStart: sw.shiftStart,
      shiftEnd: sw.shiftEnd,
    }));

    const leaves: LeaveResponseDto[] = worker.leaves.map((l) => ({
      id: l.id,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      note: l.note,
      createdAt: l.createdAt,
    }));

    return {
      id: worker.id,
      providerId: worker.providerId,
      name: worker.name,
      role: worker.role,
      createdAt: worker.createdAt,
      stations,
      leaves,
    };
  }

  private async findOwnedWorker(
    workerId: string,
    providerId: string,
  ): Promise<WorkerWithRelations> {
    const worker = await this.workersRepository.findById(workerId, providerId);

    if (!worker) {
      throw new AppException(ErrorCode.WORKER_NOT_FOUND, 'Pracownik nie istnieje.', 404);
    }

    return worker;
  }

  // ── list ──────────────────────────────────────────────────────────────────

  async listByProvider(providerId: string): Promise<WorkerResponseDto[]> {
    const workers = await this.workersRepository.findAllByProvider(providerId);
    return workers.map((w) => this.toResponseDto(w));
  }

  // ── create ────────────────────────────────────────────────────────────────

  async create(providerId: string, dto: CreateWorkerDto): Promise<WorkerResponseDto> {
    const worker = await this.workersRepository.create(providerId, {
      name: dto.name,
      role: dto.role ?? null,
    });

    return this.toResponseDto(worker);
  }

  // ── update ────────────────────────────────────────────────────────────────

  async update(
    workerId: string,
    providerId: string,
    dto: UpdateWorkerDto,
  ): Promise<WorkerResponseDto> {
    await this.findOwnedWorker(workerId, providerId);

    const data: Prisma.WorkerUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;

    const updated = await this.workersRepository.update(workerId, data);

    return this.toResponseDto(updated);
  }

  // ── delete ────────────────────────────────────────────────────────────────

  async delete(workerId: string, providerId: string): Promise<void> {
    await this.findOwnedWorker(workerId, providerId);
    await this.workersRepository.delete(workerId);
  }

  // ── add leave ─────────────────────────────────────────────────────────────

  async addLeave(
    workerId: string,
    providerId: string,
    dto: CreateLeaveDto,
  ): Promise<WorkerResponseDto> {
    await this.findOwnedWorker(workerId, providerId);

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new AppException(
        ErrorCode.WORKER_LEAVE_CONFLICT,
        'startDate musi być wcześniejsza lub równa endDate.',
        400,
      );
    }

    const overlapping = await this.workersRepository.findOverlappingLeave(workerId, start, end);

    if (overlapping) {
      throw new AppException(
        ErrorCode.WORKER_LEAVE_CONFLICT,
        'Daty urlopu nakładają się na istniejący urlop pracownika.',
        409,
      );
    }

    await this.workersRepository.createLeave(workerId, {
      type: dto.type,
      startDate: start,
      endDate: end,
      note: dto.note ?? null,
    });

    const updated = await this.workersRepository.findByIdOrThrow(workerId);

    return this.toResponseDto(updated);
  }

  // ── delete leave ──────────────────────────────────────────────────────────

  async deleteLeave(workerId: string, providerId: string, leaveId: string): Promise<void> {
    await this.findOwnedWorker(workerId, providerId);

    const leave = await this.workersRepository.findLeave(leaveId, workerId);

    if (!leave) {
      throw new AppException(ErrorCode.WORKER_NOT_FOUND, 'Nieobecność nie istnieje.', 404);
    }

    await this.workersRepository.deleteLeave(leaveId);
  }
}
