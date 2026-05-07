import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { ScheduleExceptionsController } from './schedule-exceptions.controller';
import { ScheduleExceptionsService } from './schedule-exceptions.service';

@Module({
  imports: [ProvidersModule],
  controllers: [ScheduleExceptionsController],
  providers: [ScheduleExceptionsService],
})
export class ScheduleExceptionsModule {}
