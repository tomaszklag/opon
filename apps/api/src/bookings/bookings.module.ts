import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';
import { WorkerTasksModule } from '../worker-tasks/worker-tasks.module';
import { IdempotencyModule } from '../common/idempotency/idempotency.module';

@Module({
  imports: [ProvidersModule, WorkerTasksModule, IdempotencyModule],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
