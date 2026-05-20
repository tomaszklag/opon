import { forwardRef, Module } from '@nestjs/common';
import { WorkerTasksController } from './worker-tasks.controller';
import { WorkerTasksService } from './worker-tasks.service';
import { WorkerTasksRepository } from './worker-tasks.repository';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [forwardRef(() => ProvidersModule)],
  controllers: [WorkerTasksController],
  providers: [WorkerTasksService, WorkerTasksRepository],
  exports: [WorkerTasksService],
})
export class WorkerTasksModule {}
