import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { NotificationPreferencesDto } from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationPreferencesService } from './notification-preferences.service';

@ApiTags('notification-preferences')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  // ── GET /v1/providers/me/notification-preferences ────────────────────────

  @Get()
  @ApiOperation({ summary: 'Pobierz ustawienia powiadomień (tworzy domyślne jeśli brak)' })
  @ApiResponse({ status: 200, type: NotificationPreferencesDto })
  get(@CurrentUser() user: JwtPayload): Promise<NotificationPreferencesDto> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    return this.service.get(user.providerId);
  }

  // ── PUT /v1/providers/me/notification-preferences ────────────────────────

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Zaktualizuj ustawienia powiadomień' })
  @ApiResponse({ status: 200, type: NotificationPreferencesDto })
  update(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    return this.service.update(user.providerId, dto);
  }
}
