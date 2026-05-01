import { Module } from '@nestjs/common';
import { ServiceConfigsController } from './service-configs.controller';
import { ServiceConfigsRepository } from './service-configs.repository';
import { ServiceConfigsService } from './service-configs.service';

@Module({
  controllers: [ServiceConfigsController],
  providers: [ServiceConfigsRepository, ServiceConfigsService],
  exports: [ServiceConfigsService],
})
export class ServiceConfigsModule {}
