import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class WorkerTaskListQueryDto {
  @ApiProperty({ example: '2026-04-28' }) @IsDateString() weekStart!: string;
}
