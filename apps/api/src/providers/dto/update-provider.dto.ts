import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProviderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: '+48600000000' })
  @IsOptional()
  @Matches(/^\+\d{7,15}$/, { message: 'Nieprawidłowy numer telefonu' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ description: 'Szerokość geogr. centrum operacji (mobilni)' })
  @IsOptional()
  @IsLatitude()
  cityCenterLat?: number;

  @ApiPropertyOptional({ description: 'Długość geogr. centrum operacji (mobilni)' })
  @IsOptional()
  @IsLongitude()
  cityCenterLng?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  serviceRadiusKm?: number;
}
