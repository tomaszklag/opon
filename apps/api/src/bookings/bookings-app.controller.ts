import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppBookingsService } from './app-bookings.service';
import { AppBookingListQueryDto } from './dto/app-booking-list-query.dto';
import { AppBookingResponseDto } from './dto/app-booking-response.dto';
import { AppCreateBookingDto } from './dto/app-create-booking.dto';

@ApiTags('app-bookings')
@ApiBearerAuth()
@Roles(UserRole.CLIENT)
@Controller('v1/app/bookings')
export class BookingsAppController {
  constructor(private readonly appBookingsService: AppBookingsService) {}

  // ── GET /v1/app/bookings ──────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List bookings for current client' })
  @ApiOkResponse({ type: [AppBookingResponseDto] })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: AppBookingListQueryDto,
  ): Promise<AppBookingResponseDto[]> {
    return this.appBookingsService.listForClient(user.sub, query.status);
  }

  // ── GET /v1/app/bookings/:id ──────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get single booking for current client' })
  @ApiOkResponse({ type: AppBookingResponseDto })
  async getOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppBookingResponseDto> {
    return this.appBookingsService.getForClient(user.sub, id);
  }

  // ── POST /v1/app/bookings ─────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking (client)' })
  @ApiCreatedResponse({ type: AppBookingResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AppCreateBookingDto,
  ): Promise<AppBookingResponseDto> {
    return this.appBookingsService.createForClient(user, dto);
  }

  // ── POST /v1/app/bookings/:id/cancel ─────────────────────────────────────

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking (client)' })
  @ApiOkResponse({ type: AppBookingResponseDto })
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppBookingResponseDto> {
    return this.appBookingsService.cancelForClient(user.sub, id);
  }
}
