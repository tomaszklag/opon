import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderStatus, UserRole } from '@prisma/client';

export class AuthMeResponseDto {
  @ApiProperty() sub!: string;
  @ApiProperty() phone!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiPropertyOptional() jti?: string;
  @ApiPropertyOptional() providerId?: string;
  @ApiPropertyOptional({ enum: ProviderStatus }) status?: ProviderStatus;
}
