import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty({ enum: LeaveType, example: LeaveType.VACATION })
  @IsEnum(LeaveType)
  type!: LeaveType;

  @ApiProperty({ example: '2025-07-01', description: 'Data rozpoczęcia (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-07-14', description: 'Data zakończenia (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 'Urlop wypoczynkowy', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
