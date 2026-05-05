import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpsertSurchargeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsIn(['PER_WHEEL', 'PER_SENSOR'])
  scope!: string;

  @IsNumber()
  pricePln!: number;

  @IsInt()
  sortOrder!: number;
}

export class UpsertSurchargesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSurchargeDto)
  surcharges!: UpsertSurchargeDto[];
}
