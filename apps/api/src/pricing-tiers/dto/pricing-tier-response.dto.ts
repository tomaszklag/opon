import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SizeTier } from '@prisma/client';

export class PricingTierResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ enum: SizeTier }) sizeTier!: SizeTier;
  @ApiProperty({ type: Number }) priceSwapPln!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) priceBalancingPerWheelPln?: number | null;
  @ApiProperty({ type: Number }) travelFeeFirstKmPln!: number;
  @ApiProperty({ type: Number }) travelFeeExtraKmPln!: number;
}
