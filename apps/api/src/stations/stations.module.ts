import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { StationsController } from './stations.controller';
import { StationsRepository } from './stations.repository';
import { StationsService } from './stations.service';

@Module({
  imports: [ProvidersModule],
  controllers: [StationsController],
  providers: [StationsRepository, StationsService],
  exports: [StationsService],
})
export class StationsModule {}
