import { IsISO8601, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SetProviderPauseDto {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Data wygaśnięcia pauzy w formacie ISO 8601. null = odblokuj.',
    example: '2026-05-01T23:59:59.999Z',
  })
  @IsOptional()
  @ValidateIf((o: SetProviderPauseDto) => o.until !== null)
  @IsISO8601()
  until?: string | null;
}
