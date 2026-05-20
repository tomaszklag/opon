import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class VerifyOtpUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() phone!: string;
  @ApiPropertyOptional({ nullable: true }) firstName!: string | null;
  @ApiPropertyOptional({ nullable: true }) lastName!: string | null;
  @ApiPropertyOptional({ nullable: true }) email!: string | null;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
}

export class VerifyOtpResponseDto {
  @ApiProperty() message!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiPropertyOptional() providerId?: string;
  @ApiPropertyOptional() accessToken?: string;
  @ApiPropertyOptional() refreshToken?: string;
  @ApiPropertyOptional({ type: VerifyOtpUserDto }) user?: VerifyOtpUserDto;
  @ApiPropertyOptional() requiresConsent?: boolean;
  @ApiPropertyOptional() isNewUser?: boolean;
}
