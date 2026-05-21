import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpsertAddonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  pricePln!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number | null;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ type: Number })
  @IsInt()
  sortOrder!: number;
}

export class UpsertAddonsDto {
  @ApiProperty({ type: [UpsertAddonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertAddonDto)
  addons!: UpsertAddonDto[];
}
