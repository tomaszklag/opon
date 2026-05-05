import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubServiceConfigDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  included!: boolean;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  fromCatalog!: boolean;

  @ApiPropertyOptional({ type: Number, nullable: true })
  pricePln?: number | null;

  @ApiPropertyOptional({ nullable: true })
  durationMinutes?: number | null;

  @ApiProperty()
  sortOrder!: number;
}
