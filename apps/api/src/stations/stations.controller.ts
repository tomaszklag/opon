import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { StationResponseDto } from './dto/station-response.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationsService } from './stations.service';

@ApiTags('stations')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/stations')
export class StationsController {
  constructor(
    private readonly service: StationsService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/stations ─────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lista stanowisk (z przypisanymi pracownikami)' })
  @ApiResponse({ status: 200, type: [StationResponseDto] })
  async list(@CurrentUser() user: JwtPayload): Promise<StationResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listByProvider(provider.id);
  }

  // ── POST /v1/providers/me/stations ────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Utwórz stanowisko' })
  @ApiResponse({ status: 201, type: StationResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStationDto,
  ): Promise<StationResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.create(provider.id, dto);
  }

  // ── PUT /v1/providers/me/stations/:id ────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Zaktualizuj stanowisko (name, services, schedule)' })
  @ApiResponse({ status: 200, type: StationResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStationDto,
  ): Promise<StationResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.update(id, provider.id, dto);
  }

  // ── DELETE /v1/providers/me/stations/:id ─────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń stanowisko' })
  @ApiResponse({ status: 204 })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.delete(id, provider.id);
  }

  // ── POST /v1/providers/me/stations/:id/workers ────────────────────────────

  @Post(':id/workers')
  @ApiOperation({ summary: 'Przypisz pracownika do stanowiska' })
  @ApiResponse({ status: 201, type: StationResponseDto })
  async assignWorker(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AssignWorkerDto,
  ): Promise<StationResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.assignWorker(id, provider.id, dto);
  }

  // ── DELETE /v1/providers/me/stations/:id/workers/:workerId ───────────────

  @Delete(':id/workers/:workerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Odepnij pracownika od stanowiska' })
  @ApiResponse({ status: 204 })
  async removeWorker(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('workerId') workerId: string,
  ): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.removeWorker(id, provider.id, workerId);
  }

  // ── PUT /v1/providers/me/stations/:id/workers/:workerId ──────────────────

  @Put(':id/workers/:workerId')
  @ApiOperation({ summary: 'Zaktualizuj godziny zmiany pracownika na stanowisku' })
  @ApiResponse({ status: 200, type: StationResponseDto })
  async updateShift(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('workerId') workerId: string,
    @Body() dto: UpdateShiftDto,
  ): Promise<StationResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.updateShift(id, provider.id, workerId, dto);
  }
}
