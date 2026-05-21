import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ChangePhoneDto {
  @ApiProperty({ example: '123456', description: 'Kod OTP wysłany na bieżący numer' })
  @IsString()
  @Length(6, 6, { message: 'Kod OTP musi mieć dokładnie 6 cyfr' })
  @Matches(/^\d{6}$/, { message: 'Kod OTP musi składać się wyłącznie z cyfr' })
  currentCode!: string;

  @ApiProperty({ example: '+48123456789', description: 'Nowy numer telefonu w formacie E.164' })
  @IsString()
  @Matches(/^\+48\d{9}$/, { message: 'Podaj numer telefonu w formacie +48XXXXXXXXX' })
  newPhone!: string;

  @ApiProperty({ example: '654321', description: 'Kod OTP wysłany na nowy numer' })
  @IsString()
  @Length(6, 6, { message: 'Kod OTP musi mieć dokładnie 6 cyfr' })
  @Matches(/^\d{6}$/, { message: 'Kod OTP musi składać się wyłącznie z cyfr' })
  newCode!: string;
}
