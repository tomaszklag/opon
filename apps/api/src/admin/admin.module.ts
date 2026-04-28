import { Module } from '@nestjs/common';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminProvidersService } from './admin-providers.service';
import { AdminGusController } from './admin-gus.controller';

@Module({
  controllers: [AdminProvidersController, AdminGusController],
  providers: [AdminProvidersService],
})
export class AdminModule {}
