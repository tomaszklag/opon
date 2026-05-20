import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AppReviewAuthorDto {
  @ApiPropertyOptional({ nullable: true })
  firstName!: string | null;
}

export class AppReviewClientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty()
  rating!: number;

  @ApiPropertyOptional({ nullable: true })
  comment!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: AppReviewAuthorDto })
  author!: AppReviewAuthorDto;
}
