import { ApiProperty } from '@nestjs/swagger';

export class AppReviewResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() rating!: number;
  @ApiProperty({ nullable: true, type: String }) comment!: string | null;
  @ApiProperty() authorName!: string;
  @ApiProperty({ nullable: true, type: String }) providerReply!: string | null;
  @ApiProperty({ nullable: true, type: String }) providerRepliedAt!: string | null;
  @ApiProperty() createdAt!: string;
}
