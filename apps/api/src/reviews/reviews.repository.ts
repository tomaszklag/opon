import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { ReviewStatsResponseDto } from './dto/review-stats-response.dto';

type AvgReplyRow = { avg_hours: number | null }[];

export type ReviewWithDetails = Prisma.ReviewGetPayload<{
  include: {
    booking: { select: { referenceCode: true } };
    client: { select: { firstName: true; lastName: true; phone: true } };
  };
}>;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProvider(
    providerId: string,
    query: ReviewListQueryDto,
  ): Promise<ReviewWithDetails[]> {
    const where: Prisma.ReviewWhereInput = { providerId, isHidden: false };

    if (query.tab === 'pending') where.providerReply = null;
    else if (query.tab === 'replied') where.providerReply = { not: null };
    else if (query.tab === 'reported') where.isReported = true;

    if (query.rating === '5') where.rating = 5;
    else if (query.rating === '4') where.rating = 4;
    else if (query.rating === 'lte3') where.rating = { lte: 3 };

    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      query.sort === 'oldest_pending' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    return this.prisma.review.findMany({
      where,
      orderBy,
      take: 100,
      include: {
        booking: { select: { referenceCode: true } },
        client: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async getStats(providerId: string): Promise<ReviewStatsResponseDto> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCount,
      ratingGroups,
      pendingReplyCount,
      repliedCount,
      reportedCount,
      newCount,
      lastThirtyDaysCount,
      providerData,
      avgReplyRows,
    ] = await Promise.all([
      this.prisma.review.count({ where: { providerId, isHidden: false } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { providerId, isHidden: false },
        _count: { rating: true },
      }),
      this.prisma.review.count({ where: { providerId, isHidden: false, providerReply: null } }),
      this.prisma.review.count({
        where: { providerId, isHidden: false, providerReply: { not: null } },
      }),
      this.prisma.review.count({ where: { providerId, isReported: true } }),
      this.prisma.review.count({ where: { providerId, isHidden: false, seenByProvider: false } }),
      this.prisma.review.count({
        where: { providerId, isHidden: false, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.provider.findUnique({ where: { id: providerId }, select: { avgRating: true } }),
      this.prisma.$queryRaw<AvgReplyRow>`
          SELECT AVG(EXTRACT(EPOCH FROM (provider_replied_at - created_at)) / 3600)::float AS avg_hours
          FROM reviews
          WHERE provider_id = ${providerId}
            AND provider_replied_at IS NOT NULL
            AND is_hidden = false
        `,
    ]);

    const countMap = Object.fromEntries(ratingGroups.map((g) => [g.rating, g._count.rating]));
    const ratingCounts: [number, number, number, number, number] = [5, 4, 3, 2, 1].map(
      (r) => countMap[r] ?? 0,
    ) as [number, number, number, number, number];

    const rawAvg = avgReplyRows[0]?.avg_hours;
    const avgReplyTimeHours = rawAvg != null ? Math.round(rawAvg * 10) / 10 : null;

    return {
      avgRating: Number(providerData?.avgRating ?? 0),
      totalCount,
      newCount,
      pendingReplyCount,
      repliedCount,
      reportedCount,
      replyRatePct: totalCount > 0 ? Math.round((repliedCount / totalCount) * 100) : 0,
      avgReplyTimeHours,
      ratingCounts,
      lastThirtyDaysCount,
    };
  }

  async findById(id: string, providerId: string): Promise<ReviewWithDetails | null> {
    return this.prisma.review.findFirst({
      where: { id, providerId },
      include: {
        booking: { select: { referenceCode: true } },
        client: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async upsertReply(
    id: string,
    providerId: string,
    text: string,
  ): Promise<ReviewWithDetails | null> {
    await this.prisma.review.updateMany({
      where: { id, providerId },
      data: { providerReply: text, providerRepliedAt: new Date() },
    });
    return this.findById(id, providerId);
  }

  async deleteReply(id: string, providerId: string): Promise<void> {
    await this.prisma.review.updateMany({
      where: { id, providerId },
      data: { providerReply: null, providerRepliedAt: null },
    });
  }

  async markReported(id: string, providerId: string): Promise<void> {
    await this.prisma.review.updateMany({
      where: { id, providerId },
      data: { isReported: true },
    });
  }

  async markAllSeen(providerId: string): Promise<void> {
    await this.prisma.review.updateMany({
      where: { providerId, seenByProvider: false },
      data: { seenByProvider: true },
    });
  }
}
