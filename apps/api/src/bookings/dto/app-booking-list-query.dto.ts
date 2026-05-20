import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class AppBookingListQueryDto {
  @ApiPropertyOptional({
    enum: ['ACTIVE', 'PAST'],
    description: 'ACTIVE = PENDING|CONFIRMED|IN_PROGRESS; PAST = completed/cancelled',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'PAST'])
  status?: 'ACTIVE' | 'PAST';
}
