import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { RegisterPushSubscriptionDto } from './dto/register-push-subscription.dto';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';

@ApiTags('push-subscriptions')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/push-subscriptions')
export class PushSubscriptionsController {
  constructor(private readonly repo: PushSubscriptionsRepository) {}

  // ── POST /v1/providers/me/push-subscriptions ─────────────────────────────

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Zarejestruj Web Push subscription urządzenia' })
  @ApiResponse({ status: 200 })
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterPushSubscriptionDto,
  ): Promise<void> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    await this.repo.upsert(user.providerId, dto);
  }

  // ── DELETE /v1/providers/me/push-subscriptions ───────────────────────────

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Wyrejestruj Web Push subscription (po wyłączeniu push w ustawieniach)',
  })
  @ApiResponse({ status: 204 })
  async unregister(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterPushSubscriptionDto,
  ): Promise<void> {
    if (!user.providerId) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    }
    await this.repo.deleteByEndpoint(user.providerId, dto.endpoint);
  }
}
