import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateWorkerTaskDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  linkedBookingId?: string | null;

  @ApiPropertyOptional({ type: String, example: '2026-05-17T09:00:00.000Z' })
  @IsISO8601()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({ type: String, example: '2026-05-17T10:00:00.000Z' })
  @IsISO8601()
  @IsOptional()
  endAt?: string;
}
