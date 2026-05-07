import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty({ example: 'nowy@example.pl', description: 'Nowy adres email' })
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  @MaxLength(254)
  newEmail!: string;
}
