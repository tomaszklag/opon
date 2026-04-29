import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() bookingReferenceCode!: string;
  @ApiProperty() authorName!: string;
  @ApiProperty() authorInitials!: string;
  @ApiProperty() rating!: number;
  @ApiProperty({ nullable: true, type: String }) comment!: string | null;
  @ApiProperty({ nullable: true, type: String }) providerReply!: string | null;
  @ApiProperty({ nullable: true, type: String }) providerRepliedAt!: string | null;
  @ApiProperty() isReported!: boolean;
  @ApiProperty() seenByProvider!: boolean;
  @ApiProperty() createdAt!: string;
}
