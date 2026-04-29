import { ApiProperty } from '@nestjs/swagger';

export class ReviewStatsResponseDto {
  @ApiProperty() avgRating!: number;
  @ApiProperty() totalCount!: number;
  @ApiProperty() newCount!: number;
  @ApiProperty() pendingReplyCount!: number;
  @ApiProperty() repliedCount!: number;
  @ApiProperty() reportedCount!: number;
  @ApiProperty() replyRatePct!: number;
  @ApiProperty({ nullable: true, type: Number }) avgReplyTimeHours!: number | null;
  @ApiProperty({ type: [Number] }) ratingCounts!: [number, number, number, number, number];
  @ApiProperty() lastThirtyDaysCount!: number;
}
