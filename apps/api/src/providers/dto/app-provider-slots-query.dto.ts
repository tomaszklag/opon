import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class AppProviderSlotsQueryDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  date!: string;
}
