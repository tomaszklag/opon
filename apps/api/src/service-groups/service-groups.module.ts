import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { ServiceGroupsController } from './service-groups.controller';
import { ServiceGroupsRepository } from './service-groups.repository';
import { ServiceGroupsService } from './service-groups.service';

@Module({
  imports: [ProvidersModule],
  controllers: [ServiceGroupsController],
  providers: [ServiceGroupsService, ServiceGroupsRepository],
  exports: [ServiceGroupsService],
})
export class ServiceGroupsModule {}
