import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { AppCreateReviewDto } from './dto/app-create-review.dto';
import { AppReviewClientResponseDto } from './dto/app-review-client-response.dto';

@ApiTags('app-reviews')
@ApiBearerAuth()
@Roles(UserRole.CLIENT)
@Controller('v1/app/reviews')
export class ReviewsAppController {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /v1/app/reviews ───────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dodaj opinię o zakończonej wizycie (mobilna)' })
  @ApiCreatedResponse({ type: AppReviewClientResponseDto })
  @ApiResponse({ status: 404, description: 'Rezerwacja nie istnieje lub brak dostępu' })
  @ApiResponse({ status: 409, description: 'Opinia już istnieje dla tej rezerwacji' })
  @ApiResponse({ status: 422, description: 'Wizyta nie jest zakończona' })
  async createReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AppCreateReviewDto,
  ): Promise<AppReviewClientResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, client: { userId: user.sub } },
      include: { client: { select: { id: true, firstName: true } } },
    });

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, 'Rezerwacja nie istnieje.', 404);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppException(
        ErrorCode.BOOKING_INVALID_STATUS,
        'Opinie można dodawać tylko do zakończonych wizyt.',
        422,
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (existing) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'Opinia dla tej rezerwacji już istnieje.',
        409,
      );
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: dto.bookingId,
          clientId: booking.clientId,
          providerId: booking.providerId,
          rating: dto.rating,
          comment: dto.comment ?? null,
        },
      });

      const agg = await tx.review.aggregate({
        where: { providerId: booking.providerId, isHidden: false },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.provider.update({
        where: { id: booking.providerId },
        data: {
          avgRating: agg._avg.rating ?? 0,
          reviewCount: agg._count.id,
        },
      });

      return created;
    });

    return {
      id: review.id,
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt.toISOString(),
      author: { firstName: booking.client.firstName },
    };
  }
}
