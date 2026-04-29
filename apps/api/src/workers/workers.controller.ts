import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerResponseDto } from './dto/worker-response.dto';
import { WorkersService } from './workers.service';

@ApiTags('workers')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/workers')
export class WorkersController {
  constructor(
    private readonly service: WorkersService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/workers ──────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lista pracowników (ze stanowiskami i urlopami)' })
  @ApiResponse({ status: 200, type: [WorkerResponseDto] })
  async list(@CurrentUser() user: JwtPayload): Promise<WorkerResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listByProvider(provider.id);
  }

  // ── POST /v1/providers/me/workers ─────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Utwórz pracownika' })
  @ApiResponse({ status: 201, type: WorkerResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateWorkerDto,
  ): Promise<WorkerResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.create(provider.id, dto);
  }

  // ── PUT /v1/providers/me/workers/:id ─────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Zaktualizuj pracownika (name, role)' })
  @ApiResponse({ status: 200, type: WorkerResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkerDto,
  ): Promise<WorkerResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.update(id, provider.id, dto);
  }

  // ── DELETE /v1/providers/me/workers/:id ──────────────────────────────────

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń pracownika' })
  @ApiResponse({ status: 200 })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.delete(id, provider.id);
  }

  // ── POST /v1/providers/me/workers/:id/leaves ──────────────────────────────

  @Post(':id/leaves')
  @ApiOperation({ summary: 'Dodaj urlop / nieobecność pracownika' })
  @ApiResponse({ status: 201, type: WorkerResponseDto })
  async addLeave(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateLeaveDto,
  ): Promise<WorkerResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.addLeave(id, provider.id, dto);
  }

  // ── DELETE /v1/providers/me/workers/:id/leaves/:leaveId ──────────────────

  @Delete(':id/leaves/:leaveId')
  @ApiOperation({ summary: 'Usuń urlop / nieobecność pracownika' })
  @ApiResponse({ status: 200 })
  async deleteLeave(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('leaveId') leaveId: string,
  ): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.deleteLeave(id, provider.id, leaveId);
  }
}
