import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PricingTierResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ type: Number }) rimSizeMin!: number;
  @ApiProperty({ type: Number }) rimSizeMax!: number;
  @ApiProperty({ type: Number }) priceSwapPln!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) priceBalancingPerWheelPln?: number | null;
  @ApiProperty({ type: Number }) travelFeeFirstKmPln!: number;
  @ApiProperty({ type: Number }) travelFeeExtraKmPln!: number;
}
