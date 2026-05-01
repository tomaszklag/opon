import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';
import { WorkerTasksModule } from '../worker-tasks/worker-tasks.module';

@Module({
  imports: [ProvidersModule, WorkerTasksModule],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
