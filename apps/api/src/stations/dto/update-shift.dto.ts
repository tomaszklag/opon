import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateShiftDto {
  @ApiPropertyOptional({ example: '08:00', description: 'Godzina rozpoczęcia zmiany (HH:MM)' })
  @IsOptional()
  @IsString()
  @Matches(TIME_RE, { message: 'shiftStart musi być w formacie HH:MM (00:00–23:59)' })
  shiftStart?: string;

  @ApiPropertyOptional({ example: '16:00', description: 'Godzina zakończenia zmiany (HH:MM)' })
  @IsOptional()
  @IsString()
  @Matches(TIME_RE, { message: 'shiftEnd musi być w formacie HH:MM (00:00–23:59)' })
  shiftEnd?: string;
}
