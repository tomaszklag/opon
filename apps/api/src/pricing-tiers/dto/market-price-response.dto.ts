import { ApiProperty } from '@nestjs/swagger';

export type MarketPriceCategory = 'small' | 'medium' | 'large';

export class MarketPriceResponseDto {
  @ApiProperty({
    enum: ['small', 'medium', 'large'],
    description: 'Kategoria rozmiaru: small (≤15"), medium (16–17"), large (≥18")',
  })
  category!: MarketPriceCategory;

  @ApiProperty({ type: Number, description: 'Minimalna cena wymiany wśród sąsiednich dostawców' })
  priceMin!: number;

  @ApiProperty({ type: Number, description: 'Maksymalna cena wymiany wśród sąsiednich dostawców' })
  priceMax!: number;

  @ApiProperty({ type: Number, description: 'Liczba unikalnych dostawców w próbce' })
  providerCount!: number;
}
