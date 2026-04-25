import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+48123456789' })
  @IsString()
  @Matches(/^\+48\d{9}$/, { message: 'Podaj numer telefonu w formacie +48XXXXXXXXX' })
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-cyfrowy kod OTP' })
  @IsString()
  @Length(6, 6, { message: 'Kod OTP musi mieć dokładnie 6 cyfr' })
  @Matches(/^\d{6}$/, { message: 'Kod OTP musi składać się wyłącznie z cyfr' })
  code!: string;
}
