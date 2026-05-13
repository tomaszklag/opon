import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkerTaskDto {
  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  linkedBookingId?: string | null;
}
