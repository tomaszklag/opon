import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

enum ServicePricingTypeEnum {
  FLAT = 'FLAT',
  VARIANTS = 'VARIANTS',
  RIM_SIZES = 'RIM_SIZES',
}

export class UpsertServiceVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  rimSizes!: string[];

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  pricePln!: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(0)
  durationMinutes!: number;

  @ApiProperty({ type: Number })
  @IsInt()
  sortOrder!: number;
}

export class UpsertServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({ enum: ServicePricingTypeEnum })
  @IsEnum(ServicePricingTypeEnum)
  pricingType!: string;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ type: Number })
  @IsInt()
  sortOrder!: number;

  @ApiProperty({ type: [UpsertServiceVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceVariantDto)
  variants!: UpsertServiceVariantDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subServiceIds!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  addonIds!: string[];
}

export class UpsertServicesDto {
  @ApiProperty({ type: [UpsertServiceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceDto)
  services!: UpsertServiceDto[];
}
