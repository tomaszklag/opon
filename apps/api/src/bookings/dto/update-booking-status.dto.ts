import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: ['confirm', 'start', 'complete', 'cancel', 'reject', 'no_show'],
  })
  @IsEnum(['confirm', 'start', 'complete', 'cancel', 'reject', 'no_show'])
  action!: 'confirm' | 'start' | 'complete' | 'cancel' | 'reject' | 'no_show';

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
