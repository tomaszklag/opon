import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderPauseResponseDto {
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  pausedUntil!: string | null;
}
