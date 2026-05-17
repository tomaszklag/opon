import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { TireCondition, TireType } from '@prisma/client';

export class UpdateTireSetDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) vehicleName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) licensePlate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) model?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) tireSize?: string;
  @ApiPropertyOptional({ enum: TireType }) @IsOptional() @IsEnum(TireType) tireType?: TireType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOnRims?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) dotCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() treadDepthMm?: number;
  @ApiPropertyOptional({ enum: TireCondition })
  @IsOptional()
  @IsEnum(TireCondition)
  condition?: TireCondition;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() slotId?:
    | string
    | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() storagePricePln?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
