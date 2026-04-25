import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class WorkingHoursDayDto {
  @ApiProperty({ example: 1, description: '0=niedz … 6=sobota' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isClosed!: boolean;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @Matches(TIME_RE, { message: 'openTime musi być HH:MM (00:00–23:59)' })
  openTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @Matches(TIME_RE, { message: 'closeTime musi być HH:MM (00:00–23:59)' })
  closeTime?: string;

  @ApiPropertyOptional({ default: 45, description: 'Długość slotu (minuty)' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  slotMinutes?: number;
}

export class UpsertWorkingHoursDto {
  @ApiProperty({ type: [WorkingHoursDayDto], description: '1–7 dni (upsert po dayOfWeek)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDayDto)
  days!: WorkingHoursDayDto[];
}
