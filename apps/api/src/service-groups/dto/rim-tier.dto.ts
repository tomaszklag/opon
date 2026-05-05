import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RimTierDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty({ type: [String] })
  rimSizes!: string[];

  @ApiProperty({ type: Number })
  pricePln!: number;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty()
  sortOrder!: number;
}
