import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class ConfirmEmailChangeDto {
  @ApiProperty({ example: 'nowy@example.pl' })
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  @MaxLength(254)
  newEmail!: string;

  @ApiProperty({ example: '123456', description: '6-cyfrowy kod z emaila' })
  @IsString()
  @Length(6, 6, { message: 'Kod musi mieć dokładnie 6 cyfr' })
  @Matches(/^\d{6}$/, { message: 'Kod musi składać się wyłącznie z cyfr' })
  code!: string;
}
