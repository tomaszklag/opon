import { Module } from '@nestjs/common';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminProvidersService } from './admin-providers.service';

@Module({
  controllers: [AdminProvidersController],
  providers: [AdminProvidersService],
})
export class AdminModule {}
