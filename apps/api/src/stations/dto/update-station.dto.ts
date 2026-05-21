import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { DayScheduleDto } from './create-station.dto';

export class UpdateStationDto {
  @ApiPropertyOptional({ example: 'Stanowisko 1', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @ApiPropertyOptional({
    description: 'DaySchedule[] — grafik tygodniowy (JSON)',
    example: [{ dayOfWeek: 1, open: true, startTime: '08:00', endTime: '17:00' }],
    type: [DayScheduleDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule?: DayScheduleDto[];
}
