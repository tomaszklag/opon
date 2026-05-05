import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpsertRimTierDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsArray()
  @IsString({ each: true })
  rimSizes!: string[];

  @IsNumber()
  pricePln!: number;

  @IsInt()
  durationMinutes!: number;

  @IsInt()
  sortOrder!: number;
}

export class UpsertSubServiceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsBoolean()
  included!: boolean;

  @IsBoolean()
  enabled!: boolean;

  @IsBoolean()
  fromCatalog!: boolean;

  @IsOptional()
  @IsNumber()
  pricePln?: number | null;

  @IsOptional()
  @IsInt()
  durationMinutes?: number | null;

  @IsInt()
  sortOrder!: number;
}

export class UpsertServiceVariantDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsInt()
  sortOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertRimTierDto)
  rimTiers!: UpsertRimTierDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSubServiceDto)
  subServices!: UpsertSubServiceDto[];
}

export class UpsertServiceGroupDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsString()
  pricingMode!: string;

  @IsInt()
  sortOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceVariantDto)
  variants!: UpsertServiceVariantDto[];
}

export class UpsertServiceGroupsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceGroupDto)
  groups!: UpsertServiceGroupDto[];
}
