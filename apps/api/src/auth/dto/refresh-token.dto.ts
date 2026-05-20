import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (mobile clients send in body)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
