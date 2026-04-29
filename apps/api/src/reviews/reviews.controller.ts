import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewStatsResponseDto } from './dto/review-stats-response.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/reviews')
export class ReviewsController {
  constructor(
    private readonly service: ReviewsService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/reviews ──────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List reviews for provider' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReviewListQueryDto,
  ): Promise<ReviewResponseDto[]> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.list(provider.id, query);
  }

  // ── GET /v1/providers/me/reviews/stats ────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get review stats for provider hero section' })
  @ApiResponse({ status: 200, type: ReviewStatsResponseDto })
  async getStats(@CurrentUser() user: JwtPayload): Promise<ReviewStatsResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.getStats(provider.id);
  }

  // ── POST /v1/providers/me/reviews/mark-seen ───────────────────────────────

  @Post('mark-seen')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark all unseen reviews as seen' })
  @ApiResponse({ status: 204 })
  async markSeen(@CurrentUser() user: JwtPayload): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.markAllSeen(provider.id);
  }

  // ── PUT /v1/providers/me/reviews/:id/reply ────────────────────────────────

  @Put(':id/reply')
  @ApiOperation({ summary: 'Create or update provider reply' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async upsertReply(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
  ): Promise<ReviewResponseDto> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.createOrUpdateReply(provider.id, id, dto);
  }

  // ── DELETE /v1/providers/me/reviews/:id/reply ─────────────────────────────

  @Delete(':id/reply')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete provider reply' })
  @ApiResponse({ status: 204 })
  async deleteReply(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.deleteReply(provider.id, id);
  }

  // ── POST /v1/providers/me/reviews/:id/report ──────────────────────────────

  @Post(':id/report')
  @HttpCode(204)
  @ApiOperation({ summary: 'Report review abuse (US-48)' })
  @ApiResponse({ status: 204 })
  async report(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.report(provider.id, id);
  }
}
