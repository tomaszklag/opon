import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { SizeTier } from '@prisma/client';

export class CreatePricingTierDto {
  @ApiProperty({
    enum: SizeTier,
    description: 'Tier rozmiaru felgi: S (≤R15), M (R16–R17), L (≥R18)',
  })
  @IsEnum(SizeTier)
  sizeTier!: SizeTier;

  @ApiProperty({ example: 120.0, description: 'Cena wymiany kompletu (PLN)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  priceSwapPln!: number;

  @ApiPropertyOptional({ example: 25.0, description: 'Cena wyważania za koło (PLN)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceBalancingPerWheelPln?: number;

  @ApiPropertyOptional({ example: 0, description: 'Opłata dojazd — pierwsze km (PLN)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  travelFeeFirstKmPln?: number;

  @ApiPropertyOptional({ example: 2.5, description: 'Opłata dojazd — każdy kolejny km (PLN)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  travelFeeExtraKmPln?: number;
}
