import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+48123456789', description: 'Numer telefonu w formacie E.164' })
  @IsString()
  @Matches(/^\+48\d{9}$/, { message: 'Podaj numer telefonu w formacie +48XXXXXXXXX' })
  phone!: string;
}
