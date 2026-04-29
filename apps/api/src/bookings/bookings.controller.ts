import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/bookings')
export class BookingsController {
  constructor(
    private readonly service: BookingsService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/bookings ─────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List bookings for current week (provider)' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingListQueryDto,
  ): Promise<BookingResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listByProvider(provider.id, query.weekStart);
  }
}
