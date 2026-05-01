import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ example: 'Opony Express Sp. z o.o.' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: '1234567890', description: '10-cyfrowy NIP bez kresek' })
  @Matches(/^\d{10}$/, { message: 'NIP musi składać się z dokładnie 10 cyfr' })
  nip!: string;

  @ApiProperty({ enum: ProviderType })
  @IsEnum(ProviderType)
  type!: ProviderType;

  @ApiPropertyOptional({ example: '+48600000000' })
  @IsOptional()
  @Matches(/^\+\d{7,15}$/, { message: 'Nieprawidłowy numer telefonu' })
  phone?: string;

  @ApiPropertyOptional({ example: 'kontakt@firma.pl' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;
}
