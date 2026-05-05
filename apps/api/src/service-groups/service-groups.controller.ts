import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { ServiceGroupResponseDto } from './dto/service-group-response.dto';
import { SurchargeResponseDto } from './dto/surcharge-response.dto';
import { UpsertServiceGroupsDto } from './dto/upsert-service-groups.dto';
import { UpsertSurchargesDto } from './dto/upsert-surcharges.dto';
import { ServiceGroupsService } from './service-groups.service';

@ApiTags('service-groups')
@Controller('v1/providers/me')
export class ServiceGroupsController {
  constructor(
    private readonly service: ServiceGroupsService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/service-groups ───────────────────────────────────

  @Get('service-groups')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Pobierz grupy usług warsztatu' })
  @ApiResponse({ status: 200, type: [ServiceGroupResponseDto] })
  async getGroups(@CurrentUser() user: JwtPayload): Promise<ServiceGroupResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getGroups(provider.id);
  }

  // ── PUT /v1/providers/me/service-groups ───────────────────────────────────

  @Put('service-groups')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zastąp grupy usług warsztatu (pełna synchronizacja)' })
  @ApiResponse({ status: 200, type: [ServiceGroupResponseDto] })
  async replaceGroups(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertServiceGroupsDto,
  ): Promise<ServiceGroupResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.replaceGroups(provider.id, dto);
  }

  // ── GET /v1/providers/me/surcharges ───────────────────────────────────────

  @Get('surcharges')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Pobierz dopłaty warsztatu' })
  @ApiResponse({ status: 200, type: [SurchargeResponseDto] })
  async getSurcharges(@CurrentUser() user: JwtPayload): Promise<SurchargeResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getSurcharges(provider.id);
  }

  // ── PUT /v1/providers/me/surcharges ───────────────────────────────────────

  @Put('surcharges')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zastąp dopłaty warsztatu (pełna synchronizacja)' })
  @ApiResponse({ status: 200, type: [SurchargeResponseDto] })
  async replaceSurcharges(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertSurchargesDto,
  ): Promise<SurchargeResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.replaceSurcharges(provider.id, dto);
  }
}
