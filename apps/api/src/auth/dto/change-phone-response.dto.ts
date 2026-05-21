import { ApiProperty } from '@nestjs/swagger';

export class ChangePhoneResponseDto {
  @ApiProperty({ example: 'Numer telefonu zmieniony' })
  message!: string;

  @ApiProperty({ example: '+48123456789' })
  phone!: string;
}
