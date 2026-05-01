import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../common/errors';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewStatsResponseDto } from './dto/review-stats-response.dto';
import { ReviewWithDetails, ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  // ── helpers ───────────────────────────────────────────────────────────────

  private toDto(review: ReviewWithDetails): ReviewResponseDto {
    const { client } = review;
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ').trim();
    const authorName = fullName || client.phone;

    const nameParts = authorName.split(/\s+/);
    const authorInitials =
      nameParts.length >= 2
        ? (nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')
        : authorName.slice(0, 2).toUpperCase();

    return {
      id: review.id,
      bookingReferenceCode: review.booking.referenceCode,
      authorName,
      authorInitials: authorInitials.toUpperCase(),
      rating: review.rating,
      comment: review.comment ?? null,
      providerReply: review.providerReply ?? null,
      providerRepliedAt: review.providerRepliedAt?.toISOString() ?? null,
      isReported: review.isReported,
      seenByProvider: review.seenByProvider,
      createdAt: review.createdAt.toISOString(),
    };
  }

  // ── list ──────────────────────────────────────────────────────────────────

  async list(providerId: string, query: ReviewListQueryDto): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsRepository.findByProvider(providerId, query);
    return reviews.map((r) => this.toDto(r));
  }

  // ── stats ─────────────────────────────────────────────────────────────────

  async getStats(providerId: string): Promise<ReviewStatsResponseDto> {
    return this.reviewsRepository.getStats(providerId);
  }

  // ── reply ─────────────────────────────────────────────────────────────────

  async createOrUpdateReply(
    providerId: string,
    reviewId: string,
    dto: CreateReplyDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.upsertReply(reviewId, providerId, dto.text);
    if (!review) {
      throw new AppException(ErrorCode.REVIEW_NOT_FOUND, 'Opinia nie istnieje.', 404);
    }
    return this.toDto(review);
  }

  async deleteReply(providerId: string, reviewId: string): Promise<void> {
    const review = await this.reviewsRepository.findById(reviewId, providerId);
    if (!review) {
      throw new AppException(ErrorCode.REVIEW_NOT_FOUND, 'Opinia nie istnieje.', 404);
    }
    await this.reviewsRepository.deleteReply(reviewId, providerId);
  }

  // ── report ────────────────────────────────────────────────────────────────

  async report(providerId: string, reviewId: string): Promise<void> {
    const review = await this.reviewsRepository.findById(reviewId, providerId);
    if (!review) {
      throw new AppException(ErrorCode.REVIEW_NOT_FOUND, 'Opinia nie istnieje.', 404);
    }
    await this.reviewsRepository.markReported(reviewId, providerId);
  }

  // ── mark seen ─────────────────────────────────────────────────────────────

  async markAllSeen(providerId: string): Promise<void> {
    await this.reviewsRepository.markAllSeen(providerId);
  }
}
