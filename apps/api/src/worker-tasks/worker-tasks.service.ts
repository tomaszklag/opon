import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppException, ErrorCode } from '../common/errors';
import { WorkerTasksRepository } from './worker-tasks.repository';
import { CreateWorkerTaskDto } from './dto/create-worker-task.dto';
import { UpdateWorkerTaskDto } from './dto/update-worker-task.dto';
import { WorkerTaskResponseDto } from './dto/worker-task-response.dto';
import { WorkerTaskListQueryDto } from './dto/worker-task-list-query.dto';
import {
  WorkerTaskCreatedEvent,
  WorkerTaskDeletedEvent,
} from '../realtime/events/worker-task.events';

@Injectable()
export class WorkerTasksService {
  constructor(
    private readonly repo: WorkerTasksRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
    return d.toISOString().slice(0, 10);
  }

  private toDto(task: Awaited<ReturnType<WorkerTasksRepository['create']>>): WorkerTaskResponseDto {
    const lb = task.linkedBooking;
    return {
      id: task.id,
      providerId: task.providerId,
      workerId: task.workerId ?? null,
      workerName: task.worker?.name ?? null,
      title: task.title,
      startAt: task.startAt.toISOString(),
      endAt: task.endAt.toISOString(),
      notes: task.notes ?? null,
      linkedBookingId: task.linkedBookingId ?? null,
      linkedBooking: lb
        ? {
            referenceCode: lb.referenceCode,
            clientName: [lb.client.firstName, lb.client.lastName].filter(Boolean).join(' '),
            startAt: lb.startAt.toISOString(),
          }
        : null,
      createdAt: task.createdAt.toISOString(),
    };
  }

  async create(providerId: string, dto: CreateWorkerTaskDto): Promise<WorkerTaskResponseDto> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'endAt musi być późniejsze niż startAt.',
        400,
      );
    }
    const task = await this.repo.create({
      providerId,
      workerId: dto.workerId ?? null,
      title: dto.title,
      startAt,
      endAt,
      notes: dto.notes ?? null,
    });
    this.eventEmitter.emit(
      WorkerTaskCreatedEvent.EVENT,
      new WorkerTaskCreatedEvent(providerId, task.id, this.getWeekStart(startAt)),
    );
    return this.toDto(task);
  }

  async listByWeek(
    providerId: string,
    query: WorkerTaskListQueryDto,
  ): Promise<WorkerTaskResponseDto[]> {
    const weekStart = new Date(query.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    const tasks = await this.repo.findByWeek(providerId, weekStart, weekEnd);
    return tasks.map((t) => this.toDto(t));
  }

  async findById(providerId: string, id: string): Promise<WorkerTaskResponseDto> {
    const task = await this.repo.findOne(id, providerId);
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND, 'Zadanie nie istnieje.', 404);
    }
    return this.toDto(task);
  }

  async update(
    providerId: string,
    id: string,
    dto: UpdateWorkerTaskDto,
  ): Promise<WorkerTaskResponseDto> {
    const task = await this.repo.findOne(id, providerId);
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND, 'Zadanie nie istnieje.', 404);
    }
    const updated = await this.repo.update(id, providerId, {
      notes: dto.notes,
      linkedBookingId: dto.linkedBookingId,
    });
    return this.toDto(updated);
  }

  async delete(providerId: string, id: string): Promise<void> {
    const task = await this.repo.findOne(id, providerId);
    if (!task) {
      throw new AppException(ErrorCode.NOT_FOUND, 'Zadanie nie istnieje.', 404);
    }
    await this.repo.delete(id, providerId);
    this.eventEmitter.emit(
      WorkerTaskDeletedEvent.EVENT,
      new WorkerTaskDeletedEvent(providerId, id, this.getWeekStart(task.startAt)),
    );
  }

  findActiveInRange(workerId: string, rangeStart: Date, rangeEnd: Date) {
    return this.repo.findActiveInRange(workerId, rangeStart, rangeEnd);
  }
}
