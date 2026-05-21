import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { ServiceConfigResponseDto } from './dto/service-config-response.dto';
import { UpsertServiceConfigsDto } from './dto/upsert-service-configs.dto';
import { ServiceConfigsService } from './service-configs.service';

@ApiTags('service-configs')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/service-configs')
export class ServiceConfigsController {
  constructor(private readonly service: ServiceConfigsService) {}

  // ── GET /v1/providers/me/service-configs ─────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Pobierz konfigurację czasów usług' })
  @ApiResponse({ status: 200, type: [ServiceConfigResponseDto] })
  getAll(@CurrentUser() user: JwtPayload): Promise<ServiceConfigResponseDto[]> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    return this.service.getAll(user.providerId);
  }

  // ── PUT /v1/providers/me/service-configs ─────────────────────────────────

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert konfiguracji czasów usług' })
  @ApiResponse({ status: 200, type: [ServiceConfigResponseDto] })
  upsertAll(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertServiceConfigsDto,
  ): Promise<ServiceConfigResponseDto[]> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    return this.service.upsertAll(user.providerId, dto);
  }
}
