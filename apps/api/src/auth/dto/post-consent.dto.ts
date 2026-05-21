import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PostConsentDto {
  @ApiProperty({ description: 'Akceptacja regulaminu' })
  @IsBoolean()
  termsAccepted!: boolean;

  @ApiProperty({ description: 'Akceptacja polityki prywatności' })
  @IsBoolean()
  privacyAccepted!: boolean;

  @ApiPropertyOptional({ description: 'Akceptacja marketingu' })
  @IsOptional()
  @IsBoolean()
  marketingAccepted?: boolean;
}
