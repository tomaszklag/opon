import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { WorkingHoursController } from './working-hours.controller';
import { WorkingHoursRepository } from './working-hours.repository';
import { WorkingHoursService } from './working-hours.service';

@Module({
  imports: [ProvidersModule],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService, WorkingHoursRepository],
  exports: [WorkingHoursService],
})
export class WorkingHoursModule {}
