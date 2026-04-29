import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class DayScheduleDto {
  @ApiProperty({
    example: 1,
    minimum: 0,
    maximum: 6,
    description: 'Dzień tygodnia (0=niedziela, 6=sobota)',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  open!: boolean;

  @ApiProperty({ example: '08:00', description: 'Godzina otwarcia (HH:MM)' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @ApiProperty({ example: '17:00', description: 'Godzina zamknięcia (HH:MM)' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;
}

export class CreateStationDto {
  @ApiProperty({ example: 'Stanowisko 1', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ enum: ServiceType, isArray: true, default: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ServiceType, { each: true })
  services?: ServiceType[];

  @ApiProperty({
    description: 'DaySchedule[] — grafik tygodniowy (JSON)',
    example: [{ dayOfWeek: 1, open: true, startTime: '08:00', endTime: '17:00' }],
    type: [DayScheduleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule!: DayScheduleDto[];
}
