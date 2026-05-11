import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { DepotService } from './depot.service';
import { CreateTireSetDto } from './dto/create-tire-set.dto';
import { UpdateTireSetDto } from './dto/update-tire-set.dto';
import { DepotListQueryDto } from './dto/depot-list-query.dto';
import { UpsertDepotSlotsDto } from './dto/upsert-depot-slots.dto';
import { TireSetResponseDto } from './dto/tire-set-response.dto';
import { TireSetDetailResponseDto } from './dto/tire-set-detail-response.dto';
import { TireSetPageResponseDto } from './dto/tire-set-page-response.dto';
import { DepotStatsResponseDto } from './dto/depot-stats-response.dto';
import { DepotSlotResponseDto } from './dto/depot-slot-response.dto';

@ApiTags('depot')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/depot')
export class DepotController {
  constructor(
    private readonly service: DepotService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/depot ──────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List tire sets (paginated)' })
  @ApiResponse({ status: 200, type: TireSetPageResponseDto })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: DepotListQueryDto,
  ): Promise<TireSetPageResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.list(provider.id, query);
  }

  // ── GET /v1/providers/me/depot/stats ────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Depot KPI stats' })
  @ApiResponse({ status: 200, type: DepotStatsResponseDto })
  async getStats(@CurrentUser() user: JwtPayload): Promise<DepotStatsResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getStats(provider.id);
  }

  // ── GET /v1/providers/me/depot/slots ────────────────────────────────────────

  @Get('slots')
  @ApiOperation({ summary: 'List all depot slots with occupancy' })
  @ApiResponse({ status: 200, type: [DepotSlotResponseDto] })
  async getSlots(@CurrentUser() user: JwtPayload): Promise<DepotSlotResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getSlots(provider.id);
  }

  // ── POST /v1/providers/me/depot ─────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add tire set to depot' })
  @ApiResponse({ status: 201, type: TireSetDetailResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTireSetDto,
  ): Promise<TireSetDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.create(provider.id, dto);
  }

  // ── POST /v1/providers/me/depot/slots/bulk ───────────────────────────────────

  @Post('slots/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create depot slots' })
  @ApiResponse({ status: 201, type: [DepotSlotResponseDto] })
  async bulkCreateSlots(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertDepotSlotsDto,
  ): Promise<DepotSlotResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.bulkCreateSlots(provider.id, dto);
  }

  // ── GET /v1/providers/me/depot/:id ──────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get tire set detail' })
  @ApiResponse({ status: 200, type: TireSetDetailResponseDto })
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TireSetDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getById(provider.id, id);
  }

  // ── PATCH /v1/providers/me/depot/:id ────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update tire set data / location / condition' })
  @ApiResponse({ status: 200, type: TireSetDetailResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTireSetDto,
  ): Promise<TireSetDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.update(provider.id, id, dto);
  }

  // ── POST /v1/providers/me/depot/:id/pickup ───────────────────────────────────

  @Post(':id/pickup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark tire set as picked up by client' })
  @ApiResponse({ status: 200, type: TireSetDetailResponseDto })
  async pickup(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TireSetDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.pickup(provider.id, id);
  }

  // ── POST /v1/providers/me/depot/:id/store ────────────────────────────────────

  @Post(':id/store')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-admit picked-up tire set back to depot' })
  @ApiResponse({ status: 200, type: TireSetDetailResponseDto })
  async store(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { storedAt?: string; releaseDue?: string; pricePln?: number; notes?: string },
  ): Promise<TireSetDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.store(provider.id, id, body);
  }

  // ── DELETE /v1/providers/me/depot/:id ───────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tire set (only PICKED_UP)' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.remove(provider.id, id);
  }

  // ── DELETE /v1/providers/me/depot/slots/:slotId ──────────────────────────────

  @Delete('slots/:slotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete empty depot slot' })
  async removeSlot(
    @CurrentUser() user: JwtPayload,
    @Param('slotId') slotId: string,
  ): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.removeSlot(provider.id, slotId);
  }
}
