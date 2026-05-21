import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class AppCreateReviewDto {
  @ApiProperty({ example: 'uuid-booking-id' })
  @IsUUID()
  bookingId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Świetna obsługa!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
