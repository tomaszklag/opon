import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddonResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: Number }) pricePln!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) durationMinutes!: number | null;
  @ApiProperty() enabled!: boolean;
  @ApiProperty({ type: Number }) sortOrder!: number;
}
