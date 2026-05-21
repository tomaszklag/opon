import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class RegisterPushSubscriptionDto {
  @ApiProperty() @IsUrl() endpoint!: string;
  @ApiProperty() @IsString() p256dh!: string;
  @ApiProperty() @IsString() auth!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() userAgent?: string;
}
