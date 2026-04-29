import { IsDateString, IsOptional } from 'class-validator';

export class BookingListQueryDto {
  @IsOptional()
  @IsDateString()
  weekStart?: string; // ISO date string e.g. "2026-04-14" (Monday)
}
