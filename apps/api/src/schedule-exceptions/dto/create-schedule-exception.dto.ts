import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateScheduleExceptionDto {
  @ApiProperty({ example: '2026-12-25', description: 'Data (YYYY-MM-DD)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'Boże Narodzenie', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  reason!: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Jeśli brak — dzień zamknięty' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  customOpenTime?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  customCloseTime?: string;
}
