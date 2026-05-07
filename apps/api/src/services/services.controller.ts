import { Body, Controller, Delete, Get, HttpCode, Param, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { AddonResponseDto } from './dto/addon-response.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpsertAddonsDto } from './dto/upsert-addons.dto';
import { UpsertServicesDto } from './dto/upsert-services.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('v1/providers/me')
export class ServicesController {
  constructor(
    private readonly service: ServicesService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/services ────────────────────────────────────────

  @Get('services')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Pobierz listę usług warsztatu' })
  @ApiResponse({ status: 200, type: [ServiceResponseDto] })
  async getServices(@CurrentUser() user: JwtPayload): Promise<ServiceResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getServices(provider.id);
  }

  // ── PUT /v1/providers/me/services ────────────────────────────────────────

  @Put('services')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zastąp listę usług warsztatu (pełna synchronizacja)' })
  @ApiResponse({ status: 200, type: [ServiceResponseDto] })
  async replaceServices(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertServicesDto,
  ): Promise<ServiceResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.replaceServices(provider.id, dto);
  }

  // ── DELETE /v1/providers/me/services/:id ─────────────────────────────────

  @Delete('services/:id')
  @HttpCode(204)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Usuń usługę (hard lub soft delete w zależności od historii rezerwacji)',
  })
  @ApiResponse({ status: 204 })
  async deleteService(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    await this.service.deleteService(id, provider.id);
  }

  // ── GET /v1/providers/me/addons ──────────────────────────────────────────

  @Get('addons')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Pobierz kolekcję dodatków warsztatu' })
  @ApiResponse({ status: 200, type: [AddonResponseDto] })
  async getAddons(@CurrentUser() user: JwtPayload): Promise<AddonResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getAddons(provider.id);
  }

  // ── PUT /v1/providers/me/addons ──────────────────────────────────────────

  @Put('addons')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zastąp kolekcję dodatków warsztatu (pełna synchronizacja)' })
  @ApiResponse({ status: 200, type: [AddonResponseDto] })
  async replaceAddons(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertAddonsDto,
  ): Promise<AddonResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.replaceAddons(provider.id, dto);
  }

  // ── DELETE /v1/providers/me/addons/:id ───────────────────────────────────

  @Delete('addons/:id')
  @HttpCode(204)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Usuń dodatek (hard lub soft delete w zależności od historii rezerwacji)',
  })
  @ApiResponse({ status: 204 })
  async deleteAddon(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    await this.service.deleteAddon(id, provider.id);
  }
}
