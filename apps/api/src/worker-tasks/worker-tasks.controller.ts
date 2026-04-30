import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { WorkerTasksService } from './worker-tasks.service';
import { CreateWorkerTaskDto } from './dto/create-worker-task.dto';
import { WorkerTaskResponseDto } from './dto/worker-task-response.dto';
import { WorkerTaskListQueryDto } from './dto/worker-task-list-query.dto';

@ApiTags('worker-tasks')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/tasks')
export class WorkerTasksController {
  constructor(
    private readonly workerTasksService: WorkerTasksService,
    private readonly providersService: ProvidersService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateWorkerTaskDto,
  ): Promise<WorkerTaskResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.create(provider.id, dto);
  }

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: WorkerTaskListQueryDto,
  ): Promise<WorkerTaskResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.listByWeek(provider.id, query);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.delete(provider.id, id);
  }
}
