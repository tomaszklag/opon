import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkerDto {
  @ApiPropertyOptional({ example: 'Jan Kowalski', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Mechanik', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}
