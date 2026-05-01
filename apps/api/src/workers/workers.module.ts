import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { WorkersController } from './workers.controller';
import { WorkersRepository } from './workers.repository';
import { WorkersService } from './workers.service';

@Module({
  imports: [ProvidersModule],
  controllers: [WorkersController],
  providers: [WorkersRepository, WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
