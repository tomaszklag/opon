import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersRepository } from './providers.repository';
import { ProvidersService } from './providers.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, ProvidersRepository],
  exports: [ProvidersService],
})
export class ProvidersModule {}
