import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { WorkerTasksService } from './worker-tasks.service';
import { CreateWorkerTaskDto } from './dto/create-worker-task.dto';
import { UpdateWorkerTaskDto } from './dto/update-worker-task.dto';
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
  @ApiCreatedResponse({ type: WorkerTaskResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateWorkerTaskDto,
  ): Promise<WorkerTaskResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.create(provider.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: WorkerTaskResponseDto, isArray: true })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: WorkerTaskListQueryDto,
  ): Promise<WorkerTaskResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.listByWeek(provider.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: WorkerTaskResponseDto })
  async findById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<WorkerTaskResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.findById(provider.id, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: WorkerTaskResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkerTaskDto,
  ): Promise<WorkerTaskResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.update(provider.id, id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.workerTasksService.delete(provider.id, id);
  }
}
