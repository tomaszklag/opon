import { ApiProperty } from '@nestjs/swagger';

export class SurchargeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ enum: ['PER_WHEEL', 'PER_SENSOR'] })
  scope!: string;

  @ApiProperty({ type: Number })
  pricePln!: number;

  @ApiProperty()
  sortOrder!: number;
}
