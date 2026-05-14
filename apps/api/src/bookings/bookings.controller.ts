import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { IdempotencyInterceptor } from '../common/idempotency/idempotency.interceptor';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { BookingDetailResponseDto } from './dto/booking-detail-response.dto';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { BookingsService } from './bookings.service';
import { BookingAdminListQueryDto } from './dto/booking-admin-list-query.dto';
import { BookingPageResponseDto } from './dto/booking-page-response.dto';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';

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

  // ── GET /v1/providers/me/bookings/summary ─────────────────────────────────

  @Get('summary')
  @ApiOperation({ summary: 'Paginated booking list with filters (admin table)' })
  @ApiResponse({ status: 200, type: BookingPageResponseDto })
  async listAdmin(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingAdminListQueryDto,
  ): Promise<BookingPageResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listAdmin(provider.id, query);
  }

  // ── GET /v1/providers/me/bookings/stats ───────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Booking KPI stats (last 30 days vs prior 30 days)' })
  @ApiResponse({ status: 200, type: BookingStatsResponseDto })
  async getStats(@CurrentUser() user: JwtPayload): Promise<BookingStatsResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getStats(provider.id);
  }

  // ── PATCH /v1/providers/me/bookings/bulk-status ───────────────────────────

  @Patch('bulk-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update booking status (confirm or cancel)' })
  async bulkUpdateStatus(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkUpdateStatusDto,
  ): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.bulkUpdateStatus(provider.id, dto);
  }

  // ── POST /v1/providers/me/bookings/manual ────────────────────────────────

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Create manual booking (provider-initiated)' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  async createManual(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateManualBookingDto,
  ): Promise<BookingResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.createManual(provider.id, dto);
  }

  // ── GET /v1/providers/me/bookings/availability ────────────────────────────

  @Get('availability')
  @ApiOperation({ summary: 'Get available time slots for a given date' })
  @ApiResponse({ status: 200, type: AvailabilityResponseDto })
  async getAvailability(
    @CurrentUser() user: JwtPayload,
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailabilityResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getAvailability(provider.id, query);
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

  // ── PATCH /v1/providers/me/bookings/:referenceCode/reschedule ────────────

  @Patch(':referenceCode/reschedule')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reschedule a booking (move to new date/time)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  async reschedule(
    @CurrentUser() user: JwtPayload,
    @Param('referenceCode') referenceCode: string,
    @Body() dto: RescheduleBookingDto,
  ): Promise<BookingResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.reschedule(provider.id, referenceCode, dto);
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
