import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { StationResponseDto, StationWorkerResponseDto } from './dto/station-response.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { StationsRepository } from './stations.repository';

type StationWithWorkers = Prisma.StationGetPayload<{
  include: {
    workers: {
      include: { worker: true };
    };
  };
}>;

@Injectable()
export class StationsService {
  constructor(private readonly stationsRepository: StationsRepository) {}

  // ── helpers ───────────────────────────────────────────────────────────────

  private toResponseDto(station: StationWithWorkers): StationResponseDto {
    const workers: StationWorkerResponseDto[] = station.workers.map((sw) => ({
      workerId: sw.workerId,
      workerName: sw.worker.name,
      workerRole: sw.worker.role,
      shiftStart: sw.shiftStart,
      shiftEnd: sw.shiftEnd,
    }));

    return {
      id: station.id,
      providerId: station.providerId,
      name: station.name,
      services: station.services,
      schedule: station.schedule,
      workers,
      createdAt: station.createdAt,
    };
  }

  private async findOwnedStation(
    stationId: string,
    providerId: string,
  ): Promise<StationWithWorkers> {
    const station = await this.stationsRepository.findById(stationId, providerId);

    if (!station) {
      throw new AppException(ErrorCode.STATION_NOT_FOUND, 'Stanowisko nie istnieje.', 404);
    }

    return station;
  }

  // ── list ──────────────────────────────────────────────────────────────────

  async listByProvider(providerId: string): Promise<StationResponseDto[]> {
    const stations = await this.stationsRepository.findAllByProvider(providerId);
    return stations.map((s) => this.toResponseDto(s));
  }

  // ── create ────────────────────────────────────────────────────────────────

  async create(providerId: string, dto: CreateStationDto): Promise<StationResponseDto> {
    const station = await this.stationsRepository.create(providerId, {
      name: dto.name,
      services: dto.services ?? [],
      schedule: dto.schedule as unknown as Prisma.InputJsonValue,
    });

    return this.toResponseDto(station);
  }

  // ── update ────────────────────────────────────────────────────────────────

  async update(
    stationId: string,
    providerId: string,
    dto: UpdateStationDto,
  ): Promise<StationResponseDto> {
    await this.findOwnedStation(stationId, providerId);

    const data: Prisma.StationUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.services !== undefined) data.services = { set: dto.services };
    if (dto.schedule !== undefined)
      data.schedule = dto.schedule as unknown as Prisma.InputJsonValue;

    const updated = await this.stationsRepository.update(stationId, data);

    return this.toResponseDto(updated);
  }

  // ── delete ────────────────────────────────────────────────────────────────

  async delete(stationId: string, providerId: string): Promise<void> {
    await this.findOwnedStation(stationId, providerId);
    await this.stationsRepository.delete(stationId);
  }

  // ── assign worker ─────────────────────────────────────────────────────────

  async assignWorker(
    stationId: string,
    providerId: string,
    dto: AssignWorkerDto,
  ): Promise<StationResponseDto> {
    await this.findOwnedStation(stationId, providerId);

    if (dto.shiftStart && dto.shiftEnd && dto.shiftStart >= dto.shiftEnd) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'shiftStart musi być przed shiftEnd',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify the worker belongs to the same provider
    const worker = await this.stationsRepository.findWorkerById(dto.workerId);
    if (!worker) {
      throw new AppException(ErrorCode.WORKER_NOT_FOUND, 'Pracownik nie istnieje.', 404);
    }
    if (worker.providerId !== providerId) {
      throw new AppException(ErrorCode.WORKER_NOT_FOUND, 'Pracownik nie istnieje.', 404);
    }

    await this.stationsRepository.assignWorker(stationId, {
      workerId: dto.workerId,
      shiftStart: dto.shiftStart ?? null,
      shiftEnd: dto.shiftEnd ?? null,
    });

    const updated = await this.stationsRepository.findByIdOrThrow(stationId);

    return this.toResponseDto(updated);
  }

  // ── remove worker ─────────────────────────────────────────────────────────

  async removeWorker(stationId: string, providerId: string, workerId: string): Promise<void> {
    await this.findOwnedStation(stationId, providerId);

    const link = await this.stationsRepository.findWorkerAssignment(stationId, workerId);

    if (!link) {
      throw new AppException(
        ErrorCode.WORKER_NOT_FOUND,
        'Pracownik nie jest przypisany do tego stanowiska.',
        404,
      );
    }

    await this.stationsRepository.removeWorker(stationId, workerId);
  }

  // ── update shift ─────────────────────────────────────────────────────────

  async updateShift(
    stationId: string,
    providerId: string,
    workerId: string,
    dto: UpdateShiftDto,
  ): Promise<StationResponseDto> {
    await this.findOwnedStation(stationId, providerId);

    if (dto.shiftStart && dto.shiftEnd && dto.shiftStart >= dto.shiftEnd) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'shiftStart musi być przed shiftEnd',
        HttpStatus.BAD_REQUEST,
      );
    }

    const link = await this.stationsRepository.findWorkerAssignment(stationId, workerId);

    if (!link) {
      throw new AppException(
        ErrorCode.WORKER_NOT_FOUND,
        'Pracownik nie jest przypisany do tego stanowiska.',
        404,
      );
    }

    await this.stationsRepository.updateShift(stationId, workerId, {
      shiftStart: dto.shiftStart ?? null,
      shiftEnd: dto.shiftEnd ?? null,
    });

    const updated = await this.stationsRepository.findByIdOrThrow(stationId);

    return this.toResponseDto(updated);
  }
}
