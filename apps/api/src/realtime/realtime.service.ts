import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject } from 'rxjs';
import {
  BookingCreatedEvent,
  BookingStatusChangedEvent,
  BookingBulkStatusChangedEvent,
} from './events/booking.events';
import { WorkerTaskCreatedEvent, WorkerTaskDeletedEvent } from './events/worker-task.events';

interface RealtimeEntry {
  subject: Subject<MessageEvent>;
  refCount: number;
}

@Injectable()
export class RealtimeService implements OnModuleDestroy {
  private readonly connections = new Map<string, RealtimeEntry>();

  getOrCreate(providerId: string): Subject<MessageEvent> {
    const existing = this.connections.get(providerId);
    if (existing) {
      existing.refCount++;
      return existing.subject;
    }
    const subject = new Subject<MessageEvent>();
    this.connections.set(providerId, { subject, refCount: 1 });
    return subject;
  }

  release(providerId: string): void {
    const entry = this.connections.get(providerId);
    if (!entry) return;
    entry.refCount--;
    if (entry.refCount <= 0) {
      entry.subject.complete();
      this.connections.delete(providerId);
    }
  }

  private push(providerId: string, type: string, payload: Record<string, unknown>): void {
    const entry = this.connections.get(providerId);
    if (!entry) return;
    entry.subject.next({
      data: JSON.stringify({ type, payload, ts: new Date().toISOString() }),
    } as MessageEvent);
  }

  @OnEvent(BookingCreatedEvent.EVENT)
  onBookingCreated(event: BookingCreatedEvent): void {
    this.push(event.providerId, BookingCreatedEvent.EVENT, {
      bookingId: event.bookingId,
      referenceCode: event.referenceCode,
      weekStart: event.weekStart,
    });
  }

  @OnEvent(BookingStatusChangedEvent.EVENT)
  onBookingStatusChanged(event: BookingStatusChangedEvent): void {
    this.push(event.providerId, BookingStatusChangedEvent.EVENT, {
      bookingId: event.bookingId,
      referenceCode: event.referenceCode,
      weekStart: event.weekStart,
      newStatus: event.newStatus,
    });
  }

  @OnEvent(BookingBulkStatusChangedEvent.EVENT)
  onBulkStatusChanged(event: BookingBulkStatusChangedEvent): void {
    this.push(event.providerId, BookingBulkStatusChangedEvent.EVENT, {
      ids: event.ids,
      action: event.action,
    });
  }

  @OnEvent(WorkerTaskCreatedEvent.EVENT)
  onWorkerTaskCreated(event: WorkerTaskCreatedEvent): void {
    this.push(event.providerId, WorkerTaskCreatedEvent.EVENT, {
      taskId: event.taskId,
      weekStart: event.weekStart,
    });
  }

  @OnEvent(WorkerTaskDeletedEvent.EVENT)
  onWorkerTaskDeleted(event: WorkerTaskDeletedEvent): void {
    this.push(event.providerId, WorkerTaskDeletedEvent.EVENT, {
      taskId: event.taskId,
      weekStart: event.weekStart,
    });
  }

  onModuleDestroy(): void {
    for (const { subject } of this.connections.values()) {
      subject.complete();
    }
    this.connections.clear();
  }
}
