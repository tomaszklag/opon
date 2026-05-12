import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

export class RescheduleBookingDto {
  @ApiProperty({ example: '2025-06-15T09:00:00.000Z' })
  @IsISO8601()
  startAt!: string;

  @ApiProperty({ example: '2025-06-15T10:30:00.000Z' })
  @IsISO8601()
  endAt!: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  notifyClient?: boolean;
}
