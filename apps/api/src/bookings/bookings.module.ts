import { forwardRef, Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';
import { WorkerTasksModule } from '../worker-tasks/worker-tasks.module';
import { AppBookingsService } from './app-bookings.service';
import { BookingsAppController } from './bookings-app.controller';

@Module({
  imports: [forwardRef(() => ProvidersModule), WorkerTasksModule],
  controllers: [BookingsController, BookingsAppController],
  providers: [BookingsRepository, BookingsService, AppBookingsService],
  exports: [BookingsService, AppBookingsService],
})
export class BookingsModule {}
