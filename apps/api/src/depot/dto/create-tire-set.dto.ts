import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TireType } from '@prisma/client';

export class CreateTireSetDto {
  @ApiProperty() @IsString() @MaxLength(200) clientName!: string;
  @ApiProperty() @IsString() @MaxLength(20) clientPhone!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) vehicleName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) licensePlate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) model?: string;
  @ApiProperty() @IsString() @MaxLength(20) tireSize!: string;
  @ApiProperty({ enum: TireType }) @IsEnum(TireType) tireType!: TireType;
  @ApiProperty() @IsBoolean() isOnRims!: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) dotCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() treadDepthMm?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() slotId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() storagePricePln?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() storedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() releaseDue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceBookingId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
