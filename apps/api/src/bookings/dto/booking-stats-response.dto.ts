import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingStatsResponseDto {
  @ApiProperty() total!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) totalPrev!: number | null;
  @ApiProperty() revenuePln!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) revenuePrevPln!: number | null;
  @ApiProperty() avgValuePln!: number;
  @ApiProperty() completionRate!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) completionRatePrev!: number | null;
}
