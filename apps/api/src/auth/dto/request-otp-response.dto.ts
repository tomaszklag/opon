import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestOtpResponseDto {
  @ApiProperty({ example: 'Kod OTP wysłany' }) message!: string;
  @ApiProperty({ example: 300 }) expiresIn!: number;
  @ApiPropertyOptional({ example: true }) alreadySent?: boolean;
}
