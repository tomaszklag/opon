import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export type AdminStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export class BookingAdminListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
  status?: AdminStatusFilter;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() dateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() dateTo?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['startAt', 'totalPricePln']) sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['asc', 'desc']) sortDir?: string;
}
