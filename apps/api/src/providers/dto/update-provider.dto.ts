import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
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

  @ApiPropertyOptional({ enum: ProviderType })
  @IsOptional()
  @IsEnum(ProviderType)
  type?: ProviderType;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  foundedYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tireSizes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalServices?: string[];

  @ApiPropertyOptional({ description: 'Dopłata TPMS per sensor (PLN)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tpmsPricePln?: number;

  @ApiPropertyOptional({ description: 'Opłata dojazd strefa 1: 0–10 km (PLN)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFeeZone1Pln?: number;

  @ApiPropertyOptional({ description: 'Opłata dojazd strefa 2: 10–15 km (PLN)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFeeZone2Pln?: number;
}
