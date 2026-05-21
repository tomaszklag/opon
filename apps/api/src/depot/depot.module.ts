import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { DepotController } from './depot.controller';
import { DepotRepository } from './depot.repository';
import { DepotService } from './depot.service';

@Module({
  imports: [ProvidersModule],
  controllers: [DepotController],
  providers: [DepotRepository, DepotService],
  exports: [DepotService],
})
export class DepotModule {}
