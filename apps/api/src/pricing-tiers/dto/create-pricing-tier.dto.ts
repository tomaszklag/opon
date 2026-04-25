import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreatePricingTierDto {
  @ApiProperty({ example: 13, description: 'Minimalny rozmiar felgi (cale)' })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(24)
  rimSizeMin!: number;

  @ApiProperty({ example: 15, description: 'Maksymalny rozmiar felgi (cale)' })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(24)
  rimSizeMax!: number;

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
