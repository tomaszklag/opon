import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderStatus, ProviderType } from '@prisma/client';

export class ProviderResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) slug?: string | null;
  @ApiProperty() nip!: string;
  @ApiProperty({ enum: ProviderType }) type!: ProviderType;
  @ApiProperty({ enum: ProviderStatus }) status!: ProviderStatus;
  @ApiPropertyOptional({ type: String, nullable: true }) description?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) logoUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) phone?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) email?: string | null;
  @ApiProperty() ownerId!: string;
  @ApiPropertyOptional({ type: Number, nullable: true }) cityCenterLat?: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) cityCenterLng?: number | null;
  @ApiProperty({ type: Number }) serviceRadiusKm!: number;
  @ApiProperty({ type: Number }) avgRating!: number;
  @ApiProperty({ type: Number }) reviewCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  emailVerifiedAt?: Date | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  submittedAt?: Date | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  approvedAt?: Date | null;
  @ApiProperty() updatedAt!: Date;
}
