import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { BookingsService } from '../bookings/bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import {
  AppProviderListResponseDto,
  AppProviderResponseDto,
} from './dto/app-provider-response.dto';
import { AppProviderSlotsQueryDto } from './dto/app-provider-slots-query.dto';
import { AppReviewResponseDto } from './dto/app-review-response.dto';
import { AppSlotResponseDto } from './dto/app-slot-response.dto';
import { ListProvidersQueryDto } from './dto/list-providers-query.dto';
import { ProviderPublicView, ProvidersService } from './providers.service';

@ApiTags('app-providers')
@ApiBearerAuth()
@Roles(UserRole.CLIENT)
@Controller('v1/app/providers')
export class ProvidersAppController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly bookingsService: BookingsService,
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  // ── GET /v1/app/providers ──────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lista zatwierdzonych warsztatów (mobilna)' })
  @ApiResponse({ status: 200, type: AppProviderListResponseDto })
  async list(@Query() query: ListProvidersQueryDto): Promise<AppProviderListResponseDto> {
    const page = await this.providersService.listApproved(query);
    return {
      data: page.data.map((p) => this.toAppProviderDto(p)),
      total: page.total,
      page: page.page,
      limit: page.limit,
    };
  }

  // ── GET /v1/app/providers/:id ──────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Szczegóły warsztatu (mobilna)' })
  @ApiResponse({ status: 200, type: AppProviderResponseDto })
  @ApiResponse({ status: 404, description: 'Firma nie istnieje lub nie jest dostępna' })
  async getOne(@Param('id', ParseUUIDPipe) id: string): Promise<AppProviderResponseDto> {
    const provider = await this.providersService.getApprovedById(id);
    return this.toAppProviderDto(provider);
  }

  // ── GET /v1/app/providers/:id/slots ───────────────────────────────────────

  @Get(':id/slots')
  @ApiOperation({ summary: 'Dostępne sloty dla warsztatu na dany dzień (mobilna)' })
  @ApiResponse({ status: 200, type: [AppSlotResponseDto] })
  async getSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AppProviderSlotsQueryDto,
  ): Promise<AppSlotResponseDto[]> {
    // Ensure the provider exists and is approved before querying availability
    await this.providersService.getApprovedById(id);

    const availability = await this.bookingsService.getAvailability(id, { date: query.date });

    if (availability.isClosedDay) {
      return [];
    }

    return availability.slots.map((slot) => ({
      id: slot.startAt,
      startAt: slot.startAt,
      endAt: slot.endAt,
      available: slot.isAvailable,
    }));
  }

  // ── GET /v1/app/providers/:id/reviews ─────────────────────────────────────

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Opinie o warsztacie (mobilna)' })
  @ApiResponse({ status: 200, type: [AppReviewResponseDto] })
  async getReviews(@Param('id', ParseUUIDPipe) id: string): Promise<AppReviewResponseDto[]> {
    // Ensure the provider exists and is approved
    await this.providersService.getApprovedById(id);

    const reviews = await this.reviewsService.list(id, { sort: 'newest' });
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      authorName: r.authorName,
      providerReply: r.providerReply,
      providerRepliedAt: r.providerRepliedAt,
      createdAt: r.createdAt,
    }));
  }

  // ── POST /v1/app/providers/:id/waitlist ───────────────────────────────────

  @Post(':id/waitlist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dołącz do listy oczekujących warsztatu (mobilna)' })
  @ApiResponse({ status: 201, description: 'Dodano do listy oczekujących' })
  @ApiResponse({ status: 409, description: 'Już jesteś na liście oczekujących' })
  async joinWaitlist(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ providerId: string; createdAt: string }> {
    // Ensure the provider exists and is approved
    await this.providersService.getApprovedById(id);

    try {
      const entry = await this.prisma.providerWaitlistEntry.create({
        data: {
          userId: user.sub,
          providerId: id,
        },
      });
      return { providerId: entry.providerId, createdAt: entry.createdAt.toISOString() };
    } catch (err) {
      // Prisma P2002 = unique constraint violation (userId + providerId already exists)
      if ((err as { code?: string }).code === 'P2002') {
        throw new AppException(
          ErrorCode.WAITLIST_ALREADY_JOINED,
          'Już jesteś na liście oczekujących.',
          409,
        );
      }
      throw err;
    }
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private toAppProviderDto(provider: ProviderPublicView): AppProviderResponseDto {
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      logoUrl: provider.logoUrl ?? null,
      tagline: provider.tagline ?? null,
      address: provider.address ?? null,
      cityCenterLat: provider.cityCenterLat != null ? Number(provider.cityCenterLat) : null,
      cityCenterLng: provider.cityCenterLng != null ? Number(provider.cityCenterLng) : null,
      serviceRadiusKm: provider.serviceRadiusKm,
      avgRating: Number(provider.avgRating),
      reviewCount: provider.reviewCount,
      description: provider.description ?? null,
      phone: provider.phone ?? null,
      showPhone: provider.showPhone,
      vehicleTypes: provider.vehicleTypes,
      tireSizes: provider.tireSizes,
      additionalServices: provider.additionalServices,
    };
  }
}
