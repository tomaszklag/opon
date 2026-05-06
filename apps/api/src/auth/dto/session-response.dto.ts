import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) userAgent!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) ipAddress!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() lastUsedAt!: string;
  @ApiProperty() expiresAt!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) revokedAt!: string | null;
  @ApiProperty() isCurrent!: boolean;
}
