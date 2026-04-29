import { Body, Controller, Get, HttpCode, Param, Patch, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { BookingDetailResponseDto } from './dto/booking-detail-response.dto';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
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

  // ── GET /v1/providers/me/bookings/:referenceCode ──────────────────────────

  @Get(':referenceCode')
  @ApiOperation({ summary: 'Get booking detail (provider)' })
  @ApiResponse({ status: 200, type: BookingDetailResponseDto })
  async getDetail(
    @CurrentUser() user: JwtPayload,
    @Param('referenceCode') referenceCode: string,
  ): Promise<BookingDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getDetail(provider.id, referenceCode);
  }

  // ── PATCH /v1/providers/me/bookings/:referenceCode/status ─────────────────

  @Patch(':referenceCode/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update booking status (provider action)' })
  @ApiResponse({ status: 200, type: BookingDetailResponseDto })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('referenceCode') referenceCode: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingDetailResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.updateStatus(provider.id, referenceCode, dto);
  }
}
